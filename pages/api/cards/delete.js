import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const handler = async (req, res) => {
  try {

    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {id} = req.body;

    await prisma.card.delete({where: {id}});

    res.json({error: false, message: "Card deleted successfully!"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;