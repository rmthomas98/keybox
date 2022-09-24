import prisma from "../../lib/prisma";

const nodemailer = require("nodemailer");

const handler = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ error: true, message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 587,
      auth: {
        user: "rmthomas1998@gmail.com",
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const { emailToken } = user;

    const msg = {
      from: '"KeyBox" <rmthomas1998@gmail.com>',
      to: email.trim(),
      subject: "Email Verification",
      html: `<p>Dear Valued Customer,</p><p>You are receiving this email because you have requested your email verification code.</p><p>Please copy the following code and enter it into the prompt on our website to verify your email:</p><p style="font-size: 20px; font-weight: 600;">${emailToken}</p><p>Regards,</p><p>The KeyBox Team</p>`,
    };

    await transporter.sendMail(msg);

    res.json({ error: false, message: "Email sent" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
