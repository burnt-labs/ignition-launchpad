import Header from "../../../../../components/Header";
import Layout from "../../../../../components/Layout";
import FormDescription from "../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../models/project";
import User, { Users } from "../../../../../models/user";
import { GetServerSideProps } from "next";
import { UserForm } from "../../../../../components/Forms/User";
import MainWrapper from "../../../../../components/MainWrapper";

interface Props {
  userGroupId: string;
  user: User;
}

export default function EditPage(props: Props) {
  const userGroupId = props.userGroupId;
  const user = props.user;

  if (!user) {
    return (
      <Layout
        title="Edit User"
        section="usergroups"
        selectedProjectId={undefined}
      >
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Edit User"
        section="usergroups"
        selectedProjectId={undefined}
      >
        <MainWrapper>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <UserForm
              isEdit={true}
              user={user}
              userGroupId={userGroupId}
              title="Edit User"
              description="Users are represented by Solana addresses, such as their wallet address. They could also be a multi-sig address owned by several users or an organization."
            />
          </div>
        </MainWrapper>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const userGroupId = context.query.groupId?.toString();
    const userId = context.query.userId?.toString();

    if (userGroupId && userId) {
      const user = await Users.withId(userId, userGroupId);

      return {
        props: {
          userGroupId,
          user,
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
