import styles from "./plan.module.css";
import { Card, Heading, Button, Badge, Small } from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const Plan = ({ status }) => {
  const [plan, setPlan] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (status === "SUBSCRIPTION_ACTIVE") {
      setPlan("Darkpine Pro");
    }
  }, []);

  useEffect(() => {
    if (status === "SUBSCRIPTION_ACTIVE") {
      setPrice("$2.99");
    }
  }, []);

  return (
    <div className={styles.container}>
      <Card padding={20} background="tint2" elevation={1} width="100%">
        <Heading size={400} fontWeight={700} marginBottom={10}>
          Your Plan
        </Heading>
        {status === "SUBSCRIPTION_ACTIVE" && (
          <div className={styles.planContainer}>
            <Heading size={300}>
              {plan} <Badge color="green">Active</Badge>
            </Heading>
            <Heading size={300}>
              {price} <Small>/month</Small>
            </Heading>
          </div>
        )}
        {status === "TRIAL_IN_PROGRESS" && (
          <Heading size={300}>
            Darkpine Pro <Badge color="purple">free Trial</Badge>
          </Heading>
        )}
      </Card>
    </div>
  );
};
