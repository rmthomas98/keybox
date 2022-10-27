import prisma from "../../../lib/prisma";
import {decryptCards} from "../../../helpers/cards/decryptCards";
import {getToken} from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {id, userId, apiKey} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    if (!id || !userId || !apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({where: {id: userId}});

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api against user api
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: "Invalid request"});
      return;
    }

    await prisma.card.delete({where: {id}});

    // get updated cards from db and decrypt
    const {cards} = await prisma.user.findUnique({
      where: {id: userId},
      include: {cards: true},
    });
    const decryptedCards = await decryptCards(user.key, cards);

    res.json({
      error: false,
      message: "Card deleted successfully!",
      cards: decryptedCards,
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
