import { Dialog, Heading, Paragraph, toaster } from "evergreen-ui";
import { useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  CardElement,
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const getClientSecret = async (apiKey, id) => {
  const { data } = await axios.post("/api/subscribe/setup-intent", {
    userId: id,
    apiKey,
  });
  return data.clientSecret || null;
};

// payment element provider
export const UpdatePayment = ({ show, setShow, upgradeToPro }) => {
  const [clientSecret, setClientSecret] = useState(null);

  const fetchClientSecret = async () => {
    const session = await getSession();
    const { id, apiKey } = session;
    const secret = await getClientSecret(apiKey, id);
    if (secret) {
      setClientSecret(secret);
      return;
    }

    toaster.danger("Darkpine was unable to load stripe");
  };

  useEffect(() => {
    if (!show) {
      fetchClientSecret();
    }
  }, [show]);

  const options = {
    clientSecret: clientSecret,
    appearance: {
      variables: {
        fontFamily: '"SF UI Display", sans-serif',
        colorDanger: "#F31260",
      },
      rules: {
        ".Input": {
          fontSize: "12px",
          padding: "8px 12px",
          lineHeight: "16px",
        },
        ".Input:focus": {
          boxShadow: "0px 0px 0px 2px #D6E0FF",
          border: "1px solid #ADC2FF",
        },
        ".Label": {
          fontWeight: 500,
          fontSize: "14px",
        },
      },
    },
  };

  if (!clientSecret) return <div></div>;

  return (
    <Elements stripe={stripePromise} options={options}>
      <UpdatePaymentDialog
        show={show}
        setShow={setShow}
        setClientSecret={setClientSecret}
        upgradeToPro={upgradeToPro}
      />
    </Elements>
  );
};

// payment element
export const UpdatePaymentDialog = ({
  show,
  setShow,
  setClientSecret,
  upgradeToPro,
}) => {
  const elements = useElements();
  const stripe = useStripe();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    setClientSecret(null);
    setShow(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    await toaster.closeAll();
    if (!stripe || !elements) {
      toaster.danger("Please wait for stripe to load");
    }

    setIsLoading(true);

    const setupIntent = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (setupIntent.error) {
      toaster.danger(setupIntent.error.message);
      setIsLoading(false);
      return;
    }

    // make call to backend to update payment method
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/payment-method/update", {
      userId: id,
      setupIntent,
      upgradeToPro,
      apiKey,
    });

    if (data.error) {
      toaster.danger(data.message);
      setIsLoading(false);
      return;
    }

    toaster.success(data.message);
    handleClose();
    await router.replace(router.asPath);
  };

  return (
    <Dialog
      isShown={show}
      title="Update Payment Method"
      onCloseComplete={handleClose}
      isConfirmDisabled={isLoading || !stripe}
      onConfirm={handleConfirm}
      isConfirmLoading={isLoading}
    >
      {upgradeToPro && (
        <Paragraph marginBottom={16}>
          You are upgrading to Pro for <strong>$2.99 per month</strong> and will
          be charged on a monthly basis. Your card will be charged immediately.
        </Paragraph>
      )}
      <PaymentElement />
    </Dialog>
  );
};
