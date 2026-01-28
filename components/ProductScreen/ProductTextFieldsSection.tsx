import React from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { styles } from "./styles";

type Props = {
  nombre: string;
  setNombre: (v: string) => void;
  precioText: string;
  onChangePrecio: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
};

export default function ProductTextFieldsSection({
  nombre,
  setNombre,
  precioText,
  onChangePrecio,
  descripcion,
  setDescripcion,
}: Props) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del producto"
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Precio</Text>
        <TextInput
          value={precioText}
          onChangeText={onChangePrecio}
          placeholder="0"
          style={styles.input}
          keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
          inputMode="decimal"
          returnKeyType="done"
        />
        <Text style={styles.helperText}>Solo números (ej: 199 o 199.99)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción del producto..."
          style={styles.textArea}
          multiline
          textAlignVertical="top"
          blurOnSubmit={false}
        />
      </View>
    </>
  );
}
