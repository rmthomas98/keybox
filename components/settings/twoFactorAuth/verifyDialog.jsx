import {
  Dialog,
  Paragraph,
  Small,
  TextInputField,
  toaster,
} from "evergreen-ui";
import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/router";

export const VerifyDialog = ({ show, setShow, phone }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setCode("");
    setShow(false);
  };

  const handleConfirm = async () => {
    await toaster.closeAll();
    if (!code) {
      toaster.danger("Please enter your code");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/two-factor-auth/verify", {
      userId: id,
      code,
      phone,
      apiKey,
    });

    if (data.error) {
      setIsLoading(false);
      toaster.danger(data.message);
      return;
    }

    setIsLoading(false);
    toaster.success("Two factor authentication enabled");
    setShow(false);
    setCode("");
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      onCloseComplete={handleClose}
      shouldCloseOnOverlayClick={false}
      title="Verify phone number"
      isConfirmLoading={isLoading}
      isConfirmDisabled={!code}
      onConfirm={handleConfirm}
    >
      <Paragraph marginBottom={20}>
        Please enter the code we sent to your phone to verify your phone number.
      </Paragraph>
      <TextInputField
        label="Verification Code"
        placeholder="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
    </Dialog>
  );
};
