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

    const { userId, folderId } = req.body;

    // check userId against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check data
    if (!userId || !folderId) {
      res.json({ error: true, message: "Invalid data" });
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

    // delete files from s3
    for (let i = 0; i < files; i++) {
      const { key } = files[i];

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      };

      await s3.deleteObject(params).promise();
    }

    // delete files from database
    await prisma.file.deleteMany({ where: { folderId } });

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
