const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import {getToken} from "next-auth/jwt";
import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {userId, apiKey} = req.body;

    // check params
    if (!userId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user id against token id
    if (token.id !== userId) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check user
    if (!user) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // verify api key
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
    });

    res.json({error: false, clientSecret: setupIntent.client_secret});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
