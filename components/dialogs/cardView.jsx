import {
  Dialog,
  IconButton,
  Heading,
  toaster,
  TextInputField,
  SelectMenu,
  Tooltip,
  Position,
  Link,
  LinkIcon,
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
import { useForm, Controller } from "react-hook-form";
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

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Watch for changes in values to enable save button
  useEffect(() => {
    if (!isShown) return;

    const identifier = watch("identifier");
    const name = watch("name");
    const number = watch("number");
    const cvc = watch("cvc");
    const zip = watch("zip");

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
      } else {
        setIsConfirmDisabled(true);
      }
    } else {
      setIsConfirmDisabled(true);
    }

    return () => setIsConfirmDisabled(true);
  }, [
    watch("identifier"),
    watch("name"),
    watch("number"),
    watch("cvc"),
    watch("zip"),
  ]);

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
    reset();
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
    reset();
  };

  // populates data into fields on open
  useEffect(() => {
    if (!isShown) return;
    setBrand(card.brand ? card.brand : null);
    setType(card.type ? card.type : null);
    const expMonth = card.exp ? card.exp.split("/")[0] : null;
    const expYear = card.exp ? card.exp.split("/")[2] : null;
    if (expMonth && expYear) {
      setMonth(expMonth);
      setYear(expYear);
    }

    return () => {
      handleClose();
    };
  }, [isShown]);

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
  const submit = async (data) => {
    setIsLoading(true);
    await toaster.closeAll();
    const session = await getSession();
    const { id } = session;

    data["userId"] = id;
    data["cardId"] = card.id;
    data["type"] = type;
    data["brand"] = brand;

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
    setCard();
    setCard(res.data.card);
    setCards(res.data.cards);
    setIsLoading(false);
    setIsConfirmDisabled(true);
    setIsEditing(false);
  };

  if (!card) return null;

  return (
    <Dialog
      isShown={isShown}
      title={
        card.brand
          ? `${
              card.brand === "AMEX"
                ? "American Express"
                : card.brand.charAt(0).toUpperCase() +
                  card.brand.slice(1).toLowerCase()
            }`
          : "Card"
      }
      shouldCloseOnOverlayClick={false}
      confirmLabel="Save changes"
      onCloseComplete={handleClose}
      cancelLabel="Close"
      isConfirmDisabled={isConfirmDisabled}
      onConfirm={handleSubmit(submit)}
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
          <Controller
            control={control}
            name="identifier"
            rules={{ required: true }}
            defaultValue={card.identifier}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInputField
                label="Card Identifier"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.identifier && (
            <Text color="#D14343" position="absolute" bottom="-20px">
              <Small>Please enter an identifier</Small>
            </Text>
          )}
        </div>
      )}
      <div style={{ display: "flex" }}>
        <Controller
          control={control}
          name="name"
          defaultValue={card.name}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              label="Account Holder"
              placeholder="Account Holder"
              width="100%"
              marginRight={14}
              disabled={!isEditing}
            />
          )}
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
        <Controller
          control={control}
          name="number"
          defaultValue={card.number}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              label="Card Number"
              width="100%"
              placeholder="1234 5678 9012 3456"
              disabled={!isEditing}
              marginRight={10}
            />
          )}
        />
        <Tooltip content="Copy Number">
          <IconButton
            icon={ClipboardIcon}
            marginY={"auto"}
            marginRight={8}
            onClick={handleCopyNumber}
          />
        </Tooltip>
        <div>
          <Heading size={400} marginBottom={8}>
            Brand
          </Heading>
          <SelectMenu
            options={brands}
            onSelect={(brand) => setBrand(brand.value)}
            selected={brand}
            hasFilter={false}
            title="Card Brand"
            position={Position.BOTTOM_RIGHT}
          >
            <Button disabled={!isEditing} iconAfter={CaretDownIcon}>
              {brand ? brand : "Card Brand"}
            </Button>
          </SelectMenu>
        </div>
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
        <Controller
          control={control}
          name="cvc"
          defaultValue={card.cvc ? card.cvc : ""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="CVC"
              marginRight={14}
              placeholder="123"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              disabled={!isEditing}
            />
          )}
        />
        <Controller
          control={control}
          name="zip"
          defaultValue={card.zip ? card.zip : ""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Zip"
              placeholder="12345"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              disabled={!isEditing}
            />
          )}
        />
      </div>
    </Dialog>
  );
};
