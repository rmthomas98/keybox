const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const {id} = req.body;
    const priceId = "price_1LldZsIjvIl5h3pN1j3cMKH3";

    const user = await prisma.user.findUnique({where: {id}});
    const {stripeId} = user;

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
      },
    });

    res.json({error: false, message: 'Trial started'})
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
