import styles from "../../styles/appHome.module.css";
import {
  Heading,
  Button,
  AddIcon,
  Table,
  Alert,
  SmallPlusIcon,
  Small,
  PlusIcon,
  ShieldIcon,
  Text,
} from "evergreen-ui";
import { getSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import { useEffect, useState } from "react";
import { NewCredentials } from "../../components/dialogs/newCredentials";
import { CredentialsView } from "../../components/dialogs/credentialsView";

const AppHome = ({ stringifiedCreds, status }) => {
  const [newPasswordShow, setNewPasswordShow] = useState(false);
  const [credentialsViewShow, setCredentialsViewShow] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const credentials = JSON.parse(stringifiedCreds);

  const handleClick = (credentials) => {
    setSelectedCredentials(credentials);
    setCredentialsViewShow(true);
  };

  useEffect(() => {
    const newSelectedCredentials = credentials.find(
      (cred) => cred.id === selectedCredentials?.id
    );
    setSelectedCredentials(newSelectedCredentials);
  }, [stringifiedCreds]);

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <ShieldIcon marginRight={6} />
          Credentials
        </Heading>
        <Button
          appearance="primary"
          onClick={() => setNewPasswordShow(true)}
          iconBefore={PlusIcon}
        >
          Add credentials
        </Button>
      </div>
      {credentials.length === 0 && (
        <Alert
          marginTop={20}
          intent="info"
          title="No credentials on file. Get started by adding your first credentials!"
        />
      )}
      {credentials.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40}>
            <Table.SearchHeaderCell
              minWidth={130}
              value={searchValue}
              placeholder="Search account..."
              onChange={(value) => setSearchValue(value)}
            />
            {/*<Table.TextHeaderCell>Name</Table.TextHeaderCell>*/}
            <Table.TextHeaderCell>Username</Table.TextHeaderCell>
            <Table.TextHeaderCell>Website</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {credentials
              .filter((cred) =>
                !searchValue
                  ? cred
                  : cred.name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase().trim()) ||
                    cred.account
                      ?.toLowerCase()
                      .includes(searchValue.toLowerCase().trim()) ||
                    cred.website
                      ?.toLowerCase()
                      .includes(searchValue.toLowerCase().trim())
              )
              .map((credential) => (
                <Table.Row
                  key={credential.id}
                  isSelectable
                  height={40}
                  onSelect={() => handleClick(credential)}
                >
                  <Table.TextCell>{credential.name}</Table.TextCell>
                  <Table.TextCell>{credential?.account}</Table.TextCell>
                  <Table.TextCell>{credential.website}</Table.TextCell>
                </Table.Row>
              ))}
          </Table.Body>
          {searchValue &&
            credentials.filter(
              (cred) =>
                cred.name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim()) ||
                cred.account
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim()) ||
                cred.website
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
        </Table>
      )}
      <NewCredentials
        show={newPasswordShow}
        setShow={setNewPasswordShow}
        status={status}
      />
      <CredentialsView
        show={credentialsViewShow}
        setShow={setCredentialsViewShow}
        credentials={selectedCredentials}
        setCredentials={setSelectedCredentials}
        status={status}
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
    include: { credentials: true },
  });
  let { credentials } = user;

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

  const aes256 = require("aes256");

  credentials = credentials.map((cred) => {
    let decryptedPassword;
    if (!cred.password) {
      decryptedPassword = "";
    }
    if (cred.password) {
      decryptedPassword = aes256.decrypt(
        process.env.ENCRYPTION_KEY,
        cred.password
      );
    }

    const passwordLength = decryptedPassword.length;

    return {
      id: cred.id,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      name: cred.name,
      account: cred.account,
      website: cred.website,
      decryptedPassword,
      encryptedPassword: cred.password,
      hiddenPassword: `${decryptedPassword.slice(0, passwordLength / 3)}****`,
    };
  });

  return {
    props: {
      stringifiedCreds: JSON.stringify(credentials),
      status: user.status,
    },
  };
};

export default AppHome;
