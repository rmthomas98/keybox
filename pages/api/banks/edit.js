import prisma from "../../../lib/prisma";

const aes256 = require("aes256");
import { getToken } from "next-auth/jwt";
import { decryptBanks } from "../../../helpers/banks/decryptBanks";
import { decryptBank } from "../../../helpers/banks/decryptBank";
import { decryptKey } from "../../../helpers/keys/decryptKey";

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    const { userId, bankId, identifier, type, ownership, isIdentityChange } =
      req.body;
    let { name, account, routing } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    if (!userId || !bankId || !identifier) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { banks: true },
    });

    // check if user exists
    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check if identifier is changed and if it is already taken
    const { banks } = user;
    if (isIdentityChange) {
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
    }

    // get decrypted key
    let key = await decryptKey(user.key);

    // encrypt bank name, account number, and routing number
    const bankDetails = {
      identifier: identifier.trim(),
      type: type || null,
      ownership: ownership || null,
      name: name ? aes256.encrypt(key, name.trim()) : null,
      account: account ? aes256.encrypt(key, account.trim()) : null,
      routing: routing ? aes256.encrypt(key, routing.trim()) : null,
    };

    key = null;

    // update bank in db
    const updatedBank = await prisma.bank.update({
      where: { id: bankId },
      data: { ...bankDetails },
    });

    // get updated banks
    const { banks: updatedBanks } = await prisma.user.findUnique({
      where: { id: userId },
      include: { banks: true },
    });

    // decrypt bank details
    const decryptedBanks = await decryptBanks(user.key, updatedBanks);
    const decryptedBank = await decryptBank(user.key, updatedBank);

    // return success to front end
    res.json({
      error: false,
      message: "Successfully updated bank!",
      banks: decryptedBanks,
      bank: decryptedBank,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
