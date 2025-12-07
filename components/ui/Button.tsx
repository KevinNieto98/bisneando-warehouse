import Icono from "@/components/ui/Icon.native";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

type ButtonVariant = "primary" | "success" | "danger" | "warning" | "gray";

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  isDisabled?: boolean;
  iconName?: string;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

export const Button: React.FC<AppButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  iconName,
  variant = "primary",
  style,
}) => {
  const colors = {
    primary: { bg: "#2563eb", pressed: "#1e40af", text: "#fff" },
    success: { bg: "#22c55e", pressed: "#16a34a", text: "#fff" },

    danger: { bg: "#dc2626", pressed: "#b91c1c", text: "#fff" },
    warning: { bg: "#f59e0b", pressed: "#d97706", text: "#fff" },
    gray: { bg: "#6b7280", pressed: "#4b5563", text: "#fff" },
  };

  const palette = colors[variant];

  const handlePress = () => {
    if (isDisabled) return;
    if (onPress) onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg },
        pressed && { backgroundColor: palette.pressed },
        isDisabled && styles.disabled,
        style,
      ]}
      android_ripple={{ color: "#00000020" }}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <View style={styles.content}>
        {iconName && <Icono name={iconName} size={18} color={palette.text} />}
        <Text style={[styles.text, { color: palette.text }]}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Button;
