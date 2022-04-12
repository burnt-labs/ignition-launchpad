import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Trait, { Traits } from "../../../models/trait";
import TraitSet from "../../../models/traitSet";
import { TTForm } from "../TTForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormDescription from "../../FormDescription";

interface Props {
  isEdit?: boolean;
  trait?: Trait | null;
  projectId: string;
  collectionId: string;
  traitSets: TraitSet[];
  title: string;
  description: string;
}

const schema = yup
  .object({
    name: yup.string().trim().required("This field is required"),
    zIndex: yup
      .number()
      .typeError("Must be a positive number")
      .positive("Must be a positive number")
      .required("This field is required"),
  })
  .required();

export const TraitForm: React.FC<Props> = ({
  isEdit = false,
  trait = null,
  projectId,
  collectionId,
  traitSets,
  title,
  description,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Trait>({
    resolver: yupResolver(schema),
    defaultValues: trait ?? { traitSetIds: [] },
  });

  const router = useRouter();

  const onSubmit = async (data: Trait) => {
    if (isEdit) {
      if (!trait) {
        return false;
      }

      await Traits.update(data, trait.id, projectId, collectionId);
    } else {
      await Traits.create(data, projectId, collectionId);
    }

    router.push(
      {
        pathname:
          "/projects/" + projectId + "/collections/" + collectionId + "/traits",
        query: {},
      },
      undefined,
      { shallow: false }
    );

    return true;
  };

  const selectAll = async () => {
    setValue(
      "traitSetIds",
      traitSets.map((traitSet) => traitSet.id)
    );
  };

  return (
    <TTForm handleSubmit={handleSubmit} submit={onSubmit}>
      <FormDescription title={title} description={description} />

      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div className="sm:overflow-hidden">
          <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm text-brand-black50"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                placeholder="Background Color"
                className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
              />
              {errors.name && (
                <span className=" text-red-800 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="zIndex"
                className="block text-sm text-brand-black50"
              >
                Layer (z-index)
              </label>
              <input
                type="text"
                id="zIndex"
                {...register("zIndex")}
                placeholder="1"
                className="mt-1 block w-full sm:text-sm border-0 border-b focus:ring-0 pl-0"
              />
              {errors.zIndex && (
                <span className=" text-red-800 text-xs">
                  {errors.zIndex.message}
                </span>
              )}
            </div>

            <div>
              <input
                type="checkbox"
                id="excludeFromDuplicateDetection"
                {...register("excludeFromDuplicateDetection")}
                className="sm:text-sm border-transparent inline-block w-6 h-6 text-brand-black focus:ring-0 mr-4"
                value="1"
              />
              <label
                htmlFor="excludeFromDuplicateDetection"
                className="inline-block text-sm font-medium"
              >
                Exclude from duplicate detection?
              </label>
              <p className="text-xs text-brand-black50 mt-2">
                Check this box if this is a trait that should not be included
                when determining uniqueness when detecting duplicates (ex.
                background colour)
              </p>
            </div>

            <div>
              <input
                type="checkbox"
                id="isMetadataOnly"
                {...register("isMetadataOnly")}
                className="sm:text-sm border-transparent inline-block w-6 h-6 text-brand-black focus:ring-0 mr-4"
                value="1"
              />
              <label
                htmlFor="isMetadataOnly"
                className="inline-block text-sm font-medium"
              >
                Metadata-only Trait
              </label>
              <p className="text-xs text-brand-black50 mt-2">
                Check this box if this is a trait that is not associated with
                artwork
              </p>
            </div>

            <div>
              <input
                type="checkbox"
                id="isArtworkOnly"
                {...register("isArtworkOnly")}
                className="sm:text-sm border-transparent inline-block w-6 h-6 text-brand-black focus:ring-0 mr-4"
                value="1"
              />
              <label
                htmlFor="isArtworkOnly"
                className="inline-block text-sm font-medium"
              >
                Artwork-only Trait
              </label>
              <p className="text-xs text-brand-black50 mt-2">
                Check this box if this is a trait should appear in artwork but
                not appear in metadata
              </p>
            </div>

            <div>
              <input
                type="checkbox"
                id="isAlwaysUnique"
                {...register("isAlwaysUnique")}
                className="sm:text-sm border-transparent inline-block w-6 h-6 text-brand-black focus:ring-0 mr-4"
                value="1"
              />
              <label
                htmlFor="isAlwaysUnique"
                className="inline-block text-sm font-medium"
              >
                Always Unique
              </label>
              <p className="text-xs text-brand-black50 mt-2">
                Check this box if this is a trait with a unique value for every
                NFT (ex. a name)
              </p>
            </div>

            {traitSets.length == 0 ? (
              ""
            ) : (
              <div>
                <label
                  htmlFor="traitSets"
                  className="block text-sm font-medium"
                >
                  Trait Sets (
                  <a
                    href="#"
                    className="font-normal underline"
                    onClick={function () {
                      selectAll();
                    }}
                  >
                    select all
                  </a>
                  )
                </label>

                {traitSets.map((traitSet, index) => {
                  return (
                    <div key={traitSet.id}>
                      <input
                        type="checkbox"
                        id={"traitSet-" + traitSet.id}
                        {...register(`traitSetIds`, { value: [] })}
                        className="traitSetCheckbox shadow-sm sm:text-sm rounded-md border-transparent inline-block mr-2"
                        defaultChecked={trait?.traitSetIds?.includes(
                          traitSet.id
                        )}
                        value={traitSet.id}
                      />
                      <label
                        htmlFor={"traitSet-" + traitSet.id}
                        className="inline-block text-sm"
                      >
                        {traitSet.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </TTForm>
  );
};
