import { StyleSheet, Text, View } from "react-native";

export function ProductInfo({ marca, nombre }: { marca: string; nombre: string }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.brand}>{marca ?? "GENÉRICO"}</Text>
      <Text style={styles.title}>{nombre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: { marginTop: 16, gap: 6 },
  brand: { fontSize: 12, fontWeight: "700", color: "#666" },
  title: { fontSize: 20, fontWeight: "800", color: "#111" },
});
