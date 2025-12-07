// components/cart/EmptyCart.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EmptyCartProps = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

const EmptyCart: React.FC<EmptyCartProps> = ({
  title = "Tu carrito está vacío",
  subtitle = "Cuando agregues productos, aparecerán aquí.\n¿Listo para encontrar algo que te guste?",
  primaryLabel = "Explorar productos",
  secondaryLabel = "Ver categorías",
  onPrimaryPress,
  onSecondaryPress,
}) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBadge} accessible accessibilityRole="image" accessibilityLabel="Carrito vacío">
        <Ionicons name="cart-outline" size={40} color="#111827" />
        <View style={styles.spark} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={onPrimaryPress}
          android_ripple={{ color: "rgba(0,0,0,0.08)" }}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
        >
          <Ionicons name="bag-add-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={onSecondaryPress}
          android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          accessibilityRole="button"
          accessibilityLabel={secondaryLabel}
        >
          <Ionicons name="grid-outline" size={18} color="#111827" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.tip}>
        <Ionicons name="sparkles-outline" size={16} color="#6b7280" />
        <Text style={styles.tipText}>
          Consejo: puedes ajustar cantidades desde aquí mismo cuando tengas ítems.
        </Text>
      </View>
    </View>
  );
};

export default EmptyCart;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#FFF4A3", // suave sobre #FFD600
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  spark: {
    position: "absolute",
    right: -6,
    top: -6,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#FFD600",
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    marginTop: 16,
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#FFD600",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  tip: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  tipText: {
    color: "#6b7280",
    fontSize: 12,
  },
});
