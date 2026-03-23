import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import React from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Assets
const SATELLITE_IMG = require("../../../../assets/images/map_style_satellite.png");
const STREET_IMG = require("../../../../assets/images/map_style_street.png");
const OUTDOORS_IMG = require("../../../../assets/images/map_style_outdoors.png");
const DARK_IMG = require("../../../../assets/images/map_style_dark.png");

export interface MapStyleOption {
  id: string;
  label: string;
  url: string;
  image: ImageSourcePropType;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: "satellite",
    label: "Satélite",
    url: Mapbox.StyleURL.SatelliteStreet,
    image: SATELLITE_IMG,
    icon: "earth",
  },
  {
    id: "street",
    label: "Calles",
    url: Mapbox.StyleURL.Street,
    image: STREET_IMG,
    icon: "map",
  },
  {
    id: "outdoors",
    label: "Exterior",
    url: Mapbox.StyleURL.Outdoors,
    image: OUTDOORS_IMG,
    icon: "trail-sign",
  },
  {
    id: "dark",
    label: "Oscuro",
    url: Mapbox.StyleURL.Dark,
    image: DARK_IMG,
    icon: "moon",
  },
];

interface MapStylePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedStyleUrl: string;
  onSelectStyle: (url: string) => void;
}

export function MapStylePickerModal({
  visible,
  onClose,
  selectedStyleUrl,
  onSelectStyle,
}: MapStylePickerModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          onPress={onClose}
        />
        
        <Animated.View
          style={{
            transform: [{ translateY }],
            // Ensures the Animated View doesn't restrict its inner content
            width: "100%",
          }}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Tipo de mapa
            </Text>

            {/* Options Grid */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {MAP_STYLES.map((option) => {
                const isSelected = selectedStyleUrl === option.url;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.optionCard,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                        backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
                      },
                    ]}
                    onPress={() => {
                      onSelectStyle(option.url);
                      onClose();
                    }}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={option.image}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.labelContainer}>
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  handleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCard: {
    width: 110,
    borderRadius: 16,
    overflow: "hidden",
    paddingBottom: 10,
  },
  imageContainer: {
    width: "100%",
    height: 110,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  checkBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  optionLabel: {
    fontSize: 13,
  },
});
