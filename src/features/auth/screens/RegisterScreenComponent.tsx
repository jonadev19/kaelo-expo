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

export default function RegisterScreenComponent() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const checkEmailExists = useAuthStore((state) => state.checkEmailExists);
  const isLoading = useAuthStore((state) => state.isLoading);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    const { exists, error: checkError } = await checkEmailExists(email);

    if (checkError) {
      Alert.alert(
        "Error",
        `No se pudo verificar el correo: ${checkError.message}`,
      );
      return;
    }

    if (exists) {
      Alert.alert("Error", "Este correo ya está registrado");
      return;
    }

    const { error } = await signUpWithEmail(email, password);

    if (error) {
      let message = "Ocurrió un error al crear la cuenta";
      if (error.message === "User already registered") {
        message = "Este correo ya está registrado";
      }
      Alert.alert("Error de registro", message);
      return;
    }

    Alert.alert("Cuenta creada", "Revisa tu correo para confirmar tu cuenta", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") },
    ]);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error && error.name !== "OAuthCancelled") {
      Alert.alert(
        "Error",
        error.message || "No se pudo iniciar sesión con Google",
      );
    }
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
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <MaterialIcons name="terrain" size={22} color="#fff" />
            </View>
            <Text style={styles.brandText}>Kaelo</Text>
          </View>

          <Text style={styles.heroTitle}>Crea tu{"\n"}cuenta</Text>

          <View style={styles.heroLinkRow}>
            <Text style={styles.heroLinkText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.heroLinkAction}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
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
              {/* Email */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
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
                      emailFocused ? brand.primary[500] : colors.textTertiary
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
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

              {/* Password */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Contraseña
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: passwordFocused
                        ? brand.primary[500]
                        : colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={
                      passwordFocused ? brand.primary[500] : colors.textTertiary
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: colors.text }]}
                    autoComplete="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Primary button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={isLoading}
                style={[
                  styles.primaryButton,
                  { backgroundColor: brand.primary[500] },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Crear cuenta</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="#fff"
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
                  o continúa con
                </Text>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              </View>

              {/* Google button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: isLoading ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={[styles.socialText, { color: colors.text }]}>
                  Continuar con Google
                </Text>
              </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brand.primary[600],
  },
  brandText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    marginBottom: 16,
  },
  heroLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroLinkText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
  },
  heroLinkAction: {
    color: brand.primary[300],
    fontSize: 15,
    fontWeight: "700",
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
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: "500",
  },

  socialButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  socialText: {
    fontSize: 15,
    fontWeight: "600",
  },
  googleG: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
  },
});