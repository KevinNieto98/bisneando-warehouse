import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import QuantityStepper from "../ui/QuantityStepper";

export type CartItemType = {
  id: number;
  title: string;
  price: number;
  images: string[];
  inStock?: number;
  quantity: number;
};

interface Props {
  item: CartItemType;
  onChangeQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  /** Cuando está activo, ya no controla borde rojo; se deja por compatibilidad */
  notAvailable?: boolean;
  /** Disponibilidad inmediata (p. ej. reservas, bloqueo, stock en bodega cercana) */
  qtyAvailable?: number;
}

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

const CartItem: React.FC<Props> = ({
  item,
  onChangeQty,
  onRemove,
  notAvailable, // no afecta el borde
  qtyAvailable,
}) => {
  // Límites de stock
  const stockCap =
    typeof item.inStock === "number" ? Math.max(0, item.inStock) : undefined;
  const availabilityCap =
    typeof qtyAvailable === "number" ? Math.max(0, qtyAvailable) : undefined;

  // maxQty = el menor entre inStock y qtyAvailable (si ambos existen)
  const maxQty =
    typeof stockCap === "number" && typeof availabilityCap === "number"
      ? Math.min(stockCap, availabilityCap)
      : typeof stockCap === "number"
      ? stockCap
      : availabilityCap;

  const outOfStock = (maxQty ?? 1) <= 0;

  // Excede el máximo permitido (considerando el mínimo entre stock y disponibilidad)
  const exceedsMax = typeof maxQty === "number" ? item.quantity > maxQty : false;

  const setQty = (next: number) => {
    const clamped =
      Math.max(1, typeof maxQty === "number" ? Math.min(maxQty, next) : next);
    onChangeQty(item.id, clamped);
  };

  const goToDetail = () => router.push(`/product/${item.id}`);

  // Rojo solo si no hay stock o si la cantidad supera el máximo
  const danger = outOfStock || exceedsMax;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && { opacity: 0.9 },
        danger && styles.itemDanger, // borde rojo solo si hay problema real
      ]}
      onPress={goToDetail}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${item.title}`}
    >
      {/* Imagen */}
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.image}
      />

      {/* Centro: título, estado, contador + eliminar */}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.itemTitle}>
          {item.title}
        </Text>

        {/* Línea de estado (solo si hay problema) */}
        {outOfStock && (
          <Text style={[styles.stock, styles.stockDanger]}>Sin stock</Text>
        )}

        {exceedsMax && !outOfStock && (
          <Text style={[styles.stock, styles.stockDanger]}>
            Tienes {item.quantity} en el carrito, pero solo hay {maxQty} disponibles. Ajusta la cantidad.
          </Text>
        )}

        <View style={styles.controls}>
          <QuantityStepper
            value={item.quantity}
            onChange={setQty}
            min={1}
            max={maxQty}
            size="md"
            disabled={outOfStock} // puedes corregir la cantidad aunque antes estuviera "no disponible"
            stopPropagation
          />

          <Pressable
            style={styles.removeBtn}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            accessibilityRole="button"
            accessibilityLabel="Quitar del carrito"
          >
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
          </Pressable>
        </View>
      </View>

      {/* Derecha: precio (unidad) y subtotal */}
      <View style={styles.priceWrap}>
        <Text style={styles.priceUnit}>{toHNL(item.price)}</Text>
        <Text style={styles.priceSubtotal}>
          {toHNL(item.price * item.quantity)}
        </Text>
      </View>
    </Pressable>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  itemDanger: {
    borderColor: "#dc2626",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  info: { flex: 1, minHeight: 70, justifyContent: "space-between" },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  stock: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  stockDanger: { color: "#dc2626" },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  removeBtn: {
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    padding: 6,
    backgroundColor: "#fff",
  },

  priceWrap: {
    alignItems: "flex-end",
    minWidth: 94,
  },
  priceUnit: {
    fontWeight: "700",
    color: "#111827",
  },
  priceSubtotal: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },
});
