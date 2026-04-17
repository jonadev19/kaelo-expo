# Auth Screens Redesign — Design Spec

**Date:** 2026-04-16
**Scope:** Visual redesign of Login and Register screens + new Forgot Password screen
**Area:** `src/features/auth/screens/`, `app/(auth)/`

## Goal

Rediseñar las pantallas de Login y Register para adoptar un layout de dos zonas (hero oscuro superior + card blanca inferior) usando la paleta de marca Kaelo. Simplificar el flujo de Register y agregar pantalla funcional de recuperación de contraseña.

## Visual Architecture

### Layout común (Login + Register)

Dos zonas verticales dentro de un `SafeAreaView`:

**1. Hero superior (~40% de la pantalla)**
- Fondo: `brand.primary[800]` (`#065F46`)
- Logo: ícono `MaterialIcons terrain` + texto "Kaelo" (arriba, alineado a la izquierda)
- Título grande blanco: `fontSize: 32, fontWeight: 700`
  - Login: *"Inicia sesión en tu cuenta"*
  - Register: *"Crea tu cuenta"*
- Línea de enlace cruzado:
  - Login: *"¿No tienes cuenta? Registrarse"*
  - Register: *"¿Ya tienes cuenta? Iniciar sesión"*
  - Texto: `rgba(255,255,255,0.75)`; link: `brand.primary[300]` (`#6EE7B7`), `fontWeight: 700`
- Sin status bar content en el hero (solo color de background verde oscuro).

**2. Card inferior blanca**
- Fondo: `colors.background` (se adapta a light/dark theme)
- `borderTopLeftRadius: 32`, `borderTopRightRadius: 32`
- Padding interno: `24` horizontal, `32` vertical (top)
- Contiene: labels + inputs + botón principal + divisor + botón Google

### Colores aplicados

| Elemento | Color |
|---|---|
| Hero background | `brand.primary[800]` (`#065F46`) |
| Título hero | `#FFFFFF` |
| Subtítulo hero | `rgba(255,255,255,0.75)` |
| Link en hero (Sign Up / Login) | `brand.primary[300]` (`#6EE7B7`) |
| Botón principal | `brand.primary[500]` |
| Texto botón principal | `#FFFFFF` |
| Input focus ring | `brand.primary[500]` |
| "¿Olvidaste tu contraseña?" | `brand.primary[600]` |
| Divisor ("o continúa con") | `colors.border` + `colors.textTertiary` |
| Botón Google | `colors.surface` con borde `colors.border` |

### Componentes reutilizados

- Inputs conservan el mismo estilo y comportamiento focus actual (altura 56, borde 1.5, radius 16, icono a la izquierda).
- Botón principal conserva altura 56, radius 16, sombra verde.
- Animaciones de entrada (`fadeAnim`, `slideAnim`) aplican solo a la card inferior.

## Changes by File

### 1. `src/features/auth/screens/LoginScreenComponent.tsx` (refactor visual)

**Mantener:**
- Toda la lógica existente (`signInWithEmail`, `signInWithGoogle`, `handleLogin`, `handleGoogleSignIn`).
- Validación de campos y manejo de errores.
- Estados: `email`, `password`, `showPassword`, `emailFocused`, `passwordFocused`.

**Cambiar:**
- Eliminar el header centrado actual (logoBox + title + subtitle centrados).
- Reemplazar por el layout de dos zonas (hero + card).
- El link `router.push("/(auth)/register")` ahora vive en el hero, no en el footer.
- El link "¿Olvidaste tu contraseña?" ahora navega: `router.push("/(auth)/forgot-password")` en lugar de `TouchableOpacity` vacío.
- Quitar el footer "¿No tienes cuenta? Crear cuenta" (ya está en el hero).

### 2. `src/features/auth/screens/RegisterScreenComponent.tsx` (refactor visual + simplificación)

**Quitar:**
- State: `fullName`, `confirmPassword`, `fullNameFocused`, `confirmFocused`.
- Campos de UI: Nombre completo, Confirmar contraseña.
- Validación: coincidencia de contraseñas, nombre no vacío.

