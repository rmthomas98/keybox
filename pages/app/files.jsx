import styles from "../../styles/files.module.css";
import { getSession } from "next-auth/react";
import {
  Alert,
  Heading,
  Button,
  PlusIcon,
  FolderOpenIcon,
  Table,
} from "evergreen-ui";
import { useState } from "react";
import { NewFile } from "../../components/dialogs/newFile";
import { partial } from "filesize";
import { FolderView } from "../../components/dialogs/folderView";

const size = partial({ base: 3, standard: "jedec" });

const Files = ({ stringifiedFolders, status }) => {
  const [newFileShow, setNewFileShow] = useState(false);
  const [fileViewShow, setFileViewShow] = useState(false);
  const [folders, setFolders] = useState(JSON.parse(stringifiedFolders));
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setFileViewShow(true);
  };

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
          disabled={status === "TRIAL_IN_PROGRESS"}
        >
          Add folder
        </Button>
      </div>
      {status === "TRIAL_IN_PROGRESS" && (
        <Alert
          marginTop={20}
          intent="warning"
          title="Please upgrade your plan to add files."
        />
      )}
      {folders.length === 0 && status !== "TRIAL_IN_PROGRESS" && (
        <Alert
          intent="info"
          marginTop={20}
          title="No files on file. Get started by uploading your first file!"
        />
      )}
      {folders.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40}>
            <Table.SearchHeaderCell
              minWidth={130}
              placeholder="Search folders..."
            />
            <Table.TextHeaderCell># Files</Table.TextHeaderCell>
            <Table.TextHeaderCell>Folder Size</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {folders.map((folder) => (
              <Table.Row
                key={folder.id}
                isSelectable
                onSelect={() => handleFolderClick(folder)}
                height={40}
              >
                <Table.TextCell>{folder.name}</Table.TextCell>
                <Table.TextCell>{folder.files.length}</Table.TextCell>
                <Table.TextCell>{size(folder.size)}</Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <NewFile
        show={newFileShow}
        setShow={setNewFileShow}
        setAllFolders={setFolders}
      />
      <FolderView
        show={fileViewShow}
        setShow={setFileViewShow}
        folder={selectedFolder}
        setFolder={setSelectedFolder}
        setFolders={setFolders}
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

  const folders = await prisma.folder.findMany({
    where: { userId: id },
    include: { files: true },
  });

  const stringifiedFolders = JSON.stringify(folders);

  return { props: { stringifiedFolders, status: user.status } };
};

export default Files;
