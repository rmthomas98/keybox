import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {

    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {id, identifier, type, brand} = req.body.options;
    let {name, number, exp, cvc, zip} = req.body.options;

    // get user from db along with existing cards
    const {cards} = await prisma.user.findUnique({
      where: {id},
      include: {cards: true},
    });

    // check if identifier is already taken
    const isIdentifierTaken = cards.filter(
      (card) => card.identifier.toLowerCase() === identifier.toLowerCase()
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
    name = name ? aes256.encrypt(key, name) : undefined;
    number = number ? aes256.encrypt(key, number) : undefined;
    exp = exp ? aes256.encrypt(key, exp) : undefined;
    cvc = cvc ? aes256.encrypt(key, cvc) : undefined;
    zip = zip ? aes256.encrypt(key, zip) : undefined;

    // insert into db
    await prisma.card.create({
      data: {
        identifier,
        type: type === "AMEX" ? "AMERICAN_EXPRESS" : type,
        brand,
        name,
        number,
        exp,
        cvc,
        zip,
        userId: id,
      },
    });

    // get updated cards
    let {cards: updatedCards} = await prisma.user.findUnique({
      where: {id: id},
      include: {cards: true},
    });

    // decrypt card details
    updatedCards = updatedCards.map((card) => {
      card.name = card.name ? aes256.decrypt(key, card.name) : undefined;
      card.number = card.number ? aes256.decrypt(key, card.number) : undefined;
      card.exp = card.exp ? aes256.decrypt(key, card.exp) : undefined;
      card.cvc = card.cvc ? aes256.decrypt(key, card.cvc) : undefined;
      card.zip = card.zip ? aes256.decrypt(key, card.zip) : undefined;
      return card;
    })

    res.json({
      error: false,
      message: "Card added successfully",
      cards: updatedCards,
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