**Mantener:**
- Lógica: `checkEmailExists` → `signUpWithEmail` (intacta).
- Estados: `email`, `password`, `showPassword`, `emailFocused`, `passwordFocused`.
- Validación: formato email + longitud password ≥ 8.

**Cambiar:**
- Mismo layout de dos zonas que Login.
- Link en hero: *"¿Ya tienes cuenta? Iniciar sesión"* → `router.back()` (o `router.push("/(auth)/login")`).
- Quitar footer actual.

### 3. `app/(auth)/forgot-password.tsx` (nuevo)

Thin wrapper:

```tsx
import ForgotPasswordScreenComponent from "@/features/auth/screens/ForgotPasswordScreenComponent";

export default function ForgotPasswordScreen() {
  return <ForgotPasswordScreenComponent />;
}
```

### 4. `src/features/auth/screens/ForgotPasswordScreenComponent.tsx` (nuevo)

Misma arquitectura visual (hero + card), pero:

**Hero:**
- Botón "back" (`arrow-back`) arriba a la izquierda que ejecuta `router.back()`.
- Título: *"Recuperar contraseña"*.
- Subtítulo: *"Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."*

**Card:**
- Un único campo: email (mismo estilo que login).
- Botón principal: *"Enviar enlace"* (mismo estilo verde primary).
- **Estado de éxito:** tras `resetPassword(email)` sin error, mostrar mensaje inline dentro de la card:
  - Ícono check verde (`check-circle`, `brand.primary[500]`).
  - Texto: *"Enviamos un enlace a `<email>`. Revisa tu bandeja de entrada."*
  - Link inferior: *"Volver al inicio de sesión"* → `router.replace("/(auth)/login")`.
- **Estado de error:** `Alert.alert` con mensaje de Supabase (consistente con Login).

**Validación:**
- Email no vacío + formato válido (regex básica o simplemente `email.includes("@")`).

**Lógica:**
```tsx
const resetPassword = useAuthStore((state) => state.resetPassword);
const isLoading = useAuthStore((state) => state.isLoading);
const [sent, setSent] = useState(false);

const handleSubmit = async () => {
  if (!email || !email.includes("@")) {
    Alert.alert("Error", "Ingresa un correo válido");
    return;
  }
  const { error } = await resetPassword(email);
  if (error) {
    Alert.alert("Error", error.message || "No se pudo enviar el enlace");
    return;
  }
  setSent(true);
};
```

### 5. `app/(auth)/_layout.tsx` (agregar ruta)

Agregar la pantalla `forgot-password` al Stack.

## Data Flow (Forgot Password)

1. Usuario toca "¿Olvidaste tu contraseña?" en Login → `router.push("/(auth)/forgot-password")`.
2. Usuario ingresa email → toca "Enviar enlace".
3. `resetPassword(email)` llama `supabase.auth.resetPasswordForEmail(email)`.
4. Supabase envía email con link de reset (configurado por defecto en Supabase).
5. UI muestra estado de éxito inline.
6. Usuario toca "Volver al inicio de sesión" → `router.replace("/(auth)/login")`.

**Fuera de scope:** la pantalla de "set new password" (deep link callback) — eso es un flujo separado que requiere configurar redirect URLs en Supabase y manejar deep links. Para esta iteración el usuario usará el link del email en el navegador externo o Supabase lo redirige a la app si ya está configurado.

## Error Handling

- Login/Register: se mantiene el manejo actual con `Alert.alert`.
- Forgot Password:
  - Email vacío/inválido → `Alert.alert("Error", "Ingresa un correo válido")`.
  - Error de Supabase → `Alert.alert("Error", error.message)`.
  - Éxito → estado inline, sin Alert.

## Testing

Los tests existentes de `LoginScreenComponent` y `RegisterScreenComponent` (si los hay en `__tests__/`) deben seguir pasando — la lógica no cambia. Si tests referencian labels/placeholders específicos, actualizarlos.

No se requieren tests nuevos para el spec visual. La pantalla Forgot Password es UI que llama una función ya cubierta (`resetPassword` del authStore).

## Out of Scope

- Deep link callback para "set new password" (requiere setup adicional de Supabase).
- Tests unitarios nuevos para Forgot Password.
- Links legales (Terms, Privacy).
- Login social con Apple o Facebook.
- "Remember me" checkbox.