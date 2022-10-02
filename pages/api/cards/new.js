import prisma from "../../../lib/prisma";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    const { id, identifier } = req.body.options;
    let { name, number, exp, cvc, zip } = req.body.options;

    // get user from db along with existing cards
    const { cards } = await prisma.user.findUnique({
      where: { id },
      include: { cards: true },
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
        name,
        number,
        exp,
        cvc,
        zip,
        userId: id,
      },
    });

    // get updated cards
    const { cards: updatedCards } = await prisma.user.findUnique({
      where: { id: id },
      include: { cards: true },
    });

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