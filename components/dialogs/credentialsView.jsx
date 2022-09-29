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
  EyeOpenIcon,
  EyeOffIcon,
  ResetIcon,
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

  if (!credentials) return null;

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

  return (
    <Dialog
      title={credentials.name}
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
        }}
      >
        <Heading size={100} fontWeight={700}>
          created {format(new Date(credentials.createdAt), "MMMM dd, yyyy")}
        </Heading>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip position={Position.BOTTOM} content="Edit">
            <IconButton
              icon={EditIcon}
              marginRight={8}
              onClick={() => setIsEditing((prev) => !prev)}
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
              content={<Text color="#F9DADA">Delete</Text>}
              position={Position.BOTTOM}
            >
              <IconButton icon={TrashIcon} intent="danger" />
            </Tooltip>
          </Popover>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 15 }}>
        <Badge color="green" marginRight={10}>
          User / Email
        </Badge>
        <Paragraph>{credentials.account}</Paragraph>
      </div>
      <Badge color="purple">Password</Badge>
      {/*<TextInputField*/}
      {/*  label="Username / Email"*/}
      {/*  value={credentials.account}*/}
      {/*  marginTop={20}*/}
      {/*  disabled={!isEditing}*/}
      {/*/>*/}
      {/*<div style={{ position: "relative" }}>*/}
      {/*  <TextInputField*/}
      {/*    label="Password"*/}
      {/*    type={showPassword ? "text" : "password"}*/}
      {/*    value={credentials.decryptedPassword}*/}
      {/*    disabled={!isEditing}*/}
      {/*  />*/}
      {/*  {showPassword ? (*/}
      {/*    <EyeOffIcon*/}
      {/*      className="eye-icon"*/}
      {/*      onClick={() => setShowPassword(false)}*/}
      {/*    />*/}
      {/*  ) : (*/}
      {/*    <EyeOpenIcon*/}
      {/*      className="eye-icon"*/}
      {/*      onClick={() => setShowPassword(true)}*/}
      {/*    />*/}
      {/*  )}*/}
      {/*</div>*/}
    </Dialog>
  );
};
