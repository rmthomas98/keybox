import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    if (!email || !password || !code) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }

    // find user in db by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if phone token matches
    if (code.trim() !== user.phoneToken) {
      res.json({ error: true, message: "Invalid code" });
      return;
    }

    res.json({ error: false, message: "Success", codeValid: true });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;