import styles from "./payment.module.css";
import { Heading, Button, Card, Badge, Tooltip } from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { UpdatePayment } from "../dialogs/updatePayment";

export const Payment = ({ paymentMethod, status, paymentStatus, plan }) => {
  const cancelAtPeriodEnd = plan?.cancel_at_period_end;
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);

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
        {paymentMethod && (
          <>
            <div className={styles.paymentContainer}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Heading size={300} marginRight={8}>
                  **** **** **** {paymentMethod.last4}
                </Heading>
                {paymentStatus !== "FAILED" && (
                  <Badge color="blue">{paymentMethod.brand}</Badge>
                )}
                {paymentStatus === "FAILED" && (
                  <Badge color="red">Payment Failed</Badge>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Heading size={200}>
                  Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                </Heading>
              </div>
              <div className={styles.buttonContainer}>
                {paymentStatus === "FAILED" && (
                  <Button
                    appearance="primary"
                    disabled={cancelAtPeriodEnd}
                    onClick={() => setShowUpdatePayment(true)}
                  >
                    Update and pay invoice
                  </Button>
                )}
                {paymentStatus !== "FAILED" && (
                  <Button
                    appearance="primary"
                    disabled={cancelAtPeriodEnd}
                    onClick={() => setShowUpdatePayment(true)}
                  >
                    Update
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
      <UpdatePayment show={showUpdatePayment} setShow={setShowUpdatePayment} />
    </div>
  );
};
