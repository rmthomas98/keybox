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
  Heading,
} from "evergreen-ui";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";
import axios from "axios";
import { getSession } from "next-auth/react";

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

const cardTypes = [
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

const getExpYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 16; i++) {
    years.push(currentYear + i);
  }
  return years;
};

export const NewCard = ({ isShown, setIsShown, setCards }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(null);
  const [brand, setBrand] = useState(null);
  const [expMonth, setExpMonth] = useState(null);
  const [expYear, setExpYear] = useState(null);
  const years = getExpYears();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const handleClose = () => {
    setIsShown(false);
    setIsLoading(false);
    setType(null);
    setBrand(null);
    setExpMonth(null);
    setExpYear(null);
    reset();
  };

  const submit = async (data) => {
    setIsLoading(true);
    await toaster.closeAll();

    const session = await getSession();

    if (expYear && expMonth) {
      data.exp = `${expMonth}/01/${expYear}`;
    }

    const { id } = session;
    const { identifier, name, number, cvc, zip, exp } = data;
    const options = {
      id,
      identifier,
      name,
      number,
      exp,
      cvc,
      zip,
      type,
      brand,
    };

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
      <div style={{ display: "flex" }}>
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
              width="100%"
              marginRight={14}
            />
          )}
        />
        <div>
          <Heading size={400} marginBottom={8}>
            Type
          </Heading>
          <SelectMenu
            title="Card Type"
            hasFilter={false}
            position={Position.BOTTOM_RIGHT}
            options={cardTypes}
            selected={type}
            onSelect={(item) => setType(item.value)}
          >
            <Button iconAfter={CaretDownIcon}>
              {type ? type : "Card Type"}
            </Button>
          </SelectMenu>
        </div>
      </div>
      <div style={{ display: "flex" }}>
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
        <div>
          <Heading size={400} marginBottom={8}>
            Brand
          </Heading>
          <SelectMenu
            title="Card Brand"
            hasFilter={false}
            position={Position.BOTTOM_RIGHT}
            options={brands}
            selected={brand}
            onSelect={(item) => setBrand(item.value)}
          >
            <Button iconAfter={CaretDownIcon}>
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
            onSelect={(item) => setExpMonth(item.value)}
          >
            <Button iconAfter={CaretDownIcon} width={76}>
              {expMonth ? expMonth : "Month"}
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
            options={years.map((month) => ({ label: month, value: month }))}
            onSelect={(item) => setExpYear(item.value)}
          >
            <Button iconAfter={CaretDownIcon} width={76}>
              {expYear ? expYear : "Year"}
            </Button>
          </SelectMenu>
        </div>
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
