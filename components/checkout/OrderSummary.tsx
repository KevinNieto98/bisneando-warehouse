import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function OrderSummary({ summary }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Resumen de orden</Text>
      <View style={styles.row}><Text>No. Productos</Text><Text>{summary.itemsCount}</Text></View>
      <View style={styles.row}><Text>Subtotal</Text><Text>L {summary.subtotal}</Text></View>
      <View style={styles.row}><Text>Impuestos (15%)</Text><Text>L {summary.taxes}</Text></View>
      <View style={styles.row}><Text style={{ fontWeight: "700" }}>Total</Text><Text style={{ fontWeight: "700" }}>L {summary.total}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    backgroundColor: "white", 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    marginHorizontal: 12 
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
});
