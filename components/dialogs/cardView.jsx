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
} from "evergreen-ui";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { getSession } from "next-auth/react";
import { format } from "date-fns";

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

export const CardView = ({ isShown, setIsShown, card, setCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false);
  const [type, setType] = useState(null);
  const [brand, setBrand] = useState(null);
  const [month, setMonth] = useState(card?.exp ? card.exp.split("/")[0] : null);
  const [year, setYear] = useState(card?.exp ? card.exp.split("/")[2] : null);
  const years = getYears();

  console.log(brand, type);

  useEffect(() => {
    if (!isShown) return;
    setBrand(card.brand ? card.brand : null);
    setType(card.type ? card.type : null);
  }, [isShown]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm();

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
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    toaster.closeAll();
    const res = await axios.post("/api/cards/delete", { id: card.id });
    if (res.data.error) {
      setIsDeleting(false);
      toaster.danger(res.data.message);
      return;
    }

    handleClose();
  };

  if (!card) return null;

  return (
    <Dialog
      isShown={isShown}
      title={
        card?.brand
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
              : "No Expiration date"}
          </Heading>
        </div>
        <div style={{ display: "flex" }}>
          <Tooltip content={isEditing ? "Cancel" : "Edit"}>
            <IconButton
              icon={isEditing ? ResetIcon : EditIcon}
              intent={isEditing ? "danger" : "none"}
              onClick={() => setIsEditing((prev) => !prev)}
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
      <div style={{ position: "relative" }}>
        <Controller
          control={control}
          name="identifier"
          rules={{ required: true }}
          defaultValue={card ? card.identifier : ""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Card Identifier"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </div>
    </Dialog>
  );
};
