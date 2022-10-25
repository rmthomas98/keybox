const aes256 = require("aes256");
import { decryptKey } from "../keys/decryptKey";

export const decryptBank = async (encryptedKey, encryptedBank) => {
  if (!encryptedKey || !encryptedBank) return {};
  let key = await decryptKey(encryptedKey);
  if (!key) return {};

  const { id, identifier, name, ownership, account, routing, type } =
    encryptedBank;

  const decryptedBank = {
    id,
    identifier,
    type,
    ownership,
    name: name ? aes256.decrypt(key, name) : null,
    account: account ? aes256.decrypt(key, account) : null,
    routing: routing ? aes256.decrypt(key, routing) : null,
  };

  key = null;

  return decryptedBank;
};
