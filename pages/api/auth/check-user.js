import prisma from "../../../lib/prisma";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const bcrypt = require("bcryptjs");

const handler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }

    // find user in db by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }
    const { twoFactor } = user;

    // check if user has 2FA enabled
    if (!twoFactor) {
      res.json({ error: false, twoFactor });
      return;
    }

    // check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.json({ error: true, message: "Incorrect password" });
      return;
    }

    // generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // send verification code to user
    client.messages.create({
      body: `Your Darkpine verification code is ${verificationCode}`,
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      to: user.phone,
    });

    // update user in db with verification code
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneToken: verificationCode.toString() },
    });

    res.json({
      error: false,
      twoFactor,
      email: email.toLowerCase().trim(),
      password,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
