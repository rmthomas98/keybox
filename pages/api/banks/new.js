import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";
import {decryptBanks} from "../../../helpers/banks/decryptBanks";
import {decryptKey} from "../../../helpers/keys/decryptKey";

const aes256 = require("aes256");

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({req});
    if (!token) {
      return res.json({error: true, message: "Not authorized"});
    }

    const {userId, identifier, type, ownership, apiKey} = req.body;
    let {name, account, routing} = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    if (!userId || !identifier || !apiKey) {
      res.json({error: true, message: "invalid request"});
      return;
    }

    // check user
    const user = await prisma.user.findUnique({
      where: {id: userId},
      include: {banks: true},
    });

    // check if user exists
    if (!user) {
      res.json({error: true, message: "User not found"});
      return;
    }

    // check api key against user
    if (apiKey !== user.apiKey) {
      res.json({error: true, message: 'Invalid request'})
      return;
    }

    const {banks} = user;

    // check if identifier is already taken
    const isIdentityTaken = banks.filter(
      (bank) =>
        bank.identifier.toLowerCase() === identifier.toLowerCase().trim()
    );
    if (isIdentityTaken.length > 0) {
      return res.json({
        error: true,
        message: "The identifier you entered is already in use",
      });
    }

    // encrypt bank details
    let key = await decryptKey(user.key);

    if (!key) {
      res.json({error: true, message: "Invalid key"});
      return;
    }

    const bankDetails = {
      identifier: identifier.trim(),
      type: type || null,
      ownership: ownership || null,
      name: name ? aes256.encrypt(key, name.trim()) : null,
      account: account ? aes256.encrypt(key, account.trim()) : null,
      routing: routing ? aes256.encrypt(key, routing.trim()) : null,
      userId,
    };

    // erase key from memory
    key = null;

    // insert into db
    await prisma.bank.create({
      data: {...bankDetails},
    });

    // get updated banks and decrypt
    const {banks: updatedBanks} = await prisma.user.findUnique({
      where: {id: userId},
      include: {banks: true},
    });
    const decryptedBanks = await decryptBanks(user.key, updatedBanks);

    res.json({
      error: false,
      banks: decryptedBanks,
      message: "Bank added successfully!",
    });
  } catch {
    res.json({error: true, message: "Something went wrong"});
  }
};

export default handler;
