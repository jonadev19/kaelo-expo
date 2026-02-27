export const profileKeys = {
    all: ["profile"] as const,
    detail: (userId: string) => [...profileKeys.all, "detail", userId] as const,
    stats: (userId: string) => [...profileKeys.all, "stats", userId] as const,
};
