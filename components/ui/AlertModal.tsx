import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  icon = "alert-circle",
  onClose,
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.modalContainer}>
        <Ionicons name={icon} size={60} color="#eab308" />
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>

        <TouchableOpacity onPress={onClose} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Entendido</Text>
        </TouchableOpacity>
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
  modalButton: {
    backgroundColor: "#eab308",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default AlertModal;
