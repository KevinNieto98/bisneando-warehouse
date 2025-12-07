import { WifiOff } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onRetry?: () => void;
  message?: string;
}

export const InternetError: React.FC<Props> = ({
  onRetry,
  message = "Sin conexión a internet",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <WifiOff size={48} color="#9CA3AF" strokeWidth={1.5} />

        <Text style={styles.title}>{message}</Text>

        <Text style={styles.subtitle}>
          Por favor revisa tu conexión o intenta nuevamente.
        </Text>

        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // 👈 asegura que ocupe toda la pantalla y se centre verticalmente
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});
