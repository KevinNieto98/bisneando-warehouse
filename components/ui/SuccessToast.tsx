import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  /** Mostrar/ocultar el toast */
  visible: boolean;
  /** Texto principal del toast */
  text: string;
  /** Nombre del ícono de Ionicons (opcional) */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Estilo adicional para el contenedor absoluto (ej. moverlo más abajo) */
  containerStyle?: ViewStyle;
  /** Si true, se oculta solo */
  autoHide?: boolean;
  /** Tiempo para auto-ocultar (ms) */
  autoHideMs?: number;
  /** Llamado cuando termina de ocultarse (auto o manual) */
  onHide?: () => void;
};

export default function SuccessToast({
  visible,
  text,
  iconName = "checkmark-circle",
  containerStyle,
  autoHide = false,
  autoHideMs = 1400,
  onHide,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animar entrada/salida
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      if (autoHide) {
        hideTimer.current && clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          // dispara la animación de salida
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -10,
              duration: 180,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) onHide?.();
          });
        }, autoHideMs);
      }
    } else {
      // Ocultar si piden visible=false
      hideTimer.current && clearTimeout(hideTimer.current);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      hideTimer.current && clearTimeout(hideTimer.current);
    };
  }, [visible, autoHide, autoHideMs, onHide, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastWrap,
        { opacity, transform: [{ translateY }] },
        containerStyle,
      ]}
    >
      <View style={styles.toast}>
        {iconName ? (
          <Ionicons name={iconName} size={18} color="#052e16" style={{ marginRight: 6 }} />
        ) : null}
        <Text style={styles.toastText}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    top: 8, // debajo del header; ajusta si quieres
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#86efac", // green-300
    borderColor: "#34d399",     // green-400
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  toastText: {
    color: "#052e16", // green-950
    fontWeight: "700",
  },
});
