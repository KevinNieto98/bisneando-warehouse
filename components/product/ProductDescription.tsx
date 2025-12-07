import { StyleSheet, Text, View } from "react-native";

export function ProductDescription({ descripcion }: { descripcion: string }) {
  return (
    <View style={styles.descriptionCard}>
      <Text style={styles.descriptionTitle}>Descripción</Text>
      <Text style={styles.descriptionText}>{descripcion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionCard: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  descriptionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 6 },
  descriptionText: { color: "#444", lineHeight: 20 },
});
