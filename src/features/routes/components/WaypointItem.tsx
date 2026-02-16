import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { WaypointType } from "../types";

const WAYPOINT_ICONS: Record<WaypointType, keyof typeof Ionicons.glyphMap> = {
    inicio: "flag",
    fin: "flag-outline",
    cenote: "water",
    zona_arqueologica: "library",
    mirador: "eye",
    restaurante: "restaurant",
    tienda: "storefront",
    taller_bicicletas: "construct",
    descanso: "bed",
    punto_agua: "water-outline",
    peligro: "warning",
    foto: "camera",
    otro: "location",
};

const WAYPOINT_LABELS: Record<WaypointType, string> = {
    inicio: "Inicio",
    fin: "Fin",
    cenote: "Cenote",
    zona_arqueologica: "Zona Arqueológica",
    mirador: "Mirador",
    restaurante: "Restaurante",
    tienda: "Tienda",
    taller_bicicletas: "Taller",
    descanso: "Descanso",
    punto_agua: "Punto de Agua",
    peligro: "Precaución",
    foto: "Punto Fotográfico",
    otro: "Punto de Interés",
};

interface Props {
    name: string;
    description: string | null;
    waypointType: WaypointType;
    orderIndex: number;
    isLast?: boolean;
}

export const WaypointItem = ({
    name,
    description,
    waypointType,
    orderIndex,
    isLast,
}: Props) => {
    const { colors } = useTheme();
    const icon = WAYPOINT_ICONS[waypointType] ?? "location";
    const typeLabel = WAYPOINT_LABELS[waypointType] ?? waypointType;

    return (
        <View style={styles.container}>
            {/* Timeline line */}
            <View style={styles.timeline}>
                <View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.primary, borderColor: colors.primaryLight },
                    ]}
                >
                    <Ionicons name={icon} size={12} color="#FFFFFF" />
                </View>
                {!isLast && (
                    <View
                        style={[styles.line, { backgroundColor: colors.border }]}
                    />
                )}
            </View>

            {/* Content */}
            <View
                style={[
                    styles.content,
                    !isLast && { borderBottomWidth: 0 },
                ]}
            >
                <View style={styles.header}>
                    <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
                    <View
                        style={[
                            styles.typeBadge,
                            { backgroundColor: colors.primaryLight },
                        ]}
                    >
                        <Text style={[styles.typeText, { color: colors.primary }]}>
                            {typeLabel}
                        </Text>
                    </View>
                </View>
                {description && (
                    <Text
                        style={[styles.description, { color: colors.textSecondary }]}
                        numberOfLines={2}
                    >
                        {description}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 20,
    },
    timeline: {
        alignItems: "center",
        width: 32,
        marginRight: 12,
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    line: {
        width: 2,
        flex: 1,
        marginVertical: 2,
    },
    content: {
        flex: 1,
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
});
