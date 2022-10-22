import {
  CornerDialog,
  Dialog,
  Small,
  Text,
  TextInputField,
  toaster,
} from "evergreen-ui";
import {useEffect, useState} from "react";
import {getSession} from "next-auth/react";
import axios from "axios";

export const TwoFactorAuth = ({ask, status}) => {
  const [show, setShow] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShow = () => {
    setShowDialog(true);
    setShow(false);
  };

  const handleClose = () => {
    setShowDialog(false);
    setShow(false);
    setPhone("");
    setCode("");
  };

  useEffect(() => {
    setTimeout(() => {
      if (status !== "TRIAL_IN_PROGRESS") {
        setShow(true);
      }
    }, [100]);
  }, []);

  // submit phone number to backend to get code
  const handleSubmitPhone = async () => {
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
    const {id} = session;
    const {data} = await axios.post("api/two-factor-auth/setup", {
      userId: id,
      phone,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsSubmitted(true);
    setIsLoading(false);
    toaster.success("Verification code sent to your phone");
  };

  // submit code to backend to verify code and enable two factor auth
  const handleVerify = async () => {
    if (status === "TRIAL_IN_PROGRESS") {
      toaster.danger("Please upgrade your plan to enable 2FA");
      return;
    }

    if (!code) {
      toaster.danger("Please enter a verification code");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const {id} = session;
    const {data} = await axios.post("/api/two-factor-auth/verify", {
      userId: id,
      code,
      phone,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setShowDialog(false);
    toaster.success("Two factor authentication enabled");
  };

  const handleDontShow = async () => {
    setShow(false);
    setShowDialog(false);

    const session = await getSession();
    const {id} = session;

    const {data} = await axios.post("/api/two-factor-auth/disable-message", {
      userId: id,
    });
  };

  if (!ask) return null;

  return (
    <>
      <CornerDialog
        isShown={show}
        title="Two Factor Authentication"
        width={360}
        cancelLabel="Don't show again"
        confirmLabel="Setup"
        onConfirm={handleShow}
        onCancel={handleDontShow}
      >
        <Text>
          <Small>
            Set up two factor authentication to add an extra layer of security
            to your account.
          </Small>
        </Text>
      </CornerDialog>
      <Dialog
        isShown={showDialog}
        title="Setup Two Factor Authentication"
        isConfirmLoading={isLoading}
        shouldCloseOnOverlayClick={false}
        onConfirm={isSubmitted ? handleVerify : handleSubmitPhone}
        onCloseComplete={handleClose}
      >
        {!isSubmitted && (
          <>
            <Text>Enter your phone number to receive a verification code.</Text>
            <TextInputField
              marginTop={20}
              label="Phone Number"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}
        {isSubmitted && (
          <>
            <Text>Enter the verification code sent to your phone number.</Text>
            <TextInputField
              marginTop={20}
              label="Verification Code"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </>
        )}
      </Dialog>
    </>
  );
};
