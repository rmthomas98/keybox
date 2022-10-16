import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const { userId, phone } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // check for phone and user id
    if (!phone || !userId) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }

    // check if phone number already exists
    const doesPhoneExist = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (doesPhoneExist && doesPhoneExist.id !== userId) {
      res.json({
        error: true,
        message: "A user with this phone number already exists",
      });
      return;
    }

    // generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // send verification code to user
    const message = await client.messages.create({
      body: `Your Darkpine verification code is ${verificationCode}`,
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      to: phone,
    });

    if (message.status === "failed") {
      res.json({ error: true, message: "Error sending verification code" });
      return;
    }

    // updated user in db
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneToken: verificationCode.toString(),
      },
    });

    res.json({ error: false, message: "Verification code sent" });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
