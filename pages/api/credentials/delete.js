import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptCredentials} from "../../../helpers/credentials/decryptCredentials";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {id, userId, apiKey} = req.body;

    // check auth token against user id
    if (token.id !== userId) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // check params
    if (!id || !userId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api key against user api key
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // delete credentials from db
    await prisma.credential.delete({where: {id}});

    // get user from db along with existing credentials
    const updatedUser = await prisma.user.findUnique({
      where: {id: userId},
      include: {credentials: true},
    });

    // get updated credentials from db
    const {credentials} = updatedUser;
    const updatedCredentials = await decryptCredentials(user.key, credentials);

    // return success to front end
    res.json({
      error: false,
      message: "Successfully deleted credentials!",
      credentials: updatedCredentials,
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
