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
  toaster,
  TextInputField,
  TextInput,
  EyeOpenIcon,
  EyeOffIcon,
  ClipboardIcon,
  BanCircleIcon,
  EraserIcon,
  LinkIcon,
  Link,
  LightningIcon,
  Small,
  ResetIcon,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { format } from "date-fns";
import generator from "generate-password";

export const CredentialsView = ({
  show,
  setShow,
  credentials,
  setCredentials,
  status,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!show) return;
    setPassword(
      credentials.decryptedPassword ? credentials.decryptedPassword : ""
    );
  }, [show]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const handleClose = () => {
    setShow(false);
    setCredentials(null);
    setShowPassword(false);
    setIsDeleting(false);
    setIsEditing(false);
    setIsConfirmDisabled(true);
    setIsLoading(false);
    reset();
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
    setIsLoading(false);
    setIsConfirmDisabled(true);
    setPassword(credentials.decryptedPassword);
    reset();
  };

  const submit = async (data) => {
    setIsLoading(true);
    const session = await getSession();
    const { id: userId } = session;
    const { id } = credentials;
    const { name, account, website } = data;

    const nameChange = name !== credentials.name;

    const options = {
      id,
      userId,
      name,
      nameChange,
      account,
      website,
      password,
    };

    const res = await axios.post("/api/credentials/edit", { options });

    if (res.data.error) {
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    router.replace(router.asPath);
    toaster.success(res.data.message);
    setIsLoading(false);
    setIsEditing(false);
    setIsConfirmDisabled(true);
  };

  // check if changes are made
  useEffect(() => {
    const name = watch("name");
    const account = watch("account");
    const website = watch("website");

    if (isEditing) {
      if (name !== credentials.name) {
        setIsConfirmDisabled(false);
      } else if (password !== credentials.decryptedPassword) {
        setIsConfirmDisabled(false);
      } else if (account !== credentials.account) {
        setIsConfirmDisabled(false);
      } else if (website !== credentials.website) {
        setIsConfirmDisabled(false);
      } else {
        setIsConfirmDisabled(true);
      }
    } else {
      setIsConfirmDisabled(true);
    }
  }, [watch("name"), watch("account"), watch("website"), password]);

  // create a clickable link to the website
  const getClickableLink = (url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    } else {
      return `https://${url}`;
    }
  };

  // generate a random password
  const generatePassword = () => {
    if (status === "TRIAL_IN_PROGRESS") {
      toaster.danger("You cannot generate a password in trial mode");
      return;
    }
    const generatedPassword = generator.generate({
      length: 15,
      number: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
    });

    setPassword(generatedPassword);
  };

  if (!credentials) return null;

  return (
    <Dialog
      title={"Credentials"}
      isShown={show}
      onCloseComplete={handleClose}
      cancelLabel="Close"
      confirmLabel="Save Changes"
      isConfirmDisabled={isConfirmDisabled}
      onConfirm={handleSubmit(submit)}
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isLoading}
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
            {credentials.name}
            {credentials.website ? "" : " "}
            {credentials.website && (
              <Tooltip
                content={getClickableLink(credentials.website)}
                position={Position.BOTTOM}
              >
                <Link
                  href={getClickableLink(credentials.website)}
                  target="_blank"
                >
                  <LinkIcon
                    size={12}
                    marginRight={6}
                    marginLeft={6}
                    position={"relative"}
                    top={1}
                  />
                </Link>
              </Tooltip>
            )}
            <Badge
              color="purple"
              opacity={isEditing ? 1 : 0}
              transform={isEditing ? "scale(1)" : "scale(0.75)"}
              pointerEvents={"none"}
              transition={"300ms"}
            >
              Edit mode
            </Badge>
          </Heading>
          <Heading size={100} fontWeight={700}>
            created {format(new Date(credentials.createdAt), "MMMM dd, yyyy")}
          </Heading>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip
            position={Position.BOTTOM}
            content={isEditing ? "Cancel" : "Edit"}
          >
            <IconButton
              icon={isEditing ? ResetIcon : EditIcon}
              marginRight={6}
              onClick={() => (isEditing ? handleReset() : setIsEditing(true))}
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
      {isEditing && (
        <>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Controller
              control={control}
              name="name"
              rules={{ required: true }}
              defaultValue={credentials.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Account Name"
                  value={value}
                  disabled={!isEditing}
                  width={"100%"}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && (
              <Text color="#D14343" position="absolute" bottom="5px">
                <Small>Please enter a name</Small>
              </Text>
            )}
          </div>
          <Controller
            control={control}
            name="website"
            defaultValue={credentials.website ? credentials.website : ""}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInputField
                label="Website"
                disabled={!isEditing}
                width={"100%"}
                marginRight={6}
                onChange={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
        </>
      )}

      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <Controller
          control={control}
          name="account"
          defaultValue={credentials.account ? credentials.account : ""}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInputField
              label="Username / Email"
              disabled={!isEditing}
              width={"100%"}
              marginRight={6}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!isEditing}
          width={"100%"}
          marginRight={6}
        />
        {isEditing && status !== "TRIAL_IN_PROGRESS" && (
          <Tooltip content="Generate new password">
            <IconButton
              icon={LightningIcon}
              marginRight={6}
              onClick={generatePassword}
              disabled={status === "TRIAL_IN_PROGRESS"}
            />
          </Tooltip>
        )}
        <Tooltip content="Copy">
          <IconButton icon={ClipboardIcon} onClick={handleCopyPassword} />
        </Tooltip>
        {showPassword ? (
          <EyeOffIcon
            className="eye-icon-creds"
            onClick={() => setShowPassword(false)}
            right={isEditing && status !== "TRIAL_IN_PROGRESS" ? 86 : 50}
          />
        ) : (
          <EyeOpenIcon
            className="eye-icon-creds"
            onClick={() => setShowPassword(true)}
            right={isEditing && status !== "TRIAL_IN_PROGRESS" ? 86 : 50}
          />
        )}
      </div>
    </Dialog>
  );
};
