const aes256 = require("aes256");

export const decryptCards = (cards) => {
  const key = process.env.ENCRYPTION_KEY;

  const updatedCards = cards.map((card) => {
    card.name = card.name ? aes256.decrypt(key, card.name) : null;
    card.number = card.number ? aes256.decrypt(key, card.number) : null;
    card.exp = card.exp ? aes256.decrypt(key, card.exp) : null;
    card.cvc = card.cvc ? aes256.decrypt(key, card.cvc) : null;
    card.zip = card.zip ? aes256.decrypt(key, card.zip) : null;
    return card;
  });

  return updatedCards;
};