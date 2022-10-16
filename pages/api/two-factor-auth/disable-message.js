import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const { userId } = req.body;

    // update user in db
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneToken: null,
        twoFactor: false,
        ask2FA: false,
      },
    });

    res.json({ error: false, message: "Two factor authentication disabled" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
