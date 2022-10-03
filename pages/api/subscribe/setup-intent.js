const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import {getToken} from "next-auth/jwt";

const handler = async (req, res) => {
  try {

    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
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
