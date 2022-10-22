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
  Small,
  Text,
  Paragraph,
} from "evergreen-ui";
import { useState, useContext } from "react";
import prisma from "../../lib/prisma";
import { NewCryptoWallet } from "../../components/dialogs/crypto/newCryptoWallet";
import { decryptWallets } from "../../helpers/crypto/decryptWallets";
import { CryptoWalletView } from "../../components/dialogs/crypto/cryptoWalletView";
import { SearchContext } from "../../components/context/search";

const Crypto = ({ stringifiedWallets }) => {
  const [newWallet, setNewWallet] = useState(false);
  const [wallets, setWallets] = useState(JSON.parse(stringifiedWallets));
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletView, setWalletView] = useState(false);

  const handleWalletClick = (wallet) => {
    setSelectedWallet(wallet);
    setWalletView(true);
  };

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
        <Alert marginTop={20} intent="info" title="No wallets on file">
          <Paragraph size={300} color="#2952CC" marginTop={4}>
            Get started by adding your first wallet!
          </Paragraph>
        </Alert>
      )}
      {wallets.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40} paddingRight={0}>
            {/*<Table.SearchHeaderCell*/}
            {/*  minWidth={50}*/}
            {/*  onChange={(value) => setSearchValue(value)}*/}
            {/*  placeholder="Search..."*/}
            {/*/>*/}
            <Table.TextHeaderCell>Wallet Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Address</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {wallets
              .filter((wallet) =>
                searchValue
                  ? wallet.name.includes(searchValue.toLowerCase().trim())
                  : wallet
              )
              .map((wallet) => (
                <Table.Row
                  key={wallet.id}
                  isSelectable
                  onSelect={() => handleWalletClick(wallet)}
                  height={40}
                >
                  <Table.TextCell>{wallet.name}</Table.TextCell>
                  <Table.TextCell>{wallet.address}</Table.TextCell>
                </Table.Row>
              ))}
            {wallets.filter((wallet) =>
              searchValue
                ? wallet.name.includes(searchValue.toLowerCase().trim())
                : wallet
            ).length === 0 && (
              <Table.Row height={40}>
                <Table.TextCell textAlign="center" width="100%">
                  <Text color="#D14343">
                    <Small>
                      No results found for <b>{searchValue}</b>
                    </Small>
                  </Text>
                </Table.TextCell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}
      <NewCryptoWallet
        show={newWallet}
        setShow={setNewWallet}
        setWallets={setWallets}
      />
      <CryptoWalletView
        show={walletView}
        setShow={setWalletView}
        wallet={selectedWallet}
        setWallet={setSelectedWallet}
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
  const user = await prisma.user.findUnique({
    where: { id },
    include: { cryptoWallets: true },
  });

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

  if (user.paymentStatus === "FAILED") {
    return {
      redirect: {
        destination: "/app/subscription",
        permanent: false,
      },
    };
  }

  // get the users crypto data
  const wallets = decryptWallets(user.cryptoWallets);

  return { props: { stringifiedWallets: JSON.stringify(wallets) } };
};

export default Crypto;
