import { difficulty as difficultyColors } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { StyleSheet, View } from "react-native";
import type { RouteDifficulty } from "../types";

const DIFFICULTY_MARKER_COLORS: Record<RouteDifficulty, string> = {
    facil: difficultyColors.easy,
    moderada: difficultyColors.moderate,
    dificil: difficultyColors.hard,
    experto: difficultyColors.expert,
};

interface Props {
    difficulty: RouteDifficulty;
    isSelected?: boolean;
}

export const RouteMarker = ({ difficulty, isSelected }: Props) => {
    const { colors } = useTheme();
    const markerColor = DIFFICULTY_MARKER_COLORS[difficulty] ?? colors.primary;

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.pin,
                    {
                        backgroundColor: markerColor,
                        borderColor: isSelected ? colors.text : "#FFFFFF",
                        transform: [{ scale: isSelected ? 1.25 : 1 }],
                    },
                ]}
            >
                <View style={styles.innerDot} />
            </View>
            <View
                style={[
                    styles.arrow,
                    {
                        borderTopColor: markerColor,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    pin: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    innerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        marginTop: -2,
    },
});
