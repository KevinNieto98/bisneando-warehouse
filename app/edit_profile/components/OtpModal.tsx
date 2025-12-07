// components/profile/OtpModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

type Props = {
  visible: boolean;
  otpCode: string;
  setOtpCode: (v: string) => void;
  loadingVerify: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function OtpModal({
  visible,
  otpCode,
  setOtpCode,
  loadingVerify,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.35}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.otpModal}>
        <Ionicons name="key" size={48} color="#eab308" />
        <Text style={styles.otpTitle}>Ingresa tu código</Text>
        <Text style={styles.otpSubtitle}>Te enviamos un código de 6 dígitos.</Text>

        <TextInput
          style={styles.otpInput}
          placeholder="••••••"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={6}
          value={otpCode}
          onChangeText={setOtpCode}
          textAlign="center"
        />

        <View style={styles.otpActions}>
          <TouchableOpacity style={[styles.otpButton, styles.otpCancel]} onPress={onClose} disabled={loadingVerify}>
            <Text style={styles.otpCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.otpButton, styles.otpConfirm]} onPress={onSubmit} disabled={loadingVerify}>
            {loadingVerify ? <ActivityIndicator color="#fff" /> : <Text style={styles.otpConfirmText}>Verificar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  otpModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  otpTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937", marginTop: 10 },
  otpSubtitle: { textAlign: "center", color: "#4b5563", fontSize: 14, marginTop: 6, marginBottom: 14 },
  otpInput: {
    width: "65%",
    height: 52,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontSize: 22,
    letterSpacing: 6,
    color: "#111827",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  otpActions: { flexDirection: "row", gap: 12, width: "100%", marginTop: 6 },
  otpButton: { flex: 1, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  otpCancel: { backgroundColor: "#f3f4f6" },
  otpCancelText: { color: "#111827", fontWeight: "700" },
  otpConfirm: { backgroundColor: "#22c55e" },
  otpConfirmText: { color: "white", fontWeight: "700" },
});
