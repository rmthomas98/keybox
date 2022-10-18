import styles from "../../styles/subscription.module.css";
import {
  Heading,
  Button,
  Card,
  Alert,
  Icon,
  CubeIcon,
  Tablist,
  Tab,
  Paragraph,
  Small,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { Plan } from "../../components/subscription/plan/plan";
import { Payment } from "../../components/subscription/payment/payment";
import { Invoices } from "../../components/subscription/invoices/invoices";

const Subscription = ({
  plan,
  status,
  paymentStatus,
  paymentMethod,
  invoices,
}) => {
  return (
    <div className={styles.container}>
      <Heading
        size={600}
        fontWeight={700}
        marginBottom={20}
        display="flex"
        alignItems="center"
        borderBottom="1px solid #E6E8F0"
        paddingBottom={10}
      >
        <Icon icon={CubeIcon} marginRight={6} /> My Subscription
      </Heading>
      {status === "TRIAL_IN_PROGRESS" && (
        <Alert
          intent="info"
          marginBottom={20}
          title="Upgrade to pro to continue using Darkpine after your trial is over."
        />
      )}
      {paymentStatus === "FAILED" && (
        <Alert
          intent="danger"
          marginBottom={20}
          title="Your payment method has failed."
        >
          <Paragraph color="#7D2828">
            <Small>
              Please update your payment method to continue using Darkpine.
            </Small>
          </Paragraph>
        </Alert>
      )}
      <div className={styles.flexContainer}>
        <Plan status={status} plan={plan} paymentStatus={paymentStatus} />
        <Payment
          paymentMethod={paymentMethod}
          status={status}
          paymentStatus={paymentStatus}
        />
      </div>
      <Invoices invoices={invoices} />
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { id } = session;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user.emailVerified) {
    return {
      redirect: {
        destination: `/verify?email=${user.email}`,
        permanent: false,
      },
    };
  }

  if (
    user.status === "NEW_ACCOUNT" ||
    user.status === "SUBSCRIPTION_CANCELED"
  ) {
    return {
      redirect: {
        destination: `/app/choose-plan`,
        permanent: false,
      },
    };
  }

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  let plan = await stripe.subscriptions.list({
    customer: user.stripeId,
    status: "all",
    limit: 1,
  });

  plan = plan?.data[0] || null;

  let paymentMethod = await stripe.customers.listPaymentMethods(user.stripeId, {
    type: "card",
  });

  paymentMethod = paymentMethod?.data[0]?.card || null;

  let invoices = await stripe.invoices.list({
    customer: user.stripeId,
  });

  invoices = invoices?.data || null;
  invoices = invoices?.map((invoice) => {
    if (
      invoice.status === "paid" ||
      invoice.status === "open" ||
      invoice.status === "uncollectible"
    ) {
      return invoice;
    }
  });
  invoices = invoices.filter((invoice) => invoice !== undefined);

  return {
    props: {
      status: user.status,
      plan,
      paymentStatus: user.paymentStatus,
      paymentMethod,
      invoices,
    },
  };
};

export default Subscription;
