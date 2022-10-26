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

    const { userId, folderId, apiKey } = req.body;

    // check userId against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check data
    if (!userId || !folderId || !apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "Invalid user" });
      return;
    }

    // check api key
    if (apiKey !== user.apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // get folder and files from database
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true },
    });
    const { files } = folder;

    // create s3 instance
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // delete files from s3 and database
    for (let i = 0; i < files.length; i++) {
      const { key, id } = files[i];

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      };

      await s3.deleteObject(params).promise();
      await prisma.file.delete({ where: { id } });
    }

    // delete folder from database
    await prisma.folder.delete({ where: { id: folderId } });

    // get updated folders
    const updatedFolders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true },
    });

    res.json({
      error: false,
      folders: updatedFolders,
      message: "Folder deleted",
    });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
