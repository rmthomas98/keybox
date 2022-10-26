import prisma from "../../lib/prisma";
import {getToken} from "next-auth/jwt";

const nodemailer = require("nodemailer");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // get feedback and user id
    const {feedback, userId, apiKey} = req.body;

    if (!userId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user id against token id
    if (userId !== token.id) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check user
    if (!user) {
      res.json({error: true, message: "Invalid user"});
      return;
    }

    // verify api key
    if (user.apiKey !== apiKey) {
      res.json({error: true, message: 'Invalid api key'});
      return;
    }

    // check feedback
    if (!feedback) {
      res.json({error: true, message: 'Please enter feedback'});
      return;
    }

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

    res.json({error: false, message: "Feedback sent"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
