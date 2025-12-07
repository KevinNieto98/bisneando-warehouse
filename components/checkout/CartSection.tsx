import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import EditButton from "../ui/EditButton";

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const PLACEHOLDER = "https://via.placeholder.com/300x300.png?text=Sin+imagen";

// Mismo helper que usas en CartScreen
const ensureUrls = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u.length > 0);
};

export function CartSection() {
  // 1) Carrito (store)
  const itemsRecord = useCartStore((s) => s.items);
  // 2) Catálogo para fallback de imágenes (mismo que CartScreen)
  const products = useAppStore((s) => s.products);

  // Igual que en CartScreen: normalizamos items + resolvemos imágenes
  const items = useMemo(() => {
    const raw = Object.values(itemsRecord ?? {});
    const byId = new Map(products?.map((p) => [p.id, p]) ?? []);

    return raw.map((it) => {
      const cartImgs = ensureUrls(it.images);
      if (cartImgs.length > 0) {
        return { ...it, images: cartImgs };
      }

      const prod = byId.get(it.id);
      const prodImgs = ensureUrls(prod?.images);

      return {
        ...it,
        images: prodImgs.length > 0 ? prodImgs : [PLACEHOLDER],
      };
    });
  }, [itemsRecord, products]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Verificar orden</Text>

      <View style={styles.header}>
        <Text style={styles.subtitle}>Tu carrito</Text>
        <EditButton />
      </View>

      {items.length === 0 ? (
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ color: "#6b7280" }}>Tu carrito está vacío.</Text>
        </View>
      ) : (
        items.map((product, idx) => {
          const qty = Number(product.quantity || 0);
          const unit = Number(product.price || 0);
          const lineSubtotal = unit * qty;
          const uri = product.images?.[0] || PLACEHOLDER;
          const key = String(product.id ?? `line-${idx}`);

          return (
            <View key={key} style={styles.item}>
              <Image source={{ uri }} style={styles.image} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.title}
                </Text>

                <Text style={styles.details}>
                  {toHNL(unit)} x {qty}
                </Text>

                <Text style={styles.subtotal}>
                  Subtotal: {toHNL(lineSubtotal)}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  subtitle: { fontSize: 18, fontWeight: "600" },

  item: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "center" },
  image: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f3f4f6" },

  name: { fontWeight: "600", color: "#111827" },
  details: { color: "gray", fontSize: 12, marginTop: 2 },
  subtotal: { marginTop: 4, fontWeight: "600" },
});
