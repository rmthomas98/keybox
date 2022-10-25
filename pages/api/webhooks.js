import prisma from "../../lib/prisma";
import { buffer } from "micro";

const stripe = require("stripe")(process.env.STRIPE_WEBHOOK_SECRET);

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {
  if (req.method === "POST") {
    const sig = req.headers["stripe-signature"];
    const buf = await buffer(req);

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // handle the event
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customer = invoice.customer;
      const billingReason = invoice.billing_reason;
      const amountDue = invoice.amount_due;

      if (billingReason === "subscription_create" && amountDue === 0) {
        // update user in db
        await prisma.user.update({
          where: { stripeId: customer },
          data: {
            paymentStatus: "PAID",
            status: "TRIAL_IN_PROGRESS",
            trialUsed: true,
          },
        });
      } else {
        // update user in db
        await prisma.user.update({
          where: { stripeId: customer },
          data: {
            paymentStatus: "PAID",
            status: "SUBSCRIPTION_ACTIVE",
            trialUsed: true,
          },
        });
      }

      console.log("Payment Succeeded");
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customer = invoice.customer;

      // update user in db
      await prisma.user.update({
        where: { stripeId: customer },
        data: {
          paymentStatus: "FAILED",
        },
      });

      console.log("payment failed");
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customer = subscription.customer;

      // update user in db
      await prisma.user.update({
        where: { stripeId: customer },
        data: {
          paymentStatus: "PAID",
          status: "SUBSCRIPTION_CANCELED",
        },
      });
      console.log("subscription deleted");
    }

    // return a response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } else {
    res.status(405).end("Method not allowed");
  }
};

export default handler;
