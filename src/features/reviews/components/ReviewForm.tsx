import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubmitReview } from "../hooks/useSubmitReview";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
    routeId: string;
    visible: boolean;
    onClose: () => void;
}

export function ReviewForm({ routeId, visible, onClose }: ReviewFormProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { mutate: submit, isPending } = useSubmitReview(routeId);

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert("Selecciona una calificación", "Toca las estrellas para calificar");
            return;
        }

        submit(
            {
                route_id: routeId,
                rating,
                comment: comment.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setRating(0);
                    setComment("");
                    onClose();
                    Alert.alert("¡Gracias!", "Tu reseña ha sido publicada");
                },
                onError: (error) => {
                    Alert.alert("Error", error.message);
                },
            },
        );
    };

    const handleClose = () => {
        setRating(0);
        setComment("");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <Pressable style={styles.backdrop} onPress={handleClose} />

                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.background,
                            paddingBottom: insets.bottom + 16,
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Escribir Reseña
                        </Text>
                        <Pressable onPress={handleClose} hitSlop={12}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    {/* Stars */}
                    <View style={styles.ratingSection}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            ¿Cómo fue tu experiencia?
                        </Text>
                        <StarRating
                            rating={rating}
                            size={36}
                            interactive
                            onRate={setRating}
                        />
                        {rating > 0 && (
                            <Text style={[styles.ratingLabel, { color: colors.primary }]}>
                                {
                                    ["", "Mala", "Regular", "Buena", "Muy buena", "Excelente"][
                                    rating
                                    ]
                                }
                            </Text>
                        )}
                    </View>

                    {/* Comment */}
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                        placeholder="Cuéntanos sobre tu experiencia... (opcional)"
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />

                    {/* Submit */}
                    <Pressable
                        style={[
                            styles.submitButton,
                            { backgroundColor: colors.primary },
                            (rating === 0 || isPending) && { opacity: 0.5 },
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitText}>Publicar Reseña</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    ratingSection: {
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        lineHeight: 20,
        minHeight: 100,
        marginBottom: 20,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    submitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
