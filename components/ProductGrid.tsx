// components/ProductGrid.tsx
import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { ProductGridItem } from "./ProductGridItem";
import { Product } from "./ProductSlideItem";

interface Props {
  products: Product[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

// 👇 Helper para obtener el stock desde distintas props posibles
const getStockFromProduct = (p: any): number => {
  if (!p || typeof p !== "object") return 0;

  // tu columna real
  if (typeof p.qty === "number") return p.qty;

  // por si en otros contextos viene con nombres raros
  if (typeof p.stock === "number") return p.stock;
  if (typeof p.existencia === "number") return p.existencia;
  if (typeof p.availableQty === "number") return p.availableQty;
  if (typeof p.cantidad === "number") return p.cantidad;

  // Si no hay campo claro, asumimos stock > 0
  return 1;
};

export const ProductGrid: React.FC<Props> = ({
  products,
  refreshing = false,
  onRefresh,
}) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.slug}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        const stock = getStockFromProduct(item);
        const isOutOfStock = stock <= 0;

        return (
          <View style={styles.itemWrapper}>
            <ProductGridItem product={item} isOutOfStock={isOutOfStock} />
          </View>
        );
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  itemWrapper: {},
});

export default ProductGrid;
