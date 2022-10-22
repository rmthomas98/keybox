const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }
    const {id} = req.body;
    const priceId = "price_1LldZsIjvIl5h3pN1j3cMKH3";

    // check user id against token id
    if (token.id !== id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const user = await prisma.user.findUnique({where: {id}});

    // check user
    if (!user) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const {stripeId} = user;

    // make sure user hasnt used trial before
    if (user.trialUsed) {
      res.json({error: true, message: "Trial already used"});
      return;
    }

    await stripe.subscriptions.create({
      customer: stripeId,
      items: [{price: priceId}],
      trial_period_days: 7,
      cancel_at_period_end: true,
    });

    await prisma.user.update({
      where: {id},
      data: {
        status: "TRIAL_IN_PROGRESS",
        trialUsed: true,
      },
    });

    res.json({error: false, message: "Trial started"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
