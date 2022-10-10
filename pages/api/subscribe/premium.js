import { getToken } from "next-auth/jwt";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }
    const { id, setupIntent } = req.body;

    // check user id against token id
    if (token.id !== id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const paymentMethodId = setupIntent.setupIntent.payment_method;
    const priceId = "price_1LldZsIjvIl5h3pN1j3cMKH3";
    const user = await prisma.user.findUnique({ where: { id } });
    const { stripeId } = user;

    // attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeId,
    });

    // update customer to default payment method
    await stripe.customers.update(stripeId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // create subscription in stripe
    await stripe.subscriptions.create({
      customer: stripeId,
      items: [{ price: priceId }],
    });

    // update user in db
    await prisma.user.update({
      where: { id },
      data: {
        paymentStatus: "PAID",
        status: "SUBSCRIPTION_ACTIVE",
        trialUsed: true,
      },
    });

    res.json({ error: false, message: "success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
