import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import axios from "axios";
import { toaster, Dialog, Button } from "evergreen-ui";
import { set } from "react-hook-form";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const getClientSecret = async () => {
  const res = await axios.get("/api/subscribe/setup-intent");
  return res.data.clientSecret;
};

export const Premium = ({ isOpen, setIsOpen }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientSecret = async () => {
    const secret = await getClientSecret();
    setClientSecret(secret);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClientSecret();
  }, []);

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

  if (isLoading || !clientSecret) return <div></div>;

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </Elements>
  );
};

export const PaymentForm = ({ isOpen, setIsOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toaster.danger("Please wait for stripe to load");
      return;
    }

    setIsLoading(true);

    const setupIntent = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (setupIntent.error) {
      toaster.danger("Something went wrong while processing your card");
      return;
    }

    const session = await getSession();
    const { id } = session;
    const res = await axios.post("/api/subscribe/premium", { id, setupIntent });

    if (res.data.error) {
      toaster.danger("Something went wrong");
      setIsLoading(false);
      return;
    }

    router.push("/app/new-subscription");
  };

  return (
    <Dialog
      isShown={isOpen}
      title="Confirm Subscription"
      onCloseComplete={() => setIsOpen(false)}
      confirmLabel="Pay Now"
      isConfirmDisabled={!stripe || !elements}
      onConfirm={handleSubmit}
      isConfirmLoading={isLoading}
    >
      <PaymentElement />
    </Dialog>
  );
};
