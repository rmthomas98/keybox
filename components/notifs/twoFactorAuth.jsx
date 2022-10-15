import { CornerDialog, Dialog, Small, Text } from "evergreen-ui";
import { useEffect, useState } from "react";

export const TwoFactorAuth = () => {
  const [show, setShow] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleShow = () => {
    setShowDialog(true);
    setShow(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, [100]);
  }, []);

  return (
    <>
      <CornerDialog
        isShown={show}
        title="Two Factor Authentication"
        onCloseComplete={() => {}}
        width={360}
        cancelLabel="Dont show again"
        confirmLabel="Setup"
        onConfirm={handleShow}
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
        onCloseComplete={() => {}}
      ></Dialog>
    </>
  );
};
