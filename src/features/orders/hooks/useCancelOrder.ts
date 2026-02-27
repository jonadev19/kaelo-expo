import { useUser } from "@/shared/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrder } from "../api";
import { orderKeys } from "../keys";

export const useCancelOrder = () => {
    const user = useUser();
    const userId = user?.id ?? "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => cancelOrder(orderId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};
