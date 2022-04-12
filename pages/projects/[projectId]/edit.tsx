import Layout from "../../../components/Layout";
import Project, { Projects } from "../../../models/project";
import { GetServerSideProps } from "next";
import { ProjectForm } from "../../../components/Forms/Project";
import MainWrapper from "../../../components/MainWrapper";

interface Props {
  project: Project;
  projectId: string;
}

export default function EditPage(props: Props) {
  const project = props.project;
  const projectId = props.projectId;

  return (
    <Layout
      title="Edit Project"
      section="projects"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <ProjectForm
          title="Project"
          description="Edit information about your project."
          isEdit={true}
          project={project}
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const project = await Projects.withId(projectId!);

    return {
      props: {
        project,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
