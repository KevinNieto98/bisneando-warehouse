// components/profile/PhoneField.tsx
import FloatingInput from "@/components/ui/FloatingInput";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  telefono: string;
  onChangeTelefono: (v: string) => void;
  phoneVerified: boolean;
  onPressAction: () => void;
};

// Botón más pequeño; ajústalo si quieres más/menos alto
const BUTTON_HEIGHT = 32; // ~ la mitad de un input típico (56–64)

export default function PhoneField({
  telefono,
  onChangeTelefono,
  phoneVerified,
  onPressAction,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrapper}>
        <FloatingInput
          label="Teléfono"
          value={telefono}
          onChangeText={onChangeTelefono}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.btn,
          phoneVerified ? styles.btnEdit : styles.btnVerify,
        ]}
        onPress={onPressAction}
        activeOpacity={0.9}
      >
        <Ionicons
          name={phoneVerified ? "checkmark-done-outline" : "checkmark-done-outline"}
          size={14}
          color={phoneVerified ? "#1D4ED8" : "#15803D"}
        />
        <Text
          style={[
            styles.btnText,
            phoneVerified ? styles.btnTextEdit : styles.btnTextVerify,
          ]}
          numberOfLines={1}
        >
          {phoneVerified ? "Verificado" : "Verificar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center", // ⬅️ centra verticalmente al botón respecto al input
    gap: 8,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  btn: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 14,
    minWidth: 96,
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",   // centra el icono/texto dentro del botón
    justifyContent: "center",
  },
  btnVerify: { backgroundColor: "#DCFCE7", borderColor: "#BBF7D0" },
  btnEdit: { backgroundColor: "#DBEAFE", borderColor: "#BFDBFE" },
  btnText: { fontSize: 13, fontWeight: "600", marginLeft: 6, lineHeight: 16 },
  btnTextVerify: { color: "#15803D" },
  btnTextEdit: { color: "#1D4ED8" },
});
