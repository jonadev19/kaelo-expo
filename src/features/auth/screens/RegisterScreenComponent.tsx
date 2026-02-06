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

export default function RegisterScreenComponent() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const checkEmailExists = useAuthStore((state) => state.checkEmailExists);
  const isLoading = useAuthStore((state) => state.isLoading);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
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
                Crea tu cuenta
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Empieza a descubrir rutas y comercios
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
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
                    placeholder="Crea una contraseña"
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

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Confirmar contraseña
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: confirmFocused
                        ? brand.primary[500]
                        : colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={
                      confirmFocused ? brand.primary[500] : colors.textTertiary
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    style={[styles.input, { color: colors.text }]}
                    autoComplete="password"
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons
                      name={
                        showConfirmPassword ? "visibility-off" : "visibility"
                      }
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

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

                    {/* Divider */}
                    <View style={styles.divider}>
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: colors.border },
                        ]}
                      />
                      <Text
                        style={[
                          styles.dividerText,
                          { color: colors.textTertiary },
                        ]}
                      >
                        o continúa con
                      </Text>
                      <View
                        style={[
                          styles.line,
                          { backgroundColor: colors.border },
                        ]}
                      />
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
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="#fff"
                    />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                ¿Ya tienes cuenta?
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text
                  style={[styles.footerLink, { color: brand.primary[600] }]}
                >
                  Inicia sesión
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
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
    marginVertical: 28,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
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
  googleG: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4285F4",
  },
  socialText: {
    fontSize: 16,
    fontWeight: "600",
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
