// components/ui/QuantityStepper.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { GestureResponderEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;          // default 1
  max?: number;          // opcional (p.ej. inStock)
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Si los botones viven dentro de un Pressable/Link, evita que propaguen el toque */
  stopPropagation?: boolean;
};

const SIZES = {
  sm: { h: 28, w: 28, fs: 14, gap: 6, padH: 8 },
  md: { h: 36, w: 36, fs: 16, gap: 8, padH: 10 },
  lg: { h: 44, w: 44, fs: 18, gap: 10, padH: 12 },
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  disabled = false,
  stopPropagation = true,
}: Props) {
  const [isMinusHeld, setMinusHeld] = useState(false);
  const [isPlusHeld, setPlusHeld] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clamp = (n: number) => {
    let out = Math.max(min, n);
    if (typeof max === "number") out = Math.min(max, out);
    return out;
  };

  const doHaptic = async () => {
    try {
      if (Platform.OS !== "web") await Haptics.selectionAsync();
    } catch {
      // no-op
    }
  };

  const step = (delta: number) => {
    if (disabled) return;
    const next = clamp(value + delta);
    if (next !== value) {
      onChange(next);
      doHaptic();
    }
  };

  // Long-press repeat
  const startHold = (delta: number) => {
    step(delta); // un primer paso inmediato
    holdTimer.current && clearInterval(holdTimer.current);
    // aceleración: primero lento, luego más rápido
    let interval = 250;
    holdTimer.current = setInterval(() => {
      step(delta);
      interval = Math.max(60, interval - 30);
    }, interval);
  };

  const stopHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setMinusHeld(false);
    setPlusHeld(false);
  };

  useEffect(() => stopHold, []);

  const sz = SIZES[size];
  const atMin = value <= min;
  const atMax = typeof max === "number" ? value >= max : false;

  const pressProps = (delta: number) => ({
    onPress: (e?: GestureResponderEvent) => {
      if (stopPropagation) e?.stopPropagation?.();
      step(delta);
    },
    onLongPress: (e?: GestureResponderEvent) => {
      if (stopPropagation) e?.stopPropagation?.();
      delta < 0 ? setMinusHeld(true) : setPlusHeld(true);
      startHold(delta);
    },
    onPressOut: () => stopHold(),
    android_ripple: { color: "rgba(0,0,0,0.06)", borderless: false },
  });

  return (
    <View
      style={[
        styles.wrap,
        { paddingHorizontal: sz.padH, gap: sz.gap, height: sz.h + 8 },
        disabled && styles.wrapDisabled,
      ]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <Pressable
        style={[styles.btn, { width: sz.w, height: sz.h }, (atMin || disabled) && styles.btnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Disminuir cantidad"
        {...pressProps(-1)}
      >
        <Ionicons name="remove" size={sz.fs + 4} color={atMin || disabled ? "#9ca3af" : "#374151"} />
      </Pressable>

      <Text style={[styles.value, { fontSize: sz.fs }]}>{value}</Text>

      <Pressable
        style={[styles.btn, { width: sz.w, height: sz.h }, (atMax || disabled) && styles.btnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Aumentar cantidad"
        {...pressProps(+1)}
      >
        <Ionicons name="add" size={sz.fs + 4} color={atMax || disabled ? "#9ca3af" : "#374151"} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  wrapDisabled: {
    opacity: 0.6,
  },
  btn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#f9fafb",
  },
  btnDisabled: {
    backgroundColor: "#f3f4f6",
  },
  value: {
    minWidth: 26,
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
});
