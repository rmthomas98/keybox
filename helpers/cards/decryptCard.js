const aes256 = require("aes256");
import {decryptKey} from "../keys/decryptKey";

export const decryptCard = async (encryptedKey, encryptedCard) => {
  if (!encryptedKey || !encryptedCard) return {}
  let key = await decryptKey(encryptedKey);
  if (!key) return {}

  const {id, createdAt, identifier, type, name, number, exp, cvc, zip} = encryptedCard;

  // decrypt all card details other than identifier and type
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
  }
};