const aes256 = require("aes256");

export const decryptCard = (card) => {
  const key = process.env.ENCRYPTION_KEY;
  const { name, number, exp, cvc, zip } = card;

  card.name = name ? aes256.decrypt(key, name) : null;
  card.number = number ? aes256.decrypt(key, number) : null;
  card.exp = exp ? aes256.decrypt(key, exp) : null;
  card.cvc = cvc ? aes256.decrypt(key, cvc) : null;
  card.zip = zip ? aes256.decrypt(key, zip) : null;

  return card;
};