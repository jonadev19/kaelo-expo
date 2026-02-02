export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  detail: (id: string) => [...routeKeys.all, "detail", id] as const,
};
