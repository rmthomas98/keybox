import prisma from "../../../lib/prisma";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    const { id, userId, name, nameChange, account, website, password } =
      req.body.options;

    // get user from db along with existing credentials
    const { credentials } = await prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    });

    if (nameChange) {
      // check if name is already taken
      const isNameTaken = credentials.filter(
        (credential) => credential.name?.toLowerCase() === name.toLowerCase()
      );

      if (isNameTaken.length > 0) {
        return res.json({
          error: true,
          message: "The name you entered is already in use",
        });
      }
    }

    // encrypt password
    let encryptedPassword;
    if (password) {
      const key = process.env.ENCRYPTION_KEY;
      encryptedPassword = aes256.encrypt(key, password);
    }

    // update credentials
    await prisma.credential.update({
      where: { id },
      data: {
        name,
        account,
        website,
        password: encryptedPassword ? encryptedPassword : undefined,
      },
    });

    res.json({ error: false, message: "Credentials updated successfully" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
