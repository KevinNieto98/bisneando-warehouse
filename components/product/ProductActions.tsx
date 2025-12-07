import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  cantidad: number;
  setCantidad: (n: number) => void;
  onWhatsApp: () => void;
  onShare: () => void;
  /** Stock máximo permitido; si es 0 o menor, el stepper queda deshabilitado */
  maxQty?: number;
};

export function ProductActions({
  cantidad,
  setCantidad,
  onWhatsApp,
  onShare,
  maxQty = 0,
}: Props) {
  const atMin = cantidad <= 1;
  const atMax = maxQty > 0 ? cantidad >= maxQty : false;
  const disabled = maxQty <= 0;

  return (
    <View style={styles.counterRow}>
      {/* WhatsApp */}
      <TouchableOpacity style={[styles.wideButton, styles.whatsappButton]} onPress={onWhatsApp}>
        <Ionicons name="logo-whatsapp" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Compartir */}
      <TouchableOpacity style={[styles.wideButton, styles.shareButton]} onPress={onShare}>
        <Ionicons name="share-social" size={20} color="#2563eb" />
      </TouchableOpacity>

      {/* Counter (mismas dimensiones/estilos) */}
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => {
            if (!atMin && !disabled) setCantidad(cantidad - 1);
          }}
          disabled={atMin || disabled}
        >
          <Ionicons
            name="remove"
            size={18}
            color={atMin || disabled ? "#9ca3af" : "#000"}
          />
        </TouchableOpacity>

        <Text style={styles.counterText}>{cantidad}</Text>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => {
            if (!atMax && !disabled) setCantidad(cantidad + 1);
          }}
          disabled={atMax || disabled}
        >
          <Ionicons
            name="add"
            size={18}
            color={atMax || disabled ? "#9ca3af" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 12,
  },
  wideButton: {
    flex: 1, // cada botón ocupa 1 parte → 1/4 del total
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  whatsappButton: { backgroundColor: "#25D366" },
  shareButton: { backgroundColor: "#f2f2f2" },
  counterContainer: {
    flex: 2, // el counter ocupa 2 partes → 1/2 del total
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // distribuye botones y número
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    flex: 1, // hace que el número ocupe el centro del espacio
  },
});
