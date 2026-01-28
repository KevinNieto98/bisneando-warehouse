import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductHeader } from "@/components/product/ProductHeader";
import SuccessToast from "@/components/ui/SuccessToast";

import {
    ProductBottomBar,
    ProductImagesSection,
    ProductQuantitySection,
    ProductSelectorsSection,
    ProductStatusSection,
    ProductTextFieldsSection,
} from ".";

import type { EditableImage, Option } from "@/app/product/_types";
import { styles } from "./styles";

type Props = {
  savedVisible: boolean;

  // ✅ navegación/acciones
  onPressExit: () => void;
  onPressSave: () => void; // ✅ faltaba

  saving: boolean; // ✅ faltaba

  // imágenes
  imagenes: EditableImage[];
  onRemoveImage: (id: string) => void;
  onAddImages: () => Promise<void> | void;

  // estado
  isActive: boolean;
  setIsActive: (v: boolean) => void;

  // fields
  nombre: string;
  setNombre: (v: string) => void;

  precioText: string;
  onChangePrecio: (v: string) => void;

  descripcion: string;
  setDescripcion: (v: string) => void;

  // selectors (con options ya resueltas)
  loadingMarcas: boolean;
  marcaId: number | null;
  setMarcaId: (v: number | null) => void;
  marcaOptions: Option[];

  loadingCategories: boolean;
  categoriaId: number | null;
  setCategoriaId: (v: number | null) => void;
  categoriaOptions: Option[];

  // qty
  cantidad: number;
  setCantidad: (n: number) => void;
};

export default function ProductEditView(props: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <ProductHeader totalItems={0} returnAction={props.onPressExit} />

      <KeyboardAwareFlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 18 : 90}
        contentContainerStyle={{ paddingBottom: 190 }}
        ListHeaderComponent={
          <View style={styles.content}>
            <SuccessToast
              visible={props.savedVisible}
              text="Cambios guardados"
              iconName="checkmark-circle-outline"
            />

            <ProductImagesSection
              imagenes={props.imagenes}
              onRemove={props.onRemoveImage}
              onAdd={props.onAddImages}
            />

            <ProductStatusSection
              isActive={props.isActive}
              setIsActive={props.setIsActive}
            />

            <ProductTextFieldsSection
              nombre={props.nombre}
              setNombre={props.setNombre}
              precioText={props.precioText}
              onChangePrecio={props.onChangePrecio}
              descripcion={props.descripcion}
              setDescripcion={props.setDescripcion}
            />

            <ProductSelectorsSection
              loadingMarcas={props.loadingMarcas}
              marcaId={props.marcaId}
              setMarcaId={props.setMarcaId}
              marcaOptions={props.marcaOptions}
              loadingCategories={props.loadingCategories}
              categoriaId={props.categoriaId}
              setCategoriaId={props.setCategoriaId}
              categoriaOptions={props.categoriaOptions}
            />

            <ProductQuantitySection
              cantidad={props.cantidad}
              setCantidad={props.setCantidad}
            />
          </View>
        }
      />

      {/* ✅ Bottom bar con Guardar */}
      <ProductBottomBar
        saving={props.saving}
        onPressSave={props.onPressSave}
      />
    </SafeAreaView>
  );
}
