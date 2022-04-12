import FormDescription from "../../../../components/FormDescription";
import Header from "../../../../components/Header";
import Layout from "../../../../components/Layout";
import Project, { Projects } from "../../../../models/project";
import UserGroup, { UserGroups } from "../../../../models/userGroup";
import { CollectionForm } from "../../../../components/Forms/Collection";
import { GetServerSideProps } from "next";
import MainWrapper from "../../../../components/MainWrapper";
import { verifyIdToken } from "../../../../context/auth";
import nookies from "nookies";

interface Props {
  project: Project;
  projectId: string;
  userGroups: UserGroup[];
}

export default function CreatePage(props: Props) {
  const projectId = props.projectId;
  const userGroups = props.userGroups;

  return (
    <Layout
      title="Create a New Drop"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <CollectionForm
            projectId={projectId}
            userGroups={userGroups}
            title="Drop"
            description="Enter details about your launch."
          />
        </div>
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId;
    const cookies = nookies.get(context);
    const { uid } = await verifyIdToken(cookies.token);
    const userGroups = await UserGroups.all(uid);

    return {
      props: {
        projectId: projectId,
        userGroups: userGroups,
      },
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
