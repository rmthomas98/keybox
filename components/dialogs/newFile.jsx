import { Dialog, TextInputField, FileUploader } from "evergreen-ui";
import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export const NewFile = ({ show, setShow }) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    const { data } = await axios.post("/api/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(data);
  };

  return (
    <Dialog
      isShown={show}
      title="New File"
      onCloseComplete={() => setShow(false)}
      onConfirm={handleUpload}
      confirmLabel="Upload"
    >
      <TextInputField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FileUploader
        renderFile={(file) => file.name}
        onChange={(files) => setFile(files[0])}
      />
    </Dialog>
  );
};
