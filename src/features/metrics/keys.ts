export const metricsKeys = {
    all: ["metrics"] as const,
    dashboard: (userId: string) =>
        [...metricsKeys.all, "dashboard", userId] as const,
    achievements: (userId: string) =>
        [...metricsKeys.all, "achievements", userId] as const,
    activity: (userId: string) =>
        [...metricsKeys.all, "activity", userId] as const,
};
