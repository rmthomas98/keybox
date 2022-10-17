import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptWallets} from "../../../helpers/crypto/decryptWallets";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    const {userId, walletId} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // make sure user owns wallet
    const wallet = await prisma.cryptoWallet.findUnique({
      where: {id: walletId},
    });

    if (wallet.userId !== userId) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // delete wallet
    await prisma.cryptoWallet.delete({where: {id: walletId}});

    // get updated wallets
    const wallets = await prisma.cryptoWallet.findMany({where: {userId}});

    // decrypt wallets
    const decryptedWallets = decryptWallets(wallets);

    res.json({error: false, wallets: decryptedWallets, message: "Wallet deleted"});
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Error deleting crypto wallet"});
  }
};

export default handler;
