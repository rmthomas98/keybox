const aes256 = require('aes256');

export const decryptCards = (cards) => {
  const key = process.env.ENCRYPTION_KEY;

  const updatedCards = cards.map((card) => {
    card.name = card.name ? aes256.decrypt(key, card.name) : undefined;
    card.number = card.number ? aes256.decrypt(key, card.number) : undefined;
    card.exp = card.exp ? aes256.decrypt(key, card.exp) : undefined;
    card.cvc = card.cvc ? aes256.decrypt(key, card.cvc) : undefined;
    card.zip = card.zip ? aes256.decrypt(key, card.zip) : undefined;
    return card;
  })

  return updatedCards;
}