import {
  Dialog,
  Small,
  Text,
  TextInputField,
  toaster,
  SelectMenu,
  Button,
  Position,
  CaretDownIcon,
} from "evergreen-ui";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";
import axios from "axios";
import { getSession } from "next-auth/react";

export const NewCard = ({ isShown, setIsShown, setCards }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const router = useRouter();

  const handleClose = () => {
    setIsShown(false);
    setIsLoading(false);
    setType(null);
    reset();
  };

  const submit = async (data) => {
    setIsLoading(true);

    let { exp } = data;
    if (exp && exp.length === 5 && exp.includes("/")) {
      const [month, year] = data.exp.split("/");
      exp = [month, "01", year].join("/");
    }

    const session = await getSession();
    const { id } = session;
    const { identifier, name, number, cvc, zip } = data;
    const options = { id, identifier, name, number, exp, cvc, zip };

    const res = await axios.post("/api/cards/new", { options });

    if (res.data.error) {
      toaster.danger(res.data.message);
      setIsLoading(false);
      return;
    }

    toaster.success(res.data.message);
    setCards(res.data.cards);
    handleClose();
  };

  return (
    <Dialog
      isShown={isShown}
      onCloseComplete={handleClose}
      title="Add New Card"
      shouldCloseOnOverlayClick={false}
      onConfirm={handleSubmit(submit)}
      isConfirmLoading={isLoading}
    >
      <div style={{ position: "relative" }}>
        <Controller
          control={control}
          name="identifier"
          defaultValue={""}
          rules={{ required: true }}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Card Identifier"
              placeholder="Chase Freedom, Discover Credit Card..."
              onChange={onChange}
              value={value}
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
      <Controller
        control={control}
        name="name"
        defaultValue={""}
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            label="Account Holder"
            placeholder="John Doe"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
          />
        )}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <Controller
          control={control}
          name="number"
          defaultValue={""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
              width="100%"
              marginRight={14}
            />
          )}
        />
        <SelectMenu
          title="Card Type"
          hasFilter={false}
          position={Position.BOTTOM_RIGHT}
          options={["Credit", "Debit"].map((label) => ({
            label,
            value: label,
          }))}
          selected={type}
          onSelect={(item) => setType(item.value)}
        >
          <Button iconAfter={CaretDownIcon}>{type ? type : "Card Type"}</Button>
        </SelectMenu>
      </div>
      <div style={{ display: "flex" }}>
        <Controller
          control={control}
          name="exp"
          defaultValue={""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Exp"
              marginRight={14}
              placeholder="MM / YY"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="cvc"
          defaultValue={""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="CVC"
              marginRight={14}
              placeholder="123"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="zip"
          defaultValue={""}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              label="Zip"
              placeholder="12345"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
            />
          )}
        />
      </div>
    </Dialog>
  );
};
