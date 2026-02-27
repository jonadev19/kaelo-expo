import { supabase } from "@/lib/supabase";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);
    const { data: profile, isLoading: profileLoading } = useProfile();
    const { mutateAsync: update, isPending } = useUpdateProfile();

    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Populate fields when profile loads
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name ?? "");
            setBio(profile.bio ?? "");
            setPhone(profile.phone ?? "");
            setAvatarUrl(profile.avatar_url ?? null);
        }
    }, [profile]);

    const handlePickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled || !result.assets[0]) return;

        const asset = result.assets[0];
        if (!user?.id) return;

        setUploadingAvatar(true);
        try {
            const ext = asset.uri.split(".").pop() ?? "jpg";
            const filePath = `${user.id}/avatar.${ext}`;

            // Read file as blob
            const response = await fetch(asset.uri);
            const blob = await response.blob();

            // Convert blob to ArrayBuffer
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, arrayBuffer, {
                    contentType: asset.mimeType ?? `image/${ext}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            // Add cache buster to force refresh
            const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            setAvatarUrl(newUrl);
        } catch (err: any) {
            Alert.alert("Error", err.message ?? "No se pudo subir la imagen");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {
            await update({
                full_name: fullName.trim() || undefined,
                bio: bio.trim() || undefined,
                phone: phone.trim() || undefined,
                avatar_url: avatarUrl ?? undefined,
            });
            Alert.alert("Perfil actualizado", "", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.message ?? "No se pudo actualizar");
        }
    };

    const hasChanges =
        fullName !== (profile?.full_name ?? "") ||
        bio !== (profile?.bio ?? "") ||
        phone !== (profile?.phone ?? "") ||
        avatarUrl !== (profile?.avatar_url ?? null);

    if (profileLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Editar Perfil
                </Text>
                <Pressable
                    onPress={handleSave}
                    disabled={!hasChanges || isPending}
                    hitSlop={12}
                >
                    {isPending ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text
                            style={[
                                styles.saveText,
                                { color: hasChanges ? colors.primary : colors.textTertiary },
                            ]}
                        >
                            Guardar
                        </Text>
                    )}
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar */}
                <Pressable
                    style={styles.avatarSection}
                    onPress={handlePickAvatar}
                    disabled={uploadingAvatar}
                >
                    <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                        {uploadingAvatar ? (
                            <View
                                style={[
                                    styles.avatarPlaceholder,
                                    { backgroundColor: colors.primaryLight },
                                ]}
                            >
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View
                                style={[
                                    styles.avatarPlaceholder,
                                    { backgroundColor: colors.primaryLight },
                                ]}
                            >
                                <Ionicons name="person" size={40} color={colors.primary} />
                            </View>
                        )}
                        <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={14} color="#FFFFFF" />
                        </View>
                    </View>
                    <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                        Cambiar foto
                    </Text>
                </Pressable>

                {/* Fields */}
                <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Nombre completo
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Tu nombre"
                        placeholderTextColor={colors.inputPlaceholder}
                        autoCapitalize="words"
                        maxLength={100}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Biografía
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Cuéntanos sobre ti..."
                        placeholderTextColor={colors.inputPlaceholder}
                        multiline
                        maxLength={300}
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                        {bio.length}/300
                    </Text>
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Teléfono
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                            },
                        ]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+52 999 123 4567"
                        placeholderTextColor={colors.inputPlaceholder}
                        keyboardType="phone-pad"
                        maxLength={20}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Correo electrónico
                    </Text>
                    <View
                        style={[
                            styles.input,
                            styles.disabledInput,
                            {
                                backgroundColor: colors.surfaceSecondary,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={{ color: colors.textTertiary }}>
                            {user?.email ?? ""}
                        </Text>
                    </View>
                    <Text style={[styles.hint, { color: colors.textTertiary }]}>
                        El correo no se puede cambiar
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    saveText: {
        fontSize: 16,
        fontWeight: "600",
    },
    form: {
        padding: 20,
        paddingBottom: 60,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        overflow: "visible",
        position: "relative",
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 48,
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraIcon: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    textArea: {
        minHeight: 90,
        lineHeight: 20,
    },
    disabledInput: {
        justifyContent: "center",
    },
    charCount: {
        fontSize: 11,
        textAlign: "right",
        marginTop: 4,
    },
    hint: {
        fontSize: 11,
        marginTop: 4,
    },
});
