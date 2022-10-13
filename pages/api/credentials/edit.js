import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const aes256 = require("aes256");
import { decryptCredentials } from "../../../helpers/credentials/decryptCredentials";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, userId, name, nameChange, account, website, password } =
      req.body.options;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // get user from db along with existing credentials
    const { credentials } = await prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    });

    if (nameChange) {
      // check if name is already taken
      const isNameTaken = credentials.filter(
        (credential) =>
          credential.name?.toLowerCase() === name.toLowerCase().trim()
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
        name: name.trim(),
        account,
        website,
        password: encryptedPassword ? encryptedPassword : null,
      },
    });

    // get updated credential and decrypt
    const updatedCredential = await prisma.credential.findUnique({
      where: { id },
    });
    if (updatedCredential.password) {
      const key = process.env.ENCRYPTION_KEY;
      const { password: encryptedPassword } = updatedCredential;
      updatedCredential.decryptedPassword = aes256.decrypt(
        key,
        encryptedPassword
      );
      updatedCredential.encryptedPassword = encryptedPassword;
    } else {
      updatedCredential.decryptedPassword = "";
      updatedCredential.encryptedPassword = updatedCredential.password;
    }

    // get all credentials
    const updatedCredentials = await decryptCredentials(userId);

    res.json({
      error: false,
      message: "Credentials updated successfully",
      credential: updatedCredential,
      credentials: updatedCredentials,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
