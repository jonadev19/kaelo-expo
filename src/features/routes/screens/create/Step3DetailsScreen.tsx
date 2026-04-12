import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PricingToggle } from "../../components/creation/PricingToggle";
import { StepHeader } from "../../components/creation/StepHeader";
import { TagSelector } from "../../components/creation/TagSelector";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";
import type { RouteDifficulty, RouteTerrainType } from "../../types";

const DIFFICULTIES: { value: RouteDifficulty; label: string }[] = [
  { value: "facil", label: "Fácil" },
  { value: "moderada", label: "Moderada" },
  { value: "dificil", label: "Difícil" },
  { value: "experto", label: "Experto" },
];

const TERRAINS: { value: RouteTerrainType; label: string }[] = [
  { value: "asfalto", label: "Asfalto" },
  { value: "terraceria", label: "Terracería" },
  { value: "mixto", label: "Mixto" },
];

export default function Step3DetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const details = useRouteCreationStore((s) => s.details);
  const setDetails = useRouteCreationStore((s) => s.setDetails);
  const snappedRoute = useRouteCreationStore((s) => s.snappedRoute);
  const addPhotos = useRouteCreationStore((s) => s.addPhotos);
  const removePhoto = useRouteCreationStore((s) => s.removePhoto);
  const reorderPhotos = useRouteCreationStore((s) => s.reorderPhotos);

  const autoMinutes = snappedRoute
    ? Math.round(snappedRoute.duration / 60)
    : null;

  const canProceed = details.name.trim().length >= 3;

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      addPhotos(result.assets.map((a) => a.uri));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setDetails({ cover_image_uri: result.assets[0].uri });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader step={3} title="Detalles" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover image */}
        <Text style={[styles.label, { color: colors.text }]}>Imagen de portada</Text>
        <Pressable
          onPress={pickImage}
          style={[
            styles.imagePicker,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          {details.cover_image_uri ? (
            <Image source={{ uri: details.cover_image_uri }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePickerInner}>
              <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
              <Text style={[styles.imagePickerText, { color: colors.textSecondary }]}>
                Toca para seleccionar imagen
              </Text>
            </View>
          )}
        </Pressable>

        {/* Additional photos */}
        <Text style={[styles.label, { color: colors.text }]}>Fotos adicionales</Text>
        <View style={styles.photosGrid}>
          {details.photo_uris.map((uri, index) => (
            <View key={uri} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoThumbImage} />
              <Pressable
                style={styles.photoRemoveBtn}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={22} color="#FF4D6A" />
              </Pressable>
              <View style={styles.photoReorderRow}>
                {index > 0 && (
                  <Pressable
                    style={styles.photoReorderBtn}
                    onPress={() => reorderPhotos(index, index - 1)}
                  >
                    <Ionicons name="chevron-back" size={14} color="#FFF" />
                  </Pressable>
                )}
                {index < details.photo_uris.length - 1 && (
                  <Pressable
                    style={styles.photoReorderBtn}
                    onPress={() => reorderPhotos(index, index + 1)}
                  >
                    <Ionicons name="chevron-forward" size={14} color="#FFF" />
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          <Pressable
            onPress={pickPhotos}
            style={[styles.addPhotoBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Ionicons name="add-outline" size={28} color={colors.textTertiary} />
            <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>Agregar</Text>
          </Pressable>
        </View>

        {/* Name */}
        <Text style={[styles.label, { color: colors.text }]}>Nombre *</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          placeholder="Ej. Ruta de los Cenotes"
          placeholderTextColor={colors.inputPlaceholder}
          value={details.name}
          onChangeText={(v) => setDetails({ name: v })}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.text }]}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          placeholder="Describe la ruta, qué la hace especial..."
          placeholderTextColor={colors.inputPlaceholder}
          value={details.description}
          onChangeText={(v) => setDetails({ description: v })}
          multiline
          numberOfLines={4}
        />

        {/* Difficulty */}
        <Text style={[styles.label, { color: colors.text }]}>Dificultad</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => {
            const sel = details.difficulty === d.value;
            return (
              <Pressable
                key={d.value}
                style={[styles.chip, { backgroundColor: sel ? colors.primary : colors.surfaceSecondary, borderColor: sel ? colors.primary : colors.border }]}
                onPress={() => setDetails({ difficulty: d.value })}
              >
                <Text style={[styles.chipText, { color: sel ? "#FFF" : colors.text }]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Terrain */}
        <Text style={[styles.label, { color: colors.text }]}>Terreno</Text>
        <View style={styles.chipRow}>
          {TERRAINS.map((t) => {
            const sel = details.terrain_type === t.value;
            return (
              <Pressable
                key={t.value}
                style={[styles.chip, { backgroundColor: sel ? colors.primary : colors.surfaceSecondary, borderColor: sel ? colors.primary : colors.border }]}
                onPress={() => setDetails({ terrain_type: t.value })}
              >
                <Text style={[styles.chipText, { color: sel ? "#FFF" : colors.text }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Municipality */}
        <Text style={[styles.label, { color: colors.text }]}>Municipio</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          placeholder="Ej. Mérida"
          placeholderTextColor={colors.inputPlaceholder}
          value={details.municipality}
          onChangeText={(v) => setDetails({ municipality: v })}
        />

        {/* Tags */}
        <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
        <TagSelector
          selected={details.tags}
          onChange={(tags) => setDetails({ tags })}
        />

        {/* Duration */}
        <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
          Duración estimada (minutos)
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          placeholder={autoMinutes ? `Auto: ~${autoMinutes} min` : "Ej. 90"}
          placeholderTextColor={colors.inputPlaceholder}
          keyboardType="number-pad"
          value={
            details.estimated_duration_min != null
              ? String(details.estimated_duration_min)
              : ""
          }
          onChangeText={(v) =>
            setDetails({
              estimated_duration_min: v ? parseInt(v, 10) || null : null,
            })
          }
        />

        {/* Pricing */}
        <Text style={[styles.label, { color: colors.text }]}>Precio</Text>
        <PricingToggle
          isFree={details.is_free}
          price={details.price}
          onToggle={(isFree) => setDetails({ is_free: isFree, price: isFree ? 0 : details.price })}
          onPriceChange={(price) => setDetails({ price })}
        />
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[styles.bottomBar, { backgroundColor: colors.background, paddingBottom: insets.bottom + 8 }]}
      >
        <View />
        <Pressable
          style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.buttonDisabled }]}
          onPress={() => router.push("/create-route/step4-businesses")}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 4 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  imagePickerInner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePickerText: { fontSize: 13 },
  coverImage: { width: "100%", height: "100%" },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoThumb: {
    width: (Dimensions.get("window").width - 48) / 3,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photoThumbImage: {
    width: "100%",
    height: "100%",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  photoReorderRow: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  photoReorderBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    width: (Dimensions.get("window").width - 48) / 3,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 11,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
