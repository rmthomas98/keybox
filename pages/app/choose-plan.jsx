import styles from "../../styles/choosePlan.module.css";
import {
  Heading,
  Button,
  Text,
  Small,
  Card,
  Badge,
  UnorderedList,
  TickCircleIcon,
  BanCircleIcon,
  ListItem,
  toaster,
  SideSheet,
  Dialog,
} from "evergreen-ui";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import { Trial } from "../../components/dialogs/trial";
import { Premium } from "../../components/dialogs/premium";

const ChoosePlan = ({ status }) => {
  const [trialDialog, setTrialDialog] = useState(false);
  const [premiumDialog, setPremiumDialog] = useState(false);
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Heading
          size={800}
          fontWeight={700}
          marginBottom={30}
          textAlign="center"
        >
          {status === "NEW_ACCOUNT"
            ? "Select a Plan to Get Started"
            : "Subscribe now to get access to all features"}
        </Heading>
        <div className={styles.cardContainer}>
          {status === "NEW_ACCOUNT" && (
            <Card
              padding={24}
              background="tint2"
              elevation={1}
              maxWidth={250}
              width="100%"
              marginRight={20}
            >
              <Badge marginBottom={10}>7 Day Free Trial</Badge>
              <Heading
                size={700}
                paddingBottom={10}
                style={{ borderBottom: "1px solid #E6E8F0" }}
              >
                $0.00
              </Heading>
              <Heading size={400} marginTop={10} marginBottom={10}>
                Features
              </Heading>
              <UnorderedList size={300}>
                <ListItem icon={TickCircleIcon} iconColor="success">
                  Unlimited password storage
                </ListItem>
                <ListItem icon={TickCircleIcon} iconColor="success">
                  Unlimited credit/debit cards
                </ListItem>
                <ListItem icon={TickCircleIcon} iconColor="success">
                  Any other secret info
                </ListItem>
                <ListItem icon={TickCircleIcon} iconColor="success">
                  Customer support
                </ListItem>
                <ListItem icon={BanCircleIcon} iconColor="danger">
                  Password generator
                </ListItem>
                <ListItem icon={BanCircleIcon} iconColor="danger">
                  Bank accounts
                </ListItem>
                <ListItem icon={BanCircleIcon} iconColor="danger">
                  File uploads
                </ListItem>
              </UnorderedList>
              <Button
                appearance="primary"
                marginTop={20}
                width="100%"
                onClick={() => setTrialDialog(true)}
              >
                Start free trial
              </Button>
            </Card>
          )}
          <Card
            padding={24}
            background="tint2"
            elevation={1}
            maxWidth={250}
            width="100%"
          >
            <Badge marginBottom={10}>KeyBox Premium</Badge>
            <Heading
              size={700}
              paddingBottom={10}
              style={{ borderBottom: "1px solid #E6E8F0" }}
            >
              $2.99{" "}
              <Text>
                <Small>/ month</Small>
              </Text>
            </Heading>
            <Heading size={400} marginTop={10} marginBottom={10}>
              Features
            </Heading>
            <UnorderedList size={300}>
              <ListItem icon={TickCircleIcon} iconColor="success">
                Unlimited password storage
              </ListItem>{" "}
              <ListItem icon={TickCircleIcon} iconColor="success">
                Password generator
              </ListItem>
              <ListItem icon={TickCircleIcon} iconColor="success">
                Unlimited credit/debit cards
              </ListItem>
              <ListItem icon={TickCircleIcon} iconColor="success">
                Unlimited bank accounts
              </ListItem>
              <ListItem icon={TickCircleIcon} iconColor="success">
                15 GB File Storage
              </ListItem>
              <ListItem icon={TickCircleIcon} iconColor="success">
                Any other secret info
              </ListItem>
              <ListItem icon={TickCircleIcon} iconColor="success">
                Customer support
              </ListItem>
            </UnorderedList>
            <Button
              appearance="primary"
              marginTop={20}
              width="100%"
              onClick={() => setPremiumDialog(true)}
            >
              Buy Premium
            </Button>
          </Card>
        </div>
      </div>
      <Trial isOpen={trialDialog} setIsOpen={setTrialDialog} />
      <Premium isOpen={premiumDialog} setIsOpen={setPremiumDialog} />
    </div>
  );
};

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

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
  const { status } = user;

  if (status === "SUBSCRIPTION_ACTIVE" || status === "TRIAL_IN_PROGRESS") {
    return {
      redirect: {
        destination: "/app",
        permanent: false,
      },
    };
  }

  return { props: { status } };
};

export default ChoosePlan;
