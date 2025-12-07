import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

export interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void; // se usa para cerrar / cancelar
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = "Confirmación",
  message,
  icon = "help-circle",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
      backdropOpacity={0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View style={styles.modalContainer}>
        <Ionicons name={icon} size={60} color="#22c55e" />
        {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
        <Text style={styles.modalMessage}>{message}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.btnGhost]}> 
            <Text style={[styles.btnText, styles.btnGhostText]}>{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onConfirm} style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnPrimaryText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
  },
  modalMessage: {
    textAlign: "center",
    color: "#4b5563",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  btnGhost: {
    backgroundColor: "#f3f4f6",
  },
  btnGhostText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 16,
  },
  btnPrimary: {
    backgroundColor: "#22c55e",
  },
  btnPrimaryText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  btnText: {
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ConfirmModal;
