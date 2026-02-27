import { useUser } from "@/shared/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "../api";
import { orderKeys } from "../keys";

export const useMyOrders = () => {
    const user = useUser();
    const userId = user?.id ?? "";

    return useQuery({
        queryKey: orderKeys.myOrders(),
        queryFn: () => fetchMyOrders(userId),
        enabled: !!userId,
    });
};
