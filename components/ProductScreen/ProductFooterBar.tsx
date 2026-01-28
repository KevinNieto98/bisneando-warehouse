import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  saving: boolean;
  onPressSave: () => void;
};

export default function ProductFooterBar({ saving, onPressSave }: Props) {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        onPress={onPressSave}
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        activeOpacity={0.9}
        disabled={saving}
      >
        <Ionicons name="checkmark" size={22} color="#fff" />
        <Text style={styles.saveText}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
      </TouchableOpacity>
    </View>
  );
}
