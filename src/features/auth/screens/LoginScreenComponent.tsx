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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreenComponent() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Animaciones de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleLogin = async () => {
    // Validación básica
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const { error } = await signInWithEmail(email, password);

    if (error) {
      // Manejo de errores amigable
      let message = "Ocurrió un error al iniciar sesión";
      if (error.message === "Invalid login credentials") {
        message = "Correo o contraseña incorrectos";
      }
      Alert.alert("Error de acceso", message);
    } else {
      // Si todo sale bien, el Index.tsx detectará el cambio de sesión
      // y te redirigirá automáticamente a /(tabs)
      console.log("Login exitoso");
    }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.logoBox,
                  { backgroundColor: brand.primary[500] },
                ]}
              >
                <MaterialIcons name="terrain" size={36} color="#fff" />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                Bienvenido a Kaelo
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Inicia sesión para continuar explorando
              </Text>
            </Animated.View>

            {/* Formulario */}
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
                    placeholder="Ingresa tu contraseña"
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotWrapper}>
                <Text
                  style={[styles.forgotText, { color: brand.primary[600] }]}
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Botón principal */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isLoading}
                style={[
                  styles.primaryButton,
                  { backgroundColor: brand.primary[500] },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" /> // <-- Feedback visual de carga
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
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
                <View
                  style={[styles.line, { backgroundColor: colors.border }]}
                />
                <Text
                  style={[styles.dividerText, { color: colors.textTertiary }]}
                >
                  o continúa con
                </Text>
                <View
                  style={[styles.line, { backgroundColor: colors.border }]}
                />
              </View>

              {/* Social buttons */}
              <View style={styles.socialGrid}>
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
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.socialButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MaterialIcons name="apple" size={22} color={colors.text} />
                  <Text style={[styles.socialText, { color: colors.text }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                ¿No tienes cuenta?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text
                  style={[styles.footerLink, { color: brand.primary[600] }]}
                >
                  Crear cuenta
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: brand.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  // Form
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

  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
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

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
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

  socialGrid: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialText: {
    fontSize: 15,
    fontWeight: "600",
  },
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },

  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
