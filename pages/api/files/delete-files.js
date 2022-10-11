import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const aws = require("aws-sdk");

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const { userId, files } = req.body;

    // check userId against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check data
    if (!userId || !files) {
      res.json({ error: true, message: "No files to delete" });
      return;
    }

    const fileIds = files.map((file) => {
      return { id: file.id };
    });

    // delete files from database
    const deletedFiles = await prisma.file.deleteMany({
      where: fileIds,
    });
  } catch {
    res.json({ error: true, message: "Error deleting files" });
  }
};

export default handler;
