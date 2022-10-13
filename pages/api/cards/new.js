import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { decryptCards } from "../../../helpers/cards/decryptCards";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, identifier, type, brand } = req.body.options;
    let { name, number, exp, cvc, zip } = req.body.options;

    // check user id against token
    if (id !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // get user from db along with existing cards
    const { cards } = await prisma.user.findUnique({
      where: { id },
      include: { cards: true },
    });

    // check if identifier is already taken
    const isIdentifierTaken = cards.filter(
      (card) =>
        card.identifier.toLowerCase() === identifier.toLowerCase().trim()
    );

    // if identifier is taken, return error
    if (isIdentifierTaken.length > 0) {
      return res.json({
        error: true,
        message: "The identifier you entered is already in use",
      });
    }

    // encrypt card details
    const key = process.env.ENCRYPTION_KEY;
    name = name ? aes256.encrypt(key, name) : null;
    number = number ? aes256.encrypt(key, number) : null;
    exp = exp ? aes256.encrypt(key, exp) : null;
    cvc = cvc ? aes256.encrypt(key, cvc) : null;
    zip = zip ? aes256.encrypt(key, zip) : null;

    // insert into db
    await prisma.card.create({
      data: {
        identifier: identifier.trim(),
        type: type ? type : null,
        brand: brand ? brand : null,
        name,
        number,
        exp,
        cvc,
        zip,
        userId: id,
      },
    });

    // get updated cards
    let { cards: updatedCards } = await prisma.user.findUnique({
      where: { id: id },
      include: { cards: true },
    });

    // decrypt card details
    updatedCards = decryptCards(updatedCards);

    res.json({
      error: false,
      message: "Card added successfully",
      cards: updatedCards,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
