import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordSentPage() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Botón volver a Login */}
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={{
            position: "absolute",
            top: insets.top + 8,
            left: 16,
            zIndex: 10,
            padding: 8,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={28} color="#374151" />
        </TouchableOpacity>

        <View style={styles.center}>
          <Image
            source={require("@/assets/images/bisneando.png")}
            style={{ width: 160, height: 80, marginBottom: 24 }}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>¡Revisa tu correo!</Text>

            <Text style={styles.description}>
              {email
                ? `Hemos enviado un enlace a ${email} para cambiar tu contraseña.`
                : "Hemos enviado un enlace a tu correo para cambiar tu contraseña."}{" "}
              Si no lo ves, revisa tu carpeta de spam o correo no deseado.
            </Text>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={styles.linkBtn}>
                  <Text style={styles.linkText}>
                    ¿Ingresaste mal el correo? Inténtalo de nuevo
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#facc15" }, // fondo amarillo
  safe: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 18,
  },
  button: {
    width: "100%",
    backgroundColor: "#eab308",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
  linkBtn: { paddingVertical: 8, alignItems: "center" },
  linkText: { color: "#a16207", fontWeight: "700" },
});
