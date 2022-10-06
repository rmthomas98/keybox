import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const aes256 = require("aes256");
const generator = require("generate-password");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { id, name, account, password, generatePassword, website } =
      req.body.options;
    let generatedPassword;

    // get user from db along with existing credentials
    const user = await prisma.user.findUnique({
      where: { id },
      include: { credentials: true },
    });

    // check if name is already taken
    const isNameTaken = user.credentials.filter(
      (credentials) =>
        credentials.name?.toLowerCase() === name.toLowerCase().trim()
    );

    if (isNameTaken.length > 0) {
      return res.json({
        error: true,
        message: "The name you entered is already in use",
      });
    }

    // if user wants to generate password
    if (generatePassword) {
      generatedPassword = generator.generate({
        length: 15,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
      });
    }

    let encryptedPassword;

    if (password || generatedPassword) {
      // encrypt password
      const key = process.env.ENCRYPTION_KEY;
      encryptedPassword = aes256.encrypt(
        key,
        generatedPassword ? generatedPassword : password
      );
    }

    // insert into db
    await prisma.credential.create({
      data: {
        name: name.trim(),
        account,
        password: encryptedPassword ? encryptedPassword : null,
        website,
        userId: id,
      },
    });

    // return success to front end
    res.json({ error: false, message: "success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
