import prisma from "../../../lib/prisma";

const aes256 = require("aes256");
import { getToken } from "next-auth/jwt";
import { getUserData } from "../../../helpers/getUserData";
import { decryptBanks } from "../../../helpers/decryptBanks";
import { decryptBank } from "../../../helpers/decryptBank";

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

    // check if identifier is changed and if it is already taken
    let { banks } = getUserData(userId, { banks: true });
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

    // encrypt bank name, account number, and routing number
    const key = process.env.ENCRYPTION_KEY;
    name = name ? aes256.encrypt(key, name) : null;
    account = account ? aes256.encrypt(key, account) : null;
    routing = routing ? aes256.encrypt(key, routing) : null;

    // update bank in db
    const updatedBank = await prisma.bank.update({
      where: { id: bankId },
      data: {
        identifier: identifier.trim(),
        name,
        account,
        routing,
        type: type ? type : null,
        ownership: ownership ? ownership : null,
      },
    });

    // get updated banks
    const { banks: updatedBanks } = await getUserData(userId, { banks: true });

    // decrypt bank details
    const decryptedBanks = decryptBanks(updatedBanks);
    const decryptedBank = decryptBank(updatedBank);

    // return success to front end
    res.json({
      error: false,
      message: "Successfully updated bank!",
      banks: decryptedBanks,
      bank: decryptedBank,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
