import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PhotoGalleryProps {
    photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    if (!photos || photos.length === 0) return null;

    return (
        <>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Galería ({photos.length})
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {photos.map((uri, index) => (
                        <Pressable
                            key={uri}
                            onPress={() => setPreviewIndex(index)}
                        >
                            <Image
                                source={{ uri }}
                                style={[styles.thumb, { borderColor: colors.border }]}
                                resizeMode="cover"
                            />
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Full-screen preview */}
            <Modal visible={previewIndex !== null} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Pressable
                        style={[styles.closeBtn, { top: insets.top + 8 }]}
                        onPress={() => setPreviewIndex(null)}
                    >
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </Pressable>

                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: (previewIndex ?? 0) * SCREEN_WIDTH, y: 0 }}
                    >
                        {photos.map((uri) => (
                            <Image
                                key={uri}
                                source={{ uri }}
                                style={styles.fullImage}
                                resizeMode="contain"
                            />
                        ))}
                    </ScrollView>

                    <Text style={[styles.counter, { bottom: insets.bottom + 16 }]}>
                        {(previewIndex ?? 0) + 1} / {photos.length}
                    </Text>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, marginTop: 16 },
    title: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
    scrollContent: { gap: 10 },
    thumb: {
        width: 140,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
    },
    closeBtn: {
        position: "absolute",
        right: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: "100%",
    },
    counter: {
        position: "absolute",
        alignSelf: "center",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
