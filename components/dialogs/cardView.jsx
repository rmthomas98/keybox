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
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { getSession } from "next-auth/react";
import { format } from "date-fns";
import Image from "next/image";

export const CardView = ({ isShown, setIsShown, card }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setIsShown(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    toaster.closeAll();
    const res = await axios.post("/api/cards/delete", {});
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
      onCloseComplete={handleClose}
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
          <Button
            iconBefore={EditIcon}
            onClick={() => setIsEditing((prev) => !prev)}
            marginRight={6}
          >
            Edit
          </Button>
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
    </Dialog>
  );
};
