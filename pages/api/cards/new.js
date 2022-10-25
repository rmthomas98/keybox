import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { decryptCards } from "../../../helpers/cards/decryptCards";
import { decryptKey } from "../../../helpers/keys/decryptKey";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, identifier, type } = req.body.options;
    let { name, number, exp, cvc, zip } = req.body.options;

    // check user id against token
    if (id !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check user
    const user = await prisma.user.findUnique({ where: { id } });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // get user from db along with existing cards
    const { cards } = await prisma.user.findUnique({
      where: { id },
      include: { cards: true },
    });

    // check for identifier
    if (!identifier?.trim()) {
      res.json({ error: true, message: "Identifier required" });
      return;
    }

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

    // encrypt all card details other than identifier
    let key = await decryptKey(user.key);

    if (!key) {
      res.json({ error: true, message: "Key not found" });
      return;
    }

    const cardDetails = {
      identifier: identifier.trim(),
      name: name ? aes256.encrypt(key, name.trim()) : null,
      number: number ? aes256.encrypt(key, number.trim()) : null,
      exp: exp ? aes256.encrypt(key, exp.trim()) : null,
      cvc: cvc ? aes256.encrypt(key, cvc.trim()) : null,
      zip: zip ? aes256.encrypt(key, zip.trim()) : null,
      type: type || null,
      userId: id,
    };

    // clear key from memory
    key = null;

    // insert into db
    await prisma.card.create({
      data: {
        ...cardDetails,
      },
    });

    // get updated cards and decrypt
    const { cards: updatedCards } = await prisma.user.findUnique({
      where: { id },
      include: { cards: true },
    });

    const decryptedCards = await decryptCards(user.key, updatedCards);

    res.json({
      error: false,
      message: "Card added successfully",
      cards: decryptedCards,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
