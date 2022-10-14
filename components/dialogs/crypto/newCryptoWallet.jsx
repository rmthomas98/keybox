import {
  Dialog,
  IconButton,
  TextInputField,
  toaster,
  Popover,
  Tooltip,
  TagInput,
  Heading,
  EyeOffIcon,
  EyeOpenIcon,
} from "evergreen-ui";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export const NewCryptoWallet = ({ show, setShow, setWallets }) => {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [phrase, setPhrase] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
  };

  return (
    <Dialog
      isShown={show}
      title="Add Wallet"
      onCloseComplete={handleClose}
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isLoading}
    >
      <TextInputField
        label="Name"
        placeholder="Wallet name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextInputField
        label="Address"
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div style={{ position: "relative" }}>
        <TextInputField
          label="Private Key"
          placeholder="Wallet private key"
          type={showKey ? "text" : "password"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autocomplete="off"
        />
        {showKey && (
          <EyeOffIcon
            position="absolute"
            right="12px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowKey(false)}
          />
        )}
        {!showKey && (
          <EyeOpenIcon
            position="absolute"
            right="12px"
            top="35px"
            cursor="pointer"
            onClick={() => setShowKey(true)}
          />
        )}
      </div>
      <div>
        <Heading size={400} marginBottom={8}>
          Secret Phrase
        </Heading>
        <TagInput
          values={phrase}
          onChange={(values) => setPhrase(values)}
          label="Seed Phrase"
          tagSubmitKey="space"
          inputProps={{
            placeholder: "Wallet seed phrase",
          }}
          width="100%"
        />
      </div>
    </Dialog>
  );
};
