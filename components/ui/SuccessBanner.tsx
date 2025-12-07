// components/ui/SuccessBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  message?: string;
  variant?: "success" | "error" | "info";
};

export default function SuccessBanner({ message, variant = "success" }: Props) {
  if (!message) return null;

  const palette =
    variant === "error"
      ? { bg: "#ef4444", icon: "alert-circle" as const }
      : variant === "info"
      ? { bg: "#3b82f6", icon: "information-circle" as const }
      : { bg: "#22c55e", icon: "checkmark-circle" as const };

  return (
    <View style={[styles.successBanner, { backgroundColor: palette.bg }]}>
      <Ionicons name={palette.icon} size={18} color="#fff" />
      <Text style={styles.successText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  successBanner: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 50,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  successText: { color: "#fff", fontWeight: "700" },
});
