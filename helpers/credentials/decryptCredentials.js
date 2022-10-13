import prisma from "../../lib/prisma";

const aes256 = require("aes256");

export const decryptCredentials = async (userId) => {
  // get user from db along with credentials
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { credentials: true },
  });

  let { credentials } = user;

  // decrypt passwords
  credentials = credentials.map((cred) => {
    const key = process.env.ENCRYPTION_KEY;
    const { password } = cred;

    if (password) {
      cred.encryptedPassword = password;
      cred.decryptedPassword = aes256.decrypt(key, password);
    }

    return cred;
  });

  return credentials;
};
