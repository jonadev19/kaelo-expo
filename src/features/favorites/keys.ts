export const favoriteKeys = {
    all: ["favorites"] as const,
    list: (userId: string) => [...favoriteKeys.all, "list", userId] as const,
    check: (userId: string, routeId: string) =>
        [...favoriteKeys.all, "check", userId, routeId] as const,
};
