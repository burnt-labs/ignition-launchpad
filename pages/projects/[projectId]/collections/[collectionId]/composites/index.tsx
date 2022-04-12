import Layout from "../../../../../../components/Layout";
import DropsSubnav from "../../../../../../components/DropsSubnav";
import { EmptyState } from "../../../../../../components/EmptyState";
import Link from "next/dist/client/link";
import { TrashIcon } from "@heroicons/react/solid";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import ImageCompositeGroup, {
  ImageCompositeGroups,
} from "../../../../../../models/imageCompositeGroup";
import { ImageComposites } from "../../../../../../models/imageComposite";
import { TraitSets } from "../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { ProgressModal } from "../../../../../../components/ProgressModal";
import { useState } from "react";
import { useRouter } from "next/router";
import { API } from "../../../../../../models/api";
import IconButtonWithTitle from "../../../../../../components/Button/IconButtonWithTitle";
import SecondaryWrapper from "../../../../../../components/SecondaryWrapper";
import { TraitValues } from "../../../../../../models/traitValue";
import { Traits } from "../../../../../../models/trait";
import { ActionModal } from "../../../../../../components/ActionModal";

interface Props {
  project: Project;
  collection: Collection;
  compositeGroups: ImageCompositeGroup[];
  compositesCountDict: { [compositeGroupId: string]: number };
  projectId: string;
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const compositeGroups = props.compositeGroups;
  const compositesCountDict = props.compositesCountDict;
  const projectId = props.projectId;

  const BATCH_SIZE = 100;

  const [maxCombinationsCount, setMaxCombinationsCount] = useState(0);
  const [maxCombinationsModalOpen, setMaxCombinationsModalOpen] =
    useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [generatingModalOpen, setGeneratingModalOpen] = useState(false);
  const [isGeneratingCancelled, setIsGeneratingCancelled] = useState(false);

  const [generatingTraitSetName, setGeneratingTraitSetName] = useState("");
  const [generatingTraitSetSize, setGeneratingTraitSetSize] = useState(0);

  const [traitSetGeneratedItems, setTraitSetGeneratedItems] = useState(0);
  const [totalGeneratedItems, setTotalGeneratedItems] = useState(0);

