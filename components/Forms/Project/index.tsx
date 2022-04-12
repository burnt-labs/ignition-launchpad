import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Project, { Projects } from "../../../models/project";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormDescription from "../../FormDescription";
import { useAuth } from "../../../context/auth";

interface Props {
  isEdit?: boolean;
  project?: Project | null;
  title: string;
  description: string;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    description: yup.string().trim().required("This field is required"),
  })
  .required();

export const ProjectForm: React.FC<Props> = ({
  isEdit = false,
  project = null,
  title,
  description,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Project>({
    resolver: yupResolver(schema),
    defaultValues: project ?? {},
  });

  const { user } = useAuth();
  const router = useRouter();
  const onSubmit = async (data: Project) => {
    data.url = "https://" + data.domain;

    if (isEdit) {
      if (!project) {
        return false;
      }
      await Projects.update(data, project.id);
    } else {
      await Projects.create(data, user.uid);
    }

    router.push(
      {
        pathname: "/projects",
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
        isSubmitting={isSubmitting}
        description={description}
      />
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div className="col-span-6 sm:col-span-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-brand-black50"
          >
            Project Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Burnt Banksy"
            className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
            {...register("name")}
          />
          {errors.name && (
            <span className=" text-red-800 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm text-brand-black50"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="420 algorithmically generated fire starters."
              className="mt-1 block w-full sm:text-sm border focus:ring-0"
            />
            {errors.description && (
              <span className=" text-red-800 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </TTForm>
  );
};
