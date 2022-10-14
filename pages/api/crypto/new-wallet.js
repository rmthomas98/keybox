import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const {userId, name, address, key, phrase} = req.body;

    // check user id against token id
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // check data
    if (!userId || !name) {
      res.json({error: true, message: "Invalid data"});
      return;
    }

    // make user user id is valid
    const user = await prisma.user.findUnique({
      where: {id: userId},
      include: {wallets: true},
    });

    if (!user) {
      res.json({error: true, message: "Invalid user"});
      return;
    }

    // check if wallet name is already taken
    const {wallets: userWallets} = user;
    const isWalletNameTaken = userWallets.some(
      (wallet) => wallet.name.toLowerCase() === name.toLowerCase().trim()
    );
    if (isWalletNameTaken) {
      res.json({error: true, message: "Wallet name already exists"});
      return;
    }

    // encrypt address, key, and phrase
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedAddress = address
      ? aes256.encrypt(key, address.trim())
      : null;
    const encryptedKey = key ? aes256.encrypt(encryptionKey, key.trim()) : null;
    const encryptedPhrase = phrase
      ? aes256.encrypt(key, phrase.join(","))
      : null;

    // create wallet in db
    const wallet = await prisma.wallet.create({
      data: {
        name: name.trim(),
        address: encryptedAddress,
        privateKey: encryptedKey,
        phrase: encryptedPhrase,
        userId,
      },
    });

    // get updated wallets and decrypt data
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
