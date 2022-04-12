import Header from "../../../../../../components/Header";
import Layout from "../../../../../../components/Layout";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { TraitForm } from "../../../../../../components/Forms/Trait";
import MainWrapper from "../../../../../../components/MainWrapper";

interface Props {
  collectionId: string;
  traitSets: TraitSet[];
  projectId: string;
}

export default function CreatePage(props: Props) {
  const collectionId = props.collectionId;
  const traitSets = props.traitSets;
  const projectId = props.projectId;

  return (
    <Layout
      title="Create a Trait"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <TraitForm
          projectId={projectId}
          collectionId={collectionId}
          traitSets={traitSets}
          title="Trait"
          description="Enter details about your trait."
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
      const traitSets = await TraitSets.all(projectId, collectionId);

      return {
        props: {
          collectionId: collectionId,
          traitSets: traitSets,
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
