import styles from "./payment.module.css";
import { Heading, Button, Card, Badge } from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const Payment = ({ paymentMethod, status }) => {
  return (
    <div style={{ width: "100%", display: "flex" }}>
      <Card
        padding={20}
        background="tint2"
        elevation={1}
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Heading size={400} fontWeight={700}>
          Payment Method
        </Heading>
        {!paymentMethod && (
          <Heading size={300} marginTop={10}>
            No payment method on file
          </Heading>
        )}
        {!paymentMethod && (
          <div className={styles.buttonContainer}>
            <Button
              appearance="primary"
              disabled={status === "TRIAL_IN_PROGRESS"}
            >
              Add payment method
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
