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
} from "evergreen-ui";
import { getSession } from "next-auth/react";
// import prisma from "../../lib/prisma";
import { useState } from "react";
import { NewCredentials } from "../../components/dialogs/newCredentials";
import { CredentialsView } from "../../components/dialogs/credentialsView";
import { format } from "date-fns";

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

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700}>
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
          <Table.Head height={50}>
            <Table.SearchHeaderCell
              minWidth={130}
              value={searchValue}
              placeholder="Search account..."
              onChange={(value) => setSearchValue(value)}
            />
            {/*<Table.TextHeaderCell>Name</Table.TextHeaderCell>*/}
            <Table.TextHeaderCell>Username</Table.TextHeaderCell>
            <Table.TextHeaderCell>Created</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height={500}>
            {credentials
              .filter((cred) =>
                !searchValue
                  ? cred
                  : cred.name.toLowerCase().includes(searchValue.toLowerCase())
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
                  <Table.TextCell>
                    {format(new Date(credential.createdAt), "MM/dd/yyyy")}
                  </Table.TextCell>
                </Table.Row>
              ))}
          </Table.Body>
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

  const aes256 = require("aes256");

  credentials = credentials.map((cred) => {
    const decryptedPassword = aes256.decrypt(
      process.env.ENCRYPTION_KEY,
      cred.password
    );

    const passwordLength = decryptedPassword.length;

    return {
      id: cred.id,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      name: cred.name,
      account: cred.account,
      decryptedPassword: decryptedPassword,
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
