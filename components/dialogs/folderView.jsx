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
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [fileRejections, setFileRejections] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
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
    }
  }, [show]);

  const handleClose = () => {
    setShow(false);
  };

  const handleDeleteFolder = async () => {};
  const handleRemove = (file) => {};

  const handleReset = async () => {
    setIsDeleting(false);
    setIsEditing(false);
    setIsLoading(false);
    setName(folder.name || "");
    setFiles(folder.files || []);
    setNewFiles([]);
    setFileRejections([]);
    setDeletedFiles([]);
  };

  if (!folder) return null;

  return (
    <Dialog
      isShown={show}
      onCloseComplete={handleClose}
      title="Folder View"
      shouldCloseOnOverlayClick={false}
      confirmLabel="Save changes"
      cancelLabel="Close"
      onCancel={handleClose}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E6E8F0",
          paddingBottom: 12,
          marginBottom: 12,
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
              position={isEditing ? "absolute" : "relative"}
              opacity={isEditing ? 0 : 1}
              transition={"transform 300ms"}
              transform={isEditing ? "scale(0.75)" : "scale(1)"}
            >
              {size(folder.size)}
            </Badge>
            <Badge
              color="purple"
              opacity={isEditing ? 1 : 0}
              transform={isEditing ? "scale(1)" : "scale(0.75)"}
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
          <Tooltip content={isEditing ? "Cancel" : "Upload files"}>
            <IconButton
              icon={isEditing ? ResetIcon : UploadIcon}
              intent={isEditing ? "danger" : "none"}
              onClick={isEditing ? handleReset : () => setIsEditing(true)}
              marginRight={6}
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
                disabled={isEditing}
              />
            </Tooltip>
          </Popover>
        </div>
      </div>
      {files.length > 1 && !isEditing && (
        <SearchInput
          width="100%"
          placeholder="Search files..."
          marginBottom={12}
        />
      )}
      {isEditing && (
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
              <FileCard key={name} name={name} sizeInBytes={size} type={type} />
            );
          }}
        />
      )}
      {!isEditing &&
        files.map((file) => {
          return (
            <FileCard
              key={file.id}
              name={file.name}
              sizeInBytes={file.size}
              type={file.type}
              onClick={() => {}}
              cursor={"pointer"}
              onRemove={() => handleRemove(file)}
            />
          );
        })}
    </Dialog>
  );
};
