const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
    });

    res.json({ error: false, clientSecret: setupIntent.client_secret });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
