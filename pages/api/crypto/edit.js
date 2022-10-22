import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptWallets} from "../../../helpers/crypto/decryptWallets";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    const {userId, walletId, name, address, key, phrase, nameChange} =
      req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    if (!name || !userId || !walletId) {
      res.json({error: true, message: "Wallet name is required"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // make sure user owns wallet
    const wallet = await prisma.cryptoWallet.findUnique({
      where: {id: walletId},
    });

    if (wallet?.userId !== userId) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // check if wallet name is already taken
    if (nameChange) {
      const userWallets = await prisma.cryptoWallet.findMany({
        where: {userId},
      });
      const isWalletNameTaken = userWallets.some((wallet) => {
        return wallet.name.toLowerCase() === name.toLowerCase().trim();
      });
      if (isWalletNameTaken) {
        res.json({error: true, message: "Wallet name already exists"});
        return;
      }
    }

    // encrypt name, address, key, and phrase
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedAddress = address
      ? aes256.encrypt(encryptionKey, address)
      : null;
    const encryptedKey = key ? aes256.encrypt(encryptionKey, key) : null;
    const encryptedPhrase =
      phrase.length > 0
        ? aes256.encrypt(encryptionKey, phrase.join(","))
        : null;

    // update wallet
    let updatedWallet = await prisma.cryptoWallet.update({
      where: {id: walletId},
      data: {
        name: name.trim(),
        address: encryptedAddress,
        privateKey: encryptedKey,
        phrase: encryptedPhrase,
        userId,
      },
    });

    // decrypt updated wallet
    updatedWallet = decryptWallets([updatedWallet])[0];

    // get all wallets for user
    let {cryptoWallets: updatedWallets} = await prisma.user.findUnique({
      where: {id: userId},
      include: {cryptoWallets: true},
    });
    updatedWallets = decryptWallets(updatedWallets);

    res.json({
      error: false,
      message: "Wallet updated",
      wallet: updatedWallet,
      wallets: updatedWallets,
    });
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Error editing crypto wallet"});
  }
};

export default handler;
