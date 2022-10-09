import {
  Dialog,
  SelectMenu,
  TextInputField,
  Heading,
  toaster,
  Text,
  Small,
  Button,
  Position,
  CaretDownIcon,
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

export const NewBank = ({ show, setShow, setBanks }) => {
  const [identifier, setIdentifier] = useState("");
  const [type, setType] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [routing, setRouting] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    if (identifier) {
      setIsFormValid(true);
    }
  }, [identifier]);

  const handleClose = () => {
    setShow(false);
    setIdentifier("");
    setType(null);
    setOwnership(null);
    setName("");
    setAccount("");
    setRouting("");
    setIsLoading(false);
    setIsFormValid(true);
  };

  const submit = async () => {
    toaster.closeAll();
    if (!identifier) return setIsFormValid(false);
    setIsLoading(true);
    const session = await getSession();
    const { id: userId } = session;
    const { data } = await axios.post("/api/banks/new", {
      userId,
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
    toaster.success(data.message);
    handleClose();
  };

  return (
    <Dialog
      isShown={show}
      title="Add Bank Account"
      onCloseComplete={handleClose}
      shouldCloseOnOverlayClick={false}
      onConfirm={submit}
      isConfirmLoading={isLoading}
    >
      <div style={{ position: "relative" }}>
        <TextInputField
          label="Bank Identifier"
          placeholder="Enter a unique identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <TextInputField
        label="Account Holder"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Account Holder Name"
      />
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Account Number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Account Number"
          width="100%"
          marginRight={14}
        />
        <div>
          <Heading size={400} marginBottom={8}>
            Type
          </Heading>
          <SelectMenu
            title="Account Type"
            options={types}
            position={Position.BOTTOM_RIGHT}
            hasFilter={false}
            selected={type}
            onSelect={(item) => setType(item.value)}
          >
            <Button iconAfter={CaretDownIcon} minWidth={100}>
              {type || "Account Type"}
            </Button>
          </SelectMenu>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Routing Number"
          value={routing}
          onChange={(e) => setRouting(e.target.value)}
          placeholder="Routing Number"
          width="100%"
          marginRight={14}
        />
        <div>
          <Heading size={400} marginBottom={8}>
            Ownership
          </Heading>
          <SelectMenu
            title="Ownership"
            options={ownerships}
            position={Position.BOTTOM_RIGHT}
            hasFilter={false}
            selected={ownership}
            onSelect={(item) => setOwnership(item.value)}
          >
            <Button iconAfter={CaretDownIcon} minWidth={100}>
              {ownership || "Ownership"}
            </Button>
          </SelectMenu>
        </div>
      </div>
    </Dialog>
  );
};
