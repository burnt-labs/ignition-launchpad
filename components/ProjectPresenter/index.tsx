import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PencilIcon from "@heroicons/react/solid/PencilIcon";
import TrashIcon from "@heroicons/react/solid/TrashIcon";

import Project, { Projects } from "../../models/project";
import { DestructiveModal } from "../DestructiveModal";

const ProjectPresenter: React.FC<Project> = ({ id, name, description }) => {
  const router = useRouter();

  const [projectIdToDelete, setProjectIdToDelete] = useState<string | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const confirmDeleteProject = (event: React.MouseEvent, projectId: string) => {
    event.preventDefault();
    setProjectIdToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const deleteProject = async () => {
    if (projectIdToDelete) {
      await Projects.remove(projectIdToDelete);
    }
    setProjectIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteProject = async () => {
    setProjectIdToDelete(null);
    setDeleteModalOpen(false);
  };

  return (
    <>
      <Link href={"/projects/" + id} passHref={true}>
        <div className="border border-brand-black10 border-solid p-6 cursor-pointer">
          <p className="text-brand-black font-semibold text-lg">{name}</p>
          <p className="mt-4 text-brand-black50 text-sm">{description}</p>
          <div className="mt-6">
            <Link href={"/projects/" + id + "/edit"} passHref={true}>
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
              onClick={(e) => confirmDeleteProject(e, id)}
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
        title="Delete Project"
        message={
          "Are you sure you want to delete ‘" +
          (name ?? "Unknown") +
          "’? This will remove all data associated with this project, including drops, images, and traits. This action cannot be undone."
        }
        deleteAction={() => {
          deleteProject();
        }}
        cancelAction={() => {
          cancelDeleteProject();
        }}
        show={deleteModalOpen}
      />
    </>
  );
};

export default ProjectPresenter;
