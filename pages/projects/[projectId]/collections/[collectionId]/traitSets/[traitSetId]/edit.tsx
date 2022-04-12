import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import { GetServerSideProps } from "next";
import { TraitSetForm } from "../../../../../../../components/Forms/TraitSet";
import MainWrapper from "../../../../../../../components/MainWrapper";

interface Props {
  projectId: string;
  collectionId: string;
  traitSet: TraitSet;
}

export default function EditPage(props: Props) {
  const projectId = props.projectId;
  const collectionId = props.collectionId;
  const traitSet = props.traitSet;

  return (
    <Layout
      title="Edit Trait Sets"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <TraitSetForm
          isEdit={true}
          traitSet={traitSet}
          projectId={projectId}
          collectionId={collectionId}
          title="Trait Set"
          description="Enter details about your trait set."
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();
    const traitSetId = context.query.traitSetId?.toString();

    if (projectId && collectionId && traitSetId) {
      const traitSet = await TraitSets.withId(
        projectId,
        collectionId,
        traitSetId
      );

      return {
        props: {
          projectId: projectId,
          collectionId: collectionId,
          traitSet: traitSet,
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
