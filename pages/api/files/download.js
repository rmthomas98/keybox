import { getToken } from "next-auth/jwt";

const aws = require("aws-sdk");

const handler = async (req, res) => {
  try {
    const token = await getToken({ req });

    if (!token) {
      res.json({ error: true, message: "Something went wrong" });
      return;
    }

    const { userId, folderId, fileId, key, apiKey } = req.body;

    // check user id against token
    if (userId !== token.id) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    if (!userId || !folderId || !fileId || !key) {
      res.json({ error: true, message: "Invalid data" });
      return;
    }

    // get user from db
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { files: true },
    });

    if (!user) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    // check api key against user
    if (apiKey !== user.apiKey) {
      res.json({ error: true, message: "Invalid request" });
      return;
    }

    // check if user has file by fileId and key
    const doesUserHaveFile = user.files.some(
      (file) => file.id === fileId && file.key === key
    );

    if (!doesUserHaveFile) {
      res.json({ error: true, message: "Unauthorized" });
      return;
    }

    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    };

    const signedUrl = s3.getSignedUrl("getObject", params);

    res.json({ error: false, signedUrl });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
