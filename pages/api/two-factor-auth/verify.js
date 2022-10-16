import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const { userId, code, phone } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if user has phone token
    if (!user.phoneToken) {
      res.json({ error: true, message: "User does not have a phone token" });
      return;
    }

    // check if code matched
    if (code.trim() !== user.phoneToken) {
      res.json({ error: true, message: "Invalid code" });
      return;
    }

    // update user in db
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneToken: null,
        twoFactor: true,
        ask2FA: false,
        phone: phone.trim(),
      },
    });

    res.json({ error: false, message: "Success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
