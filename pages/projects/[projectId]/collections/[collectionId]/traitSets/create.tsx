import Header from "../../../../../../components/Header";
import Layout from "../../../../../../components/Layout";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import { GetServerSideProps } from "next";
import { TraitSetForm } from "../../../../../../components/Forms/TraitSet";
import MainWrapper from "../../../../../../components/MainWrapper";

interface Props {
  collection: Collection;
  projectId: string;
}

export default function CreatePage(props: Props) {
  const collection = props.collection;
  const projectId = props.projectId;

  return (
    <Layout
      title="Create Trait Sets"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <TraitSetForm
          projectId={projectId}
          collectionId={collection.id}
          title="Trait Set"
          description="Restrict a set of traits to only be combined together."
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const collection = await Collections.withId(collectionId, projectId);

      return {
        props: {
          collection: collection,
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
