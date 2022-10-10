import {
  Dialog,
  Badge,
  Heading,
  Button,
  SelectMenu,
  Position,
  CaretDownIcon,
  TextInputField,
  toaster,
  Tooltip,
  IconButton,
  ResetIcon,
  EditIcon,
  Popover,
  Card,
  Paragraph,
  Small,
  TrashIcon,
  Text,
  ClipboardIcon,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

const types = [
  {
    label: "Checking",
    value: "CHECKING",
  },
  {
    label: "Savings",
    value: "SAVINGS",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

const ownerships = [
  {
    label: "Individual",
    value: "INDIVIDUAL",
  },
  {
    label: "Business",
    value: "BUSINESS",
  },
  {
    label: "Joint",
    value: "JOINT",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

export const BankView = ({ show, setShow, setBanks, bank, setBank }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);

  const [identifier, setIdentifier] = useState("");
  const [type, setType] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [routing, setRouting] = useState("");

  const setValues = () => {
    setIdentifier(bank.identifier || "");
    setType(bank.type || null);
    setOwnership(bank.ownership || null);
    setName(bank.name || "");
    setAccount(bank.account || "");
    setRouting(bank.routing || "");
  };

  useEffect(() => {
    if (show && bank) {
      setValues();
    }
  }, [show, bank]);

  useEffect(() => {
    if (isEditing && !identifier) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [identifier]);

  useEffect(() => {
    if (isEditing) {
      if (identifier !== bank.identifier) {
        setIsConfirmDisabled(false);
      } else if (type !== bank.type) {
        setIsConfirmDisabled(false);
      } else if (ownership !== bank.ownership) {
        setIsConfirmDisabled(false);
      } else if (name !== bank.name) {
        setIsConfirmDisabled(false);
      } else if (account !== bank.account) {
        setIsConfirmDisabled(false);
      } else if (routing !== bank.routing) {
        setIsConfirmDisabled(false);
      } else {
        setIsConfirmDisabled(true);
      }
    } else {
      setIsConfirmDisabled(true);
    }
  }, [identifier, type, ownership, name, account, routing]);

  const resetValues = () => {
    setValues();
    setIsEditing(false);
    setIsConfirmDisabled(true);
  };

  const handleClose = () => {
    setShow(false);
    setIsLoading(false);
    setIsEditing(false);
    setIsDeleting(false);
    setIdentifier("");
    setType(null);
    setOwnership(null);
    setName("");
    setAccount("");
    setRouting("");
    setIsConfirmDisabled(true);
  };

  const handleDelete = async () => {
    await toaster.closeAll();
    setIsDeleting(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/banks/delete", {
      userId: id,
      bankId: bank.id,
    });
    if (data.error) {
      toaster.danger(data.message);
      setIsDeleting(false);
      return;
    }

    setBanks(data.banks);
    toaster.success(data.message);
    handleClose();
  };

  const handleSubmit = async () => {
    toaster.closeAll();
    if (!identifier) return setIsFormValid(false);
    setIsLoading(true);

    const session = await getSession();
    const { id } = session;

    const { data } = await axios.post("/api/banks/edit", {
      userId: id,
      bankId: bank.id,
      identifier,
      type,
      ownership,
      name,
      account,
      routing,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setBanks(data.banks);
    setBank(data.bank);
    setIsLoading(false);
    setIsEditing(false);
    toaster.success(data.message);
  };

  const handleCopy = async (value) => {
    await toaster.closeAll();
    navigator.clipboard.writeText(value);
    value === account
      ? toaster.success("Account number copied to clipboard")
      : toaster.success("Routing number copied to clipboard");
  };

  if (!bank) return null;

  return (
    <Dialog
      isShown={show}
      onCloseComplete={handleClose}
      title="Bank Account"
      shouldCloseOnOverlayClick={false}
      confirmLabel="Save changes"
      isConfirmLoading={isLoading}
      isConfirmDisabled={!isEditing || isConfirmDisabled}
      onConfirm={handleSubmit}
      cancelLabel="Close"
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
              {bank.identifier}
            </Heading>
            {bank.type && (
              <Badge
                color="teal"
                position={isEditing ? "absolute" : "relative"}
                opacity={isEditing ? 0 : 1}
                transition={"transform 300ms"}
                transform={isEditing ? "scale(0.75)" : "scale(1)"}
              >
                {bank.type}
              </Badge>
            )}
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
            {bank.ownership
              ? `${bank.ownership} Account`
              : "Account type not set"}
          </Heading>
        </div>
        <div style={{ display: "flex" }}>
          <Tooltip content={isEditing ? "Cancel" : "Edit"}>
            <IconButton
              icon={isEditing ? ResetIcon : EditIcon}
              intent={isEditing ? "danger" : "none"}
              onClick={isEditing ? resetValues : () => setIsEditing(true)}
              marginRight={6}
            />
          </Tooltip>
          <Popover
            content={({ close }) => (
              <Card padding={20}>
                <Heading size={500} marginBottom={10}>
                  Delete Bank
                </Heading>
                <Paragraph>
                  <Small>
                    Are you sure you want to delete this bank?
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
        <div style={{ position: "relative" }}>
          <TextInputField
            label="Bank Identifier"
            placeholder="Bank Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={!isEditing}
          />
          {!isFormValid && (
            <Text color="#D14343" position="absolute" bottom="-20px">
              <Small>Please enter an identifier</Small>
            </Text>
          )}
        </div>
      )}
      <TextInputField
        label="Account Holder"
        placeholder="Account Holder Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!isEditing}
      />
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Account Number"
          placeholder="Account Number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          disabled={!isEditing}
          width="100%"
          marginRight={8}
        />
        <Tooltip content="Copy account #">
          <IconButton
            icon={ClipboardIcon}
            onClick={() => handleCopy(account)}
            marginY="auto"
            marginRight={8}
          />
        </Tooltip>
        <div>
          <Heading size={400} marginBottom={8}>
            Type
          </Heading>
          <SelectMenu
            title="Account Type"
            position={Position.BOTTOM_RIGHT}
            hasFilter={false}
            options={types}
            selected={type}
            onSelect={(item) => setType(item.value)}
          >
            <Button iconAfter={CaretDownIcon} disabled={!isEditing}>
              {type || "Account Type"}
            </Button>
          </SelectMenu>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Routing Number"
          placeholder="Routing Number"
          value={routing}
          onChange={(e) => setRouting(e.target.value)}
          disabled={!isEditing}
          width="100%"
          marginRight={8}
        />
        <Tooltip content="Copy routing #">
          <IconButton
            icon={ClipboardIcon}
            onClick={() => handleCopy(routing)}
            marginY="auto"
            marginRight={8}
          />
        </Tooltip>
        <div>
          <Heading size={400} marginBottom={8}>
            Ownership
          </Heading>
          <SelectMenu
            title="Ownership"
            position={Position.BOTTOM_RIGHT}
            hasFilter={false}
            options={ownerships}
            selected={ownership}
            onSelect={(item) => setOwnership(item.value)}
          >
            <Button iconAfter={CaretDownIcon} disabled={!isEditing}>
              {ownership || "Ownership"}
            </Button>
          </SelectMenu>
        </div>
      </div>
    </Dialog>
  );
};
