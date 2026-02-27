import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { RouteDifficulty, RouteFilters, RouteTerrainType } from "../types";

interface FilterOption {
    label: string;
    value: string;
}

const DIFFICULTY_OPTIONS: FilterOption[] = [
    { label: "Fácil", value: "facil" },
    { label: "Moderada", value: "moderada" },
    { label: "Difícil", value: "dificil" },
    { label: "Experto", value: "experto" },
];

const TERRAIN_OPTIONS: FilterOption[] = [
    { label: "Asfalto", value: "asfalto" },
    { label: "Terracería", value: "terraceria" },
    { label: "Mixto", value: "mixto" },
];

const DISTANCE_OPTIONS: FilterOption[] = [
    { label: "<20 km", value: "20" },
    { label: "20-50 km", value: "50" },
    { label: "50+ km", value: "999" },
];

interface Props {
    filters: RouteFilters;
    onFiltersChange: (filters: RouteFilters) => void;
}

export const FilterChips = ({ filters, onFiltersChange }: Props) => {
    const { colors } = useTheme();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const toggleGroup = useCallback(
        (group: string) => {
            setExpandedGroup(expandedGroup === group ? null : group);
        },
        [expandedGroup],
    );

    const selectDifficulty = useCallback(
        (value: string) => {
            onFiltersChange({
                ...filters,
                difficulty:
                    filters.difficulty === value ? null : (value as RouteDifficulty),
            });
            setExpandedGroup(null);
        },
        [filters, onFiltersChange],
    );

    const selectTerrain = useCallback(
        (value: string) => {
            onFiltersChange({
                ...filters,
                terrain:
                    filters.terrain === value ? null : (value as RouteTerrainType),
            });
            setExpandedGroup(null);
        },
        [filters, onFiltersChange],
    );

    const selectDistance = useCallback(
        (value: string) => {
            const km = parseInt(value, 10);
            const isActive =
                filters.maxDistance === km ||
                (km === 999 && filters.minDistance === 50);

            if (isActive) {
                onFiltersChange({ ...filters, maxDistance: null, minDistance: null });
            } else if (km === 999) {
                onFiltersChange({ ...filters, minDistance: 50, maxDistance: null });
            } else if (km === 20) {
                onFiltersChange({ ...filters, maxDistance: 20, minDistance: null });
            } else {
                onFiltersChange({ ...filters, maxDistance: km, minDistance: 20 });
            }
            setExpandedGroup(null);
        },
        [filters, onFiltersChange],
    );

    const hasActiveFilters =
        filters.difficulty || filters.terrain || filters.maxDistance || filters.minDistance;

    const clearAll = useCallback(() => {
        onFiltersChange({});
        setExpandedGroup(null);
    }, [onFiltersChange]);

    const renderChipGroup = (
        label: string,
        groupKey: string,
        options: FilterOption[],
        activeValue: string | null | undefined,
        onSelect: (value: string) => void,
        icon: keyof typeof Ionicons.glyphMap,
    ) => {
        const isExpanded = expandedGroup === groupKey;
        const activeOption = options.find((o) => o.value === activeValue);

        return (
            <View key={groupKey}>
                <Pressable
                    style={[
                        styles.chip,
                        {
                            backgroundColor: activeValue
                                ? colors.primaryLight
                                : colors.surface,
                            borderColor: activeValue ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={() => toggleGroup(groupKey)}
                >
                    <Ionicons
                        name={icon}
                        size={14}
                        color={activeValue ? colors.primary : colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.chipText,
                            {
                                color: activeValue ? colors.primary : colors.text,
                                fontWeight: activeValue ? "600" : "400",
                            },
                        ]}
                    >
                        {activeOption?.label ?? label}
                    </Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={12}
                        color={activeValue ? colors.primary : colors.textTertiary}
                    />
                </Pressable>

                {isExpanded && (
                    <View
                        style={[
                            styles.dropdown,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                    >
                        {options.map((option) => (
                            <Pressable
                                key={option.value}
                                style={[
                                    styles.dropdownItem,
                                    option.value === activeValue && {
                                        backgroundColor: colors.primaryLight,
                                    },
                                ]}
                                onPress={() => onSelect(option.value)}
                            >
                                <Text
                                    style={[
                                        styles.dropdownText,
                                        {
                                            color:
                                                option.value === activeValue
                                                    ? colors.primary
                                                    : colors.text,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {renderChipGroup(
                    "Dificultad",
                    "difficulty",
                    DIFFICULTY_OPTIONS,
                    filters.difficulty,
                    selectDifficulty,
                    "speedometer-outline",
                )}
                {renderChipGroup(
                    "Terreno",
                    "terrain",
                    TERRAIN_OPTIONS,
                    filters.terrain,
                    selectTerrain,
                    "trail-sign-outline",
                )}
                {renderChipGroup(
                    "Distancia",
                    "distance",
                    DISTANCE_OPTIONS,
                    filters.maxDistance?.toString() ??
                    (filters.minDistance === 50 ? "999" : undefined),
                    selectDistance,
                    "resize-outline",
                )}

                {hasActiveFilters && (
                    <Pressable
                        style={[
                            styles.clearChip,
                            { backgroundColor: colors.errorBackground },
                        ]}
                        onPress={clearAll}
                    >
                        <Ionicons name="close-circle" size={14} color={colors.error} />
                        <Text style={[styles.chipText, { color: colors.error }]}>
                            Limpiar
                        </Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
    },
    clearChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    dropdown: {
        position: "absolute",
        top: 42,
        left: 0,
        minWidth: 130,
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    dropdownItem: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 13,
    },
});
