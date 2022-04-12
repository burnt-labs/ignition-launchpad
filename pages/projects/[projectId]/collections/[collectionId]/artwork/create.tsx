import Layout from "../../../../../../components/Layout";
import Header from "../../../../../../components/Header";
import FormDescription from "../../../../../../components/FormDescription";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import ImageLayer, { ImageLayers } from "../../../../../../models/imageLayer";
import { GetServerSideProps } from "next";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { storage } from "../../../../../../app-firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { ProgressModal } from "../../../../../../components/ProgressModal";
import MainWrapper from "../../../../../../components/MainWrapper";

interface Props {
  collection: Collection;
  projectId: string;
}

export default function CreatePage(props: Props) {
  const collection = props.collection;
  const projectId = props.projectId;

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadingFileIndex, setUploadingFileIndex] = useState(0);
  const [uploadingFileProgress, setUploadingFileProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  function cancelUploadingFiles() {
    // TODO: truly cancel the uploading task
    // right now we just hide the progress modal
    setUploadModalOpen(false);
  }

  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFiles) {
      return;
    }

    const files = Array.from(selectedFiles);

    setTotalFiles(files.length);
    setUploadModalOpen(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadingFile(file.name);
      setUploadingFileIndex(i);

      const uuid = uuidv4();
      const originalFilename = file.name;
      const extension = originalFilename.substr(
        originalFilename.lastIndexOf(".") + 1
      );
      const bucketFilename = uuid + "." + extension;
      console.log(
        "starting file: " +
          file.name +
          " to: " +
          projectId +
          "/" +
          collection.id +
          "/" +
          bucketFilename
      );
      const storageRef = ref(
        storage,
        projectId + "/" + collection.id + "/" + bucketFilename
      );

      await new Promise<void>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", (snapshot) => {
          const progress = Math.round(
            snapshot.bytesTransferred / snapshot.totalBytes
          );
          setUploadingFileProgress(progress);
        });
        uploadTask.then(
          (snapshot) => {
            const filePromises = Array<Promise<void>>();

            let url: string;
            const task1 = getDownloadURL(storageRef)
              .then((downloadURL) => {
                url = downloadURL;
              })
              .catch((error) => {
                console.log("error getting d/l url: " + error);
              });
            filePromises.push(task1);

            let metadata: any;
            const task2 = getMetadata(storageRef)
              .then((downloadMetadata) => {
                metadata = downloadMetadata;
              })
              .catch((error) => {
                console.log("error getting metadata: " + error);
              });
            filePromises.push(task2);

            return Promise.all(filePromises)
              .then(async () => {
                const imageLayer = {
                  bucketFilename: bucketFilename,
                  url: url,
                  name: originalFilename,
                  bytes: metadata.size,
                  traitId: null,
                  traitValueId: null,
                } as ImageLayer;

                await ImageLayers.create(imageLayer, projectId, collection.id);

                console.log(imageLayer);
                resolve();
              })
              .catch((error) => {
                console.log("file error: " + error);
                reject(error);
              });
          },
          (error) => {
            console.log("upload error");
            console.log(error);
            reject(error);
          }
        );
      });
    }

    setUploadModalOpen(false);

    router.push(
      {
        pathname:
          "/projects/" +
          projectId +
          "/collections/" +
          collection.id +
          "/artwork",
        query: {},
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <Layout
      title="Create Artwork"
      section="collections"
      selectedProjectId={projectId}
    >
      <MainWrapper>
        <form
          action="#"
          className="md:grid md:grid-cols-2"
          method="POST"
          encType="multipart/form-data"
          onSubmit={onSubmit}
        >
          <FormDescription
            title="Artwork"
            description="Upload your artwork. Once uploaded, you will have an opportunity to assign traits and configure layering."
          />
          <div className="mt-5 col-span-2 md:mt-0 md:col-span-1">
            <div className="sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="files"
                    className="cursor-pointer w-full mt-1 flex justify-center px-6 pt-20 pb-20 border-2 border-brand-black10"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-18 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="relative bg-white rounded-md text-sm font-medium text-brand-primary">
                        Upload artwork
                      </span>
                      <input
                        id="files"
                        name="files"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                      />
                      <p className="text-xs pb-5">
                        Transparent PNGs recommended
                      </p>
                      <p className="text-xs text-gray-500 pb-5">
                        {selectedFiles
                          ? "[" + selectedFiles?.length + " files selected]"
                          : ""}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </MainWrapper>

      <ProgressModal
        title="Uploading Artwork"
        message={
          "Uploading " +
          uploadingFile +
          " (" +
          uploadingFileIndex +
          " of " +
          totalFiles +
          ")"
        }
        loadingPercent={Math.ceil(
          (100 * (uploadingFileIndex + 1 * uploadingFileProgress)) / totalFiles
        )}
        cancelAction={() => {
          cancelUploadingFiles();
        }}
        show={uploadModalOpen}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const collection = await Collections.withId(collectionId, projectId);

      return {
        props: {
          collection: collection,
          projectId: projectId,
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
