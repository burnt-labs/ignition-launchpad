import Link from "next/link";
import Layout from "../../components/Layout";
import HeaderWithAddButton from "../../components/HeaderWithAddButton";
import Project, { Projects } from "../../models/project";
import { EmptyState } from "../../components/EmptyState";
import { GetServerSideProps } from "next";
import ProjectPresenter from "../../components/ProjectPresenter";
import MainWrapper from "../../components/MainWrapper";
import nookies from "nookies";
import { verifyIdToken } from "../../context/auth";

interface Props {
  projects: Project[];
}

export default function ProjectPage(props: Props) {
  let projects = props.projects;

  if (!projects || projects.length == 0) {
    return (
      <Layout title="Projects" section="projects" selectedProjectId={undefined}>
        <MainWrapper>
          <Link href={"/projects/create"} passHref={true}>
            <button type="button" className="block w-full">
              <EmptyState
                title="No projects"
                message="Get started by creating your first project."
                buttonTitle="New Project"
              />
            </button>
          </Link>
        </MainWrapper>
      </Layout>
    );
  } else {
    return (
      <Layout title="Projects" section="projects" selectedProjectId={undefined}>
        <HeaderWithAddButton
          title="My Projects"
          addTitle="Create Project"
          addHref="/projects/create"
        />
        <MainWrapper>
          <div className="grid grid-cols-2 gap-5">
            {projects.map((item) => (
              <ProjectPresenter key={item.id} {...item} />
            ))}
          </div>
        </MainWrapper>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookies = nookies.get(context);
    const { uid } = await verifyIdToken(cookies.token);
    const projects = await Projects.all(uid);

    return {
      props: {
        projects,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
