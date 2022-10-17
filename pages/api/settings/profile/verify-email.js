import prisma from '../../../../lib/prisma';
import {getToken} from 'next-auth/jwt';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: 'Not authorized'});
      return;
    }

    const {userId, email, code} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: 'Not authorized'});
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check if user exists
    if (!user) {
      res.json({error: true, message: 'User not found'});
      return;
    }

    // make user email is same as change email
    if (email.toLowerCase().trim() !== user.changeEmailTo) {
      res.json({error: true, message: 'Email does not match'});
      return;
    }

    // check if code is correct
    if (code.trim() !== user.emailToken) {
      res.json({error: true, message: 'Code is incorrect'});
      return;
    }

    // update user email in stripe
    await stripe.customers.update(user.stripeId, {
      email: email.toLowerCase().trim(),
    })

    // update user email in db
    await prisma.user.update({
      where: {id: userId},
      data: {
        email: email.toLowerCase().trim(),
        changeEmailTo: null,
        emailToken: null,
      }
    })

    res.json({error: false, message: 'Email updated'});

  } catch {
    res.json({error: true, message: 'Something went wrong'});
  }
}

export default handler;