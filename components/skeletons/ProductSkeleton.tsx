import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductSkeleton = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerSkeleton} />

      <View style={styles.content}>
        {/* Carousel */}
        <View style={styles.carouselSkeleton} />

        {/* Info */}
        <View style={styles.infoSkeleton} />
        <View style={[styles.infoSkeleton, { width: "60%" }]} />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.buttonSkeleton} />
          <View style={styles.buttonSkeleton} />
          <View style={styles.counterSkeleton} />
        </View>

        {/* PriceBox */}
        <View style={styles.priceSkeleton} />

        {/* Description */}
        <View style={[styles.textSkeleton, { width: "80%" }]} />
        <View style={[styles.textSkeleton, { width: "90%" }]} />
        <View style={[styles.textSkeleton, { width: "70%" }]} />

        {/* Similares */}
        <View style={{ marginTop: 24 }}>
          <View style={[styles.textSkeleton, { width: "50%", height: 20 }]} />
          <View style={styles.gridRow}>
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductSkeleton;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  headerSkeleton: {
    height: 56,
    backgroundColor: "#FFD600",
  },
  carouselSkeleton: {
    height: 220,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
    marginBottom: 16,
  },
  infoSkeleton: {
    height: 20,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
    marginBottom: 8,
    width: "80%",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  buttonSkeleton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  counterSkeleton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  priceSkeleton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
    marginBottom: 16,
  },
  textSkeleton: {
    height: 14,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  gridItem: {
    width: "30%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
});