  const [compositeGroupIdToDelete, setCompositeGroupIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteCompositeGroup = (
    event: React.MouseEvent,
    compositeGroupId: string
  ) => {
    event.preventDefault();
    setCompositeGroupIdToDelete(compositeGroupId);
    setDeleteModalOpen(true);
  };

  const deleteCompositeGroup = async () => {
    if (compositeGroupIdToDelete) {
      await ImageCompositeGroups.remove(
        compositeGroupIdToDelete,
        projectId,
        collection.id
      );
    }
    setCompositeGroupIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteCompositeGroup = async () => {
    setCompositeGroupIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const generateNewCompositeGroup = async () => {
    const traits = await Traits.all(projectId, collection.id);
    const numberOfLayers = [];
    for (const trait of traits) {
      if (!trait.excludeFromDuplicateDetection && !trait.isMetadataOnly) {
        const traitValues = await TraitValues.all(
          projectId,
          collection.id,
          trait.id
        );
        numberOfLayers.push(traitValues.length);
      }
    }
    const maxCombinations = numberOfLayers.reduce((a, b) => a * b, 1);
    if (collection.supply > maxCombinations) {
      setIsGeneratingCancelled(true);
      setMaxCombinationsCount(maxCombinations);
      setMaxCombinationsModalOpen(true);
      return;
    }

    let totalCreated = 0;

    setIsGeneratingCancelled(false);
    setGeneratingModalOpen(true);

    const compositeGroup = await ImageCompositeGroups.create(
      {
        timestamp: new Date().getTime(),
      } as ImageCompositeGroup,
      projectId,
      collection.id
    );

    let traitSets = await TraitSets.all(projectId, collection.id);
    if (traitSets.length == 0) {
      const defaultTraitSet = await TraitSets.defaultTraitSet(
        projectId,
        collection
      );
      traitSets = [defaultTraitSet];
    }

    for (let i = 0; i < traitSets.length && !isGeneratingCancelled; i++) {
      const traitSet = traitSets[i];
      let traitSetCreated = 0;

      setGeneratingTraitSetName(traitSet.name);
      setGeneratingTraitSetSize(traitSet.supply);

      while (
        traitSet.supply > traitSetCreated &&
        collection.supply > totalCreated &&
        !isGeneratingCancelled
      ) {
        setTraitSetGeneratedItems(traitSetCreated);
        setTotalGeneratedItems(totalCreated);

        const maxTraitSetBatchSize = traitSet.supply - traitSetCreated;
        const batchSize = Math.min(BATCH_SIZE, maxTraitSetBatchSize);

        const newComposites = await fetch(
          API.ENDPOINT +
            "/artwork/generate-artwork?projectId=" +
            projectId +
            "&collectionId=" +
            collection.id +
            "&compositeGroupId=" +
            compositeGroup.id +
            "&traitSetId=" +
            traitSet.id +
            "&startIndex=" +
            totalCreated +
            "&batchSize=" +
            batchSize +
            "&isFirstBatchInTraitSet=" +
            (traitSetCreated == 0 ? "1" : "0"),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((json) => {
            console.log(json);
            return json;
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        traitSetCreated += batchSize;
        totalCreated += batchSize;
      }
    }

    console.log("art generation complete");

    setGeneratingModalOpen(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/composites/" +
          compositeGroup.id,
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  function cancelGenerateCompositeGroup() {
    console.log("Generating cancelled");
    setIsGeneratingCancelled(true);
    setGeneratingModalOpen(false);
  }

  return (
    <Layout
      title="Composites"
      section="collections"
      selectedProjectId={projectId}
    >
      <div>
        <DropsSubnav
          project={project}
          collection={collection}
          section="composites"
        >
          <IconButtonWithTitle
            onClick={(e) => generateNewCompositeGroup()}
            addTitle="Generate New Composites"
          />
        </DropsSubnav>
        {!compositeGroups ? (
          <main className="px-8 py-12">
            <p>Not Found</p>
          </main>
        ) : compositeGroups.length == 0 ? (
          <main className="px-8 py-12">
            <button
              type="button"
              className="block w-full"
              onClick={(e) => generateNewCompositeGroup()}
            >
              <EmptyState
                title="No composite groups"
                message="Generate your first group of image composites."
                buttonTitle="Generate Composites"
              />
            </button>
          </main>
        ) : (
          <SecondaryWrapper>
            <main>
              <div className="flex flex-col clear-both py-4">
                <div className="-my-2 overflow-x-auto">
                  <div className="py-2 align-middle inline-block min-w-full">
                    <div className="overflow-hidden border-b border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-brand-white">
                          <tr>
                            <th
                              scope="col"
                              className="py-3 text-left text-xs font-normal uppercase tracking-wider"
                            >
                              Generated Composite Sets
                            </th>
                            <th
                              scope="col"
                              className="py-3 text-left text-xs font-normal uppercase tracking-wider"
                            >
                              Total Composites
                            </th>
                            <th
                              scope="col"
                              className="py-3 text-left text-xs font-normal uppercase tracking-wider"
                            ></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {compositeGroups.map((compositeGroup) => (
                            <Link
                              key={compositeGroup.id}
                              href={
                                "/projects/" +
                                project.id +
                                "/collections/" +
                                collection.id +
                                "/composites/" +
                                compositeGroup.id
                              }
                              passHref={true}
                            >
                              <tr className="hover:bg-gray-100 cursor-pointer">
                                <td className="py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {compositeGroup?.timestamp
                                      ? new Date(
                                          compositeGroup?.timestamp ?? 0
                                        ).toLocaleString() ?? 0
                                      : "Date Unknown (" +
                                        compositeGroup?.id +
                                        ")"}
                                  </div>
                                </td>
                                <td className="py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {compositesCountDict[compositeGroup.id]}
                                  </div>
                                </td>
                                <td align="right" width="100">
                                  <a
                                    href="#"
                                    className="inline-block bg-brand-black rounded-full mr-3"
                                    onClick={(e) =>
                                      confirmDeleteCompositeGroup(
                                        e,
                                        compositeGroup.id
                                      )
                                    }
                                  >
                                    <TrashIcon
                                      className="text-brand-white w-3 h-3 m-2"
                                      aria-hidden="true"
                                    />
                                  </a>
                                </td>
                              </tr>
                            </Link>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </SecondaryWrapper>
        )}

        <ActionModal
          title="Max Possible Combinations Error"
          message={`The maximum possible image combinations is ${maxCombinationsCount}. Please set the collection supply of ${collection.supply} to be under ${maxCombinationsCount}`}
          actionButtonTitle="Edit"
          actionURLs={[
            `/projects/${projectId}/collections/${collection.id}/edit`,
          ]}
          cancelAction={() => {
            setMaxCombinationsModalOpen(false);
          }}
          show={maxCombinationsModalOpen}
        />

        <DestructiveModal
          title="Delete Composite Group"
          message={
            "Are you sure you want to delete ‘" +
            (compositeGroups.find(
              (compositeGroup) => compositeGroup.id == compositeGroupIdToDelete
            )?.id ?? "Unknown") +
            "’? This will remove all data associated with this composite run. This action cannot be undone."
          }
          deleteAction={() => {
            deleteCompositeGroup();
          }}
          cancelAction={() => {
            cancelDeleteCompositeGroup();
          }}
          show={deleteModalOpen}
        />

        <ProgressModal
          title="Generating Composite Group"
          message={
            totalGeneratedItems +
            "/" +
            collection.supply +
            " generated - " +
            generatingTraitSetName +
            ": (" +
            traitSetGeneratedItems +
            "-" +
            generatingTraitSetSize +
            ")" +
            `. A collection of 1000 will take around 5-10 minutes.`
          }
          loadingPercent={Math.ceil(
            (100 * totalGeneratedItems) / collection.supply
          )}
          cancelAction={() => {
            cancelGenerateCompositeGroup();
          }}
          show={generatingModalOpen}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const compositeGroups = await ImageCompositeGroups.all(
        projectId,
        collectionId
      );

      let compositesCountDict: { [compositeGroupId: string]: number } = {};
      for (let i = 0; i < compositeGroups.length; i++) {
        const compositeGroupId = compositeGroups[i].id;
        const composites = await ImageComposites.all(
          projectId,
          collectionId,
          compositeGroupId
        );
        compositesCountDict[compositeGroupId] = composites.length;
      }

      return {
        props: {
          project: project,
          collection: collection,
          compositeGroups: compositeGroups,
          compositesCountDict: compositesCountDict,
          projectId: projectId,
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
