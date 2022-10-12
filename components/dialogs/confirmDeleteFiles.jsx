import { Dialog, Text, FileCard } from "evergreen-ui";

export const ConfirmDeleteFiles = ({
  show,
  setShow,
  handleDeleteFiles,
  deletedFiles,
  isLoading,
}) => {
  return (
    <Dialog
      isShown={show}
      title="Confirm Delete"
      onCloseComplete={() => setShow(false)}
      intent="danger"
      confirmLabel="Delete"
      onConfirm={handleDeleteFiles}
      isConfirmLoading={isLoading}
    >
      <Text>
        Are you sure you want to delete{" "}
        {deletedFiles.length > 1 ? "these files?" : "this file?"}
      </Text>
      <div style={{ marginTop: 10 }}>
        {deletedFiles.map((file, index) => (
          <FileCard name={file.name} type={file.type} sizeInBytes={file.size} />
        ))}
      </div>
    </Dialog>
  );
};
