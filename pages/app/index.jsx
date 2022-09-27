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

const AppHome = ({ credentials, status }) => {
  const [newPasswordShow, setNewPasswordShow] = useState(false);

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
          <Table.Head>
            <Table.SearchHeaderCell />
          </Table.Head>
        </Table>
      )}
      <NewCredentials
        show={newPasswordShow}
        setShow={setNewPasswordShow}
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
  const { credentials } = user;

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

  return { props: { credentials, status: user.status } };
};

export default AppHome;
