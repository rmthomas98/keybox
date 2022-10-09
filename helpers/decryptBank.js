const aes256 = require("aes256");

export const decryptBank = (bank) => {
  const key = process.env.ENCRYPTION_KEY;
  const { name, account, routing } = bank;
  bank.name = name ? aes256.decrypt(key, name) : null;
  bank.account = account ? aes256.decrypt(key, account) : null;
  bank.routing = routing ? aes256.decrypt(key, routing) : null;
  return bank;
};