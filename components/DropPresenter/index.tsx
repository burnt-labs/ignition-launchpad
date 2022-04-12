import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PencilIcon from "@heroicons/react/solid/PencilIcon";
import TrashIcon from "@heroicons/react/solid/TrashIcon";

import Collection, { Collections } from "../../models/collection";
import { DestructiveModal } from "../DestructiveModal";

const DropPresenter: React.FC<Collection> = ({ id, name, url }) => {
  const router = useRouter();
  const query = router.query;

  const projectId = query.projectId as string;

  const [collectionIdToDelete, setCollectionIdToDelete] = useState<
    string | null
  >(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const confirmDeleteCollection = (
    event: React.MouseEvent,
    collectionId: string
  ) => {
    event.preventDefault();
    setCollectionIdToDelete(collectionId);
    setDeleteModalOpen(true);
  };

  const deleteCollection = async () => {
    if (collectionIdToDelete) {
      await Collections.remove(collectionIdToDelete, projectId);
    }
    setCollectionIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteCollection = async () => {
    setCollectionIdToDelete(null);
    setDeleteModalOpen(false);
  };

  return (
    <>
      <Link
        href={"/projects/" + projectId + "/collections/" + id}
        passHref={true}
      >
        <div className="border border-brand-black10 border-solid p-6 cursor-pointer">
          <p className="text-brand-black font-semibold text-lg">{name}</p>
          <p className="mt-4 text-brand-black50 text-sm">{url}</p>
          <div className="mt-6">
            <Link
              href={"/projects/" + projectId + "/collections/" + id + "/edit"}
              passHref={true}
            >
              <a
                href="#"
                className="inline-block bg-brand-black rounded-full mr-4"
              >
                <PencilIcon
                  className="text-brand-white w-4 h-4 m-2"
                  aria-hidden="true"
                />
              </a>
            </Link>
            <a
              href="#"
              onClick={(e) => confirmDeleteCollection(e, id)}
              className="inline-block bg-brand-black rounded-full"
            >
              <TrashIcon
                className="text-brand-white w-4 h-4 m-2"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </Link>
      <DestructiveModal
        title="Delete Drop"
        message={
          "Are you sure you want to delete ‘" + name ??
          "Unknown" +
            "’? This will remove all data associated with this drop, including images and traits. This action cannot be undone."
        }
        deleteAction={() => {
          deleteCollection();
        }}
        cancelAction={() => {
          cancelDeleteCollection();
        }}
        show={deleteModalOpen}
      />
    </>
  );
};

export default DropPresenter;
