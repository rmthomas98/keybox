import {
  Dialog,
  TextInputField,
  Switch,
  Text,
  Small,
  InfoSignIcon,
  Tooltip,
  Badge,
} from "evergreen-ui";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

export const NewCredentials = ({ show, setShow, status }) => {
  const [password, setPassword] = useState("");
  const [genPass, setGenPass] = useState(false);
  const [genPassDisabled, setGenPassDisabled] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setGenPass(false);
    reset();

    if (status === "TRIAL_IN_PROGRESS") setGenPassDisabled(true);
  }, [show]);

  const submit = (data) => {
    console.log("hello");
    console.log(data);
  };

  return (
    <Dialog
      isShown={show}
      title="Add new credentials"
      onCloseComplete={() => setShow(false)}
      onConfirm={handleSubmit(submit)}
    >
      <div style={{ position: "relative" }}>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInputField
              label="Account Name"
              placeholder="Twitter, Instagram, etc."
              autoComplete="off"
              type="text"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
          name="name"
        />
        {errors.name && (
          <Text color="#D14343" position="absolute" bottom="-20px">
            <Small>Please enter a name</Small>
          </Text>
        )}
      </div>
      <TextInputField
        label="Username / Email"
        placeholder="Username or email used to login"
        type="text"
        autoComplete="off"
      />
      <div style={{ position: "relative" }}>
        <TextInputField
          disabled={genPass}
          label="Password"
          placeholder="Password for the account"
          type="password"
        />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Switch
          checked={genPass}
          onChange={(e) => setGenPass(e.target.checked)}
          hasCheckIcon
          disabled={genPassDisabled}
        />
        <Text marginLeft={10} marginRight={10}>
          <Small>Generate Password</Small>
        </Text>
        <Tooltip
          content={
            status !== "TRIAL_IN_PROGRESS"
              ? "We will generate a unique 15 character password for you."
              : "Upgrade to premium in order to gain access to this feature."
          }
        >
          <InfoSignIcon size={14} color="muted" />
        </Tooltip>
        {status === "TRIAL_IN_PROGRESS" && (
          <Badge color="red" marginLeft={10}>
            disabled
          </Badge>
        )}
      </div>
    </Dialog>
  );
};
