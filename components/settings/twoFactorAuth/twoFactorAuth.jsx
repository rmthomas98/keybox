import styles from "./twoFactorAuth.module.css";
import {
  Heading,
  Button,
  TextInputField,
  toaster,
  Paragraph,
  StatusIndicator,
  Badge,
  Small,
  Alert,
} from "evergreen-ui";
import { useState, useEffect } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { DisableDialog } from "./disableDialog";
import { VerifyDialog } from "./verifyDialog";

export const TwoFactorAuth = ({ twoFactor, currentPhone, status }) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  useEffect(() => {
    if (currentPhone && status !== "TRIAL_IN_PROGRESS") {
      setPhone(currentPhone);
      setIsConfirmDisabled(true);
    }
  }, [twoFactor, currentPhone]);

  useEffect(() => {
    if (
      phone.length >= 10 &&
      phone.trim() !== currentPhone &&
      status !== "TRIAL_IN_PROGRESS"
    ) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [phone]);

  const handleConfirm = async () => {
    if (status === "TRIAL_IN_PROGRESS") {
      toaster.danger("Please upgrade your plan to enable 2FA");
      return;
    }

    if (!phone || phone.length < 10) {
      toaster.danger("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/two-factor-auth/setup", {
      userId: id,
      phone,
      apiKey,
    });

    if (data.error) {
      setIsLoading(false);
      toaster.danger(data.message);
      return;
    }

    setIsLoading(false);
    setShowVerifyDialog(true);
  };

  return (
    <div className={styles.container}>
      {status !== "TRIAL_IN_PROGRESS" && (
        <>
          <div className={styles.header}>
            <Heading size={400} fontWeight={700}>
              <StatusIndicator color={twoFactor ? "success" : "danger"} />
              Two Factor Auth
            </Heading>
            <div className={styles.btnContainer}>
              {twoFactor && (
                <>
                  <Button
                    intent="danger"
                    marginRight={6}
                    onClick={() => setShowDisableDialog(true)}
                  >
                    Disable
                  </Button>
                  <Button
                    appearance="primary"
                    disabled={isConfirmDisabled}
                    isLoading={isLoading}
                    onClick={handleConfirm}
                  >
                    Update
                  </Button>
                </>
              )}
              {!twoFactor && (
                <Button
                  appearance="primary"
                  disabled={isConfirmDisabled}
                  onClick={handleConfirm}
                  isLoading={isLoading}
                >
                  Enable
                </Button>
              )}
            </div>
          </div>
          <Paragraph marginBottom={20}>
            <Small>
              Two-factor authentication (2FA) adds an additional layer of
              security to your account by requiring more than just a password to
              log in. When 2FA is enabled, you will be prompted for a code in
              addition to your password when you sign in.
            </Small>
          </Paragraph>
          <TextInputField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            maxWidth={400}
            hint="Verification code will be sent to this number"
          />
          <DisableDialog
            show={showDisableDialog}
            setShow={setShowDisableDialog}
            setPhone={setPhone}
          />
          <VerifyDialog
            show={showVerifyDialog}
            setShow={setShowVerifyDialog}
            phone={phone}
          />
        </>
      )}
      {status === "TRIAL_IN_PROGRESS" && (
        <Alert
          intent="warning"
          title="Upgrade plan to enable two factor authentication"
        />
      )}
    </div>
  );
};
