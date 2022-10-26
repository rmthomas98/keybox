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

    if (!wallet || !wallet.userId !== userId) {
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
    let encryptionKey = await decryptWallets(user.key);

    const walletDetails = {
      name: name.trim(),
      address: address ? aes256.encrypt(encryptionKey, address.trim()) : null,
      privateKey: key ? aes256.encrypt(encryptionKey, key.trim()) : null,
      phrase: phrase ? aes256.encrypt(encryptionKey, phrase.join(",")) : null,
    };

    // erase key from memory
    encryptionKey = null;

    // update wallet
    let updatedWallet = await prisma.wallet.update({
      where: {id: walletId},
      data: {...walletDetails},
    });

    // get updated wallet and decrypt

    // get all wallets and decrypt


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
