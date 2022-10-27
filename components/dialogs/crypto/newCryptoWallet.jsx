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
  Text,
  Small,
} from "evergreen-ui";
import { useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";

export const NewCryptoWallet = ({ show, setShow, setWallets }) => {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [phrase, setPhrase] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShow(false);
    setAddress("");
    setName("");
    setPrivateKey("");
    setPhrase([]);
    setShowKey(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    await toaster.closeAll();
    if (!name) return toaster.danger("Please enter a name for your wallet");
    setIsLoading(true);
    const session = await getSession();
    const { id, apiKey } = session;
    const { data } = await axios.post("/api/crypto/new", {
      userId: id,
      name,
      address,
      privateKey,
      phrase,
      apiKey,
    });

    if (data.error) {
      setIsLoading(false);
      toaster.danger(data.message);
      return;
    }

    setWallets(data.wallets);
    toaster.success("Wallet added successfully");
    handleClose();
  };

  return (
    <Dialog
      isShown={show}
      title="Add Wallet"
      onCloseComplete={handleClose}
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isLoading}
      onConfirm={handleConfirm}
      confirmLabel="Add Wallet"
      isConfirmDisabled={!name}
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
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
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
          Seed Phrase
        </Heading>
        <TagInput
          values={phrase}
          onChange={(values) => setPhrase(values)}
          label="Seed Phrase"
          tagSubmitKey="enter"
          inputProps={{
            placeholder: "Seed phrase",
          }}
          width="100%"
        />
        <Text>
          <Small>Press enter to add a new word</Small>
        </Text>
      </div>
    </Dialog>
  );
};
