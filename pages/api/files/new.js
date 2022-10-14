import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const fs = require("fs");
const aws = require("aws-sdk");
const formidable = require("formidable");

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  try {
    // authenticate user
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
    }

    const data = await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const { userId, name } = fields;
    const maxSize = 15000000000; // 15GB
    const maxFileSize = 50 * 1024 ** 2; // 50 MB

    // check data
    if (!fields || !files || !name || !userId) {
      res.json({ error: true, message: "Invalid Data" });
      return;
    }

    // check userId against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // create folder in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { folders: true },
    });

    // check user subscription status
    if (user.status !== "SUBSCRIPTION_ACTIVE") {
      res.json({
        error: true,
        message: "You must upgrade your subscription to upload files.",
      });
      return;
    }

    // check if folder name is unique
    const folderNameExists = user.folders.filter(
      (folder) => folder.name.toLowerCase() === name.toLowerCase().trim()
    );
    if (folderNameExists.length > 0) {
      return res.json({ error: true, message: "Folder name already exists" });
    }

    // get all folders from db to check size
    const folders = await prisma.folder.findMany({
      where: { userId },
    });

    // check if total size of files exceeds 15GB
    const currentSize = folders.reduce((acc, file) => acc + file.size, 0);
    const fileList = Object.keys(files).map((key) => files[key]);
    const uploadedFileSize = fileList.reduce((acc, file) => acc + file.size, 0);

    if (currentSize + uploadedFileSize > maxSize) {
      res.json({ error: true, message: "No storage available" });
      return;
    }

    // make sure no files are over 50MB
    if (fileList.some((file) => file.size > maxFileSize)) {
      res.json({ error: true, message: "File size exceeds limit" });
      return;
    }

    // create folder in database
    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    // create s3 instance
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // loop through files and upload to s3
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const { originalFilename, size, filepath, mimetype } = file;
      const blob = fs.readFileSync(filepath);

      // create s3 params
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${userId}/${folder.id}/${originalFilename}`,
        Body: blob,
      };

      // upload file to s3
      await s3.upload(params).promise();

      // create document record in database and associate with folder and user
      await prisma.file.create({
        data: {
          name: originalFilename,
          type: mimetype,
          size,
          key: `${userId}/${folder.id}/${originalFilename}`,
          folderId: folder.id,
          userId,
        },
      });
    }

    // update folder with total file size
    const totalSize = fileList.reduce((acc, file) => acc + file.size, 0);
    await prisma.folder.update({
      where: { id: folder.id },
      data: { size: totalSize },
    });

    // get updated folders
    const updatedFolders = await prisma.folder.findMany({
      where: { userId },
      include: { files: true },
    });

    res.json({
      error: false,
      message:
        fileList.length > 1
          ? "Files uploaded successfully"
          : "File uploaded successfully",
      folders: updatedFolders,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: true,
      message: "Error uploading files, please try again",
    });
  }
};

export default handler;
