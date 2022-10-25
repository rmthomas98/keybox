import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptCard} from "../../../helpers/cards/decryptCard";
import {decryptCards} from "../../../helpers/cards/decryptCards";
import {decryptKey} from "../../../helpers/keys/decryptKey";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {cardId, userId, identifier, identifierChange, type} = req.body;
    let {name, number, exp, cvc, zip} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // get user from db along with existing cards
    const {cards} = await prisma.user.findUnique({
      where: {id: userId},
      include: {cards: true},
    });

    // check for identifier
    if (!identifier?.trim()) {
      res.json({error: true, message: "Identifier required"});
      return;
    }

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

    // get encryption key
    let key = await decryptKey(user.key);

    if (!key) {
      res.json({error: true, message: "Key not found"});
      return;
    }

    // encrypt all card details other than identifier
    const cardDetails = {
      identifier: identifier.trim(),
      name: name ? aes256.encrypt(key, name.trim()) : null,
      number: number ? aes256.encrypt(key, number.trim()) : null,
      exp: exp ? aes256.encrypt(key, exp.trim()) : null,
      cvc: cvc ? aes256.encrypt(key, cvc.trim()) : null,
      zip: zip ? aes256.encrypt(key, zip.trim()) : null,
      type: type || null,
    };

    // clear key from memory
    key = null;

    // update card in db
    await prisma.card.update({
      where: {id: cardId},
      data: {...cardDetails},
    });

    // get updated card and decrypt
    const updatedCard = await prisma.card.findUnique({where: {id: cardId}});
    const decryptedCard = await decryptCard(user.key, updatedCard)

    // get updated cards and decrypt


    // send card and success back to frontend
    res.json({
      error: false,
      message: "Card updated successfully",
      card: updatedCard,
      cards: updatedCards,
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
