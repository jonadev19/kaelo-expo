export const walletKeys = {
  all: ["wallet"] as const,
  balance: (userId: string) => [...walletKeys.all, "balance", userId] as const,
  transactions: (userId: string) =>
    [...walletKeys.all, "transactions", userId] as const,
  summary: (userId: string) => [...walletKeys.all, "summary", userId] as const,
};
