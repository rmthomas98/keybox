import {
  Badge,
  Button,
  Card,
  Dialog,
  EditIcon,
  Heading,
  IconButton,
  Paragraph,
  Popover,
  Position,
  ResetIcon,
  Small,
  Text,
  TextInputField,
  toaster,
  Tooltip,
  TrashIcon,
  FileCard,
  SearchInput,
  FilePicker,
  FileUploader,
  UploadIcon,
} from "evergreen-ui";
import { useEffect, useMemo, useState } from "react";
import { partial } from "filesize";
import axios from "axios";
import { getSession } from "next-auth/react";
import { ConfirmDeleteFiles } from "./confirmDeleteFiles";

const size = partial({ base: 3, standard: "jedec" });

export const FolderView = ({
  show,
  setShow,
  setFolders,
  setFolder,
  folder,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [fileRejections, setFileRejections] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const maxSizeInBytes = 50 * 1024 ** 2; // 50 MB

  const values = useMemo(
    () => [
      ...newFiles,
      ...fileRejections.map((fileRejection) => fileRejection.file),
    ],
    [fileRejections, newFiles]
  );

  useEffect(() => {
    if (show) {
      setFiles(folder.files || []);
      setName(folder.name);
      setSearch("");
    }
  }, [show]);

  useEffect(() => {
    if (!folder) return;
    if (search) {
      const filteredFiles = folder.files.filter((file) => {
        const fileName = file.name.toLowerCase();
        const searchValue = search.toLowerCase().trim();
        if (fileName.includes(searchValue) && deletedFiles.indexOf(file) === -1)
          return file;
      });
      setFiles(filteredFiles);
    } else {
      const filteredFiles = folder.files.filter(
        (file) => deletedFiles.indexOf(file) === -1
      );
      setFiles(filteredFiles);
    }
  }, [search]);

  const handleClose = () => {
    setIsEditingName(false);
    setShowConfirm(false);
    setIsDeleting(false);
    setIsEditing(false);
    setIsLoading(false);
    setIsAdding(false);
    setIsConfirmDisabled(true);
    setName("");
    setNewFiles([]);
    setFileRejections([]);
    setDeletedFiles([]);
    setShow(false);
    setSearch("");
    setFiles([]);
  };

  const handleRemove = (file) => {
    const newCurrentFiles = files.filter((f) => f !== file);
    const newDeletedFiles = [...deletedFiles, file];
    setFiles(newCurrentFiles);
    setDeletedFiles(newDeletedFiles);
  };

  const handleRemoveUploaded = (file) => {
    const newNewFiles = newFiles.filter((f) => f !== file);
    const newRejections = fileRejections.filter((f) => f.file !== file);

    setNewFiles(newNewFiles);
    setFileRejections(newRejections);
  };

  const handleReset = async () => {
    setIsEditingName(false);
    setShowConfirm(false);
    setIsDeleting(false);
    setIsEditing(false);
    setIsLoading(false);
    setIsAdding(false);
    setIsConfirmDisabled(true);
    setFiles(folder.files || []);
    setName(folder.name || "");
    setSearch("");
    setNewFiles([]);
    setFileRejections([]);
    setDeletedFiles([]);
  };

  useEffect(() => {
    if (folder) {
      setFiles(folder.files || []);
      setName(folder.name || "");
    }
  }, [folder]);

  const handleDeleteFolder = async () => {
    await toaster.closeAll();
    setIsDeleting(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/files/delete", {
      userId: id,
      folderId: folder.id,
    });

    if (data.error) {
      setIsDeleting(false);
      toaster.danger(data.message);
      return;
    }

    toaster.success(data.message);
    setFolders(data.folders);
    handleClose();
  };

  const handleDeleteFiles = async () => {
    if (deletedFiles.length === 0) return toaster.danger("No files selected");
    await toaster.closeAll();
    const session = await getSession();
    const { id } = session;

    setIsLoading(true);
    const { data } = await axios.post("/api/files/delete-files", {
      files: deletedFiles,
      folderId: folder.id,
      folderSize: folder.size,
      userId: id,
    });

    if (data.error) {
      setIsLoading(true);
      toaster.danger(data.message);
      return;
    }

    setFolder(data.folder);
    setFolders(data.folders);
    toaster.success(data.message);
    handleReset();
  };

  const handleUploadFiles = async () => {
    await toaster.closeAll();
    if (newFiles.length === 0) return toaster.danger("No files selected");
    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const formData = new FormData();
    formData.append("folderId", folder.id);
    formData.append("userId", id);
    newFiles.forEach((file) => formData.append(file.name, file));

    const { data } = await axios.post("/api/files/upload", formData);

    if (data.error) {
      setIsLoading(false);
      toaster.danger(data.message);
      return;
    }

    setFolder(data.folder);
    setFolders(data.folders);
    toaster.success(data.message);
    handleReset();
  };

  const handleEditName = async () => {
    if (name === folder.name) return;
    await toaster.closeAll();
    if (!name) return toaster.danger("Please enter a name");

    setIsEditingName(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/files/edit-name", {
      userId: id,
      folderId: folder.id,
      name,
    });

    if (data.error) {
      setIsEditingName(false);
      toaster.danger(data.message);
      return;
    }

    setIsEditingName(false);
    setFolder(data.folder);
    setFolders(data.folders);
    toaster.success(data.message);
  };

  useEffect(() => {
    if (isEditing && deletedFiles.length !== 0) {
      setIsConfirmDisabled(false);
    } else if (isAdding && newFiles.length !== 0) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [isEditing, isAdding, deletedFiles, newFiles]);

  if (!folder) return null;

  return (
    <>
      <Dialog
        isShown={show}
        onCloseComplete={handleClose}
        title="Folder View"
        shouldCloseOnOverlayClick={false}
        confirmLabel={
          isEditing
            ? deletedFiles.length === 0
              ? "Delete"
              : `Delete ${deletedFiles.length} ${
                  deletedFiles.length > 1 ? "files" : "file"
                }`
            : isAdding
            ? "Upload"
            : "Confirm"
        }
        isConfirmLoading={isLoading}
        intent={isEditing ? "danger" : "default"}
        isConfirmDisabled={isConfirmDisabled}
        cancelLabel="Close"
        onCancel={handleClose}
        background={"#fff"}
        onConfirm={isEditing ? () => setShowConfirm(true) : handleUploadFiles}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E6E8F0",
            paddingBottom: 12,
            marginBottom: 12,
            // position: "sticky",
            // top: -10,
            // background: "#fff",
            // zIndex: 1,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Heading
                size={500}
                marginBottom={4}
                marginRight={6}
                display="flex"
                alignItems="center"
                maxWidth={200}
              >
                {folder.name}
              </Heading>
              <Badge
                color="teal"
                position={isEditing || isAdding ? "absolute" : "relative"}
                opacity={isEditing || isAdding ? 0 : 1}
                transition={"transform 300ms"}
                transform={isEditing || isAdding ? "scale(0.75)" : "scale(1)"}
              >
                {size(folder.size)}
              </Badge>
              <Badge
                color="yellow"
                opacity={isEditing ? 1 : 0}
                transform={isEditing ? "scale(1)" : "scale(0.75)"}
                position={isAdding ? "absolute" : "relative"}
                pointerEvents={"none"}
                transition={"transform 300ms"}
              >
                Delete
              </Badge>
              <Badge
                color="purple"
                opacity={isAdding ? 1 : 0}
                transform={isAdding ? "scale(1)" : "scale(0.75)"}
                pointerEvents={"none"}
                transition={"transform 300ms"}
              >
                Upload
              </Badge>
            </div>
            <Heading size={100} fontWeight={700}>
              {`${folder.files.length} ${
                folder.files.length === 1 ? "file" : "files"
              } in folder`}
            </Heading>
          </div>
          <div style={{ display: "flex" }}>
            <Tooltip content={isAdding ? "Cancel" : "Upload"}>
              <IconButton
                icon={isAdding ? ResetIcon : UploadIcon}
                marginRight={6}
                onClick={isAdding ? handleReset : () => setIsAdding(true)}
                disabled={isEditing}
                intent={isAdding ? "danger" : "none"}
              />
            </Tooltip>
            <Tooltip content={isEditing ? "Cancel" : "Edit"}>
              <IconButton
                icon={isEditing ? ResetIcon : EditIcon}
                intent={isEditing ? "danger" : "none"}
                onClick={isEditing ? handleReset : () => setIsEditing(true)}
                marginRight={6}
                disabled={isAdding}
              />
            </Tooltip>
            <Popover
              content={({ close }) => (
                <Card padding={20}>
                  <Heading size={500} marginBottom={10}>
                    Delete Folder
                  </Heading>
                  <Paragraph>
                    <Small>
                      Are you sure you want to delete this folder?
                      <br></br> This action cannot be undone.
                    </Small>
                  </Paragraph>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 20,
                    }}
                  >
                    <Button onClick={close} marginRight={10}>
                      Cancel
                    </Button>
                    <Button
                      appearance="primary"
                      intent="danger"
                      iconBefore={TrashIcon}
                      isLoading={isDeleting}
                      onClick={handleDeleteFolder}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              )}
              position={Position.BOTTOM_RIGHT}
            >
              <Tooltip
                content={<Text color="#EE9191">Delete</Text>}
                position={Position.BOTTOM}
              >
                <IconButton
                  icon={TrashIcon}
                  intent="danger"
                  disabled={isEditing || isAdding}
                />
              </Tooltip>
            </Popover>
          </div>
        </div>
        {!isAdding && isEditing && (
          <div style={{ display: "flex" }}>
            <TextInputField
              label="Folder Name"
              value={name}
              placeholder={"Folder name"}
              onChange={(e) => setName(e.target.value)}
              width="100%"
              marginRight={6}
            />
            <Button
              appearance="primary"
              disabled={name === folder.name}
              marginY={"auto"}
              onClick={handleEditName}
              isLoading={isEditingName}
            >
              Update
            </Button>
          </div>
        )}
        {folder.files.length > 1 && !isAdding && (
          <SearchInput
            width="100%"
            placeholder="Search files..."
            marginBottom={12}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={
              deletedFiles.length === folder.files.length ||
              deletedFiles.length === folder.files.length - 1
            }
            // position="sticky"
            // top={50}
          />
        )}
        {isAdding && (
          <FileUploader
            label="Select File(s)"
            description="You can select as many files as you want within your plan. Files must be under 50MB."
            onAccepted={setNewFiles}
            onRejected={setFileRejections}
            maxSizeInBytes={maxSizeInBytes}
            values={values}
            renderFile={(file) => {
              const { name, size, type } = file;
              return (
                <FileCard
                  key={name}
                  name={name}
                  sizeInBytes={size}
                  type={type}
                  onRemove={() => handleRemoveUploaded(file)}
                  isInvalid={size > maxSizeInBytes}
                  isLoading={isLoading}
                />
              );
            }}
          />
        )}
        {!isAdding &&
          files.map((file) => (
            <FileCard
              key={file.id}
              name={file.name}
              sizeInBytes={file.size}
              type={file.type}
              onClick={() => {}}
              cursor={isEditing ? "default" : "pointer"}
              onRemove={isEditing ? () => handleRemove(file) : undefined}
            />
          ))}
        {!isAdding && !files.length && search && <Text>No files found</Text>}
        {!isAdding && !files.length && !search && <Text>No files</Text>}
      </Dialog>
      <ConfirmDeleteFiles
        show={showConfirm}
        setShow={setShowConfirm}
        handleDeleteFiles={handleDeleteFiles}
        deletedFiles={deletedFiles}
        isLoading={isLoading}
      />
    </>
  );
};
