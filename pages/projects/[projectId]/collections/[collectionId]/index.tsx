import Link from "next/link";
import Layout from "../../../../../components/Layout";
import DropsSubnav from "../../../../../components/DropsSubnav";
import { PencilAltIcon } from "@heroicons/react/outline";
import Project, { Projects } from "../../../../../models/project";
import Collection, {
  Collections,
  CollectionType,
} from "../../../../../models/collection";
import UserGroup, { UserGroups } from "../../../../../models/userGroup";
import { GetServerSideProps } from "next";
import MainWrapper from "../../../../../components/MainWrapper";
import IconButtonWithTitle from "../../../../../components/Button/IconButtonWithTitle";

interface Props {
  project: Project;
  collection: Collection;
  projectId: string;
  userGroup: UserGroup;
}

const InfoPresenter = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <dt className="text-xs text-brand-black40">{label}</dt>
    <dd className="mt-3 text-sm text-brand-black">{value}</dd>
  </div>
);

export default function IndexPage(props: Props) {
  const project = props.project;
  const collection = props.collection;
  const projectId = props.projectId;
  const userGroup = props.userGroup;

  if (!collection) {
    return (
      <Layout title="Drops" section="collections" selectedProjectId={projectId}>
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else {
    return (
      <Layout title="Drops" section="collections" selectedProjectId={projectId}>
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="details"
          >
            <Link
              href={
                "/projects/" +
                project.id +
                "/collections/" +
                collection.id +
                "/edit"
              }
              passHref={true}
            >
              <IconButtonWithTitle variant="edit" addTitle="Edit" />
            </Link>
          </DropsSubnav>
          <MainWrapper>
            <div className="grid grid-cols-2 gap-10">
              <InfoPresenter label="Collection Name" value={collection.name} />
              <InfoPresenter label="NFT Name" value={collection.nftName} />
              <InfoPresenter
                label="Collection Type"
                value={
                  collection.type == CollectionType.Generative
                    ? "Generative"
                    : collection.type == CollectionType.Prerendered
                    ? "Prerendered"
                    : "Tilemapped"
                }
              />
              <InfoPresenter label="Supply" value={collection.supply} />
              <InfoPresenter
                label="Seller Fee Basis Points"
                value={collection.sellerFeeBasisPoints}
              />
              <InfoPresenter label="Symbol" value={collection.symbol} />
              <InfoPresenter label="External NFT URL" value={collection.url} />
              <InfoPresenter label="Creators" value={userGroup?.name} />
            </div>
          </MainWrapper>
        </div>
      </Layout>
    );
  }
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const project = await Projects.withId(projectId);
      const collection = await Collections.withId(collectionId, projectId);
      const userGroup = await UserGroups.withId(collection.userGroupId);

      return {
        props: {
          project: project,
          collection: collection,
          projectId: projectId,
          userGroup: userGroup,
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
