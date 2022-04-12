import Layout from "../../../components/Layout";
import Header from "../../../components/Header";
import FormDescription from "../../../components/FormDescription";
import Project, { Projects } from "../../../models/project";
import { GetServerSideProps } from "next";
import UserGroup, { UserGroups } from "../../../models/userGroup";
import { UserGroupForm } from "../../../components/Forms/UserGroup";
import MainWrapper from "../../../components/MainWrapper";

interface Props {
  userGroup: UserGroup;
}

export default function EditPage(props: Props) {
  const userGroup = props.userGroup;

  return (
    <Layout
      title="Edit User Group"
      section="projects"
      selectedProjectId={undefined}
    >
      <MainWrapper>
        <UserGroupForm
          title="User Group"
          description="User Groups are a collection of addresses that represent users. These are useful for assigning owners to a project, recipients for an airdrop, etc."
          isEdit={true}
          userGroup={userGroup}
        />
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const groupId = context.query.groupId?.toString();

    if (groupId) {
      const userGroup = await UserGroups.withId(groupId);

      return {
        props: {
          userGroup,
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
