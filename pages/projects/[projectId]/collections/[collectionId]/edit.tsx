import Layout from "../../../../../components/Layout";
import Collection, { Collections } from "../../../../../models/collection";
import Project, { Projects } from "../../../../../models/project";
import UserGroup, { UserGroups } from "../../../../../models/userGroup";
import Header from "../../../../../components/Header";
import FormDescription from "../../../../../components/FormDescription";
import { CollectionForm } from "../../../../../components/Forms/Collection";
import { GetServerSideProps } from "next";
import MainWrapper from "../../../../../components/MainWrapper";
import { verifyIdToken } from "../../../../../context/auth";
import nookies from "nookies";

interface Props {
  projectId: string;
  collection: Collection;
  userGroups: UserGroup[];
}

export default function EditPage(props: Props) {
  const projectId = props.projectId;
  const collection = props.collection;
  const userGroups = props.userGroups;

  return (
    <Layout
      title="Edit Drop"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <CollectionForm
          projectId={projectId}
          collection={collection}
          userGroups={userGroups}
          isEdit={true}
          title="Drop"
          description="Enter details about your launch."
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const cookies = nookies.get(context);
    const { uid } = await verifyIdToken(cookies.token);

    if (projectId && collectionId) {
      const collection = await Collections.withId(collectionId, projectId);
      const userGroups = await UserGroups.all(uid);

      return {
        props: {
          projectId,
          collection,
          userGroups,
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
