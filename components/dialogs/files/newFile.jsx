import {
  Dialog,
  TextInputField,
  FileUploader,
  FileCard,
  toaster,
  Text,
  Small,
} from "evergreen-ui";
import { useEffect, useState, useMemo } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export const NewFile = ({ show, setShow, setAllFolders }) => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [fileRejections, setFileRejections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const maxSizeInBytes = 50 * 1024 ** 2; // 50 MB
  const values = useMemo(
    () => [
      ...files,
      ...fileRejections.map((fileRejection) => fileRejection.file),
    ],
    [files, fileRejections]
  );

  useEffect(() => {
    if (name && files.length) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [name, files]);

  const handleRemove = (file) => {
    const newFiles = files.filter((f) => f !== file);
    const newRejections = fileRejections.filter((f) => f.file !== file);
    setFiles(newFiles);
    setFileRejections(newRejections);
  };

  const handleClose = () => {
    setName("");
    setFiles([]);
    setFileRejections([]);
    setIsLoading(false);
    setIsFormValid(false);
    setShow(false);
  };

  const handleUpload = async () => {
    if (!name || !files.length) {
      setIsFormValid(false);
      toaster.danger("Enter a name and select a file before uploading");
      return;
    }
    toaster.closeAll();
    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const formData = new FormData();
    formData.append("userId", id);
    formData.append("apiKey", apiKey);
    formData.append("name", name);
    files.forEach((file) => formData.append(file.name, file));
    const { data } = await axios.post("/api/files/new", formData);

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    toaster.success(data.message);
    setAllFolders(data.folders);
    handleClose();
  };

  return (
    <Dialog
      isShown={show}
      title="New File(s)"
      onCloseComplete={handleClose}
      onConfirm={handleUpload}
      confirmLabel="Upload"
      isConfirmDisabled={!isFormValid || !name || files.length === 0}
      isConfirmLoading={isLoading}
      shouldCloseOnOverlayClick={false}
    >
      <div style={{ position: "relative" }}>
        <TextInputField
          label="Folder Name"
          placeholder="Folder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <FileUploader
        label="Select File(s)"
        description="You can select as many files as you want within your plan. Files must be under 50MB."
        maxSizeInBytes={maxSizeInBytes}
        onAccepted={setFiles}
        onRejected={setFileRejections}
        values={values}
        renderFile={(file) => {
          const { name, size, type } = file;
          return (
            <FileCard
              key={name}
              name={name}
              isLoading={isLoading}
              sizeInBytes={size}
              type={type}
              onRemove={() => handleRemove(file)}
              isInvalid={size > maxSizeInBytes}
              validationMessage={
                size > maxSizeInBytes ? "File must be under 50MB" : null
              }
            />
          );
        }}
      />
    </Dialog>
  );
};
