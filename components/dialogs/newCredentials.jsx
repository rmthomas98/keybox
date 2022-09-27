import {
  Dialog,
  TextInputField,
  Switch,
  Text,
  Small,
  InfoSignIcon,
  Tooltip,
  Badge,
  EyeOpenIcon,
  EyeOffIcon,
  toaster,
} from "evergreen-ui";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export const NewCredentials = ({ show, setShow, status }) => {
  const [password, setPassword] = useState("");
  const [genPass, setGenPass] = useState(false);
  const [genPassDisabled, setGenPassDisabled] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      account: "",
    },
  });

  useEffect(() => {
    if (!show) return;
    if (status === "TRIAL_IN_PROGRESS") setGenPassDisabled(true);
  }, [show]);

  const handleClose = () => {
    setShow(false);
    setGenPass(false);
    setPassword("");
    setShowPass(false);
    setIsLoading(false);
    reset();
  };

  const submit = async (data) => {
    toaster.closeAll();
    setIsLoading(true);
    const session = await getSession();
    const { id } = session;

    const options = {
      id,
      name: data.name,
      account: data.account,
      password: password,
      generatePassword: genPass,
    };

    const res = await axios.post("/api/credentials/new", { options });

    if (res.data.error) {
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    setIsLoading(false);
    toaster.success("Credentials added successfully!");
    handleClose();
    router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      title="Add new credentials"
      onCloseComplete={handleClose}
      onConfirm={handleSubmit(submit)}
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isLoading}
    >
      <div style={{ position: "relative" }}>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInputField
              label="Account Name"
              placeholder="Google, Twitter, etc."
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
      <div style={{ position: "relative" }}>
        <Controller
          control={control}
          name="account"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInputField
              label="Username / Email"
              placeholder="Username or email used to login"
              type="text"
              autoComplete="off"
              onChange={onChange}
              value={value}
              onBlur={onBlur}
            />
          )}
        />
      </div>
      <div style={{ position: "relative" }}>
        <TextInputField
          disabled={genPass}
          label="Password"
          placeholder="Password for the account"
          type={showPass ? "text" : "password"}
          value={genPass ? "" : password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {showPass && (
          <EyeOffIcon
            position="absolute"
            right="12px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowPass(false)}
          />
        )}
        {!showPass && (
          <EyeOpenIcon
            position="absolute"
            right="12px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowPass(true)}
          />
        )}
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
