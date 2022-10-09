import styles from "../../styles/banks.module.css";
import {
  BriefcaseIcon,
  Button,
  CreditCardIcon,
  Heading,
  PlusIcon,
  Alert,
  Table,
  Text,
  Small,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import { decryptBanks } from "../../helpers/decryptBanks";
import { useState } from "react";
import { NewBank } from "../../components/dialogs/newBank";
import { BankView } from "../../components/dialogs/bankView";

const Banks = ({ stringifiedBanks }) => {
  const [banks, setBanks] = useState(JSON.parse(stringifiedBanks));
  const [newBankShow, setNewBankShow] = useState(false);
  const [bankViewShow, setBankViewShow] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const handleBankClick = (bank) => {
    setSelectedBank(bank);
    setBankViewShow(true);
  };

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <BriefcaseIcon marginRight={6} /> Banks
        </Heading>
        <Button
          appearance="primary"
          iconBefore={PlusIcon}
          onClick={() => setNewBankShow(true)}
        >
          Add bank
        </Button>
      </div>
      {banks.length === 0 && (
        <Alert
          marginTop={20}
          intent="info"
          title="No banks on file. Get started by adding your first bank!"
        />
      )}
      {banks.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40}>
            <Table.SearchHeaderCell
              minWidth={130}
              onChange={(value) => setSearchValue(value)}
              placeholder="Search banks..."
            />
            <Table.TextHeaderCell>Account #</Table.TextHeaderCell>
            <Table.TextHeaderCell>Type</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {banks
              .filter((bank) =>
                !searchValue
                  ? bank
                  : bank.identifier
                      .toLowerCase()
                      .includes(searchValue.toLowerCase().trim())
              )
              .map((bank) => (
                <Table.Row
                  key={bank.id}
                  isSelectable
                  onSelect={() => handleBankClick(bank)}
                  height={40}
                >
                  <Table.TextCell>{bank.identifier}</Table.TextCell>
                  <Table.TextCell>
                    {bank.account ? `***${bank.account.slice(-4)}` : ""}
                  </Table.TextCell>
                  <Table.TextCell>{bank.type}</Table.TextCell>
                </Table.Row>
              ))}
            {searchValue &&
              banks.filter((bank) =>
                bank.identifier
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim())
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
      <NewBank
        show={newBankShow}
        setShow={setNewBankShow}
        setBanks={setBanks}
      />
      <BankView
        show={bankViewShow}
        setShow={setBankViewShow}
        bank={selectedBank}
        setBank={setSelectedBank}
        setBanks={setBanks}
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
    include: { banks: true },
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

  const { banks: encryptedBanks } = user;
  const banks = decryptBanks(encryptedBanks);

  return {
    props: { stringifiedBanks: JSON.stringify(banks) },
  };
};

export default Banks;
