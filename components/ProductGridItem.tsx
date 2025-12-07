import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isOutOfStock?: boolean;   // 👈 NUEVO
}

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 2 * 3 - 32) / 3;

export const ProductGridItem: React.FC<Props> = ({
  product,
  onAddToCart,
  isOutOfStock = false,
}) => {
  const imageUri =
    product.images?.[0] ||
    "https://via.placeholder.com/300x200.png?text=Sin+Imagen";

  const priceFormatted = useMemo(
    () =>
      new Intl.NumberFormat("es-HN", {
        style: "currency",
        currency: "HNL",
        maximumFractionDigits: 2,
      }).format(product.price),
    [product.price]
  );

  const handleOpenProduct = () => {
    if (isOutOfStock) return; // 👈 no navegar si no hay stock
    router.push(`../product/${product.id}`);
  };

  const handleCartPress = () => {
    if (isOutOfStock) return; // 👈 tampoco agregar si no hay stock
    if (onAddToCart) onAddToCart(product);
    else router.push(`../product/${product.id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isOutOfStock && styles.cardOutOfStock, // 👈 gris si sin stock
        pressed && !isOutOfStock && { opacity: 0.9 }, // feedback solo si hay stock
      ]}
      onPress={handleOpenProduct}
    >
      <View>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        {isOutOfStock && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Agotado</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.textWrapper}>
          {product.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {product.brand}
            </Text>
          )}
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {product.title}
          </Text>
          <Text style={[styles.price, isOutOfStock && styles.priceOutOfStock]}>
            {priceFormatted}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cartButton,
            isOutOfStock && styles.cartButtonDisabled,
            pressed && !isOutOfStock && { opacity: 0.7 },
          ]}
          onPress={handleCartPress}
        >
          <Ionicons
            name="cart-outline"
            size={12}
            color={isOutOfStock ? "#9ca3af" : "white"}
          />
          <Text
            style={[
              styles.cartText,
              isOutOfStock && styles.cartTextDisabled,
            ]}
          >
            +
          </Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    width: CARD_WIDTH,
    height: 180,
    margin: CARD_MARGIN,
  },
  // 👇 estado "grisado" visualmente
  cardOutOfStock: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d4d4d8",
    opacity: 0.6,
  },
  image: {
    width: "100%",
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
    padding: 6,
  },
  textWrapper: {
    flexShrink: 1,
  },
  brand: {
    fontSize: 8,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: "500",
    color: "#3f3f46",
    minHeight: 24,
    lineHeight: 12,
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    color: "#18181b",
  },
  priceOutOfStock: {
    color: "#9ca3af",
  },
  cartButton: {
    backgroundColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cartButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  cartText: {
    color: "white",
    fontSize: 9,
    fontWeight: "600",
  },
  cartTextDisabled: {
    color: "#9ca3af",
  },
  bottomSpacer: {
    height: 1,
  },
  // badge "Agotado"
  badge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(239,68,68,0.9)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "700",
  },
});
