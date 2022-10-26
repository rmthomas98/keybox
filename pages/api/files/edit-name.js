import prisma from "../../../lib/prisma";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });
    if (!token) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    const { userId, folderId, name, apiKey } = req.body;

    // check userId against token id
    if (userId !== token.id) {
      res.json({ error: true, message: "Not authorized" });
      return;
    }

    // check data
    if (!userId || !folderId || !name || !apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.json({ error: true, message: "User not found" });
      return;
    }

    // check api key against user
    if (apiKey !== user.apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check if folder name is already taken
    const userFolders = await prisma.folder.findMany({ where: { userId } });
    const isFolderNameTaken = userFolders.some(
      (folder) => folder.name.toLowerCase() === name.toLowerCase().trim()
    );
    if (isFolderNameTaken) {
      res.json({ error: true, message: "Folder name already exists" });
      return;
    }

    // update folder name
    await prisma.folder.update({ where: { id: folderId }, data: { name } });

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

    // return updated folder and folders
    res.json({
      error: false,
      message: "Folder name updated",
      folder: updatedFolder,
      folders: updatedFolders,
    });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
