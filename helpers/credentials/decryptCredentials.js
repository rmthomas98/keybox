import { decryptKey } from "../keys/decryptKey";

const aes256 = require("aes256");

export const decryptCredentials = async (encryptedKey, encryptedCreds) => {
  if (!encryptedKey || !encryptedCreds) return [];
  if (encryptedCreds.length === 0) return [];
  let key = await decryptKey(encryptedKey);
  if (!key) return [];

  const credentials = encryptedCreds.map((cred) => {
    const { id, createdAt, name, account, website, password } = cred;
    const decryptedAccount = account ? aes256.decrypt(key, account) : null;
    const decryptedWebsite = website ? aes256.decrypt(key, website) : null;
    const decryptedPassword = password ? aes256.decrypt(key, password) : null;

    return {
      id,
      createdAt,
      name,
      account: decryptedAccount,
      website: decryptedWebsite,
      password: decryptedPassword,
    };
  });

  key = null;

  return credentials;
};
