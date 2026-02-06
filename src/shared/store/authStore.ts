import { supabase } from "@/lib/supabase";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { create } from "zustand";

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  initialize: () => () => void;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  checkEmailExists: (
    email: string,
  ) => Promise<{ exists: boolean | null; error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,

  // Inicializa el listener de auth - retorna función de cleanup
  initialize: () => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // Retornar función de cleanup
    return () => {
      subscription.unsubscribe();
    };
  },

  // Iniciar sesión con email/password
  signInWithEmail: async (email, password) => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ isLoading: false });
    return { error };
  },

  // Iniciar sesión con Google (OAuth)
  signInWithGoogle: async () => {
    set({ isLoading: true });

    try {
      const redirectUri = makeRedirectUri({
        scheme: "kaeloappproduction",
        path: "auth/callback",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        set({ isLoading: false });
        return { error };
      }

      // Abrir el navegador para OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      if (result.type === "success") {
        // El usuario completó el flujo OAuth
        // Supabase manejará la sesión automáticamente
        set({ isLoading: false });
        return { error: null };
      } else {
        // El usuario canceló el flujo
        set({ isLoading: false });
        return {
          error: {
            message: "Inicio de sesión cancelado",
            name: "OAuthCancelled",
          } as AuthError,
        };
      }
    } catch (err) {
      set({ isLoading: false });
      const message = err instanceof Error ? err.message : "Error en autenticación con Google";
      return {
        error: {
          message,
          name: "OAuthError",
        } as AuthError,
      };
    }
  },

  // Verificar si el email ya existe (Edge Function)
  checkEmailExists: async (email) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.functions.invoke(
        "check-email-exists",
        {
          body: { email },
        },
      );

      set({ isLoading: false });

      if (error) {
        console.error("Edge function error:", error);
        return {
          exists: null,
          error: new Error(
            `Error verificando email: ${error.message || JSON.stringify(error)}`,
          ),
        };
      }

      console.log("Edge function success:", data);
      return { exists: !!data?.exists, error: null };
    } catch (err) {
      set({ isLoading: false });
      console.error("Unexpected error in checkEmailExists:", err);
      const message = err instanceof Error ? err.message : "Error inesperado";
      return {
        exists: null,
        error: new Error(`Error inesperado: ${message}`),
      };
    }
  },

  // Registrar usuario con email/password
  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    set({ isLoading: false });
    return { error };
  },

  // Cerrar sesión
  signOut: async () => {
    set({ isLoading: true });

    const { error } = await supabase.auth.signOut();

    set({ isLoading: false });
    return { error };
  },

  // Enviar email para restablecer contraseña
  resetPassword: async (email) => {
    set({ isLoading: true });

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    set({ isLoading: false });
    return { error };
  },
}));

// Selectores para uso optimizado
export const useSession = () => useAuthStore((state) => state.session);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.session);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () =>
  useAuthStore((state) => state.isInitialized);
