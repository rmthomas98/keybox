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
  OfflineIcon,
} from "evergreen-ui";
import { useState } from "react";
import prisma from "../../lib/prisma";
import { NewCryptoWallet } from "../../components/dialogs/crypto/newCryptoWallet";

const Crypto = ({ stringifiedWallets }) => {
  const [newWallet, setNewWallet] = useState(false);
  const [wallets, setWallets] = useState(JSON.parse(stringifiedWallets));
  const [searchValue, setSearchValue] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletView, setWalletView] = useState(false);

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <OfflineIcon marginRight={6} /> Crypto
        </Heading>
        <Button
          appearance="primary"
          iconBefore={PlusIcon}
          onClick={() => setNewWallet(true)}
        >
          Add Wallet
        </Button>
      </div>
      {wallets.length === 0 && (
        <Alert
          marginTop={20}
          intent="info"
          title="No wallets on file. Get started by adding your first wallet!"
        />
      )}
      {wallets.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40} paddingRight={0}>
            <Table.SearchHeaderCell
              minWidth={50}
              onChange={(value) => setSearchValue(value)}
              placeholder="Search..."
            />
            <Table.TextHeaderCell>Address</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {wallets.map((wallet) => (
              <Table.Row
                key={wallet.id}
                isSelectable
                onSelect={() => {}}
                height={40}
              >
                <Table.TextCell>Name</Table.TextCell>
                <Table.TextCell>{wallet.address}</Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <NewCryptoWallet
        show={newWallet}
        setShow={setNewWallet}
        setWallets={setWallets}
      />
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

  return { props: { stringifiedWallets: JSON.stringify([]) } };
};

export default Crypto;
