import Header from "../../../../components/Header";
import Layout from "../../../../components/Layout";
import FormDescription from "../../../../components/FormDescription";
import { GetServerSideProps } from "next";
import Project, { Projects } from "../../../../models/project";
import { UserForm } from "../../../../components/Forms/User";
import MainWrapper from "../../../../components/MainWrapper";

interface Props {
  userGroupId: string;
}

export default function CreatePage(props: Props) {
  const userGroupId = props.userGroupId;

  return (
    <Layout
      title="Create User"
      section="projects"
      selectedProjectId={undefined}
    >
      <MainWrapper>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <UserForm
            userGroupId={userGroupId}
            title="Add New User"
            description="Users are represented by Solana addresses, such as their wallet address. They could also be a multi-sig address owned by several users or an organization."
          />
        </div>
      </MainWrapper>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userGroupId = context.query.groupId?.toString();

    if (userGroupId) {
      return {
        props: {
          userGroupId,
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
