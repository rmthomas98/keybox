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

    const { userId, code, phone, apiKey } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // check for required fields
    if (!code || !phone || !userId || !apiKey) {
      return res.json({ error: true, message: "Invalid request" });
    }

    // get user from db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if api key is valid
    if (user.apiKey !== apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check user status
    if (user.status !== "SUBSCRIPTION_ACTIVE") {
      res.json({ error: true, message: "Upgrade your plan to enable 2FA" });
      return;
    }

    // check if user has phone token
    if (!user.phoneToken) {
      res.json({ error: true, message: "User does not have a phone token" });
      return;
    }

    // check if phone matches user to change phone number
    if (phone.trim() !== user.setPhoneTo) {
      res.json({ error: true, message: "Phone number does not match" });
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
        setPhoneTo: null,
      },
    });

    res.json({ error: false, message: "Success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
