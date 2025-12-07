import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icono from "./Icon.native";

interface LinksAppProps {
  name: string;              // icono izquierdo
  title: string;
  onPress?: () => void;
  disabled?: boolean;        // ← NUEVO (opcional)
  loading?: boolean;         // ← NUEVO (opcional)
  rightIconName?: string;    // opcional: reemplazar ChevronRight
}

export default function LinksApp({
  name,
  title,
  onPress,
  disabled = false,
  loading = false,
  rightIconName = "ChevronRight",
}: LinksAppProps) {
  const isBlocked = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.menuItem, isBlocked && styles.menuItemDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isBlocked}
    >
      <View style={styles.leftSection}>
        <Icono name={name} size={22} color="#27272a" />
        <Text style={styles.menuText}>{title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Icono name={rightIconName} size={20} color="#52525b" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#27272a",
    fontWeight: "500",
  },
});
