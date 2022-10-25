const aes256 = require("aes256");
import { decryptKey } from "../keys/decryptKey";

export const decryptCards = async (encryptedKey, encryptedCards) => {
  if (!encryptedKey || !encryptedCards) return [];
  let key = await decryptKey(encryptedKey);
  if (!key) return [];

  const cards = encryptedCards.map((card) => {
    const { id, createdAt, identifier, type, name, number, exp, cvc, zip } =
      card;
    // decrypt all card details other than identifier
    return {
      id,
      createdAt,
      identifier,
      type,
      name: name ? aes256.decrypt(key, name) : null,
      number: number ? aes256.decrypt(key, number) : null,
      exp: exp ? aes256.decrypt(key, exp) : null,
      cvc: cvc ? aes256.decrypt(key, cvc) : null,
      zip: zip ? aes256.decrypt(key, zip) : null,
    };
  });

  // erase key from memory
  key = null;

  return cards;
};
