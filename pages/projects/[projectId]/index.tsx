import Link from "next/link";
import Layout from "../../../components/Layout";
import { EmptyState } from "../../../components/EmptyState";
import Project, { Projects } from "../../../models/project";
import Collection, { Collections } from "../../../models/collection";
import { GetServerSideProps } from "next";
import MainWrapper from "../../../components/MainWrapper";
import HeaderWithAddButton from "../../../components/HeaderWithAddButton";
import DropPresenter from "../../../components/DropPresenter";

interface Props {
  projectId: string;
  project: Project;
  collections: Collection[];
}

export default function IndexPage(props: Props) {
  const projectId = props.projectId;
  const project = props.project;
  const collections = props.collections;

  if (!project) {
    return (
      <Layout title="Project" section="projects" selectedProjectId={projectId}>
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (collections.length == 0) {
    return (
      <Layout
        title={`${project.name} Project`}
        section="projects"
        selectedProjectId={undefined}
      >
        <MainWrapper>
          <Link
            href={"/projects/" + projectId + "/collections/create"}
            passHref={true}
          >
            <button type="button" className="block w-full">
              <EmptyState
                title="No drops"
                message="Create your first drop."
                buttonTitle="New Drop"
              />
            </button>
          </Link>
        </MainWrapper>
      </Layout>
    );
  } else {
    return (
      <Layout
        title={`${project.name} Project`}
        section="projects"
        selectedProjectId={projectId}
      >
        <HeaderWithAddButton
          title="Collections"
          addTitle="Create Drop"
          addHref={`/projects/${project.id}/collections/create`}
        />
        <MainWrapper>
          <div className="grid grid-cols-2 gap-5">
            {collections.map((item) => (
              <DropPresenter key={item.id} {...item} />
            ))}
          </div>
        </MainWrapper>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();

    if (projectId) {
      const collections = await Collections.all(projectId);
      const project = await Projects.withId(projectId);

      return {
        props: {
          projectId,
          project,
          collections,
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
