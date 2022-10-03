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

    // delete credentials from db
    await prisma.credential.delete({where: {id}});

    // return success to front end
    res.json({error: false, message: "Successfully deleted credentials!"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
