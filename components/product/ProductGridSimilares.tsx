import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Product, ProductGridItem } from "../ProductGridItem";

interface Props {
  products: Product[];
}

export const ProductGridSimilares: React.FC<Props> = ({ products }) => {
  // 🔥 Tomamos solo los 3 primeros productos
  const topThree = products.slice(0, 3);

  return (
    <FlatList
      data={topThree}
      keyExtractor={(item) => item.slug}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.itemWrapper}>
          <ProductGridItem product={item} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  itemWrapper: {
    flex: 1,
    alignItems: "center",
  },
});
