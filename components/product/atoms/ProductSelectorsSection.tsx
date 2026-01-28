
import type { Option } from "@/types/product";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  loadingMarcas: boolean;
  marcaId: number | null;
  setMarcaId: (v: number | null) => void;
  marcaOptions: Option[];

  loadingCategories: boolean;
  categoriaId: number | null;
  setCategoriaId: (v: number | null) => void;
  categoriaOptions: Option[];
};

export default function ProductSelectorsSection({
  loadingMarcas,
  marcaId,
  setMarcaId,
  marcaOptions,
  loadingCategories,
  categoriaId,
  setCategoriaId,
  categoriaOptions,
}: Props) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Marca</Text>
        <View style={styles.pickerBox}>
          <Picker
            enabled={!loadingMarcas}
            selectedValue={marcaId ?? 0}
            onValueChange={(val: number) => setMarcaId(val === 0 ? null : val)}
          >
            <Picker.Item
              label={loadingMarcas ? "Cargando marcas..." : "Seleccionar marca..."}
              value={0}
            />
            {marcaOptions.map((m) => (
              <Picker.Item key={m.id} label={m.label} value={m.id} />
            ))}
          </Picker>
        </View>
        {loadingMarcas && <Text style={styles.helperText}>(Cargando desde la base...)</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerBox}>
          <Picker
            enabled={!loadingCategories}
            selectedValue={categoriaId ?? 0}
            onValueChange={(val: number) => setCategoriaId(val === 0 ? null : val)}
          >
            <Picker.Item
              label={loadingCategories ? "Cargando categorías..." : "Seleccionar categoría..."}
              value={0}
            />
            {categoriaOptions.map((c) => (
              <Picker.Item key={c.id} label={c.label} value={c.id} />
            ))}
          </Picker>
        </View>
        {loadingCategories && <Text style={styles.helperText}>(Cargando desde la base...)</Text>}
      </View>
    </>
  );
}
