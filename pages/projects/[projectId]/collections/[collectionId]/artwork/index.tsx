import Image from "next/image";
import Link from "next/link";
import Layout from "../../../../../../components/Layout";
import { EmptyState } from "../../../../../../components/EmptyState";
import { TrashIcon } from "@heroicons/react/solid";
import { SearchIcon } from "@heroicons/react/outline";
import DropsSubnav from "../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../models/project";
import Collection, {
  Collections,
  CollectionType,
} from "../../../../../../models/collection";
import ImageLayer, { ImageLayers } from "../../../../../../models/imageLayer";
import Trait, { Traits } from "../../../../../../models/trait";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import TraitValue, { TraitValues } from "../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";
import { ProgressModal } from "../../../../../../components/ProgressModal";
import { db } from "../../../../../../app-firebase";
import { writeBatch } from "firebase/firestore";
import IconButtonWithTitle from "../../../../../../components/Button/IconButtonWithTitle";
import SecondaryWrapper from "../../../../../../components/SecondaryWrapper";

interface Props {
  project: Project;
  collection: Collection;
  imageLayers: ImageLayer[];
  projectId: string;
  traitSets: TraitSet[];
  traits: Trait[];
  traitsDict: { [traitSetId: string]: Trait[] };
  traitValuesDict: { [traitId: string]: TraitValue[] };
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const imageLayers = props.imageLayers;
  const projectId = props.projectId;
  const traitSets = props.traitSets;
  const traits = props.traits;
  const traitsDict = props.traitsDict;
  const traitValuesDict = props.traitValuesDict;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageLayerIdToDelete, setImageLayerIdToDelete] = useState<
    string | null
  >(null);

  const [isSyncingModalOpen, setIsSyncingModalOpen] = useState(false);
  const [itemSyncing, setItemSyncing] = useState(0);
  const [totalItemsToSync, setTotalItemsToSync] = useState(0);
  const [isSyncingCancelled, setIsSyncingCancelled] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);

  const router = useRouter();

  const confirmDeleteImageLayer = async (
    event: React.MouseEvent,
    imageLayerId: string
  ) => {
    event.preventDefault();
    setImageLayerIdToDelete(imageLayerId);
    setDeleteModalOpen(true);
  };

  const deleteImageLayer = async () => {
    if (imageLayerIdToDelete) {
      await ImageLayers.remove(imageLayerIdToDelete, projectId, collection.id);
    }
    setImageLayerIdToDelete(null);
    setDeleteModalOpen(false);
    const imageLayerElem = document.getElementById(
      "imagelayer-" + imageLayerIdToDelete
    );
    imageLayerElem?.remove();
  };

  const cancelDeleteImageLayer = async () => {
    setImageLayerIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const onChangeTraitSetId = async (
    traitSetId: string,
    imageLayerId: string
  ) => {
    // START LOADING

    await ImageLayers.update(
      {
        traitSetId: traitSetId == "-1" ? null : traitSetId,
      },
      imageLayerId,
      projectId,
      collection.id
    );

    // STOP LOADING

    const traitIdElem = document.getElementById(imageLayerId + "-trait");

    if (traitIdElem) {
      const nonNilOptions = traitsDict[traitSetId]?.map((trait) => {
        return `<option value=${trait.id}>${trait.name}</option>`;
      });
      traitIdElem.innerHTML =
        '<option key="-1" value="-1"></option>' + nonNilOptions?.join();
    }

    const traitValueElem = document.getElementById(
      imageLayerId + "-traitValue"
    );

    if (traitValueElem) {
      traitValueElem.innerHTML = '<option key="-1" value="-1"></option>';
    }
  };

  const onChangeTraitId = async (traitId: string, imageLayerId: string) => {
    // START LOADING

    await ImageLayers.update(
      {
        traitId: traitId == "-1" ? null : traitId,
      },
      imageLayerId,
      projectId,
      collection.id
    );

    // STOP LOADING

    const traitValueElem = document.getElementById(
      imageLayerId + "-traitValue"
    );

    if (traitValueElem) {
      const nonNilOptions = traitValuesDict[traitId]?.map((traitValue) => {
        return `<option value=${traitValue.id}>${traitValue.name}</option>`;
      });
      traitValueElem.innerHTML =
        '<option key="-1" value="-1"></option>' + nonNilOptions?.join();
    }
  };

  const onChangeTraitValueId = async (
    traitValueId: string,
    imageLayerId: string
  ) => {
    // START LOADING

    await ImageLayers.update(
      {
        traitValueId: traitValueId,
      },
      imageLayerId,
      projectId,
      collection.id
    );

    // STOP LOADING
  };

  const syncTraitsToFilenames = async () => {
    setIsSyncingCancelled(false);

    let failures: string[] = [];

    setIsSyncingModalOpen(true);
    setTotalItemsToSync(imageLayers.length);

    let batch = writeBatch(db);

    let iter = 0;

    for (let i = 0; i < imageLayers.length; i++) {
      if (isSyncingCancelled) {
        console.log("cancelled");
        break;
      }

      const imageLayer = imageLayers[i];

      // strip extension from filename
      const imageName = imageLayer.name.replace(/\.[^/.]+$/, "");
      const components = imageName.split(new RegExp(/\-/, "i"));

      if (components.length < 2) {
        failures.push(imageLayer.name);
        continue;
      }

      let traitSetName: string;
      let traitName: string;
      let traitValueName: string;

      let traitSet: TraitSet | undefined;
      let trait: Trait | undefined;

      if (components.length == 3) {
        traitSetName = components[0].toLowerCase();
        traitSet = traitSets.find((iterSet) => {
          return iterSet.name.toLowerCase() == traitSetName;
        });

        if (!traitSet) {
          failures.push(imageLayer.name);
          continue;
        }

        traitName = components[1].toLowerCase();
        traitValueName = components[2].toLowerCase();
      } else {
        traitSetName = traitName = components[0].toLowerCase();
        traitValueName = components[1].toLowerCase();
      }

      trait = traits.find((iterTrait) => {
        return (
          iterTrait.name.toLowerCase() == traitName &&
          (!traitSet || iterTrait.traitSetIds.includes(traitSet.id))
        );
      });

      if (!trait) {
        console.log("bad trait " + traitName);
        failures.push(imageLayer.name);
        continue;
      }

      const traitValue = traitValuesDict[trait.id].find((traitValue) => {
        return traitValue.name.toLowerCase() == traitValueName;
      });

      if (traitValue) {
        if (
          imageLayer.traitSetId != traitSet?.id ||
          imageLayer.traitId != trait.id ||
          imageLayer.traitValueId != traitValue.id
        ) {
          console.log(i + " needs update: " + imageLayer.name);

          ImageLayers.update(
            {
              traitSetId: traitSet?.id || -1,
              traitId: trait.id,
              traitValueId: traitValue.id,
            },
            imageLayer.id,
            project.id,
            collection.id,
            batch
          );
        }
      } else {
        console.log("bad trait value " + traitValueName);
        failures.push(imageLayer.name);
        continue;
      }

      if ((i > 0 && i % 250 == 0) || i == imageLayers.length - 1) {
        console.log("running batch");
        await batch.commit();
        batch = writeBatch(db);
        setItemSyncing(i);
      }
    }

    setIsSyncingModalOpen(false);

    if (failures.length > 0) {
      console.log("The following images had failures:");
      console.log(failures);
      alert("The following images had failures:\n" + failures.join("\n"));
    } else {
      router.reload();
    }
  };

  const cancelSyncFilenamesToTraits = async () => {
    setIsSyncingCancelled(true);
    setIsSyncingModalOpen(false);
  };

  const searchChanged = async (searchValue: string) => {
    setSearchTerm(searchValue.trim());
  };

  let filteredImageLayers: ImageLayer[];
  if (searchTerm) {
    filteredImageLayers = imageLayers.filter((imageLayer, i) => {
      return imageLayer.name.toUpperCase().includes(searchTerm.toUpperCase());
    });
  } else {
    filteredImageLayers = imageLayers;
  }

  if (showOnlyUnassigned) {
    filteredImageLayers = filteredImageLayers.filter((imageLayer) => {
      return imageLayer.traitValueId == null;
    });
  }

  if (!collection) {
    return (
      <Layout
        title="Artwork"
        section="collections"
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="artwork"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (imageLayers.length == 0) {
    return (
      <Layout
        title="Artwork"
        section="collections"
        selectedProjectId={undefined}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="artwork"
          />
          <main className="px-8 py-12">
            <Link
              href={
                "/projects/" +
                project.id +
                "/collections/" +
                collection.id +
                "/artwork/create"
              }
              passHref={true}
            >
              <button type="button" className="block w-full">
                <EmptyState
                  title="No artwork"
                  message="Upload some layered artwork"
                  buttonTitle="New Artwork"
                />
              </button>
            </Link>
          </main>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Artwork"
        section="collections"
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="artwork"
          >
            <div>
              <span className="pr-4">
                <Link
                  href={
                    "/projects/" +
                    project.id +
                    "/collections/" +
                    collection.id +
                    "/artwork/create"
                  }
                  passHref={true}
                >
                  <IconButtonWithTitle addTitle="Add Artwork" />
                </Link>
              </span>
            </div>
          </DropsSubnav>
          <SecondaryWrapper>
            <main>
              <div className="mt-8 float-right">
                {collection.type == CollectionType.Prerendered ? (
                  ""
                ) : (
                  <span></span>
                )}
              </div>

              <div className="float-left mt-6 flex items-center">
                <div className="relative mr-8">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    onKeyPress={function (e) {
                      if (e.code === "Enter" || e.code === "NumpadEnter") {
                        const searchElem = document.getElementById(
                          "search"
                        ) as HTMLInputElement;
                        const searchTerm = searchElem.value;
                        searchChanged(searchTerm);
                      }
                    }}
                    className="p-4 text-sm w-80"
                    defaultValue=""
                    placeholder="Search..."
                  />
                  <button
                    type="button"
                    onClick={function (e) {
                      const searchElem = document.getElementById(
                        "search"
                      ) as HTMLInputElement;
                      const searchTerm = searchElem.value;
                      searchChanged(searchTerm);
                    }}
                  >
                    <SearchIcon className="absolute w-4 h-4 right-4 top-4" />
                  </button>
                </div>

                {collection.type == CollectionType.Prerendered ? (
                  ""
                ) : (
                  <>
                    <input
                      type="checkbox"
                      id="unassigned"
                      className="mr-3 w-6 h-6 text-brand-black focus:ring-0"
                      checked={showOnlyUnassigned}
                      onChange={function (e) {
                        setShowOnlyUnassigned(!showOnlyUnassigned);
                      }}
                    />
                    <label htmlFor="unassigned">
                      {showOnlyUnassigned
                        ? "Show Assigned and Unassigned"
                        : "Show Only Unassigned"}
                    </label>
                  </>
                )}
              </div>

              <ul
                role="list"
                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 clear-both py-8"
              >
                {filteredImageLayers.map((imageLayer) => (
                  <li
                    id={"imagelayer-" + imageLayer.id}
                    key={imageLayer.id}
                    className="relative border border-brand-black"
                  >
                    <Link
                      href={
                        "/projects/" +
                        project.id +
                        "/collections/" +
                        collection.id +
                        "/artwork/" +
                        imageLayer.id +
                        "/edit"
                      }
                      passHref={true}
                    >
                      <div className="block group w-full aspect-w-10 aspect-h-10 bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                        <Image
                          src={imageLayer.url}
                          unoptimized
                          alt=""
                          className="object-cover pointer-events-none group-hover:opacity-75"
                          layout="fill"
                        />
                        <button
                          type="button"
                          className="absolute inset-0 focus:outline-none"
                        >
                          <span className="sr-only">
                            View details for {imageLayer.name}
                          </span>
                        </button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="block text-sm font-medium text-gray-900 truncate pointer-events-none">
                          {imageLayer.name}
                        </p>
                        <a
                          href="#"
                          onClick={(e) =>
                            confirmDeleteImageLayer(e, imageLayer.id)
                          }
                          className="inline-block bg-brand-black rounded-full"
                        >
                          <TrashIcon
                            className="text-brand-white w-3 h-3 m-2"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                      {collection.type == CollectionType.Prerendered ? (
                        ""
                      ) : (
                        <>
                          <br />
                          <div>
                            <label
                              htmlFor="traitSet"
                              className="block text-xs text-brand-black50"
                            >
                              Associated Trait Set
                            </label>
                            <select
                              id={imageLayer.id + "-traitSet"}
                              className="mt-1 block w-full py-2 pl-0 text-sm border-t-0 border-r-0 border-l-0 border-b focus:ring-0 cursor-pointer"
                              defaultValue={imageLayer.traitSetId ?? "-1"}
                              onChange={(e) => {
                                const { value } = e.currentTarget;
                                const traitSetId = value.toString();
                                if (traitSetId) {
                                  onChangeTraitSetId(traitSetId, imageLayer.id);
                                }
                              }}
                            >
                              <option value="-1">
                                {traitSets.length == 0
                                  ? "Default"
                                  : "Unassigned"}
                              </option>
                              {traitSets.map((traitSet) => (
                                <option key={traitSet.id} value={traitSet.id}>
                                  {traitSet.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="trait"
                              className="mt-4 block text-xs text-brand-black50"
                            >
                              Associated Trait
                            </label>
                            <select
                              id={imageLayer.id + "-trait"}
                              className="mt-1 block w-full py-2 pl-0 text-sm border-t-0 border-r-0 border-l-0 border-b focus:ring-0 cursor-pointer"
                              defaultValue={imageLayer.traitId ?? "-1"}
                              onChange={(e) => {
                                const { value } = e.currentTarget;
                                const traitId = value.toString();
                                if (traitId) {
                                  onChangeTraitId(traitId, imageLayer.id);
                                }
                              }}
                            >
                              <option value="-1">Unassigned</option>
                              {traitsDict[imageLayer.traitSetId ?? "-1"]?.map(
                                (trait) => (
                                  <option key={trait.id} value={trait.id}>
                                    {trait.name}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="traitValue"
                              className="mt-4 block text-xs text-brand-black50"
                            >
                              Associated Trait Value
                            </label>
                            <select
                              id={imageLayer.id + "-traitValue"}
                              className="mt-1 block w-full py-2 pl-0 text-sm border-t-0 border-r-0 border-l-0 border-b focus:ring-0 cursor-pointer"
                              defaultValue={imageLayer.traitValueId ?? ""}
                              onChange={(e) => {
                                const { value } = e.currentTarget;
                                const traitValueId = value.toString();
                                if (traitValueId) {
                                  onChangeTraitValueId(
                                    traitValueId,
                                    imageLayer.id
                                  );
                                }
                              }}
                            >
                              <option key={"-1"} value="-1"></option>
                              {(imageLayer.traitId
                                ? traitValuesDict[imageLayer.traitId] ?? []
                                : []
                              ).map((traitValue) => (
                                <option
                                  key={traitValue.id}
                                  value={traitValue.id}
                                >
                                  {traitValue.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </main>
          </SecondaryWrapper>

          <ProgressModal
            title="Syncing Traits to Filenames"
            message={
              "Syncing " + itemSyncing + " of " + totalItemsToSync + "..."
            }
            loadingPercent={Math.ceil((100 * itemSyncing) / totalItemsToSync)}
            cancelAction={cancelSyncFilenamesToTraits}
            show={isSyncingModalOpen}
          />

          <DestructiveModal
            title="Delete Artwork"
            message={
              "Are you sure you want to delete ‘" +
              (imageLayers.find((file) => file.id == imageLayerIdToDelete)
                ?.name ?? "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteImageLayer();
            }}
            cancelAction={() => {
              cancelDeleteImageLayer();
            }}
            show={deleteModalOpen}
          />
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const imageLayers = await ImageLayers.all(projectId, collectionId);
      const traitSets = await TraitSets.all(projectId, collectionId);
      const traits = await Traits.all(projectId, collectionId);

      const traitsDict: { [traitSetId: string]: Trait[] } = {};

      if (traitSets.length == 0) {
        traitsDict["-1"] = traits;
      } else {
        for (let i = 0; i < traitSets.length; i++) {
          const traitSet = traitSets[i];
          let includedTraits: Trait[] = [];
          for (let j = 0; j < traits.length; j++) {
            const trait = traits[j];

            if (trait.traitSetIds.includes(traitSet.id)) {
              includedTraits.push(trait);
            }
          }
          traitsDict[traitSet.id] = includedTraits;
        }
      }

      const traitValuesDict: { [traitId: string]: TraitValue[] } = {};
      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i];
        const traitValues = await TraitValues.all(
          projectId,
          collectionId,
          trait.id
        );
        traitValuesDict[trait.id] = traitValues;
      }

      return {
        props: {
          project: project,
          collection: collection,
          imageLayers: imageLayers,
          projectId: projectId,
          traitSets: traitSets,
          traitsDict: traitsDict,
          traits: traits,
          traitValuesDict: traitValuesDict,
        },
      };
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    props: {},
  };
};
