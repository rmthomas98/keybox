import styles from "../../styles/appHome.module.css";
import { Heading, Button, AddIcon, Table, Alert } from "evergreen-ui";
import { getSession } from "next-auth/react";
// import prisma from "../../lib/prisma";

const AppHome = ({ passwords }) => {
  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700}>
          Passwords
        </Heading>
        <Button appearance="primary" iconBefore={AddIcon}>
          New password
        </Button>
      </div>
      {passwords.length === 0 && (
        <Alert
          marginTop={20}
          intent="info"
          title='No passwords on file. Start adding passwords by clicking the "New password" button.'
        />
      )}
      {passwords.length > 0 && (
        <Table marginTop={30}>
          <Table.Head>
            <Table.SearchHeaderCell />
          </Table.Head>
        </Table>
      )}
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
    include: { passwords: true },
  });
  const { passwords } = user;

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

  return { props: { passwords } };
};

export default AppHome;
