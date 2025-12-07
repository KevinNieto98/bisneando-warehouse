// components/profile/NameRow.tsx
import FloatingInput from "@/components/ui/FloatingInput";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  nombre: string;
  apellido: string;
  onChangeNombre: (v: string) => void;
  onChangeApellido: (v: string) => void;
};

export default function NameRow({
  nombre,
  apellido,
  onChangeNombre,
  onChangeApellido,
}: Props) {
  return (
    <View style={styles.nameRow}>
      <View style={{ flex: 1 }}>
        <FloatingInput label="Nombre" value={nombre} onChangeText={onChangeNombre} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <FloatingInput label="Apellido" value={apellido} onChangeText={onChangeApellido} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
