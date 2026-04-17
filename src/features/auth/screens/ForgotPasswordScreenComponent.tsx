import { brand } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreenComponent() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [sent, setSent] = useState(false);

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Error", "Ingresa un correo válido");
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      Alert.alert(
        "Error",
        error.message || "No se pudo enviar el enlace",
      );
      return;
    }

    setSent(true);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Hero */}
      <SafeAreaView edges={["top"]} style={styles.hero}>
        <View style={styles.heroContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.heroTitle}>Recuperar{"\n"}contraseña</Text>

          <Text style={styles.heroSubtitle}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </Text>
        </View>
      </SafeAreaView>

      {/* Card */}
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {sent ? (
                <View style={styles.successBox}>
                  <View
                    style={[
                      styles.successIcon,
                      { backgroundColor: brand.primary[100] },
                    ]}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={40}
                      color={brand.primary[500]}
                    />
                  </View>
                  <Text style={[styles.successTitle, { color: colors.text }]}>
                    Enlace enviado
                  </Text>
                  <Text
                    style={[
                      styles.successText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Enviamos un enlace a{" "}
                    <Text style={{ fontWeight: "700", color: colors.text }}>
                      {email}
                    </Text>
                    . Revisa tu bandeja de entrada.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.replace("/(auth)/login")}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: brand.primary[500] },
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      Volver al inicio de sesión
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.field}>
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Correo electrónico
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: emailFocused
                            ? brand.primary[500]
                            : colors.border,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="mail-outline"
                        size={20}
                        color={
                          emailFocused
                            ? brand.primary[500]
                            : colors.textTertiary
                        }
                        style={styles.inputIcon}
                      />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tu@correo.com"
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.input, { color: colors.text }]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                      {email.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setEmail("")}
                          hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                          }}
                        >
                          <MaterialIcons
                            name="close"
                            size={18}
                            color={colors.textTertiary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: brand.primary[500], marginTop: 8 },
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>
                          Enviar enlace
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={20}
                          color="#fff"
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.primary[800],
  },

  // Hero
  hero: {
    backgroundColor: brand.primary[800],
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    marginBottom: 24,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    lineHeight: 22,
  },

  // Card
  card: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },

  primaryButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: brand.primary[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  successBox: {
    alignItems: "center",
    paddingTop: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
});