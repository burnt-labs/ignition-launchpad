import Layout from "../../../../../../../../components/Layout";
import Header from "../../../../../../../../components/Header";
import FormDescription from "../../../../../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../../../../../models/project";
import Collection, {
  Collections,
} from "../../../../../../../../models/collection";
import Trait, { Traits } from "../../../../../../../../models/trait";
import { TraitValueForm } from "../../../../../../../../components/Forms/TraitValue";
import MainWrapper from "../../../../../../../../components/MainWrapper";

interface Props {
  project: Project;
  collection: Collection;
  trait: Trait;
}

export default function CreatePage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const trait = props.trait;

  return (
    <Layout
      title="Trait Values"
      section="collections"
      selectedProjectId={project.id}
    >
      <MainWrapper>
        <TraitValueForm
          projectId={project.id}
          collectionId={collection.id}
          trait={trait}
          title="Project"
          description={"Add a value for your '" + trait?.name + "' trait."}
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
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const trait = await Traits.withId(projectId, collectionId, traitId);

      return {
        props: {
          project: project,
          collection: collection,
          trait: trait,
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
