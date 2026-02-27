import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/**
 * OAuth Callback Handler
 * 
 * Esta pantalla procesa el callback de autenticación OAuth (Google).
 * Cuando el usuario completa el login en Google, es redirigido aquí
 * con los tokens en la URL. Extraemos esos tokens y los usamos para
 * establecer la sesión en Supabase.
 */
export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Obtener la URL completa del deep link
                const url = await Linking.getInitialURL();

                if (url) {
                    // Extraer los fragmentos de la URL (después del #)
                    const urlObj = new URL(url);
                    const fragment = urlObj.hash.substring(1); // Remover el #
                    const params = new URLSearchParams(fragment);

                    const accessToken = params.get("access_token");
                    const refreshToken = params.get("refresh_token");

                    if (accessToken && refreshToken) {
                        // Establecer la sesión en Supabase con los tokens
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (error) {
                            console.error("Error setting session:", error);
                            router.replace("/(auth)/login");
                            return;
                        }

                        // Sesión establecida exitosamente, redirigir a la app
                        router.replace("/(tabs)");
                        return;
                    }
                }

                // Si no hay tokens válidos, volver al login
                router.replace("/(auth)/login");
            } catch (error) {
                console.error("Error in auth callback:", error);
                router.replace("/(auth)/login");
            }
        };

        handleCallback();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.text}>Completando inicio de sesión...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
});
