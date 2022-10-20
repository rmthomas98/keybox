import { Dialog, Paragraph, toaster } from "evergreen-ui";
import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

export const Resume = ({ show, setShow }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    await toaster.closeAll();
    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/subscription/resume", {
      userId: id,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    toaster.success(data.message);
    setIsLoading(false);
    setShow(false);
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      title="Resume Subscription"
      onCloseComplete={() => setShow(false)}
      onConfirm={handleConfirm}
      confirmLabel="Resume plan"
      isConfirmLoading={isLoading}
      cancelLabel={"Close"}
      intent="success"
    >
      <Paragraph>
        Are you sure you want to resume your subscription? You will continue to
        be charged for the plan you are currently on.
      </Paragraph>
    </Dialog>
  );
};
