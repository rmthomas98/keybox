import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const bcrypt = require("bcryptjs");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const {userId, password, confirmPassword} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // get user
    const user = await prisma.user.findUnique({where: {id: userId}});

    // check if user exists
    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check if passwords match
    if (password !== confirmPassword) {
      res.json({error: true, message: "Passwords do not match"});
      return;
    }

    // make sure password is at least 8 characters
    if (password.length < 8) {
      res.json({error: true, message: "Password must be at least 8 characters"});
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user in db
    await prisma.user.update({
      where: {id: userId},
      data: {password: hashedPassword},
    });

    res.json({error: false, message: 'Password updated successfully'});
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
