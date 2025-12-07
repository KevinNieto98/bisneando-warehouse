import { useCartStore } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CartButton } from "../ui/CartButttom";

type ProductHeaderProps = {
  showCartButton?: boolean;   // default: true
  totalItems?: number;        // opcional: si no viene, se toma del store
  returnAction?: () => void;  // opcional: acción personalizada para el botón back
};

export function ProductHeader({
  showCartButton = true,
  totalItems,
  returnAction,
}: ProductHeaderProps) {
  // Si no te pasan totalItems, úsalo desde el store
  const itemsFromStore = useCartStore((s) => s.totalItems());
  const count = typeof totalItems === "number" ? totalItems : itemsFromStore;

  // Si viene returnAction úsalo; si no, fallback a router.back()
  const handleBack = React.useMemo(
    () => (returnAction ? returnAction : () => router.back()),
    [returnAction]
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Volver atrás"
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {showCartButton && <CartButton count={count} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFD600",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
});
