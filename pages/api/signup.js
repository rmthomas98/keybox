const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import prisma from "../../lib/prisma";

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const handler = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      res.json({ error: true, message: "Password do not match" });
      return;
    }

    // check if email already exists
    const doesEmailExist = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (doesEmailExist) {
      res.json({
        error: true,
        message: "A user with this email already exists",
      });
      return;
    }

    // Create customer in stripe
    const customer = await stripe.customers.create({
      email: email.trim().toLowerCase(),
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(4).toString("hex").toUpperCase();

    // create user in db
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        stripeId: customer.id,
        password: hashedPassword,
        emailToken,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 587,
      auth: {
        user: "rmthomas1998@gmail.com",
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const msg = {
      from: '"KeyBox" <rmthomas1998@gmail.com>',
      to: email.trim().toLowerCase(),
      subject: "Email Verification",
      html: `<p>Dear Valued Customer,</p><p>Thank you for creating an account with KeyBox!</p><p>Please copy the following code and enter it into the prompt on our website to verify your email:</p><p style="font-size: 20px; font-weight: 600;">${emailToken}</p><p>Regards,</p><p>The KeyBox Team</p>`,
    };

    await transporter.sendMail(msg);

    res.json({ error: false, message: "success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
