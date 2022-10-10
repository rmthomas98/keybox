import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";
import { getUserData } from "../../../helpers/getUserData";
import { decryptBanks } from "../../../helpers/decryptBanks";

const handler = async (req, res) => {
  try {
    const { userId, bankId } = req.body;

    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      return res.json({ error: true, message: "Not authorized" });
    }

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // delete bank from db
    await prisma.bank.delete({ where: { id: bankId } });

    // get updated banks
    let { banks } = await getUserData(userId, { banks: true });

    // decrypt bank details
    banks = decryptBanks(banks);

    res.json({ error: false, message: "Bank deleted successfully!", banks });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
