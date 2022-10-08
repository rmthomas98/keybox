import prisma from "../lib/prisma";

// type format = {cards: true, banks: true, etc...}
export const getUserData = async (userId, type) => {
  const data = await prisma.user.findUnique({
    where: { id: userId },
    include: type,
  });

  return data;
};
