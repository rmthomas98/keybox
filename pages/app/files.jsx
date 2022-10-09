import styles from "../../styles/files.module.css";
import { getSession } from "next-auth/react";
import { Alert, Heading, Button, PlusIcon, FolderOpenIcon } from "evergreen-ui";
import { useState } from "react";
import { NewFile } from "../../components/dialogs/newFile";

const Files = ({ files }) => {
  const [newFileShow, setNewFileShow] = useState(false);
  const [fileViewShow, setFileViewShow] = useState(false);

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <FolderOpenIcon marginRight={6} /> Files
        </Heading>
        <Button
          appearance="primary"
          iconBefore={PlusIcon}
          onClick={() => setNewFileShow(true)}
        >
          Add file
        </Button>
      </div>
      <NewFile show={newFileShow} setShow={setNewFileShow} />
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
    include: { files: true },
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

  const { files } = user;

  return { props: { files } };
};

export default Files;
