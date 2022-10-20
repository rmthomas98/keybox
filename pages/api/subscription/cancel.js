import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const { userId } = req.body;

    if (!userId) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    const plan = await stripe.subscriptions.list({
      customer: user.stripeId,
      status: "active",
      limit: 1,
    });

    const subscriptionId = plan?.data[0]?.id || null;

    if (!subscriptionId) {
      res.json({ error: true, message: "Subscription not found" });
      return;
    }

    if (user.paymentStatus === "FAILED") {
      // delete subscription
      await stripe.subscriptions.del(subscriptionId);

      // clear user subscription in db
      await prisma.user.update({
        where: { id: userId },
        data: { status: "SUBSCRIPTION_CANCELED", paymentStatus: "PAID" },
      });

      // return success message
      res.json({ error: false, message: "Subscription canceled" });
      return;
    }

    // cancel subscription at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ error: false, message: "Subscription cancelled" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
