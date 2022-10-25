import {
  Dialog,
  IconButton,
  Heading,
  toaster,
  TextInputField,
  SelectMenu,
  Tooltip,
  Position,
  Badge,
  EditIcon,
  ResetIcon,
  TrashIcon,
  Popover,
  Card,
  Paragraph,
  Small,
  Button,
  Text,
  CaretDownIcon,
  ClipboardIcon,
} from "evergreen-ui";
import { useState, useEffect } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { format } from "date-fns";

const types = [
  {
    label: "Credit",
    value: "CREDIT",
  },
  {
    label: "Debit",
    value: "DEBIT",
  },
  {
    label: "Prepaid",
    value: "PREPAID",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

const brands = [
  {
    label: "Visa",
    value: "VISA",
  },
  {
    label: "Mastercard",
    value: "MASTERCARD",
  },
  {
    label: "American Express",
    value: "AMEX",
  },
  {
    label: "Discover",
    value: "DISCOVER",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 16; i++) {
    years.push((currentYear + i).toString());
  }
  return years;
};

export const CardView = ({ isShown, setIsShown, card, setCard, setCards }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [type, setType] = useState(null);
  const [brand, setBrand] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const years = getYears();

  // Input values
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [showFormError, setShowFormError] = useState(false);

  // Watch for changes in values to enable save button
  useEffect(() => {
    if (!isShown) return;

    const expMonth = card.exp ? card.exp.split("/")[0] : null;
    const expYear = card.exp ? card.exp.split("/")[2] : null;
    const currExp = `${expMonth}/01/${expYear}`;
    const newExp = `${month}/01/${year}`;

    if (isEditing) {
      if (identifier !== card?.identifier) {
        setIsConfirmDisabled(false);
      } else if (name !== card?.name) {
        setIsConfirmDisabled(false);
      } else if (number !== card?.number) {
        setIsConfirmDisabled(false);
      } else if (cvc !== card?.cvc) {
        setIsConfirmDisabled(false);
      } else if (zip !== card?.zip) {
        setIsConfirmDisabled(false);
      } else if (type !== card.type) {
        setIsConfirmDisabled(false);
      } else if (currExp !== newExp) {
        setIsConfirmDisabled(false);
      } else {
        setIsConfirmDisabled(true);
      }
    } else {
      setIsConfirmDisabled(true);
    }

    return () => setIsConfirmDisabled(true);
  }, [identifier, name, number, cvc, zip, type, month, year]);

  // Reset from cancel editing
  const handleReset = () => {
    setIsEditing(false);
    setIsLoading(false);
    setIsConfirmDisabled(true);
    setBrand(card.brand ? card.brand : null);
    setType(card.type ? card.type : null);
    const expMonth = card.exp ? card.exp.split("/")[0] : null;
    const expYear = card.exp ? card.exp.split("/")[2] : null;
    if (expMonth && expYear) {
      setMonth(expMonth);
      setYear(expYear);
    }
    setIdentifier(card.identifier || "");
    setName(card.name || "");
    setNumber(card.number || "");
    setCvc(card.cvc || "");
    setZip(card.zip || "");
  };

  // Reset all values on modal close
  const handleClose = () => {
    setIsShown(false);
    setIsEditing(false);
    setCard(null);
    setIsDeleting(false);
    setIsLoading(false);
    setIsConfirmDisabled(true);
    setType(null);
    setBrand(null);
    setMonth(null);
    setYear(null);
    setIdentifier("");
    setName("");
    setNumber("");
    setCvc("");
    setZip("");
  };

  // populates data into fields on open
  useEffect(() => {
    if (!isShown || !card) return;
    setBrand(card.brand ? card.brand : null);
    setType(card.type ? card.type : null);
    const expMonth = card.exp ? card.exp.split("/")[0] : null;
    const expYear = card.exp ? card.exp.split("/")[2] : null;
    if (expMonth && expYear) {
      setMonth(expMonth);
      setYear(expYear);
    }

    setIdentifier(card.identifier || "");
    setName(card.name || "");
    setNumber(card.number || "");
    setCvc(card.cvc || "");
    setZip(card.zip || "");
  }, [isShown, card]);

  // Copy card number to clipboard
  const handleCopyNumber = async () => {
    await toaster.closeAll();
    navigator.clipboard.writeText(card.number);
    toaster.success("Card number copied to clipboard");
  };

  // Deletes the card
  const handleDelete = async () => {
    setIsDeleting(true);
    toaster.closeAll();
    const session = await getSession();
    const { id } = session;

    const res = await axios.post("/api/cards/delete", {
      id: card.id,
      userId: id,
    });

    if (res.data.error) {
      setIsDeleting(false);
      toaster.danger(res.data.message);
      return;
    }

    toaster.success("Card deleted successfully");
    setCards(res.data.cards);
    handleClose();
  };

  // Function to update any changes
  const submit = async () => {
    if (!identifier) return setShowFormError(true);

    setIsLoading(true);
    await toaster.closeAll();
    const session = await getSession();
    const { id } = session;

    const data = {
      userId: id,
      cardId: card.id,
      type,
      brand,
      identifier,
      name,
      number,
      cvc,
      zip,
    };

    if (month && year) {
      data["exp"] = `${month}/01/${year}`;
    } else {
      data["exp"] = null;
    }

    if (data.identifier !== card.identifier) {
      data["identifierChange"] = true;
    }

    const res = await axios.post("/api/cards/edit", data);

    if (res.data.error) {
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    toaster.success(res.data.message);
    setCard(res.data.card);
    setCards(res.data.cards);
    handleReset();
  };

  useEffect(() => {
    if (!identifier) {
      setShowFormError(true);
    } else {
      setShowFormError(false);
    }
  }, [identifier]);

  if (!card) return null;

  return (
    <Dialog
      isShown={isShown}
      title={
        card.type
          ? `${
              card.type.charAt(0).toUpperCase() +
              card.type.slice(1).toLowerCase()
            } Card`
          : "Card"
      }
      shouldCloseOnOverlayClick={false}
      confirmLabel="Save changes"
      onCloseComplete={handleClose}
      cancelLabel="Close"
      isConfirmDisabled={isConfirmDisabled}
      onConfirm={submit}
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Heading
              size={500}
              marginBottom={4}
              marginRight={6}
              display="flex"
              alignItems="center"
              maxWidth={200}
            >
              {card.identifier}
            </Heading>
            {card.type && (
              <Badge
                color="teal"
                position={isEditing ? "absolute" : "relative"}
                opacity={isEditing ? 0 : 1}
                transition={"transform 300ms"}
                transform={isEditing ? "scale(0.75)" : "scale(1)"}
              >
                {card.type}
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
            {card.exp && "Expires"}{" "}
            {card.exp
              ? format(new Date(card.exp), "MMMM yyyy")
              : "No Expiration date set"}
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
                  Delete Card
                </Heading>
                <Paragraph>
                  <Small>
                    Are you sure you want to delete this card?
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
            label="Card Identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Identifier"
          />
          {showFormError && (
            <Text color="#D14343" position="absolute" bottom="-20px">
              <Small>Please enter an identifier</Small>
            </Text>
          )}
        </div>
      )}
      <div style={{ display: "flex" }}>
        <TextInputField
          label="Account Holder"
          placeholder="Account Holder"
          width="100%"
          marginRight={14}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isEditing}
        />

        <div>
          <Heading size={400} marginBottom={8}>
            Type
          </Heading>
          <SelectMenu
            options={types}
            position={Position.BOTTOM_RIGHT}
            selected={type}
            onSelect={(type) => setType(type.value)}
            hasFilter={false}
            title="Card Type"
          >
            <Button iconAfter={CaretDownIcon} disabled={!isEditing}>
              {type ? type : "Card Type"}
            </Button>
          </SelectMenu>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <TextInputField
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          label="Card Number"
          width="100%"
          placeholder="1234 5678 9012 3456"
          disabled={!isEditing}
          marginRight={10}
        />
        <Tooltip content="Copy Number">
          <IconButton
            icon={ClipboardIcon}
            marginY={"auto"}
            marginRight={8}
            onClick={handleCopyNumber}
          />
        </Tooltip>
        {/*<div>*/}
        {/*  <Heading size={400} marginBottom={8}>*/}
        {/*    Brand*/}
        {/*  </Heading>*/}
        {/*  <SelectMenu*/}
        {/*    options={brands}*/}
        {/*    onSelect={(brand) => setBrand(brand.value)}*/}
        {/*    selected={brand}*/}
        {/*    hasFilter={false}*/}
        {/*    title="Card Brand"*/}
        {/*    position={Position.BOTTOM_RIGHT}*/}
        {/*  >*/}
        {/*    <Button disabled={!isEditing} iconAfter={CaretDownIcon}>*/}
        {/*      {brand ? brand : "Card Brand"}*/}
        {/*    </Button>*/}
        {/*  </SelectMenu>*/}
        {/*</div>*/}
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: 14 }}>
          <Heading size={400} marginBottom={8}>
            Exp Month
          </Heading>
          <SelectMenu
            title="Month"
            hasFilter={false}
            position={Position.BOTTOM_LEFT}
            options={months.map((month) => ({ label: month, value: month }))}
            onSelect={(item) => setMonth(item.value)}
            selected={month}
          >
            <Button iconAfter={CaretDownIcon} width={76} disabled={!isEditing}>
              {month ? month : "Month"}
            </Button>
          </SelectMenu>
        </div>
        <div style={{ marginRight: 14 }}>
          <Heading size={400} marginBottom={8}>
            Exp Year
          </Heading>
          <SelectMenu
            title="Year"
            hasFilter={false}
            position={Position.BOTTOM_LEFT}
            options={years.map((year) => ({ label: year, value: year }))}
            onSelect={(item) => setYear(item.value)}
            selected={year}
          >
            <Button iconAfter={CaretDownIcon} width={76} disabled={!isEditing}>
              {year ? year : "Year"}
            </Button>
          </SelectMenu>
        </div>
        <TextInputField
          label="CVC"
          marginRight={14}
          placeholder="123"
          onChange={(e) => setCvc(e.target.value)}
          value={cvc}
          disabled={!isEditing}
        />
        <TextInputField
          label="Zip"
          placeholder="12345"
          onChange={(e) => setZip(e.target.value)}
          value={zip}
          disabled={!isEditing}
        />
      </div>
    </Dialog>
  );
};
