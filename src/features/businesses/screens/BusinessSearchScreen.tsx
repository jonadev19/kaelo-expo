import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BusinessCard } from "../components/BusinessCard";
import { useSearchBusinesses } from "../hooks/useSearchBusinesses";
import type { BusinessListItem } from "../types";

export default function BusinessSearchScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
        return () => clearTimeout(timer);
    }, [query]);

    // Auto-focus input
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const { data: results = [], isLoading } = useSearchBusinesses(debouncedQuery);

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
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <View
                        style={[
                            styles.searchBar,
                            {
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                    >
                        <Ionicons name="search" size={18} color={colors.textTertiary} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Buscar comercios..."
                            placeholderTextColor={colors.textTertiary}
                            value={query}
                            onChangeText={setQuery}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery("")} hitSlop={8}>
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color={colors.textTertiary}
                                />
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>

            {/* Results */}
            {debouncedQuery.length < 2 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Escribe al menos 2 caracteres para buscar
                    </Text>
                </View>
            ) : isLoading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : results.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="storefront-outline"
                        size={48}
                        color={colors.textTertiary}
                    />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No se encontraron comercios para "{debouncedQuery}"
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 16 },
                    ]}
                    renderItem={({ item }) => (
                        <BusinessCard business={item} onPress={handleBusinessPress} />
                    )}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 0,
    },
    listContent: { padding: 16 },
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
