import prisma from "../../../lib/prisma";
import { decryptCards } from "../../../helpers/decryptCards";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, userId } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    await prisma.card.delete({ where: { id } });

    // get updated cards
    let { cards: updatedCards } = await prisma.user.findUnique({
      where: { id: userId },
      include: { cards: true },
    });

    // decrypt card details
    updatedCards = decryptCards(updatedCards);

    res.json({
      error: false,
      message: "Card deleted successfully!",
      cards: updatedCards,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
