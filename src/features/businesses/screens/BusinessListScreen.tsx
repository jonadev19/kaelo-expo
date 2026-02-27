import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BusinessCard } from "../components/BusinessCard";
import { useBusinesses } from "../hooks/useBusinesses";
import type { BusinessListItem, BusinessType } from "../types";

interface CategoryOption {
    label: string;
    value: BusinessType | null;
    icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: CategoryOption[] = [
    { label: "Todos", value: null, icon: "grid-outline" },
    { label: "Restaurantes", value: "restaurante", icon: "restaurant" },
    { label: "Cafeterías", value: "cafeteria", icon: "cafe" },
    { label: "Tiendas", value: "tienda", icon: "storefront" },
    { label: "Talleres", value: "taller_bicicletas", icon: "construct" },
    { label: "Hospedaje", value: "hospedaje", icon: "bed" },
    { label: "Farmacias", value: "farmacia", icon: "medkit" },
];

export default function BusinessListScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedType, setSelectedType] = useState<BusinessType | null>(null);

    const { data: businesses = [], isLoading } = useBusinesses(selectedType);

    const handleBusinessPress = useCallback(
        (business: BusinessListItem) => {
            router.push({
                pathname: "/business-detail" as any,
                params: { id: business.id },
            });
        },
        [router],
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <Text style={[styles.title, { color: colors.text }]}>Comercios</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Encuentra lo que necesitas cerca de tu ruta
                </Text>

                {/* Search bar */}
                <Pressable
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.inputBorder,
                        },
                    ]}
                    onPress={() => router.push("/business-search" as any)}
                >
                    <Ionicons name="search" size={18} color={colors.textTertiary} />
                    <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>
                        Buscar comercios...
                    </Text>
                </Pressable>

                {/* Category Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContent}
                    style={styles.chipsScroll}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive =
                            cat.value === selectedType ||
                            (cat.value === null && selectedType === null);
                        return (
                            <Pressable
                                key={cat.label}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: isActive
                                            ? colors.primary
                                            : colors.surface,
                                        borderColor: isActive ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => setSelectedType(cat.value)}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={14}
                                    color={isActive ? "#FFFFFF" : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.chipText,
                                        {
                                            color: isActive ? "#FFFFFF" : colors.text,
                                            fontWeight: isActive ? "600" : "400",
                                        },
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Business List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : businesses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="storefront-outline"
                        size={48}
                        color={colors.textTertiary}
                    />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No hay comercios disponibles
                        {selectedType ? " en esta categoría" : ""}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={businesses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 16 },
                    ]}
                    renderItem={({ item }) => (
                        <BusinessCard business={item} onPress={handleBusinessPress} />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    searchPlaceholder: {
        fontSize: 15,
    },
    chipsScroll: {
        marginHorizontal: -20,
    },
    chipsContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
    },
    listContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
    },
});
