import { getToken } from "next-auth/jwt";

const aws = require("aws-sdk");

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });

    if (!token) {
      res.json({ error: true, message: "Something went wrong" });
      return;
    }

    const { userId, folderId, fileId, key } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    if (!userId || !folderId || !fileId || !key) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
