export const reviewKeys = {
    all: ["reviews"] as const,
    route: (routeId: string) =>
        [...reviewKeys.all, "route", routeId] as const,
    business: (businessId: string) =>
        [...reviewKeys.all, "business", businessId] as const,
};
