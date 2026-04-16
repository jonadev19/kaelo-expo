import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
    LayoutChangeEvent,
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

interface ChipGroupConfig {
    label: string;
    groupKey: string;
    options: FilterOption[];
    activeValue: string | null | undefined;
    onSelect: (value: string) => void;
    icon: keyof typeof Ionicons.glyphMap;
}

interface Props {
    filters: RouteFilters;
    onFiltersChange: (filters: RouteFilters) => void;
}

export const FilterChips = ({ filters, onFiltersChange }: Props) => {
    const { colors } = useTheme();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [chipPositions, setChipPositions] = useState<Record<string, number>>({});
    const scrollOffsetRef = useRef(0);

    const toggleGroup = useCallback(
        (group: string) => {
            setExpandedGroup((prev) => (prev === group ? null : group));
        },
        [],
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

    const handleChipLayout = useCallback((groupKey: string, event: LayoutChangeEvent) => {
        const { x } = event.nativeEvent.layout;
        setChipPositions((prev) => ({ ...prev, [groupKey]: x }));
    }, []);

    const chipGroups: ChipGroupConfig[] = [
        {
            label: "Dificultad",
            groupKey: "difficulty",
            options: DIFFICULTY_OPTIONS,
            activeValue: filters.difficulty,
            onSelect: selectDifficulty,
            icon: "speedometer-outline",
        },
        {
            label: "Terreno",
            groupKey: "terrain",
            options: TERRAIN_OPTIONS,
            activeValue: filters.terrain,
            onSelect: selectTerrain,
            icon: "trail-sign-outline",
        },
        {
            label: "Distancia",
            groupKey: "distance",
            options: DISTANCE_OPTIONS,
            activeValue: filters.maxDistance?.toString() ??
                (filters.minDistance === 50 ? "999" : undefined),
            onSelect: selectDistance,
            icon: "resize-outline",
        },
    ];

    const activeGroup = chipGroups.find((g) => g.groupKey === expandedGroup);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={(e) => {
                    scrollOffsetRef.current = e.nativeEvent.contentOffset.x;
                }}
                scrollEventThrottle={16}
            >
                {chipGroups.map((group) => {
                    const isExpanded = expandedGroup === group.groupKey;
                    const activeOption = group.options.find((o) => o.value === group.activeValue);

                    return (
                        <View
                            key={group.groupKey}
                            onLayout={(e) => handleChipLayout(group.groupKey, e)}
                        >
                            <Pressable
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: group.activeValue
                                            ? colors.primaryLight
                                            : colors.surface,
                                        borderColor: group.activeValue ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => toggleGroup(group.groupKey)}
                            >
                                <Ionicons
                                    name={group.icon}
                                    size={14}
                                    color={group.activeValue ? colors.primary : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.chipText,
                                        {
                                            color: group.activeValue ? colors.primary : colors.text,
                                            fontWeight: group.activeValue ? "600" : "400",
                                        },
                                    ]}
                                >
                                    {activeOption?.label ?? group.label}
                                </Text>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={12}
                                    color={group.activeValue ? colors.primary : colors.textTertiary}
                                />
                            </Pressable>
                        </View>
                    );
                })}

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

            {/* Dropdown rendered OUTSIDE ScrollView to avoid clipping */}
            {activeGroup && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            left: (chipPositions[activeGroup.groupKey] ?? 0) + 16 - scrollOffsetRef.current,
                        },
                    ]}
                >
                    {activeGroup.options.map((option) => (
                        <Pressable
                            key={option.value}
                            style={[
                                styles.dropdownItem,
                                option.value === activeGroup.activeValue && {
                                    backgroundColor: colors.primaryLight,
                                },
                            ]}
                            onPress={() => activeGroup.onSelect(option.value)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    {
                                        color:
                                            option.value === activeGroup.activeValue
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
        minWidth: 130,
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
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