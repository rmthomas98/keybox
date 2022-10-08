import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { getUserData } from "../../../helpers/getUserData";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { userId, identifier, type, ownership } = req.body;
    let { name, account, routing } = req.body;

    // get user from db along with existing banks
    const { banks } = await getUserData(userId, { banks: true });

    // check if identifier is already taken
    const isIdentityTaken = banks.filter(
      (bank) =>
        bank.identifier.toLowerCase() === identifier.toLowerCase().trim()
    );
    if (isIdentityTaken.length > 0) {
      return res.json({
        error: true,
        message: "The identifier you entered is already in use",
      });
    }

    // encrypt bank details
    const key = process.env.ENCRYPTION_KEY;
    name = name ? aes256.encrypt(key, name) : null;
    account = account ? aes256.encrypt(key, account) : null;
    routing = routing ? aes256.encrypt(key, routing) : null;

    // insert into db
    await prisma.bank.create({
      data: {
        identifier: identifier.trim(),
        type: type ? type : null,
        ownership: ownership ? ownership : null,
        name,
        account,
        routing,
        userId,
      },
    });

    // get updated banks
    const { banks: updatedBanks } = await getUserData(userId, { banks: true });

    res.json({
      error: false,
      banks: updatedBanks,
      message: "Bank added successfully!",
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
