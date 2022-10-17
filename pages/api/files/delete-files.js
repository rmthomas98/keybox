import prisma from "../../../lib/prisma";
import {getToken} from "next-auth/jwt";

const aws = require("aws-sdk");

const handler = async (req, res) => {
  try {
    const token = await getToken({req});
    if (!token) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    const {userId, files, folderId, folderSize} = req.body;

    // check userId against token id
    if (userId !== token.id) {
      res.json({error: true, message: "Not authorized"});
      return;
    }

    // check data
    if (!userId || !files || !folderId || !folderSize) {
      res.json({error: true, message: "No files to delete"});
      return;
    }

    // create s3 instance
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // delete files from database
    for (let i = 0; i < files.length; i++) {
      const {id, key} = files[i];

      // delete file from s3
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      };

      // delete file from s3 and database
      await s3.deleteObject(params).promise();
      await prisma.file.delete({where: {id}});
    }

    // get total size of files deleted
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    // update folder size
    await prisma.folder.update({
      where: {id: folderId},
      data: {
        size: folderSize - totalSize,
      },
    });

    // get updated folder
    const folder = await prisma.folder.findUnique({
      where: {id: folderId},
      include: {files: true},
    });

    // get updated folders
    const folders = await prisma.folder.findMany({
      where: {userId},
      include: {files: true},
    });

    res.json({
      error: false,
      message: "Successfully deleted files",
      folders,
      folder,
    });
  } catch (err) {
    console.log(err);
    res.json({error: true, message: "Error deleting files"});
  }
};

export default handler;
