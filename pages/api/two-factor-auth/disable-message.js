import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    // authenticate the user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const {userId, apiKey} = req.body;

    // check for userid
    if (!userId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // update user in db
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api key
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    await prisma.user.update({
      where: {id: userId},
      data: {
        phoneToken: null,
        twoFactor: false,
        ask2FA: false,
      },
    });

    res.json({error: false, message: "Two factor authentication disabled"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
