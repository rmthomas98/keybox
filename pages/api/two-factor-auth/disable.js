import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    // authenticate the user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const { userId, apiKey } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check user and api key
    if (!userId || !apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if api key is valid
    if (user.apiKey !== apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    if (!user.twoFactor) {
      res.json({ error: true, message: "Two factor auth is not enabled" });
      return;
    }

    // update the user in db
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactor: false,
        phone: null,
        phoneToken: null,
        setPhoneTo: null,
      },
    });

    res.json({ error: false, message: "Two factor auth disabled" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
