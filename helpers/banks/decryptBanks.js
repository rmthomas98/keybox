const aes256 = require("aes256");
import { decryptKey } from "../keys/decryptKey";

export const decryptBanks = async (encryptedKey, encryptedBanks) => {
  if (!encryptedKey || !encryptedBanks) return [];
  let key = await decryptKey(encryptedKey);
  if (!key) return [];

  const decryptedBanks = encryptedBanks.map((bank) => {
    const { id, identifier, type, ownership, name, account, routing } = bank;

    return {
      id,
      identifier,
      type,
      ownership,
      name: name ? aes256.decrypt(key, name) : null,
      account: account ? aes256.decrypt(key, account) : null,
      routing: routing ? aes256.decrypt(key, routing) : null,
    };
  });

  key = null;

  return decryptedBanks;
};
