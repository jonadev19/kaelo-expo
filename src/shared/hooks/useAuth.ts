import {
  useAuthLoading,
  useAuthStore,
  useIsAuthenticated,
  useUser,
} from "../store/authStore";

export const useAuth = () => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const user = useUser();
  const signOut = useAuthStore((state) => state.signOut);

  return {
    isAuthenticated,
    isLoading,
    user,
    signOut,
    // Alias para compatibilidad
    logout: signOut,
  };
};
