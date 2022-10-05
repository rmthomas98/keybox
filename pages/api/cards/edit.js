import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptCard} from "../../../helpers/decryptCard";
import {decryptCards} from "../../../helpers/decryptCards";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {cardId, userId, identifier, identifierChange, type, brand} =
      req.body;
    let {name, number, exp, cvc, zip} = req.body;

    // get user from db along with existing cards
    const {cards} = await prisma.user.findUnique({
      where: {id: userId},
      include: {cards: true},
    });

    // check if user changed identifier
    if (identifierChange) {
      // check if identifier is taken
      const isIdentifierTaken = cards.filter(
        (card) =>
          card.identifier.toLowerCase() === identifier.toLowerCase().trim()
      );

      if (isIdentifierTaken.length > 0) {
        res.json({
          error: true,
          message: "The identifier you entered is already in use.",
        });
        return;
      }
    }

    // encrypt card details
    const key = process.env.ENCRYPTION_KEY;
    name = name ? aes256.encrypt(key, name) : undefined;
    number = number ? aes256.encrypt(key, number) : undefined;
    exp = exp ? aes256.encrypt(key, exp) : undefined;
    cvc = cvc ? aes256.encrypt(key, cvc) : undefined;
    zip = zip ? aes256.encrypt(key, zip) : undefined;

    // update card in db
    await prisma.card.update({
      where: {id: cardId},
      data: {
        identifier: identifier.trim(),
        type,
        brand,
        name,
        number,
        exp,
        cvc,
        zip,
        userId,
      },
    });

    // get updated card
    let updatedCard = await prisma.card.findUnique({where: {id: cardId}});
    updatedCard = decryptCard(updatedCard)

    // Get all cards and update
    let {cards: updatedCards} = await prisma.user.findUnique({where: {id: userId}, include: {cards: true}});
    updatedCards = decryptCards(updatedCards);

    // send card and success back to frontend
    res.json({
      error: false,
      message: "Card updated successfully",
      card: updatedCard,
      cards: updatedCards
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
