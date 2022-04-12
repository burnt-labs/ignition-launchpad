import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Collection, {
  Collections,
  CollectionType,
} from "../../../models/collection";
import UserGroup from "../../../models/userGroup";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormDescription from "../../FormDescription";
import Link from "next/link";
import { Icons } from "../../Button/IconButtonWithTitle";

interface Props {
  isEdit?: boolean;
  collection?: Collection | null;
  projectId: string;
  userGroups: UserGroup[];
  title: string;
  description: string;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    type: yup
      .number()
      .oneOf([
        CollectionType.Generative,
        CollectionType.Prerendered,
        // CollectionType.Tilemapped,
      ])
      .required("This field is required"),
    supply: yup
      .number()
      .typeError("Must be a positive whole number")
      .positive("Must be a positive whole number")
      .integer("Must be a positive whole number")
      .required("This field is required"),
    sellerFeeBasisPoints: yup
      .number()
      .typeError("Must be a positive whole number")
      .min(0, "Royalty must be 0% or greater")
      .max(100, "Royalty must be 100% or less")
      .required("This field is required"),
    symbol: yup
      .string()
      .trim()
      .uppercase()
      .max(10, "Symbol must be 10 characters or less")
      .required("This field is required"),
    url: yup
      .string()
      .trim()
      .test("template-url", "Must be a valid url", (value, _) => {
        const testURL = value?.replace(/{{([\w ]*)}}/g, "-") ?? "";
        return yup
          .object({ url: yup.string().url().required() })
          .isValidSync({ url: testURL });
      })
      .required("Must be a valid url"),
    userGroupId: yup.string().trim().required("This field is required"),
    nftName: yup.string().trim().required("This field is required"),
  })
  .required();

export const CollectionForm: React.FC<Props> = ({
  isEdit = false,
  collection = null,
  projectId,
  userGroups,
  title,
  description,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Collection>({
    resolver: yupResolver(schema),
    defaultValues: collection ?? {},
  });

  const router = useRouter();
  const onSubmit = async (data: Collection) => {
    if (isEdit) {
      if (!collection) {
        return false;
      }
      // Transform 5 to 500
      data.sellerFeeBasisPoints = data.sellerFeeBasisPoints * 100;
      await Collections.update(data, collection.id, projectId);
    } else {
      await Collections.create(data, projectId);
    }

    router.push(
      {
        pathname: "/projects/" + projectId,
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
      <FormDescription
        title={title}
        description={description}
        isSubmitting={isSubmitting}
      />

      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div>
          <label htmlFor="name" className="block text-sm text-brand-black50">
            Collection Name
          </label>
          <input
            type="text"
            {...register("name")}
            id="name"
            placeholder="Burnt Baddies 2022"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          />
          {errors.name && (
            <span className=" text-red-800 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label htmlFor="nftName" className="block text-sm text-brand-black50">
            NFT Name
          </label>
          <input
            type="text"
            {...register("nftName")}
            id="nftName"
            placeholder="Name of NFT in JSON File"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          />
          {errors.nftName && (
            <span className=" text-red-800 text-xs">
              {errors.nftName.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the name that will be shown on the NFT.
            <br />
            You can substitute NFT metadata values by using the format:
            &#123;&#123;METADATA_TITLE&#125;&#125; or
            &#123;&#123;NUMBER&#125;&#125; for item number
          </p>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm text-brand-black50">
            Collection Type
          </label>
          <select
            {...register("type")}
            id="type"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          >
            <option value={CollectionType.Generative}>Generative</option>
            <option value={CollectionType.Prerendered}>Prerendered</option>
            {/* <option value={CollectionType.Tilemapped}>Tilemapped</option> */}
          </select>
          {errors.type && (
            <span className=" text-red-800 text-xs">{errors.type.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label htmlFor="supply" className="block text-sm text-brand-black50">
            Supply
          </label>
          <input
            type="text"
            {...register("supply")}
            id="supply"
            placeholder="1000"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          />
          {errors.supply && (
            <span className=" text-red-800 text-xs">
              {errors.supply.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the number of NFTs that will be available for sale.
          </p>
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="sellerFeeBasisPoints"
            className="block text-sm text-brand-black50"
          >
            Seller Fee Basis Points (0% to 100%).
          </label>
          <input
            type="text"
            {...register("sellerFeeBasisPoints")}
            id="sellerFeeBasisPoints"
            placeholder="5"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          />
          {errors.sellerFeeBasisPoints && (
            <span className=" text-red-800 text-xs">
              {errors.sellerFeeBasisPoints.message}
            </span>
          )}
          <p className="mt-2 text-xs text-gray-500">
            This is the fee on secondary market sales creators will split.
          </p>
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label htmlFor="symbol" className="block text-sm text-brand-black50">
            Symbol
          </label>
          <input
            type="text"
            {...register("symbol")}
            id="symbol"
            placeholder="BURNT"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          />
          {errors.symbol && (
            <span className=" text-red-800 text-xs">
              {errors.symbol.message}
            </span>
          )}
        </div>

        <div>
          <div>
            <label htmlFor="url" className="block text-sm text-brand-black50">
              External NFT URL
            </label>
            <input
              type="text"
              {...register("url")}
              id="url"
              className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
              placeholder="https://burnt.com/{{NUMBER}}"
            />
            <p className="mt-2 text-xs text-gray-500">
              This is the external url used for each NFT
              <br />
              You can substitute NFT metadata values by using the format:
              &#123;&#123;METADATA_TITLE&#125;&#125; or
              &#123;&#123;NUMBER&#125;&#125; for item number
            </p>
          </div>
          {errors.url && (
            <span className=" text-red-800 text-xs">{errors.url.message}</span>
          )}
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="creators"
            className="block text-sm text-brand-black50"
          >
            Creators
          </label>
          <select
            {...register("userGroupId")}
            id="userGroupId"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
          >
            <option value="">Unassigned</option>
            {userGroups.map((userGroup) => {
              return (
                <option key={userGroup.id} value={userGroup.id}>
                  {userGroup.name}
                </option>
              );
            })}
          </select>
          {errors.userGroupId && (
            <span className=" text-red-800 text-xs">
              {errors.userGroupId.message}
            </span>
          )}
        </div>
        <div className="col-span-6 sm:col-span-4">
          {!userGroups.length && (
            <Link href={"/usergroups/create"}>
              <button
                type="button"
                className="inline-flex items-center text-base text-brand-primary "
              >
                <span className="mr-3 rounded-full bg-brand-primary p-2">
                  {Icons["create"]}
                </span>
                Create User
              </button>
            </Link>
          )}
        </div>
      </div>
    </TTForm>
  );
};
