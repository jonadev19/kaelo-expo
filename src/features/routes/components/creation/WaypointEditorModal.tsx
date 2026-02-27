import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { WaypointType } from "../../types";

const WAYPOINT_TYPES: { value: WaypointType; label: string; icon: string }[] = [
  { value: "cenote", label: "Cenote", icon: "water" },
  { value: "mirador", label: "Mirador", icon: "eye" },
  { value: "zona_arqueologica", label: "Zona Arqueológica", icon: "business" },
  { value: "restaurante", label: "Restaurante", icon: "restaurant" },
  { value: "tienda", label: "Tienda", icon: "cart" },
  { value: "taller_bicicletas", label: "Taller", icon: "build" },
  { value: "descanso", label: "Descanso", icon: "bed" },
  { value: "punto_agua", label: "Punto de Agua", icon: "water" },
  { value: "peligro", label: "Peligro", icon: "warning" },
  { value: "foto", label: "Foto", icon: "camera" },
  { value: "otro", label: "Otro", icon: "location" },
];

interface WaypointEditorModalProps {
  visible: boolean;
  coordinate: [number, number] | null; // [lng, lat]
  onSave: (data: {
    name: string;
    description: string;
    waypoint_type: WaypointType;
  }) => void;
  onClose: () => void;
}

export function WaypointEditorModal({
  visible,
  coordinate,
  onSave,
  onClose,
}: WaypointEditorModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<WaypointType>("otro");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), waypoint_type: type });
    setName("");
    setDescription("");
    setType("otro");
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setType("otro");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Agregar punto de interés
            </Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Nombre del punto"
            placeholderTextColor={colors.inputPlaceholder}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Descripción (opcional)"
            placeholderTextColor={colors.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Tipo de punto
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typesRow}
          >
            {WAYPOINT_TYPES.map((wt) => {
              const selected = type === wt.value;
              return (
                <Pressable
                  key={wt.value}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surfaceSecondary,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setType(wt.value)}
                >
                  <Ionicons
                    name={wt.icon as any}
                    size={16}
                    color={selected ? "#FFF" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: selected ? "#FFF" : colors.text },
                    ]}
                  >
                    {wt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor: name.trim()
                  ? colors.primary
                  : colors.buttonDisabled,
              },
            ]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text style={styles.saveButtonText}>Agregar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  typesRow: {
    gap: 8,
    paddingBottom: 16,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
