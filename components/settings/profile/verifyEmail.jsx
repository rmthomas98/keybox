import {
  Dialog,
  Heading,
  Paragraph,
  Small,
  TextInputField,
  toaster,
} from "evergreen-ui";
import axios from "axios";
import { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export const EmailVerifyDialog = ({ show, setShow, email }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!code) {
      toaster.danger("Please enter a valid code");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/settings/profile/verify-email", {
      userId: id,
      code,
      email,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setShow(false);
    toaster.success("Email verified successfully");
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      title="Verify Email"
      onCloseComplete={() => setShow(false)}
      confirmLabel="Verify"
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isLoading}
      isConfirmDisabled={!code}
      onConfirm={handleConfirm}
    >
      <Paragraph marginBottom={20}>
        We have sent a verification code to your email address. Please enter the
        code below to verify your email address.
      </Paragraph>
      <TextInputField
        value={code}
        onChange={(e) => setCode(e.target.value)}
        label="Verification Code"
        placeholder="Verification Code"
      />
    </Dialog>
  );
};
