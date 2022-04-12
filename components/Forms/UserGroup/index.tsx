import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import UserGroup, { UserGroups } from "../../../models/userGroup";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormDescription from "../../FormDescription";
import { useAuth } from "../../../context/auth";

interface Props {
  isEdit?: boolean;
  userGroup?: UserGroup | null;
  title: string;
  description: string;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
  })
  .required();

export const UserGroupForm: React.FC<Props> = ({
  isEdit = false,
  userGroup = null,
  title,
  description,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserGroup>({
    resolver: yupResolver(schema),
  });

  const { user } = useAuth();
  const router = useRouter();
  const onSubmit = async (data: UserGroup) => {
    if (isEdit) {
      if (!userGroup) {
        return false;
      }
      await UserGroups.update(data, userGroup.id);
    } else {
      await UserGroups.create(data, user.uid);
    }

    router.push(
      {
        pathname: "/usergroups/",
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
        <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
          <div className="col-span-6 sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Group Name
            </label>
            <input
              type="text"
              {...register("name")}
              id="name"
              defaultValue={userGroup?.name}
              placeholder="NFT Launch DAO Admins"
              className="mt-1 block w-full shadow-sm sm:text-sm rounded-md"
            />
            {errors.name && (
              <span className=" text-red-800 text-xs">
                {errors.name.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </TTForm>
  );
};
