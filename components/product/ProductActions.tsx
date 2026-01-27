import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  cantidad: number;
  setCantidad: (n: number) => void;
  /** Stock máximo permitido; si es 0 o menor, el stepper queda deshabilitado */
  maxQty?: number;
};

export function ProductActions({
  cantidad,
  setCantidad,
  maxQty = 0,
}: Props) {
  const atMin = cantidad <= 1;
  const atMax = maxQty > 0 ? cantidad >= maxQty : false;
  const disabled = maxQty <= 0;

  return (
    <View style={styles.container}>
      {/* Contador ocupa ahora todo el ancho */}
      <View style={[styles.counterContainer, disabled && styles.counterDisabled]}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            (atMin || disabled) && styles.counterButtonDisabled,
          ]}
          onPress={() => {
            if (!atMin && !disabled) setCantidad(cantidad - 1);
          }}
          disabled={atMin || disabled}
        >
          <Ionicons
            name="remove"
            size={20}
            color={atMin || disabled ? "#9CA3AF" : "#111"}
          />
        </TouchableOpacity>

        <View style={styles.counterCenter}>
          <Text style={styles.counterValue}>{cantidad}</Text>
          {maxQty > 0 && (
            <Text style={styles.counterHint}>Stock máximo: {maxQty}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.counterButton,
            (atMax || disabled) && styles.counterButtonDisabled,
          ]}
          onPress={() => {
            if (!atMax && !disabled) setCantidad(cantidad + 1);
          }}
          disabled={atMax || disabled}
        >
          <Ionicons
            name="add"
            size={20}
            color={atMax || disabled ? "#9CA3AF" : "#111"}
          />
        </TouchableOpacity>
      </View>

      {disabled && (
        <Text style={styles.disabledText}>
          No hay stock disponible para modificar la cantidad
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },

  counterContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  counterDisabled: {
    backgroundColor: "#E5E7EB",
  },

  counterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },

  counterButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },

  counterCenter: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  counterValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  counterHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  disabledText: {
    marginTop: 6,
    fontSize: 12,
    color: "#DC2626",
    textAlign: "center",
    fontWeight: "600",
  },
});
