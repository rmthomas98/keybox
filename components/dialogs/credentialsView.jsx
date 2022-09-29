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
  const router = useRouter();

  if (!credentials) return null;

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

    const handleClose = () => {
      setShow(false);
      setCredentials(null);
      setIsDeleting(false);
    };

    toaster.success(res.data.message);
    await router.replace(router.asPath);
    handleClose();
  };

  return (
    <Dialog
      title={credentials.name}
      isShown={show}
      onCloseComplete={() => setShow(false)}
      cancelLabel="Close"
      confirmLabel="Save Changes"
      isConfirmDisabled={true}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Heading size={100} fontWeight={700}>
          created {format(new Date(credentials.createdAt), "MMMM dd, yyyy")}
        </Heading>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip position={Position.BOTTOM} content="Edit">
            <IconButton icon={EditIcon} marginRight={8} />
          </Tooltip>
          <Popover
            content={({ close }) => (
              <Card padding={20}>
                <Heading size={500} marginBottom={10}>
                  Delete Credentials
                </Heading>
                <Paragraph>
                  <Small>
                    Are you sure you want to delete these credentials?<br></br>{" "}
                    This action cannot be undone.
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
      <TextInputField
        label="Username / Email"
        value={credentials.account}
        marginTop={20}
        disabled
      />
    </Dialog>
  );
};
