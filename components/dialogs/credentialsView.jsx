import {
  Dialog,
  Badge,
  Text,
  Heading,
  IconButton,
  EditIcon,
  DeleteIcon,
  TrashIcon,
  Tooltip,
  Position,
  Popover,
  Card,
  Button,
  Paragraph,
  Small,
  toaster,
  TextInputField,
  TextInput,
  EyeOpenIcon,
  EyeOffIcon,
  ResetIcon,
  ClipboardIcon,
  BanCircleIcon,
  EraserIcon,
} from "evergreen-ui";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { format } from "date-fns";

export const CredentialsView = ({
  show,
  setShow,
  credentials,
  setCredentials,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, errors } = useForm({});

  if (!credentials) return null;

  navigator.clipboard.writeText("Hello, world!");

  const handleClose = () => {
    setShow(false);
    setCredentials(null);
    setShowPassword(false);
    setIsDeleting(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    toaster.closeAll();
    const res = await axios.post("/api/credentials/delete", {
      id: credentials.id,
    });
    if (res.data.error) {
      setIsDeleting(false);
      toaster.danger(res.data.message);
      return;
    }

    toaster.success(res.data.message);
    await router.replace(router.asPath);
    handleClose();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCopyPassword = async () => {
    await toaster.closeAll();
    navigator.clipboard.writeText(credentials.decryptedPassword);
    toaster.success("Password copied to clipboard");
  };

  const handleCopyUsername = async () => {
    await toaster.closeAll();
    navigator.clipboard.writeText(credentials.account);
    toaster.success("Username copied to clipboard");
  };

  const handleReset = () => {
    setIsEditing(false);
  };

  return (
    <Dialog
      title={"Credentials"}
      isShown={show}
      onCloseComplete={handleClose}
      cancelLabel="Close"
      confirmLabel="Save Changes"
      isConfirmDisabled={true}
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
          <Heading size={500} marginBottom={4}>
            {credentials.name}{" "}
            <Badge
              color="purple"
              opacity={isEditing ? 1 : 0}
              transform={isEditing ? "scale(1)" : "scale(0.75)"}
              pointerEvents={"none"}
              transition={"300ms"}
            >
              Editing
            </Badge>
          </Heading>
          <Heading size={100} fontWeight={700}>
            created {format(new Date(credentials.createdAt), "MMMM dd, yyyy")}
          </Heading>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip
            position={Position.BOTTOM}
            content={isEditing ? "Cancel" : "Edit credentials"}
          >
            <IconButton
              icon={isEditing ? EraserIcon : EditIcon}
              marginRight={6}
              onClick={() => setIsEditing((prev) => !prev)}
              intent={isEditing ? "danger" : "none"}
            />
          </Tooltip>
          <Popover
            content={({ close }) => (
              <Card padding={20}>
                <Heading size={500} marginBottom={10}>
                  Delete Credentials
                </Heading>
                <Paragraph>
                  <Small>
                    Are you sure you want to delete these credentials?
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
            position={Position.BOTTOM}
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
      {/*<div style={{ marginTop: 15, display: "flex", flexDirection: "column" }}>*/}
      {/*  <Badge color="green" width={"fit-content"}>*/}
      {/*    Username / Email*/}
      {/*  </Badge>*/}
      {/*  <TextInput value={credentials.account} marginTop={10} width="100%" />*/}
      {/*  /!*<Paragraph>{credentials.decryptedPassword}</Paragraph>*!/*/}
      {/*</div>*/}
      {/*<div style={{ marginTop: 15, display: "flex", flexDirection: "column" }}>*/}
      {/*  <Badge color="blue" width={"fit-content"}>*/}
      {/*    Password*/}
      {/*  </Badge>*/}
      {/*  <TextInput*/}
      {/*    value={credentials.decryptedPassword}*/}
      {/*    marginTop={10}*/}
      {/*    width="100%"*/}
      {/*  />*/}
      {/*  /!*<Paragraph>{credentials.decryptedPassword}</Paragraph>*!/*/}
      {/*</div>*/}
      {isEditing && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextInputField
            label="Account Name"
            value={credentials.name}
            disabled={!isEditing}
            width={"100%"}
          />
        </div>
      )}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <TextInputField
          label="Username / Email"
          value={credentials.account}
          disabled={!isEditing}
          width={"100%"}
          marginRight={6}
        />
        <Tooltip content="Copy">
          <IconButton icon={ClipboardIcon} onClick={handleCopyUsername} />
        </Tooltip>
      </div>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <TextInputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={credentials.decryptedPassword}
          disabled={!isEditing}
          width={"100%"}
          marginRight={6}
        />
        <Tooltip content="Copy">
          <IconButton icon={ClipboardIcon} onClick={handleCopyPassword} />
        </Tooltip>
        {showPassword ? (
          <EyeOffIcon
            className="eye-icon-creds"
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <EyeOpenIcon
            className="eye-icon-creds"
            onClick={() => setShowPassword(true)}
          />
        )}
      </div>
    </Dialog>
  );
};
