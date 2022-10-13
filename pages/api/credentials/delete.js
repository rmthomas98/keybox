import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { decryptCredentials } from "../../../helpers/credentials/decryptCredentials";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, userId } = req.body;

    // check auth token against user id
    if (token.id !== userId) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // delete credentials from db
    await prisma.credential.delete({ where: { id } });

    // get updated credentials from db
    const updatedCredentials = await decryptCredentials(userId);

    // return success to front end
    res.json({
      error: false,
      message: "Successfully deleted credentials!",
      credentials: updatedCredentials,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
