import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// Puedes ajustar estos colores si quieres que combine más con tu UI
const BG_CARD = "#f9fafb";
const BD_CARD = "#e5e7eb";
const SKELETON_BASE = "#e5e7eb";
const SKELETON_HIGHLIGHT = "#f3f4f6";

type AddressListSkeletonProps = {
  /** Cantidad de tarjetas a mostrar (default 2) */
  count?: number;
};

const AddressListSkeleton: React.FC<AddressListSkeletonProps> = ({ count = 2 }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // Interpolación para “mover” el brillo de izquierda a derecha
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 300], // ancho aproximado del contenido
  });

  const items = Array.from({ length: count });

  return (
    <View>
      {items.map((_, idx) => (
        <View key={idx} style={styles.card}>
          {/* icon placeholder */}
          <View style={styles.left}>
            <View style={styles.iconPlaceholder} />

            <View style={styles.texts}>
              {/* primera línea (tipo + badge) */}
              <View style={styles.row}>
                <View style={[styles.line, { width: 80 }]} />
                <View style={[styles.badge, { opacity: 0.6 }]}>
                  <View style={[styles.badgeDot]} />
                  <View style={[styles.badgeLine]} />
                </View>
              </View>

              {/* segunda línea (nombre_direccion) */}
              <View style={[styles.line, { width: "70%", marginTop: 8 }]} />
            </View>
          </View>

          {/* lado derecho: switch + menú (placeholders) */}
          <View style={styles.right}>
            <View style={styles.switchPill}>
              <View style={styles.switchKnob} />
            </View>
            <View style={styles.menuBtn} />
          </View>

          {/* Shimmer overlay */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

export default AddressListSkeleton;

const styles = StyleSheet.create({
  card: {
    position: "relative",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: BD_CARD,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: SKELETON_BASE,
  },
  texts: { marginLeft: 10, flexShrink: 1, flex: 1 },
  row: { flexDirection: "row", alignItems: "center" },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: SKELETON_BASE,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: SKELETON_BASE,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  badgeLine: {
    width: 30,
    height: 8,
    marginLeft: 6,
    borderRadius: 4,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  right: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  switchPill: {
    width: 52,
    height: 28,
    borderRadius: 999,
    backgroundColor: SKELETON_BASE,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  menuBtn: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: SKELETON_BASE,
    marginLeft: 8,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.35)",
    opacity: 0.6,
  },
});
