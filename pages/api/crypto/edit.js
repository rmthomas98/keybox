import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptWallets} from "../../../helpers/crypto/decryptWallets";
import {decryptWallet} from "../../../helpers/crypto/decryptWallet";
import {decryptKey} from "../../../helpers/keys/decryptKey";

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
      res.json({error: true, message: "invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // make sure user owns wallet
    const wallet = await prisma.wallet.findUnique({
      where: {id: walletId},
    });

    if (!wallet || wallet.userId !== userId) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check if wallet name is already taken
    if (nameChange) {
      const userWallets = await prisma.wallet.findMany({
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

    // grab encryption key and encrypt data
    let encryptionKey = await decryptKey(user.key);

    if (!encryptionKey) {
      res.json({error: true, message: "Error editing wallet"});
      return;
    }

    const walletDetails = {
      name: name.trim(),
      address: address ? aes256.encrypt(encryptionKey, address.trim()) : null,
      privateKey: key ? aes256.encrypt(encryptionKey, key.trim()) : null,
      phrase:
        phrase.length !== 0
          ? aes256.encrypt(encryptionKey, phrase.join(","))
          : null,
      userId,
    };

    // erase key from memory
    encryptionKey = null;

    // update wallet
    let updatedWallet = await prisma.wallet.update({
      where: {id: walletId},
      data: {...walletDetails},
    });

    // get updated wallet and decrypt
    const decryptedWallet = await decryptWallet(user.key, updatedWallet);

    // get all wallets and decrypt
    const {cryptoWallets: encryptedWallets} = await prisma.user.findUnique({
      where: {id: userId},
      include: {cryptoWallets: true},
    });
    const decryptedWallets = await decryptWallets(user.key, encryptedWallets);

    res.json({
      error: false,
      message: "Wallet updated",
      wallet: decryptedWallet,
      wallets: decryptedWallets,
    });
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Error editing crypto wallet"});
  }
};

export default handler;
