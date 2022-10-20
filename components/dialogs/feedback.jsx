import {
  Heading,
  TextareaField,
  toaster,
  Dialog,
  Paragraph,
} from "evergreen-ui";
import { useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";

export const Feedback = ({ show, setShow }) => {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
    setFeedback("");
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!feedback) {
      toaster.danger("Please enter some feedback");
      return;
    }

    setIsLoading(true);
    const session = await getSession();
    const { id } = session;
    const { data } = await axios.post("/api/feedback", {
      userId: id,
      feedback,
    });

    if (data.error) {
      setIsLoading(false);
      toaster.danger(data.message);
      return;
    }

    setIsLoading(false);
    toaster.success("Feedback submitted successfully");
  };

  return (
    <Dialog
      isShown={show}
      title="Leave Your Feedback"
      onCloseComplete={handleClose}
      confirmLabel="Send"
      onConfirm={handleSubmit}
    >
      <Paragraph marginBottom={20} fontWeight={500}>
        We&#39;re always looking to improve our product. Please let us know what
        you like or dislike, as well as any features or changes you&#39;d like
        to see in the future.
      </Paragraph>
    </Dialog>
  );
};
