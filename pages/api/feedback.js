import prisma from "../../lib/prisma";
import { getToken } from "next-auth/jwt";

const nodemailer = require("nodemailer");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // get feedback and user id
    const { feedback, userId } = req.body;

    if (!userId || !feedback) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 587,
      auth: {
        user: "rmthomas1998@gmail.com",
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    // create message
    const msg = {
      from: '"Darkpine Feedback" <rmthomas1998@gmail.com>',
      to: "rmthomas1998@gmail.com",
      subject: "New Feedback",
      html: `<div></div><p>New feedback from ${user.email}</p><p>Message: ${feedback}</p></div>`,
    };

    // send message
    await transporter.sendMail(msg);

    res.json({ error: false, message: "Feedback sent" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
