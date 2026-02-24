export const orderKeys = {
    all: ["orders"] as const,
    list: () => [...orderKeys.all, "list"] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
    myOrders: () => [...orderKeys.all, "my-orders"] as const,
};
