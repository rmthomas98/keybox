import { Dialog, Paragraph, toaster } from "evergreen-ui";
import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/router";

export const DisableDialog = ({ show, setShow, setPhone }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/two-factor-auth/disable", {
      userId: id,
      apiKey,
    });
    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    toaster.success(data.message);
    setIsLoading(false);
    setShow(false);
    setPhone("");
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      title="Disable Two Factor Auth"
      onCloseComplete={() => setShow(false)}
      intent="danger"
      confirmLabel="Disable"
      onConfirm={handleConfirm}
      isConfirmLoading={isLoading}
    >
      <Paragraph>
        Are you sure you want to disable two factor authentication? You will no
        longer be able to use two factor authentication to log in to your
        account unless you enable it again.
      </Paragraph>
    </Dialog>
  );
};
