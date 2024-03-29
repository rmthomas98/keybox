import styles from "../../styles/files.module.css";
import { getSession } from "next-auth/react";
import {
  Alert,
  Heading,
  Button,
  PlusIcon,
  FolderOpenIcon,
  Table,
  Icon,
  Text,
  Small,
  Paragraph,
} from "evergreen-ui";
import { useState, useContext } from "react";
import { NewFile } from "../../components/dialogs/files/newFile";
import { partial } from "filesize";
import { FolderView } from "../../components/dialogs/files/folderView";
import { SearchContext } from "../../components/context/search";

const size = partial({ base: 3, standard: "jedec" });

const Files = ({ stringifiedFolders, status }) => {
  const [newFileShow, setNewFileShow] = useState(false);
  const [fileViewShow, setFileViewShow] = useState(false);
  const [folders, setFolders] = useState(JSON.parse(stringifiedFolders));
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { searchValue, setSearchValue } = useContext(SearchContext);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setFileViewShow(true);
  };

  return (
    <div>
      <div className={styles.navContainer}>
        <Heading size={600} fontWeight={700} display="flex" alignItems="center">
          <Icon icon={FolderOpenIcon} marginRight={6} /> Files
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
        <Alert intent="info" marginTop={20} title="No folders on file">
          <Paragraph size={300} color="#2952CC" marginTop={4}>
            Get started by creating your first folder!
          </Paragraph>
        </Alert>
      )}
      {folders.length > 0 && (
        <Table marginTop={30}>
          <Table.Head height={40} paddingRight={0}>
            {/*<Table.SearchHeaderCell*/}
            {/*  minWidth={50}*/}
            {/*  placeholder="Search..."*/}
            {/*  value={searchValue}*/}
            {/*  onChange={(value) => setSearchValue(value)}*/}
            {/*/>*/}
            <Table.TextHeaderCell>Folder</Table.TextHeaderCell>
            <Table.TextHeaderCell># Files</Table.TextHeaderCell>
            <Table.TextHeaderCell>Size</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {folders
              .filter((folder) =>
                folder.name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim())
              )
              .map((folder) => (
                <Table.Row
                  key={folder.id}
                  isSelectable
                  onSelect={() => handleFolderClick(folder)}
                  height={40}
                >
                  <Table.TextCell>{folder.name}</Table.TextCell>
                  <Table.TextCell isNumber>
                    {`${folder.files.length} ${
                      folder.files.length > 1
                        ? "files"
                        : folder.files.length === 0
                        ? "files"
                        : "file"
                    }`}
                  </Table.TextCell>
                  <Table.TextCell isNumber>{size(folder.size)}</Table.TextCell>
                </Table.Row>
              ))}
            {folders.filter((folder) =>
              folder.name
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
