import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const aes256 = require("aes256");
const generator = require("generate-password");
import {decryptCredentials} from "../../../helpers/credentials/decryptCredentials";
import {getDecryptedKey} from "../../../helpers/keys/getDecryptedKey";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {id, name, account, password, generatePassword, website} =
      req.body.options;
    let generatedPassword;

    // check auth token against user id
    if (token.id !== id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // get user from db along with existing credentials
    const user = await prisma.user.findUnique({
      where: {id},
      include: {credentials: true},
    });

    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    if (!name.trim()) {
      res.json({error: true, message: "Name is required"});
      return;
    }

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

    // get users decryption key
    let key = await getDecryptedKey(user.key);

    if (!key) {
      res.json({error: true, message: "Key not found"});
      return;
    }

    let encryptedPassword;

    if (password || generatedPassword) {
      // encrypt password with users key
      encryptedPassword = aes256.encrypt(
        key,
        generatePassword ? generatedPassword : password
      );
    }

    // encrypt other data
    const encryptedName = aes256.encrypt(key, name.trim());
    const encryptedAccount = account
      ? aes256.encrypt(key, account.trim())
      : null;
    const encryptedWebsite = website
      ? aes256.encrypt(key, website.trim())
      : null;

    key = null;

    // insert new credentials into db
    await prisma.credential.create({
      data: {
        name: encryptedName,
        account: encryptedAccount,
        password: encryptedPassword || null,
        website: encryptedWebsite,
        userId: id,
      },
    });

    // get updated credentials
    let updatedUser = await prisma.user.findUnique({
      where: {id},
      include: {credentials: true},
    })

    // get updated credentials
    const updatedCredentials = await decryptCredentials(user.key, updatedUser.credentials);

    // return success to front end
    res.json({
      error: false,
      message: "success",
      credentials: updatedCredentials,
    });
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
