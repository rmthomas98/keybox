import { Dialog, Paragraph, Small, toaster } from "evergreen-ui";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { getSession } from "next-auth/react";

export const Cancel = ({ show, setShow, paymentStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/subscription/cancel", {
      userId: id,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setShow(false);
    toaster.success(data.message);
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      onCloseComplete={() => setShow(false)}
      title="Cancel Subscription"
      intent="danger"
      confirmLabel="Cancel plan"
      cancelLabel="Close"
      onConfirm={handleConfirm}
      isConfirmLoading={isLoading}
    >
      {paymentStatus === "FAILED" && (
        <Paragraph>
          Are you sure you want to cancel your subscription? You will lose
          access to all Darkpine features immediately.
        </Paragraph>
      )}
      {paymentStatus === "PAID" && (
        <Paragraph>
          Are you sure you want to cancel your subscription? You will lose
          access to all features at the end of your billing period.
        </Paragraph>
      )}
    </Dialog>
  );
};
