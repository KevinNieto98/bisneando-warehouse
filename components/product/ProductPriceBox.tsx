import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ProductPriceBox({ precio, qty, onAdd, onBuy }: any) {
  return (
    <View style={styles.actionsPriceRow}>
      {/* Botones izquierda */}
      <View style={styles.actionsLeft}>
        <TouchableOpacity style={[styles.actionButton, styles.cartButton]} onPress={onAdd}>
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.actionTextWhite}>Agregar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.buyNowButton]} onPress={onBuy}>
          <Ionicons name="flash" size={20} color="white" />
          <Text style={styles.actionTextWhite}>Comprar</Text>
        </TouchableOpacity>
      </View>

      {/* Precio + stock */}
      <View style={styles.priceBox}>
        <Text style={styles.price}>L {precio.toLocaleString("es-HN")}</Text>
        <View style={styles.stockBadge}>
          <Ionicons
            name={qty > 0 ? "checkmark-circle" : "close-circle"}
            size={16}
            color={qty > 0 ? "green" : "red"}
          />
          <Text style={styles.stockTextSmall}>{qty > 0 ? `${qty} en stock` : "Sin stock"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actionsLeft: { flexDirection: "row", gap: 6, flex: 1 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  buyNowButton: { backgroundColor: "#FF3B30" },
  cartButton: { backgroundColor: "#2563eb" },
  priceBox: {
    alignItems: "center",
    minWidth: 110,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  price: { fontSize: 22, fontWeight: "900" },
  stockBadge: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  stockTextSmall: { fontSize: 13, fontWeight: "500", color: "#444" },
  actionTextWhite: { color: "white", fontWeight: "600" },
});
