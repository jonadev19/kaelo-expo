import type { ProductItem } from "@/features/businesses/types";
import { Alert } from "react-native";
import { create } from "zustand";
import type { CartItem } from "../types";

interface CartState {
    businessId: string | null;
    businessName: string | null;
    items: CartItem[];
}

interface CartActions {
    addItem: (product: ProductItem, businessId: string, businessName: string) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clear: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export type CartStore = CartState & CartActions;

const initialState: CartState = {
    businessId: null,
    businessName: null,
    items: [],
};

export const useCartStore = create<CartStore>((set, get) => ({
    ...initialState,

    addItem: (product, businessId, businessName) => {
        const state = get();

        // If cart has items from a different business, ask to clear
        if (state.businessId && state.businessId !== businessId && state.items.length > 0) {
            Alert.alert(
                "Vaciar carrito",
                `Tu carrito tiene productos de ${state.businessName}. ¿Deseas vaciarlo y agregar de ${businessName}?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Vaciar y agregar",
                        style: "destructive",
                        onPress: () => {
                            set({
                                businessId,
                                businessName,
                                items: [{ product, quantity: 1 }],
                            });
                        },
                    },
                ],
            );
            return;
        }

        const existing = state.items.find((i) => i.product.id === product.id);
        if (existing) {
            set({
                items: state.items.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i,
                ),
            });
        } else {
            set({
                businessId,
                businessName,
                items: [...state.items, { product, quantity: 1 }],
            });
        }
    },

    removeItem: (productId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.product.id !== productId);
        if (newItems.length === 0) {
            set(initialState);
        } else {
            set({ items: newItems });
        }
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set((state) => ({
            items: state.items.map((i) =>
                i.product.id === productId ? { ...i, quantity } : i,
            ),
        }));
    },

    clear: () => set(initialState),

    getTotal: () => {
        return get().items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );
    },

    getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },
}));
