import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CartButtonProps = {
  count?: number; // cantidad de productos en el carrito
};

export const CartButton = ({ count = 0 }: CartButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.cartIconContainer}
      onPress={() => router.push("/cart")}
    >
      <Ionicons name="cart" size={26} color="#000" />
      {count > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartIconContainer: {
    padding: 7,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
  },
  cartBadge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
});
