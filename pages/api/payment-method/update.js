import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Unauthorized"});
      return;
    }

    const {userId, setupIntent} = req.body;

    // check for userId and setupIntent
    if (!userId || !setupIntent) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check if user exists
    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    const {stripeId} = user;

    // get user plan
    let plan = await stripe.subscriptions.list({
      customer: user.stripeId,
      status: "all",
      limit: 1,
    });

    plan = plan?.data[0] || null;

    // check if user has a plan
    if (!plan) {
      res.json({error: true, message: "User has no plan"});
      return;
    }

    // check if user plan should cancel at period end
    if (plan.cancel_at_period_end) {
      res.json({error: true, message: "User plan is already set to cancel at period end"});
      return;
    }

    // get payment method id from setup intent
    const paymentMethodId = setupIntent.setupIntent.payment_method;

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

    // if payment status is failed, try to pay invoice
    if (user.paymentStatus === "FAILED") {
      // get unpaid invoice
      const invoice = await stripe.invoices.list({
        customer: stripeId,
        limit: 1,
        status: "open",
      });

      // initialize invoice id
      const invoiceId = invoice.data[0]?.id;

      if (!invoiceId) {
        res.json({error: true, message: "Invoice not found"});
        return;
      }

      // pay invoice
      const paidInvoice = await stripe.invoices.pay(invoiceId, {
        payment_method: paymentMethodId,
      });

      // check if invoice is paid
      if (paidInvoice.status === "paid") {
        // update user status
        await prisma.user.update({
          where: {id: userId},
          data: {
            paymentStatus: "PAID",
            status: "SUBSCRIPTION_ACTIVE",
          },
        });

        res.json({error: false, message: "Successfully paid invoice"});
        return;
      } else {
        res.json({error: true, message: "Error paying invoice"});
        return;
      }
    }

    res.json({error: false, message: "Successfully updated payment method"});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
