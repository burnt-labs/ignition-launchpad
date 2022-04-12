import Layout from "../../components/Layout";
import Header from "../../components/Header";
import FormDescription from "../../components/FormDescription";
import Project, { Projects } from "../../models/project";
import { GetServerSideProps } from "next";
import { UserGroupForm } from "../../components/Forms/UserGroup";
import MainWrapper from "../../components/MainWrapper";

interface Props {}

export default function CreatePage(props: Props) {
  return (
    <Layout
      title="Create a New User Group"
      section="projects"
      selectedProjectId={undefined}
    >
      <MainWrapper>
        <UserGroupForm
          title="User Group"
          description="User Groups are a collection of addresses that represent users. These are useful for assigning owners to a project, recipients for an airdrop, etc."
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    return {
      props: {},
    };
  } catch (error) {
    console.log("Error: ", error);

    return {
      props: {},
    };
  }
};
