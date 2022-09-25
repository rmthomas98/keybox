import { Heading, Dialog, Text, toaster, Small } from "evergreen-ui";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export const Trial = ({ isOpen, setIsOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const res = await axios.post("/api/subscribe/trial", { id });

    if (res.data.error) {
      setIsLoading(false);
      toaster.danger(res.data.message);
      return;
    }

    await router.push("/app");
  };

  return (
    <Dialog
      isShown={isOpen}
      onCloseComplete={() => setIsOpen(false)}
      isConfirmLoading={isLoading}
      title="Start 7 Day Free Trial"
      onConfirm={handleConfirm}
    >
      <Text>
        You are about to start your 7 day free trial. If you wish to continue
        using KeyBox beyond the trial period, you can upgrade your plan in your
        account settings.
      </Text>
    </Dialog>
  );
};
