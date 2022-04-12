import classNames from "classnames";
import Layout from "../../../../../../../components/Layout";
import DropsSubnav from "../../../../../../../components/DropsSubnav";
import { EmptyState } from "../../../../../../../components/EmptyState";
import Link from "next/dist/client/link";
import { ChartPieIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../models/traitValue";
import { DestructiveModal } from "../../../../../../../components/DestructiveModal";
import { Fragment, useState } from "react";
import { useRouter } from "next/router";
import SecondaryWrapper from "../../../../../../../components/SecondaryWrapper";
import IconButtonWithTitle from "../../../../../../../components/Button/IconButtonWithTitle";
import { Menu, Transition } from "@headlessui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";

interface Props {
  project: Project;
  collection: Collection;
  trait: Trait;
  traitValues: TraitValue[];
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const trait = props.trait;
  const traitValues = props.traitValues;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [traitValueIdToDelete, setTraitValueIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteTraitValue = (
    event: React.MouseEvent,
    traitId: string
  ) => {
    event.preventDefault();
    setTraitValueIdToDelete(traitId);
    setDeleteModalOpen(true);
  };

  const deleteTraitValue = async () => {
    if (traitValueIdToDelete) {
      await TraitValues.remove(
        traitValueIdToDelete,
        project.id,
        collection.id,
        trait.id
      );
    }
    setTraitValueIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteTraitValue = async () => {
    setTraitValueIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const distributeRarity = async () => {
    const updatedRarity = 1 / traitValues.length;

    let updates: Promise<void>[] = [];
    traitValues.forEach((traitValue) => {
      updates.push(
        TraitValues.update(
          {
            rarity: updatedRarity,
          },
          traitValue.id,
          project.id,
          collection.id,
          trait.id
        )
      );
    });

    await Promise.all(updates);
    router.reload();
  };

  const totalRarity =
    traitValues.length > 0
      ? traitValues.map((a) => a.rarity).reduce((a, b) => a + b)
      : 0;
  const noneRarity = 1 - totalRarity;

  if (!trait) {
    return (
      <Layout
        title="Traits"
        section="collections"
        selectedProjectId={project.id}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (traitValues.length == 0) {
    return (
      <Layout
        title="Traits"
        section="collections"
        selectedProjectId={undefined}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traits"
          />
          <SecondaryWrapper>
            <div className="my-4">
              <h1>{trait.name}</h1>
            </div>
            <Link
              href={
                "/projects/" +
                project.id +
                "/collections/" +
                collection.id +
                "/traits/" +
                trait.id +
                "/values/create"
              }
              passHref={true}
            >
              <button type="button" className="block w-full">
                <EmptyState
                  title="No trait values"
                  message={"Add some possible values for '" + trait.name + "'."}
                  buttonTitle="New Value"
                />
              </button>
            </Link>

            <p className="italic text-sm text-center mt-6 mb-6">or</p>

            <div className="w-full text-center">
              <Link
                href={
                  "/projects/" +
                  project.id +
                  "/collections/" +
                  collection.id +
                  "/traits/" +
                  trait.id +
                  "/values/create-list"
                }
                passHref={true}
              >
                <IconButtonWithTitle addTitle="Add a List of Values" />
              </Link>
            </div>

            <p className="italic text-sm text-center mt-6 mb-6">or</p>

            <div className="w-full text-center">
              <Link
                href={
                  "/projects/" +
                  project.id +
                  "/collections/" +
                  collection.id +
                  "/traits/" +
                  trait.id +
                  "/values/import-list"
                }
                passHref={true}
              >
                <IconButtonWithTitle addTitle="Import a List of Values" />
              </Link>
            </div>
          </SecondaryWrapper>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Traits"
        section="collections"
        selectedProjectId={project.id}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="traits"
          />
          <SecondaryWrapper className="mt-4">
            <div className="mb-6 float-right flex items-center">
              <Menu as="div" className="relative inline-block text-left mr-8">
                <div>
                  <Menu.Button className="inline-flex justify-center items-center w-full text-brand-primary">
                    <span className="mr-3 rounded-full bg-brand-primary p-2">
                      <PlusIcon
                        aria-hidden="true"
                        className="w-3 h-3 text-brand-white"
                      />
                    </span>
                    Add Value
                    <ChevronDownIcon
                      className="-mr-1 ml-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/traits/" +
                              trait.id +
                              "/values/create"
                            }
                          >
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Add Value
                            </a>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/traits/" +
                              trait.id +
                              "/values/create-list"
                            }
                            passHref={true}
                          >
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Add List of Values
                            </a>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={
                              "/projects/" +
                              project.id +
                              "/collections/" +
                              collection.id +
                              "/traits/" +
                              trait.id +
                              "/values/import-list"
                            }
                            passHref={true}
                          >
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Import List
                            </a>
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              <span>
                <button
                  type="button"
                  className="inline-flex items-center text-base text-brand-primary "
                  onClick={(e) => distributeRarity()}
                >
                  <span className="mr-3 rounded-full bg-brand-primary p-2">
                    <ChartPieIcon
                      className="w-3 h-3 text-brand-white"
                      aria-hidden="true"
                    />
                  </span>
                  Distribute Rarity Evenly
                </button>
              </span>
            </div>

            <div className="mb-4">
              {trait.isAlwaysUnique ? (
                trait.name
              ) : (
                <h1>
                  {trait.name}, Total Rarity: {totalRarity.toFixed(5)}
                </h1>
              )}
            </div>

            <div className="flex flex-col clear-both">
              <div className="overflow-x-auto">
                <div className="align-middle inline-block min-w-full">
                  <div className="overflow-hidden border-b ">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-brand-white">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          >
                            Value Name
                          </th>
                          {trait.isAlwaysUnique ? (
                            ""
                          ) : (
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                            >
                              Rarity
                            </th>
                          )}
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {noneRarity > 0 ? (
                          <tr className="opacity-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm italic text-gray-900">
                                {"None"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm italic text-gray-500 max-w-sm truncate overflow-ellipsis max-h-14">
                                {noneRarity}
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        ) : (
                          ""
                        )}
                        {traitValues?.map((traitValue) => {
                          return (
                            <Link
                              key={traitValue.id}
                              href={
                                "/projects/" +
                                project.id +
                                "/collections/" +
                                collection.id +
                                "/traits/" +
                                trait.id +
                                "/values/" +
                                traitValue.id
                              }
                              passHref={true}
                            >
                              <tr
                                key={traitValue.id}
                                className="hover:bg-gray-100 cursor-pointer"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {traitValue?.name || "Unknown"}
                                  </div>
                                </td>

                                {trait.isAlwaysUnique ? (
                                  ""
                                ) : (
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-sm truncate overflow-ellipsis max-h-14">
                                      {traitValue?.rarity}
                                    </div>
                                  </td>
                                )}
                                <td align="right">
                                  <Link
                                    href={
                                      "/projects/" +
                                      project.id +
                                      "/collections/" +
                                      collection.id +
                                      "/traits/" +
                                      trait.id +
                                      "/values/" +
                                      traitValue.id
                                    }
                                    passHref={true}
                                  >
                                    <a
                                      href="#"
                                      className="inline-block bg-brand-black rounded-full mr-3"
                                    >
                                      <PencilIcon
                                        className="text-brand-white w-3 h-3 m-2"
                                        aria-hidden="true"
                                      />
                                    </a>
                                  </Link>
                                  <a
                                    href="#"
                                    className="inline-block bg-brand-black rounded-full mr-3"
                                    onClick={(e) =>
                                      confirmDeleteTraitValue(e, traitValue.id)
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </SecondaryWrapper>

          <DestructiveModal
            title="Delete Value"
            message={
              "Are you sure you want to delete ‘" +
              (traitValues.find((value) => value.id == traitValueIdToDelete)
                ?.name ?? "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteTraitValue();
            }}
            cancelAction={() => {
              cancelDeleteTraitValue();
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
    const traitId = context.query.traitId?.toString();

    if (projectId && collectionId && traitId) {
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const traitValues = await TraitValues.all(
        projectId,
        collectionId,
        traitId
      );

      return {
        props: {
          project: project,
          collection: collection,
          trait: trait,
          traitValues: traitValues,
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
