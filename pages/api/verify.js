import prisma from "../../lib/prisma";

const handler = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ error: true, message: "User not found" });
    }

    if (user.emailToken !== token) {
      return res.json({ error: true, message: "Invalid token" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailToken: null,
        emailVerified: true,
      },
    });

    res.json({ error: false, message: "Email verified" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
