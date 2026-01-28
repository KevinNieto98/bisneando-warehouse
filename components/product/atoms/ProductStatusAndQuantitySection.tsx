import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  isActive: boolean;
  setIsActive: (v: boolean) => void;

  cantidad: number;
  setCantidad: (n: number) => void;

  /** Stock máximo permitido; si es 0 o menor, el stepper queda deshabilitado */
  maxQty?: number;
};

export default function ProductStatusAndQuantitySection({
  isActive,
  setIsActive,
  cantidad,
  setCantidad,
  maxQty = 0,
}: Props) {
  const atMin = cantidad <= 1;
  const atMax = maxQty > 0 ? cantidad >= maxQty : false;
  const disabled = maxQty <= 0;

  return (
    <View style={styles.statusQtyRow}>
      {/* ---------- STATUS (50%) ---------- */}
      <View style={styles.statusBox}>
        <Text style={styles.label}>Activo</Text>
   
        <View style={styles.switchWrapper}>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#E5E7EB", true: "#86EFAC" }}
            thumbColor={isActive ? "#16A34A" : "#9CA3AF"}
          />
        </View>
      </View>

      {/* ---------- QUANTITY (50%) ---------- */}
      <View style={styles.qtyBox}>
        <Text style={styles.label}>Cantidad</Text>

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
              <Text style={styles.counterHint}>Máx: {maxQty}</Text>
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
            No hay stock disponible
          </Text>
        )}
      </View>
    </View>
  );
}
