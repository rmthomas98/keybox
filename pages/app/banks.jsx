import styles from "../../styles/banks.module.css";
import {
  BriefcaseIcon,
  Button,
  CreditCardIcon,
  Heading,
  PlusIcon,
  Alert,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import { decryptBanks } from "../../helpers/decryptBanks";
import { useState } from "react";
import { NewBank } from "../../components/dialogs/newBank";

const Banks = ({ stringifiedBanks }) => {
  const [banks, setBanks] = useState(JSON.parse(stringifiedBanks));
  const [newBankShow, setNewBankShow] = useState(false);
  const [bankViewShow, setBankViewShow] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchValue, setSearchValue] = useState("");

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
      <NewBank
        show={newBankShow}
        setShow={setNewBankShow}
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
  console.log(banks);

  return {
    props: { stringifiedBanks: JSON.stringify(banks) },
  };
};

export default Banks;
