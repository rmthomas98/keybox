import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    //get user id
    const { userId, apiKey } = req.body;

    // make sure user id was passed in
    if (!userId || apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // check user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if api key is valid
    if (user.apiKey !== apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // get subscription from stripe
    const plan = await stripe.subscriptions.list({
      customer: user.stripeId,
      status: "active",
      limit: 1,
    });

    // get subscription id
    const subscriptionId = plan?.data[0]?.id || null;

    // make sure subscription exists
    if (!subscriptionId) {
      res.json({ error: true, message: "Subscription not found" });
      return;
    }

    // resume subscription
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // return success message
    res.json({ error: false, message: "Subscription resumed" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
