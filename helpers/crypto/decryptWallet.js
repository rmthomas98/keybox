const aes256 = require("aes256");
import { decryptKey } from "../keys/decryptKey";

export const decryptWallet = async (encryptedKey, encryptedWallet) => {
  if (!encryptedKey || !encryptedWallet) return {};
  let key = await decryptKey(encryptedKey);
  if (!key) return {};

  const { id, createdAt, name, address, privateKey, phrase } = encryptedWallet;

  return {
    id,
    createdAt,
    name,
    address: address ? aes256.decrypt(key, address) : null,
    privateKey: privateKey ? aes256.decrypt(key, privateKey) : null,
    phrase: phrase ? aes256.decrypt(key, phrase).split(",") : [],
  };
};
