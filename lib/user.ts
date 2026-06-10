import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY } from "@/lib/currencies";

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      defaultCurrency: true,
    },
  });
}

export async function getUserDefaultCurrency(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultCurrency: true },
  });
  return user?.defaultCurrency ?? DEFAULT_CURRENCY;
}
