import Layout from "../../components/Layout";
import Project, { Projects } from "../../models/project";
import { ProjectForm } from "../../components/Forms/Project";
import { GetServerSideProps } from "next";
import MainWrapper from "../../components/MainWrapper";

interface Props {
  projectId: string;
}

export default function CreatePage(props: Props) {
  const projectId = props.projectId;

  return (
    <Layout
      title="Create Project"
      section="projects"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <ProjectForm
          title="Project"
          description="First, setup general information about your project."
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId;

    return {
      props: {
        projectId,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
