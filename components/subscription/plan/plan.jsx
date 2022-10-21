import styles from "./plan.module.css";
import {
  Card,
  Heading,
  Button,
  Badge,
  Small,
  InlineAlert,
  Link,
  Icon,
  ArrowRightIcon,
  RigIcon,
  Text,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Cancel } from "../dialogs/cancel";
import { Resume } from "../dialogs/resume";
import NextLink from "next/link";
import { UpdatePayment } from "../dialogs/updatePayment";

// All cases
// 1. User has Pro plan - show cancel button - show next billing date
// 2. User has Free trial - show upgrade button - show end of trial date
// 3. Users payment method is declined - show failed payment badge, try to get new payment method - allow user to cancel
// 4. User cancels subscription but has not yet expired - show expire date and resume button

// If user has no plan or free trial ends without upgrading
// Redirect to /app/choose-plan
// So they can choose a plan

export const Plan = ({ status, plan, paymentStatus }) => {
  const cancelAtPeriodEnd = plan?.cancel_at_period_end;
  const currentPeriodEnd = plan?.current_period_end;

  const [showCancel, setShowCancel] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [upgradeToPro, setUpgradeToPro] = useState(false);

  const handleUpgrade = () => {
    setUpgradeToPro(true);
    setShowUpdatePayment(true);
  };

  return (
    <div className={styles.container}>
      <Card
        padding={20}
        background="tint2"
        elevation={1}
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Heading size={400} fontWeight={700} marginBottom={10}>
          My Plan
        </Heading>
        {status === "SUBSCRIPTION_ACTIVE" && (
          <div className={styles.planContainer}>
            <Heading size={300}>
              Darkpine Pro
              <Badge
                color={
                  paymentStatus === "FAILED" || cancelAtPeriodEnd
                    ? "yellow"
                    : "green"
                }
                marginLeft={6}
              >
                {paymentStatus === "FAILED"
                  ? "Payment Pending"
                  : cancelAtPeriodEnd
                  ? "cancels soon"
                  : "active"}
              </Badge>
            </Heading>
            <Heading size={300}>
              $2.99 <Small>/month</Small>
            </Heading>
          </div>
        )}
        {status === "TRIAL_IN_PROGRESS" && (
          <div className={styles.planContainer}>
            <Heading size={300}>
              Darkpine Trial
              <Badge color="purple" marginLeft={6}>
                free Trial
              </Badge>
            </Heading>
            <Heading size={300}>$0.00</Heading>
          </div>
        )}
        {status === "SUBSCRIPTION_ACTIVE" &&
          !cancelAtPeriodEnd &&
          paymentStatus !== "FAILED" && (
            <Heading size={200} marginTop={10}>
              Next payment on{" "}
              {format(new Date(currentPeriodEnd * 1000), "MMMM dd, yyyy")}
            </Heading>
          )}
        {paymentStatus === "FAILED" && (
          <Heading size={200} marginTop={10}>
            Plan will cancel after 3 failed attempts
          </Heading>
        )}
        {status === "SUBSCRIPTION_ACTIVE" && cancelAtPeriodEnd && (
          <Heading size={200} marginTop={10}>
            Subscription cancels on{" "}
            {format(new Date(currentPeriodEnd * 1000), "MMMM dd, yyyy")}
          </Heading>
        )}
        {status === "TRIAL_IN_PROGRESS" && (
          <Heading size={200} marginTop={10}>
            Trial ends on{" "}
            {format(new Date(currentPeriodEnd * 1000), "MMMM dd, yyyy")}
          </Heading>
        )}
        {status === "SUBSCRIPTION_ACTIVE" && !cancelAtPeriodEnd && (
          <div className={styles.buttonContainer}>
            <Button onClick={() => setShowCancel(true)} intent="danger">
              Cancel plan
            </Button>
          </div>
        )}
        {status === "TRIAL_IN_PROGRESS" && (
          <div className={styles.buttonProContainer}>
            <NextLink href="/pricing" target="_blank" passHref>
              <Link>
                <Text display="flex" alignItems="center" color="inherit">
                  <Small>View pro plan</Small>
                  <Icon
                    icon={ArrowRightIcon}
                    size={10}
                    marginLeft={6}
                    position="relative"
                    top={1}
                  />
                </Text>
              </Link>
            </NextLink>
            <Button appearance="primary" onClick={handleUpgrade}>
              Upgrade to pro
            </Button>
          </div>
        )}
        {cancelAtPeriodEnd && status !== "TRIAL_IN_PROGRESS" && (
          <div className={styles.buttonContainer}>
            <Button
              appearance="primary"
              intent="success"
              onClick={() => setShowResume(true)}
            >
              Resume plan
            </Button>
          </div>
        )}
      </Card>
      <Cancel
        show={showCancel}
        setShow={setShowCancel}
        paymentStatus={paymentStatus}
      />
      <Resume show={showResume} setShow={setShowResume} />
      <UpdatePayment
        show={showUpdatePayment}
        setShow={setShowUpdatePayment}
        upgradeToPro={upgradeToPro}
      />
    </div>
  );
};
