const aes256 = require('aes256');

export const decryptCard = (card) => {
  const key = process.env.ENCRYPTION_KEY;
  const {name, number, exp, cvc, zip} = card;

  card.name = name ? aes256.decrypt(key, name) : undefined;
  card.number = number ? aes256.decrypt(key, number) : undefined;
  card.exp = exp ? aes256.decrypt(key, exp) : undefined;
  card.cvc = cvc ? aes256.decrypt(key, cvc) : undefined;
  card.zip = zip ? aes256.decrypt(key, zip) : undefined;

  return card;
}