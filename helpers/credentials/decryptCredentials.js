import prisma from "../../lib/prisma";

const aes256 = require("aes256");
import { getDecryptedKey } from "../keys/getDecryptedKey";

export const decryptCredentials = async (encryptedKey, encryptedCreds) => {
  if (!encryptedKey || !encryptedCreds) return null;
  let key = await getDecryptedKey(encryptedKey);
  if (!key) return null;

  const credentials = encryptedCreds.map((cred) => {
    const { id, createdAt, name, account, website, password } = cred;
    const decryptedName = aes256.decrypt(key, name);
    const decryptedAccount = account ? aes256.decrypt(key, account) : null;
    const decryptedWebsite = website ? aes256.decrypt(key, website) : null;
    const decryptedPassword = password ? aes256.decrypt(key, password) : null;

    return {
      id,
      createdAt,
      name: decryptedName,
      account: decryptedAccount,
      website: decryptedWebsite,
      password: decryptedPassword,
    };
  });

  key = null;

  return credentials;
};
