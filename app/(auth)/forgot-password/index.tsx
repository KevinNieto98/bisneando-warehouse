import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordPage() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);

    // Aquí iría tu llamada real a la API con try/catch
    // await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

    setTimeout(() => {
      setLoading(false);
 
router.replace("/forgot-password/sent");

    }, 1500);
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
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
              <Text style={styles.title}>Recuperar contraseña</Text>
              <Text style={styles.description}>
                Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña. 
                Revisa también tu carpeta de spam si no ves el correo en unos minutos.
              </Text>

              <View style={{ gap: 14 }}>
                <View>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ejemplo@correo.com"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.button, loading && { opacity: 0.7 }]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Enviando..." : "Enviar enlace"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.footer}>
                ¿Recordaste tu contraseña?{" "}
                <Link href="/(auth)/login" style={styles.linkBold}>
                  Inicia sesión
                </Link>
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#facc15" }, // amarillo
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
  label: { fontWeight: "600", color: "#374151" },
  input: {
    marginTop: 6,
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    marginTop: 4,
    width: "100%",
    backgroundColor: "#eab308",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
});
