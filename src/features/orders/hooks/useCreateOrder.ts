import { useUser } from "@/shared/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api";
import { orderKeys } from "../keys";
import type { OrderFormData } from "../types";

export const useCreateOrder = () => {
    const user = useUser();
    const userId = user?.id ?? "";
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: OrderFormData) => createOrder(userId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};
