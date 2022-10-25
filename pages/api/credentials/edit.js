import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const aes256 = require("aes256");
import { decryptCredentials } from "../../../helpers/credentials/decryptCredentials";
import { decryptCredential } from "../../../helpers/credentials/decryptCredential";
import { decryptKey } from "../../../helpers/keys/decryptKey";

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

    // check user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "User not found" });
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

    // get decrypted user encryption key
    let key = await decryptKey(user.key);

    if (!key) {
      res.json({ error: true, message: "Could not decrypt key" });
      return;
    }

    // encrypt password
    let encryptedPassword;
    if (password) {
      encryptedPassword = aes256.encrypt(key, password);
    }

    // encrypt account and website
    const encryptedAccount = account
      ? aes256.encrypt(key, account.trim())
      : null;
    const encryptedWebsite = website
      ? aes256.encrypt(key, website.trim())
      : null;

    key = null;

    // update credentials
    await prisma.credential.update({
      where: { id },
      data: {
        name: name.trim(),
        account: encryptedAccount,
        website: encryptedWebsite,
        password: encryptedPassword ? encryptedPassword : null,
      },
    });

    // get updated credential and decrypt
    const updatedCred = await prisma.credential.findUnique({ where: { id } });
    const decryptedCred = await decryptCredential(user.key, updatedCred);

    // get all credentials
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    });

    // decrypt all credentials
    const { credentials: encryptedCreds } = updatedUser;
    const decryptedCreds = await decryptCredentials(user.key, encryptedCreds);

    res.json({
      error: false,
      message: "Credentials updated successfully",
      credential: decryptedCred,
      credentials: decryptedCreds,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
