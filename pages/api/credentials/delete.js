import prisma from "../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const { id } = req.body;

    // delete credentials from db
    await prisma.credential.delete({ where: { id } });

    // return success to front end
    res.json({ error: false, message: "Successfully deleted credentials!" });
  } catch {
    res.json({ error: true, message: "Something went wrong" });
  }
};

export default handler;
