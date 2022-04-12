import Layout from "../../../../../../../../../components/Layout";
import Header from "../../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../../../models/trait";
import TraitValue, {
  TraitValues,
} from "../../../../../../../../../models/traitValue";
import { TraitValueForm } from "../../../../../../../../../components/Forms/TraitValue";
import { GetServerSideProps } from "next";
import MainWrapper from "../../../../../../../../../components/MainWrapper";

interface Props {
  project: Project;
  collection: Collection;
  trait: Trait;
  traitValue: TraitValue;
}

export default function EditPage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const trait = props.trait;
  const traitValue = props.traitValue;

  return (
    <Layout
      title="Trait Values"
      section="collections"
      selectedProjectId={project.id}
    >
      <MainWrapper>
        <TraitValueForm
          isEdit={true}
          traitValue={traitValue}
          projectId={project.id}
          collectionId={collection.id}
          trait={trait}
          title="Trait Value"
          description={"Edit the value for your '" + trait.name + "' trait."}
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
    const valueId = context.query.valueId?.toString();

    if (projectId && collectionId && traitId && valueId) {
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);
      const traitValue = await TraitValues.withId(
        projectId,
        collectionId,
        traitId,
        valueId
      );

      return {
        props: {
          project: project,
          collection: collection,
          trait: trait,
          traitValue: traitValue,
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
