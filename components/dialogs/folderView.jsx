import { Dialog, TextInputField, toaster } from "evergreen-ui";

export const FolderView = ({
  show,
  setShow,
  setFolders,
  setFolder,
  folder,
}) => {
  const handleClose = () => {
    setShow(false);
  };

  if (!folder) return null;

  return <Dialog isShown={show} onCloseComplete={handleClose}></Dialog>;
};
