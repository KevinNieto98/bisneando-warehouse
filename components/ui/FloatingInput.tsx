import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface FloatingInputProps extends TextInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "textarea";
}

export default function FloatingInput({
  label,
  value,
  onChangeText,
  required = false,
  disabled = false,
  type = "text",
  ...rest
}: FloatingInputProps) {
  return (
    <View style={[styles.container, disabled && { opacity: 0.6 }]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>

        <TextInput
          style={[
            styles.input,
            type === "textarea" && styles.textarea,
            disabled && { color: "#9ca3af" },
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={type === "textarea"}
          numberOfLines={type === "textarea" ? 4 : 1}
          textAlignVertical={type === "textarea" ? "top" : "center"}
          placeholderTextColor="#9ca3af"
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  required: {
    color: "#dc2626",
  },
});
