import prisma from "../../../lib/prisma";

const aes256 = require("aes256");
const generator = require("generate-password");

const handler = async (req, res) => {
  try {
    const { id, name, account, password, generatePassword } = req.body.options;
    let generatedPassword;

    // get user from db along with existing credentials
    const user = await prisma.user.findUnique({
      where: { id },
      include: { credentials: true },
    });

    // check if name is already taken
    const isNameTaken = user.credentials.filter(
      (credentials) => credentials.name?.toLowerCase() === name.toLowerCase()
    );

    if (isNameTaken.length > 0) {
      return res.json({
        error: true,
        message: "The name you entered is already in use",
      });
    }

    // if user wants to generate password
    if (generatePassword) {
      generatedPassword = generator.generate({
        length: 15,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
      });
    }

    // encrypt password
    const key = process.env.ENCRYPTION_KEY;
    const encryptedPassword = aes256.encrypt(
      key,
      generatedPassword ? generatedPassword : password
    );

    // insert into db
    await prisma.credential.create({
      data: {
        name,
        account,
        password: encryptedPassword,
        userId: id,
      },
    });

    // return success to front end
    res.json({ error: false, message: "success" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
