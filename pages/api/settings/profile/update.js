import prisma from "../../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";

const nodemailer = require("nodemailer");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const { userId, apiKey } = req.body;
    let { email } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    if (!userId || !apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    if (!email) {
      res.json({ error: true, message: "Email is required" });
      return;
    }

    email = email.toLowerCase().trim();

    // get user from db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if api key is correct
    if (apiKey !== user.apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check if user changed email
    if (email !== user.email) {
      // check if email is already in use
      const emailInUse = await prisma.user.findUnique({ where: { email } });
      if (emailInUse) {
        res.json({ error: true, message: "Email already in use" });
        return;
      }

      // create email token
      const emailToken = crypto.randomBytes(4).toString("hex").toUpperCase();

      // create email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        port: 587,
        auth: {
          user: "rmthomas1998@gmail.com",
          pass: process.env.GOOGLE_PASSWORD,
        },
      });

      // create email
      const msg = {
        from: '"KeyBox" <rmthomas1998@gmail.com>',
        to: email,
        subject: "Email Verification",
        html: `<p>Dear Valued Customer,</p><p>Please copy the following code and enter it into the prompt on our website to verify your email:</p><p style="font-size: 20px; font-weight: 600;">${emailToken}</p><p>Regards,</p><p>The KeyBox Team</p>`,
      };

      // send email
      await transporter.sendMail(msg);

      // update user in db with new email token and name
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailToken,
          changeEmailTo: email,
        },
      });

      // send response
      res.json({ error: false, emailChanged: true, email });
      return;
    }

    // send response
    res.json({ error: false, emailChanged: false });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
