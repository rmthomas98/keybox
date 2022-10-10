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
} from "evergreen-ui";
import { useEffect, useState } from "react";
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

  const handleClose = () => {
    setShow(false);
  };

  const handleDelete = async () => {};

  const handleReset = async () => {
    setIsDeleting(false);
    setIsEditing(false);
    setName(folder.name || "");
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
              Edit mode
            </Badge>
          </div>
          <Heading size={100} fontWeight={700}>
            {`${folder.files.length} ${
              folder.files.length === 1 ? "file" : "files"
            } in folder`}
          </Heading>
        </div>
        <div style={{ display: "flex" }}>
          <Tooltip content={isEditing ? "Cancel" : "Edit"}>
            <IconButton
              icon={isEditing ? ResetIcon : EditIcon}
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
                    onClick={handleDelete}
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
      {folder.files.map((file) => {
        return (
          <FileCard
            key={file.id}
            name={file.name}
            sizeInBytes={file.size}
            type={file.type}
            isLoading={isLoading}
            disabled={!isEditing}
            onRemove={() => {}}
            onClick={() => {}}
            cursor={isEditing ? "default" : "pointer"}
          />
        );
      })}
    </Dialog>
  );
};
