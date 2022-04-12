import Header from "../../../../../../../components/Header";
import Layout from "../../../../../../../components/Layout";
import FormDescription from "../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../models/project";
import TraitSet, { TraitSets } from "../../../../../../../models/traitSet";
import Trait, { Traits } from "../../../../../../../models/trait";
import { GetServerSideProps } from "next";
import { TraitForm } from "../../../../../../../components/Forms/Trait";
import MainWrapper from "../../../../../../../components/MainWrapper";

interface Props {
  project: Project;
  collectionId: string;
  traitSets: TraitSet[];
  trait: Trait;
  projectId: string;
}

export default function EditPage(props: Props) {
  const collectionId = props.collectionId;
  const traitSets = props.traitSets;
  const trait = props.trait;
  const projectId = props.projectId;

  return (
    <Layout
      title="Edit Traits"
      section="collections"
      selectedProjectId={projectId}
    >
      <Header title="Edit Trait" />
      <MainWrapper>
        <TraitForm
          isEdit={true}
          trait={trait}
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
    const traitId = context.query.traitId?.toString();

    if (projectId && collectionId && traitId) {
      const traitSets = await TraitSets.all(projectId, collectionId);
      const trait = await Traits.withId(projectId, collectionId, traitId);

      return {
        props: {
          collectionId: collectionId,
          traitSets: traitSets,
          trait: trait,
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
