import {
  Dialog,
  Heading,
  toaster,
  IconButton,
  Tooltip,
  Popover,
  Badge,
  EditIcon,
  ResetIcon,
  TrashIcon,
  Card,
  Paragraph,
  Small,
  Button,
  Position,
  Text,
  TextInputField,
  TextInput,
  ClipboardIcon,
  EyeOffIcon,
  EyeOpenIcon,
  TagInput,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import { format } from "date-fns";

export const CryptoWalletView = ({
  show,
  setShow,
  wallet,
  setWallet,
  setWallets,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [key, setKey] = useState("");
  const [phrase, setPhrase] = useState([]);

  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (show && wallet) {
      setName(wallet.name || "");
      setAddress(wallet.address || "");
      setKey(wallet.privateKey || "");
      setPhrase(wallet.phrase || []);
    }
  }, [show]);

  console.log(name, address, key, phrase);

  const handleClose = () => {
    setShow(false);
  };

  const handleReset = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {};

  const handleCopy = async (text) => {
    await toaster.closeAll();
    navigator.clipboard.writeText(text);
    if (text === key) {
      toaster.success("Key copied to clipboard");
    } else if (text === address) {
      toaster.success("Address copied to clipboard");
    }
  };

  if (!wallet) return null;

  return (
    <Dialog
      isShown={show}
      title="Crypto Wallet"
      onCloseComplete={handleClose}
      shouldCloseOnOverlayClick={false}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E6E8F0",
          marginBottom: 12,
          paddingBottom: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Heading
              size={600}
              marginRight={6}
              marginBottom={4}
              display="flex"
              alignItems="center"
              maxWidth={200}
            >
              {wallet.name}
            </Heading>
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
            Created {format(new Date(wallet.createdAt), "MMMM dd, yyyy")}
          </Heading>
        </div>
        <div style={{ display: "flex" }}>
          <Tooltip content={isEditing ? "Cancel" : "Edit"}>
            <IconButton
              icon={isEditing ? ResetIcon : EditIcon}
              onClick={isEditing ? handleReset : () => setIsEditing(true)}
              intent={isEditing ? "danger" : "none"}
              marginRight={6}
            />
          </Tooltip>
          <Popover
            content={({ close }) => (
              <Card padding={20}>
                <Heading size={500} marginBottom={10}>
                  Delete Wallet
                </Heading>
                <Paragraph>
                  <Small>
                    Are you sure you want to delete this wallet?
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
        <TextInputField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wallet name"
          disabled={!isEditing}
        />
      )}
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Wallet address"
          disabled={!isEditing}
          width="100%"
          marginRight={6}
        />
        <Tooltip content="Copy address">
          <IconButton
            icon={ClipboardIcon}
            marginY={"auto"}
            onClick={() => handleCopy(address)}
          />
        </Tooltip>
      </div>
      <div style={{ display: "flex", position: "relative" }}>
        <TextInputField
          label="Private Key"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Wallet Private Key"
          disabled={!isEditing}
          width="100%"
          marginRight={6}
          type={showKey ? "text" : "password"}
        />
        <Tooltip content="Copy key">
          <IconButton
            icon={ClipboardIcon}
            marginY={"auto"}
            onClick={() => handleCopy(key)}
          />
        </Tooltip>
        {showKey && (
          <EyeOffIcon
            position="absolute"
            right="50px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowKey(false)}
          />
        )}
        {!showKey && (
          <EyeOpenIcon
            position="absolute"
            right="50px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowKey(true)}
          />
        )}
      </div>
      <div>
        <Heading size={400} marginBottom={8}>
          Seed Phrase
        </Heading>
        <TagInput
          values={phrase}
          onChange={(values) => setPhrase(values)}
          label="Seed Phrase"
          tagSubmitKey="enter"
          inputProps={{
            placeholder: "Seed phrase",
          }}
          width="100%"
          disabled={!isEditing}
        />
        <Text>
          <Small>Press enter to add a new word</Small>
        </Text>
      </div>
    </Dialog>
  );
};
