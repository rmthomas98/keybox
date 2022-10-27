import styles from "./profile.module.css";
import {
  Heading,
  Text,
  Small,
  TextInputField,
  toaster,
  Button,
  EyeOnIcon,
  EyeOffIcon,
  TextInput,
  Dialog,
} from "evergreen-ui";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import { EmailVerifyDialog } from "./verifyEmail";
import { useRouter } from "next/router";

export const Profile = ({ userEmail }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifyEmailDialog, setVerifyEmailDialog] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);

  useEffect(() => {
    setEmail(userEmail);
  }, []);

  useEffect(() => {
    if (email && email !== userEmail) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [email]);

  const handleConfirm = async () => {
    if (!email) {
      toaster.danger("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/settings/profile/update", {
      userId: id,
      name,
      email,
      apiKey,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    if (data.emailChanged) {
      // show email verify dialog
      setEmail(data.email);
      setVerifyEmailDialog(true);
      setIsConfirmDisabled(true);
    } else {
      toaster.success("No changes made");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading size={400} fontWeight={700}>
          My Profile
        </Heading>
        <Button
          appearance="primary"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={isConfirmDisabled}
        >
          Update
        </Button>
      </div>
      <TextInputField
        label="Email"
        width="100%"
        placeholder="Your email"
        maxWidth={400}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <EmailVerifyDialog
        setShow={setVerifyEmailDialog}
        show={verifyEmailDialog}
        email={email}
      />
    </div>
  );
};
