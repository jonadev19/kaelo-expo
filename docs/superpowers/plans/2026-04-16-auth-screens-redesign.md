# Auth Screens Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar Login y Register con layout de dos zonas (hero verde oscuro + card blanca), simplificar Register a solo email/password, y agregar pantalla funcional de Forgot Password.

**Architecture:** Todos los screens de auth comparten un patrón visual de dos zonas: un hero superior con fondo `brand.primary[800]` que contiene logo + título + link cruzado, y una card blanca inferior con `borderTopRadius: 32` que contiene los inputs y botones. La lógica de auth existente (`authStore`) no cambia.

**Tech Stack:** React Native (Expo), Expo Router file-based routing, Zustand (authStore), `@expo/vector-icons/MaterialIcons`, `react-native-safe-area-context`.

**Spec:** `docs/superpowers/specs/2026-04-16-auth-screens-redesign-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/features/auth/screens/LoginScreenComponent.tsx` | Modify | Rediseño visual (misma lógica) |
| `src/features/auth/screens/RegisterScreenComponent.tsx` | Modify | Rediseño visual + quitar `confirmPassword` |
| `src/features/auth/screens/ForgotPasswordScreenComponent.tsx` | Create | Nueva pantalla de recuperación |
| `app/(auth)/forgot-password.tsx` | Create | Thin route wrapper |
| `app/(auth)/_layout.tsx` | Modify | Registrar ruta `forgot-password` |

---

## Task 1: Redesign LoginScreenComponent

**Files:**
- Modify: `src/features/auth/screens/LoginScreenComponent.tsx` (full rewrite of UI, keep logic)

- [ ] **Step 1: Replace component content with new two-zone layout**

Overwrite `src/features/auth/screens/LoginScreenComponent.tsx` with:

```tsx
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const { error } = await signInWithEmail(email, password);

    if (error) {
      let message = "Ocurrió un error al iniciar sesión";
      if (error.message === "Invalid login credentials") {
        message = "Correo o contraseña incorrectos";
      }
      Alert.alert("Error de acceso", message);
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

          <Text style={styles.heroTitle}>
            Inicia sesión en{"\n"}tu cuenta
          </Text>

          <View style={styles.heroLinkRow}>
            <Text style={styles.heroLinkText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.heroLinkAction}>Registrarse</Text>
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

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotWrapper}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={[styles.forgotText, { color: brand.primary[600] }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Primary button */}
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
                  <ActivityIndicator color="#fff" />
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

  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 24,
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
```

- [ ] **Step 2: Type-check**

Run: `yarn tsc --noEmit`
Expected: No errors. (The `router.push("/(auth)/forgot-password")` path may warn if the route doesn't exist yet — this is resolved in Task 4. If TypeScript complains loudly, continue — the route will be registered shortly.)

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/screens/LoginScreenComponent.tsx
git commit -m "feat(auth): redesign login with two-zone layout"
```

---

## Task 2: Redesign + simplify RegisterScreenComponent

**Files:**
- Modify: `src/features/auth/screens/RegisterScreenComponent.tsx` (full rewrite)

- [ ] **Step 1: Replace component content**

Overwrite `src/features/auth/screens/RegisterScreenComponent.tsx` with:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `yarn tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/screens/RegisterScreenComponent.tsx
git commit -m "feat(auth): redesign register, simplify to email+password"
```

---

## Task 3: Create ForgotPasswordScreenComponent

**Files:**
- Create: `src/features/auth/screens/ForgotPasswordScreenComponent.tsx`

- [ ] **Step 1: Create the file with full content**

Create `src/features/auth/screens/ForgotPasswordScreenComponent.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `yarn tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/screens/ForgotPasswordScreenComponent.tsx
git commit -m "feat(auth): add forgot password screen component"
```

---

## Task 4: Register the forgot-password route

**Files:**
- Create: `app/(auth)/forgot-password.tsx`
- Modify: `app/(auth)/_layout.tsx`

- [ ] **Step 1: Create the route wrapper**

Create `app/(auth)/forgot-password.tsx`:

```tsx
import ForgotPasswordScreenComponent from "@/features/auth/screens/ForgotPasswordScreenComponent";

export default function ForgotPasswordScreen() {
  return <ForgotPasswordScreenComponent />;
}
```

- [ ] **Step 2: Register the screen in the auth layout**

Edit `app/(auth)/_layout.tsx`. Replace the existing Stack content with a Stack that includes `forgot-password`:

```tsx
import { useTheme } from "@/shared/hooks/useTheme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },
        headerShadowVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `yarn tsc --noEmit`
Expected: No errors. The `router.push("/(auth)/forgot-password")` call in Login should now type-check cleanly since the route exists.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/forgot-password.tsx app/\(auth\)/_layout.tsx
git commit -m "feat(auth): register forgot-password route"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start the dev server and verify flows manually**

Run: `yarn start` (and test on iOS simulator or device with `yarn ios`).

Verify each of these flows:

1. **Login screen:**
   - Hero verde oscuro aparece arriba con "Kaelo" logo, título "Inicia sesión en tu cuenta", y link "¿No tienes cuenta? Registrarse".
   - Card blanca con inputs de email y password.
   - "¿Olvidaste tu contraseña?" navega a la nueva pantalla.
   - Botón "Iniciar sesión" funciona con credenciales válidas (usuario existente en Supabase).
   - Botón "Continuar con Google" abre el flujo OAuth.

2. **Register screen:**
   - Hero con título "Crea tu cuenta" y link "¿Ya tienes cuenta? Iniciar sesión".
   - Solo email + password (no hay campos de nombre ni confirmar).
   - Password < 8 caracteres muestra alert.
   - Email ya registrado muestra alert de error.
   - Registro exitoso muestra alert de confirmación.

3. **Forgot Password screen:**
   - Hero con botón back, título "Recuperar contraseña" y subtítulo.
   - Email inválido muestra alert.
   - Envío exitoso cambia a estado de éxito inline con ícono check verde.
   - Botón "Volver al inicio de sesión" regresa a login.

4. **Light/Dark theme:** cambiar tema del sistema y verificar que la card se adapta (fondo, texto, bordes). El hero permanece verde oscuro.

- [ ] **Step 2: If tests exist, run them**

Run: `yarn test src/features/auth`
Expected: Existing `authStore.test.ts` continues to pass. No new tests required.

- [ ] **Step 3: Final commit (if any manual fixes were needed)**

If any adjustments were made during manual verification:

```bash
git add <files>
git commit -m "fix(auth): <description of fix>"
```

If no adjustments were needed, skip this step.

---

## Notes

- **Route deprecation for rewrite password:** Este plan no incluye la pantalla "set new password" que Supabase invoca desde el link del email. Para esta iteración, el usuario recibe el email y Supabase redirige al flujo por default. Implementar deep link handler queda fuera de scope.
- **Existing tests:** Solo `authStore.test.ts` existe en `src/features/auth/__tests__/`. No hay tests de UI que referencien los strings cambiados.
- **Animations:** Se mantienen las animaciones fade+slide de entrada para la card. No se animan los textos del hero (primer paint directo).