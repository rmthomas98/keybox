const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const priceId = "price_1LldZsIjvIl5h3pN1j3cMKH3";
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;