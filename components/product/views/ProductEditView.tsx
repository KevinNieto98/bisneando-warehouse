import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductHeader } from "@/components/ui/Header";
import SuccessToast from "@/components/ui/SuccessToast";
import type { EditableImage, Option } from "@/types/product";

import {
  ProductBottomBar,
  ProductImagesSection,
  ProductSelectorsSection,
  ProductStatusAndQuantitySection,
  ProductTextFieldsSection,
} from "../atoms";

import { styles } from "../atoms/styles";

type Props = {
  savedVisible: boolean;

  // navegación/acciones
  onPressExit: () => void;
  onPressSave: () => void;

  saving: boolean;

  // imágenes
  imagenes: EditableImage[];
  onRemoveImage: (id: string) => void;
  onAddImages: () => Promise<void> | void;

  // status
  isActive: boolean;
  setIsActive: (v: boolean) => void;

  // fields
  nombre: string;
  setNombre: (v: string) => void;

  precioText: string;
  onChangePrecio: (v: string) => void;

  descripcion: string;
  setDescripcion: (v: string) => void;

  // selectors
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

  // ✅ opcional (si quieres controlar max stock desde arriba)
  maxQty?: number;
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

            {/* ✅ COMBINADO: status + cantidad */}
            <ProductStatusAndQuantitySection
              isActive={props.isActive}
              setIsActive={props.setIsActive}
              cantidad={props.cantidad}
              setCantidad={props.setCantidad}
              maxQty={props.maxQty ?? 999999}
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
          </View>
        }
      />

      <ProductBottomBar saving={props.saving} onPressSave={props.onPressSave} />
    </SafeAreaView>
  );
}
