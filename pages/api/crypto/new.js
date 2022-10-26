import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { decryptWallets } from "../../../helpers/crypto/decryptWallets";
import { decryptKey } from "../../../helpers/keys/decryptKey";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const { userId, name, address, privateKey, phrase } = req.body;

    // check user id against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check data
    if (!userId || !name) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }

    // make sure user user id is valid
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cryptoWallets: true },
    });

    if (!user) {
      res.json({ error: true, message: "Invalid user" });
      return;
    }

    // check if wallet name is already taken
    const { cryptoWallets: userWallets } = user;
    const isWalletNameTaken = userWallets.some(
      (wallet) => wallet.name.toLowerCase() === name.toLowerCase().trim()
    );
    if (isWalletNameTaken) {
      res.json({ error: true, message: "Wallet name already exists" });
      return;
    }

    // grab encryption key and encrypt data
    let key = await decryptKey(user.key);

    if (!key) {
      res.json({ error: true, message: "Key not found" });
      return;
    }

    const walletDetails = {
      name: name.trim(),
      address: address ? aes256.encrypt(key, address.trim()) : null,
      privateKey: privateKey ? aes256.encrypt(key, privateKey.trim()) : null,
      phrase: phrase ? aes256.encrypt(key, phrase.join(",")) : null,
      userId,
    };

    // erase key from memory
    key = null;

    // create wallet in db
    await prisma.wallet.create({
      data: { ...walletDetails },
    });

    // get updated wallets and decrypt
    const { cryptoWallets: encryptedWallets } = await prisma.user.findUnique({
      where: { id: userId },
      include: { cryptoWallets: true },
    });
    const decryptedWallets = await decryptWallets(user.key, encryptedWallets);

    //return updated wallets
    res.json({
      error: false,
      message: "Wallet created",
      wallets: decryptedWallets,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
