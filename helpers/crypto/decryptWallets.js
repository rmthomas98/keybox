import { decryptKey } from "../keys/decryptKey";

const aes256 = require("aes256");

export const decryptWallets = async (encryptedKey, encryptedWallets) => {
  if (!encryptedKey || !encryptedWallets) return [];
  if (encryptedWallets.length === 0) return [];
  let key = await decryptKey(encryptedKey);
  if (!key) return [];

  const decryptedWallets = encryptedWallets.map((wallet) => {
    const { id, createdAt, name, address, privateKey, phrase } = wallet;

    return {
      id,
      createdAt,
      name,
      address: address ? aes256.decrypt(key, address) : null,
      privateKey: privateKey ? aes256.decrypt(key, privateKey) : null,
      phrase: phrase ? aes256.decrypt(key, phrase).split(",") : [],
    };
  });

  // erase key from memory
  key = null;

  return decryptedWallets;
};
