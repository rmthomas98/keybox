import styles from "../../styles/crypto.module.css";
import { getSession } from "next-auth/react";
import {
  Alert,
  Heading,
  Button,
  PlusIcon,
  Table,
  CreditCardIcon,
  KeyIcon,
} from "evergreen-ui";
import { useState } from "react";
import prisma from "../../lib/prisma";

const Crypto = ({ stringifiedWallets }) => {
  const [newWallet, setNewWallet] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletView, setWalletView] = useState(false);

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <KeyIcon marginRight={6} /> Crypto
        </Heading>
        <Button
          appearance="primary"
          iconBefore={PlusIcon}
          onClick={() => setNewWallet(true)}
        >
          Add Wallet
        </Button>
      </div>
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
        destination: "/app/choose-plan",
        permanent: false,
      },
    };
  }

  // get the users crypto data

  return { props: {} };
};

export default Crypto;
