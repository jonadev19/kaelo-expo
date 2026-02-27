import { useTheme } from "@/shared/hooks/useTheme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const PRESET_TAGS = [
  "familiar",
  "nocturna",
  "amanecer",
  "cenotes",
  "naturaleza",
  "urbana",
  "playa",
  "arqueología",
  "gastronomía",
  "entrenamiento",
  "principiantes",
  "gravel",
];

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const { colors } = useTheme();

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <View style={styles.grid}>
      {PRESET_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.surfaceSecondary,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => toggle(tag)}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? "#FFF" : colors.text },
              ]}
            >
              {tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
