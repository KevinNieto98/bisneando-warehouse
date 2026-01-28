import React from "react";
import { Switch, Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
};

export default function ProductStatusSection({ isActive, setIsActive }: Props) {
  return (
    <View style={[styles.section, styles.rowBetween]}>
      <View>
        <Text style={styles.label}>Activo</Text>
        <Text style={styles.helperText}>Controla si el producto está disponible</Text>
      </View>
      <Switch value={isActive} onValueChange={setIsActive} />
    </View>
  );
}

