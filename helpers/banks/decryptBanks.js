import prisma from "../../lib/prisma";

const aes256 = require("aes256");

export const decryptBanks = (banks) => {
  const key = process.env.ENCRYPTION_KEY;

  const decryptedBanks = banks.map((bank) => {
    const { name, account, routing } = bank;

    bank.name = name ? aes256.decrypt(key, name) : null;
    bank.account = account ? aes256.decrypt(key, account) : null;
    bank.routing = routing ? aes256.decrypt(key, routing) : null;

    return bank;
  });

  return decryptedBanks;
};
