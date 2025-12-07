// components/skeletons/CategorySkeleton.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

const skeletonItems = Array.from({ length: 6 }); // mostramos 6 placeholders

const CategorySkeleton = () => {
  return (
    <View style={styles.container}>
      {skeletonItems.map((_, index) => (
        <View key={`skeleton-${index}`} style={styles.card}>
          {/* Círculo/ícono */}
          <View style={styles.circle} />

          {/* Texto */}
          <View style={styles.text} />
        </View>
      ))}
    </View>
  );
};

export default CategorySkeleton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  card: {
    width: "30%", // 3 por fila aprox
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
  text: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
});
