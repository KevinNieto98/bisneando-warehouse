import React from "react";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";

interface LoginButtonProps {
  title?: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  title = "Entrar",
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>
        {disabled ? "Cargando..." : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 4,
    width: "100%",
    backgroundColor: "#eab308",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});

export default LoginButton;
