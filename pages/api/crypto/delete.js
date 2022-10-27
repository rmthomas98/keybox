import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptWallets} from "../../../helpers/crypto/decryptWallets";
import {decryptKey} from "../../../helpers/keys/decryptKey";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    const {userId, walletId, apiKey} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    if (!userId || !walletId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api key
    if (user.apiKey !== apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // make sure user owns wallet
    const wallet = await prisma.wallet.findUnique({
      where: {id: walletId},
    });

    if (!wallet || wallet.userId !== userId) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // delete wallet
    await prisma.wallet.delete({where: {id: walletId}});

    // get user wallets
    const encryptedWallets = await prisma.wallet.findMany({
      where: {userId},
    });
    const decryptedWallets = await decryptWallets(user.key, encryptedWallets);

    res.json({
      error: false,
      wallets: decryptedWallets,
      message: "Wallet deleted",
    });
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Error deleting crypto wallet"});
  }
};

export default handler;
