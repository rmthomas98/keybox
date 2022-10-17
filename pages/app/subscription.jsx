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
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { Plan } from "../../components/subscription/plan/plan";
import { Payment } from "../../components/subscription/payment/payment";

const Subscription = ({ plan, status }) => {
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
      <div className={styles.flexContainer}>
        <Plan status={status} />
        <Payment />
      </div>
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

  const plan = await stripe.subscriptions.list({
    customer: user.stripeId,
    status: "active",
    limit: 1,
  });

  return { props: { status: user.status, plan } };
};

export default Subscription;
