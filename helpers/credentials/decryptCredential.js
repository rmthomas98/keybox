import { decryptKey } from "../keys/decryptKey";

const aes256 = require("aes256");

export const decryptCredential = async (encryptedKey, encryptedCred) => {
  if (!encryptedKey || !encryptedCred) return {};

  let key = await decryptKey(encryptedKey);
  if (!key) return {};

  const { id, createdAt, name, account, website, password } = encryptedCred;

  const decryptedAccount = account ? aes256.decrypt(key, account) : null;
  const decryptedWebsite = website ? aes256.decrypt(key, website) : null;
  const decryptedPassword = password ? aes256.decrypt(key, password) : null;

  const credentials = {
    id,
    createdAt,
    name,
    account: decryptedAccount,
    website: decryptedWebsite,
    password: decryptedPassword,
  };

  key = null;

  return credentials;
};
