// AddressTypeSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type TipoDireccionId = 1 | 2 | 3; // 1=Casa, 2=Trabajo, 3=Otro

type Props = {
  value: number;                 // valor seleccionado actual (1|2|3)
  onChange: (next: TipoDireccionId) => void;
  disabled?: boolean;                     // opcional
};

const BRAND_YELLOW = "#facc15";
const WORK_BROWN = "#a16207";
const TEXT_DEFAULT = "#1e293b";

const AddressTypeSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
  const isCasa = value === 1;
  const isTrabajo = value === 2;
  const isOtro = value === 3;

  return (
    <View>
      <Text style={styles.label}>Tipo de dirección</Text>

      <View style={styles.typeContainer}>
        {/* Casa -> 1 */}
        <TouchableOpacity
          style={[styles.typeButton, isCasa && styles.typeButtonActiveCasa]}
          onPress={() => onChange(1)}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color={isCasa ? "#fff" : TEXT_DEFAULT}
          />
          <Text style={[styles.typeText, isCasa && styles.typeTextActive]}>
            Casa
          </Text>
        </TouchableOpacity>

        {/* Trabajo -> 2 */}
        <TouchableOpacity
          style={[styles.typeButton, isTrabajo && styles.typeButtonActiveTrabajo]}
          onPress={() => onChange(2)}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Ionicons
            name="briefcase-outline"
            size={22}
            color={isTrabajo ? "#fff" : TEXT_DEFAULT}
          />
          <Text style={[styles.typeText, isTrabajo && styles.typeTextActive]}>
            Oficina
          </Text>
        </TouchableOpacity>

        {/* Otro -> 3 */}
        <TouchableOpacity
          style={[styles.typeButton, isOtro && styles.typeButtonActiveCasa]}
          onPress={() => onChange(3)}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Ionicons
            name="location-outline"
            size={22}
            color={isOtro ? "#fff" : TEXT_DEFAULT}
          />
          <Text style={[styles.typeText, isOtro && styles.typeTextActive]}>
            Otro
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddressTypeSelector;

const styles = StyleSheet.create({
  label: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "600" },
  typeContainer: { flexDirection: "row", gap: 8 },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    gap: 8,
  },
  // Activos: Casa y Otro usan amarillo de marca; Trabajo usa marrón
  typeButtonActiveCasa: {
    backgroundColor: BRAND_YELLOW,
    borderColor: BRAND_YELLOW,
  },
  typeButtonActiveTrabajo: {
    backgroundColor: WORK_BROWN,
    borderColor: WORK_BROWN,
  },
  typeText: { fontSize: 14, color: TEXT_DEFAULT, fontWeight: "600" },
  typeTextActive: { color: "#fff" },
});
