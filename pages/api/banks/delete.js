import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptBanks} from "../../../helpers/banks/decryptBanks";

const handler = async (req, res) => {
  try {
    const {userId, bankId, apiKey} = req.body;

    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    if (!userId || !bankId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check if user exists
    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api key against user
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: 'Invalid request'});
      return;
    }

    // delete bank from db
    await prisma.bank.delete({where: {id: bankId}});

    // get updated banks and decrypt
    const {banks: encryptedBanks} = await prisma.user.findUnique({
      where: {id: userId},
      include: {banks: true},
    });
    const decryptedBanks = await decryptBanks(user.key, encryptedBanks);

    res.json({
      error: false,
      message: "Bank deleted successfully!",
      banks: decryptedBanks,
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
