// components/MapSkeleton.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";

const BG = "#e5e7eb";          // base
const BG_DARK = "#d1d5db";      // líneas de cuadricula
const CHIP = "#f3f4f6";         // chips
const BTN = "#f4f4f5";          // botón
const SHIMMER = "rgba(255,255,255,0.5)";

const MapSkeleton: React.FC = () => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer en loop
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();

    // Pulse en el pin
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [shimmer, pulse]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.25],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0],
  });

  return (
    <View style={styles.container}>
      {/* Fondo con cuadricula */}
      <View style={styles.gridLayer}>
        {Array.from({ length: 16 }).map((_, i) => (
          <View key={`row-${i}`} style={styles.gridRow}>
            {Array.from({ length: 8 }).map((__, j) => (
              <View key={`cell-${i}-${j}`} style={styles.gridCell} />
            ))}
          </View>
        ))}
      </View>

      {/* Shimmer diagonal */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            transform: [
              { translateX: shimmerTranslate },
              { rotate: "-18deg" },
            ],
          },
        ]}
      />

      {/* Chips arriba (título / subtítulo) */}
      <View style={styles.topChips}>
        <View style={[styles.chip, { width: 260, height: 22 }]} />
        <View style={[styles.chip, { width: 220, height: 18, marginTop: 8 }]} />
      </View>

      {/* Pin centrado con pulse */}
      <View pointerEvents="none" style={styles.pinCenterWrap}>
        <Animated.View
          style={[
            styles.pinPulse,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <Ionicons
          name="location-sharp"
          size={42}
          color="#ff3b30"
          style={styles.pinIcon}
        />
      </View>

      {/* Sombra del pin */}
      <View style={styles.pinShadow} />

      {/* Botón skeleton abajo */}
      <View style={styles.bottomCta}>
        <View style={styles.btnSkeleton}>
          <View style={styles.btnIcon} />
          <Text style={styles.btnText}> </Text>
        </View>
      </View>
    </View>
  );
};

export default MapSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    overflow: "hidden",
  },

  /* Grid */
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 8,
    paddingBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    height: 28,
    paddingHorizontal: 8,
  },
  gridCell: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: BG_DARK,
    opacity: 0.08,
  },

  /* Shimmer */
  shimmer: {
    position: "absolute",
    top: -100,
    bottom: -100,
    left: -100,
    width: 240,
    backgroundColor: SHIMMER,
    borderRadius: 16,
  },

  /* Chips */
  topChips: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    backgroundColor: CHIP,
    borderRadius: 12,
  },

  /* Pin */
  pinCenterWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -21,
    marginTop: -48, // levanta el pin para que la 'punta' quede centrada
    alignItems: "center",
    justifyContent: "center",
  },
  pinIcon: {
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pinPulse: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: "#ff3b30",
    opacity: 0.2,
  },
  pinShadow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 44,
    height: 14,
    marginLeft: -22,
    marginTop: 14,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 999,
    transform: [{ scaleX: 1.2 }],
    filter: Platform.OS === "web" ? "blur(6px)" : undefined,
  },

  /* CTA */
  bottomCta: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: "center",
  },
  btnSkeleton: {
    width: "100%",
    maxWidth: 420,
    height: 52,
    borderRadius: 14,
    backgroundColor: BTN,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  btnText: {
    height: 16,
    width: 120,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
});
