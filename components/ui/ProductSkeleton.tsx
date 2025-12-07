// Podrías crear este archivo en un directorio de skeletons, por ejemplo,
// `@/components/skeletons/ProductSkeleton.tsx`

import React from "react";
import { StyleSheet, View } from "react-native";

// Esqueleto de una sola tarjeta de producto
const ProductCardSkeleton = () => (
  <View style={styles.card}>
    {/* Área de la Imagen */}
    <View style={styles.image} />
    {/* Área de Texto */}
    <View style={styles.info}>
      <View style={styles.lineSmall} />
      <View style={styles.lineMedium} />
      <View style={styles.lineLarge} />
      <View style={styles.button} />
    </View>
  </View>
);

interface Props {
  count?: number;
  itemWidth?: number;
  gap?: number;
}

export const ProductSkeleton: React.FC<Props> = ({
  count = 2,
  itemWidth = 140, // Debe coincidir con el width de ProductSlideItem
  gap = 8,
}) => {
  const items = Array.from({ length: count });

  return (
    <View style={styles.container}>
      {items.map((_, index) => (
        <View key={index} style={{ width: itemWidth, marginRight: gap }}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 8, // Mismo padding que ScrollView de ProductSimilares
    paddingVertical: 4,
  },
  card: {
    backgroundColor: "#f3f4f6", // Un gris claro para el fondo
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    height: 210, // Mismo height que ProductSlideItem
  },
  image: {
    width: "100%",
    height: 90, // Mismo height que la imagen
    backgroundColor: "#e5e7eb",
  },
  info: {
    padding: 8,
  },
  // Líneas simulando texto
  lineSmall: {
    height: 8,
    width: "40%",
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 4,
  },
  lineMedium: {
    height: 12,
    width: "90%",
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 4,
  },
  lineLarge: {
    height: 10,
    width: "60%",
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 10,
  },
  button: {
    height: 26,
    width: "80%",
    backgroundColor: "#a8b1bd",
    borderRadius: 8,
    marginTop: 4,
  },
});