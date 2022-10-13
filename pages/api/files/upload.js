import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const data = await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const { userId, folderId } = fields;
    const maxSize = 15000000000; // 15GB
    const maxFileSize = 50 * 1024 ** 2; // 50 MB

    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    if (!userId || !folderId || !files) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // create s3 instance
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // get all folders from db to check size
    const folders = await prisma.folder.findMany({
      where: { userId },
    });

    // check if total size of files exceeds 15GB
    const currentSize = folders.reduce((acc, file) => acc + file.size, 0);
    const fileList = Object.keys(files).map((key) => files[key]);
    const uploadedFileSize = fileList.reduce((acc, file) => acc + file.size, 0);

    if (currentSize + uploadedFileSize > maxSize) {
      res.json({ error: true, message: "File size exceeds limit" });
      return;
    }

    // make sure no files are over 50MB
    if (fileList.some((file) => file.size > maxFileSize)) {
      res.json({ error: true, message: "File size exceeds limit" });
      return;
    }

    // loop through files, upload to s3 and save to db
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const { originalFilename, filepath, mimetype, size } = file;
      const blob = fs.readFileSync(filepath);

      // create s3 params
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${userId}/${folderId}/${originalFilename}`,
        Body: blob,
      };

      // upload to s3
      await s3.upload(params).promise();

      // save to db
      await prisma.file.create({
        data: {
          name: originalFilename,
          size: size,
          type: mimetype,
          folderId: folderId,
          key: `${userId}/${folderId}/${originalFilename}`,
          userId: userId,
        },
      });
    }

    // get all files in folder
    const filesInFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true },
    });

    // get total size of files in folder
    const totalSize = filesInFolder.files.reduce(
      (acc, file) => acc + file.size,
      0
    );

    // update folder size
    await prisma.folder.update({
      where: { id: folderId },
      data: { size: totalSize },
    });

    // get updated folder
    const updatedFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true },
    });

    // get updated folders
    const updatedFolders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true },
    });

    res.json({
      error: false,
      message: "Files uploaded successfully",
      folder: updatedFolder,
      folders: updatedFolders,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: true, message: "Error uploading files" });
  }
};

export default handler;
