export const paymentKeys = {
  all: ["payments"] as const,
  purchases: () => [...paymentKeys.all, "purchases"] as const,
  purchaseCheck: (routeId: string) =>
    [...paymentKeys.all, "purchase-check", routeId] as const,
  myPurchases: () => [...paymentKeys.all, "my-purchases"] as const,
};
