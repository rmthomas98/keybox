const aes256 = require("aes256");

export const decryptWallets = (wallets) => {
  const decryptionKey = process.env.ENCRYPTION_KEY;

  wallets.map((wallet) => {
    const {address, privateKey, phrase} = wallet;
    wallet.address = address ? aes256.decrypt(decryptionKey, address) : null;
    wallet.privateKey = privateKey
      ? aes256.decrypt(decryptionKey, privateKey)
      : null;
    wallet.phrase = phrase
      ? aes256.decrypt(decryptionKey, phrase).split(",")
      : null;
  });

  return wallets;
};