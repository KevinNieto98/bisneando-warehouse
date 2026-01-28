import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";


import { ProductConfirmModals, ProductEditView, ProductSkeleton } from "@/components";
import { useProductEditForm, useProductEditQuery, useProductEditSave } from "@/hooks";

export default function ProductEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idProducto = Number(id);

  const query = useProductEditQuery(idProducto);
  const form = useProductEditForm(query.initialForm);

  const [savedVisible, setSavedVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSavedToast = () => {
    setSavedVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setSavedVisible(false), 1400);
  };

  const goToProductsTab = () => router.replace("/(tabs)/products");

  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [confirmSaveVisible, setConfirmSaveVisible] = useState(false);

  const save = useProductEditSave({
    idProducto,
    form: form.state,
    onSaved: () => {
      triggerSavedToast();
      goToProductsTab();
    },
  });

  if (query.loading || !form.ready) return <ProductSkeleton />;

  if (!query.producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  // 🔥 Convertimos categories y marcas en Option[] para el View
  const categoriaOptions = (query.categories ?? [])
    .filter((c) => c.activa)
    .slice()
    .sort((a, b) =>
      String(a.nombre_categoria).localeCompare(String(b.nombre_categoria))
    )
    .map((c) => ({ id: c.id_categoria, label: c.nombre_categoria }));

  const marcaOptions = (query.marcas ?? [])
    .filter((m) => m.is_active)
    .slice()
    .sort((a, b) =>
      String(a.nombre_marca).localeCompare(String(b.nombre_marca))
    )
    .map((m) => ({ id: m.id_marca, label: m.nombre_marca }));

  return (
    <>
      <ProductEditView
        savedVisible={savedVisible}
        onPressExit={() => setConfirmExitVisible(true)}
        onPressSave={() => setConfirmSaveVisible(true)}
        saving={save.saving}
        // imágenes
        imagenes={form.state.imagenes}
        onRemoveImage={form.actions.removeImage}
        onAddImages={form.actions.addImagesFromGallery}
        // estado
        isActive={form.state.isActive}
        setIsActive={form.actions.setIsActive}
        // fields
        nombre={form.state.nombre}
        setNombre={form.actions.setNombre}
        precioText={form.state.precioText}
        onChangePrecio={form.actions.onChangePrecio}
        descripcion={form.state.descripcion}
        setDescripcion={form.actions.setDescripcion}
        // selectors (ahora van como options)
        loadingCategories={query.loadingCategories}
        categoriaId={form.state.categoriaId}
        setCategoriaId={form.actions.setCategoriaId}
        categoriaOptions={categoriaOptions}
        loadingMarcas={query.loadingMarcas}
        marcaId={form.state.marcaId}
        setMarcaId={form.actions.setMarcaId}
        marcaOptions={marcaOptions}
        // qty
        cantidad={form.state.cantidad}
        setCantidad={form.actions.setCantidad}
      />

      <ProductConfirmModals
        confirmExitVisible={confirmExitVisible}
        setConfirmExitVisible={setConfirmExitVisible}
        onConfirmExit={() => {
          setConfirmExitVisible(false);
          goToProductsTab();
        }}
        confirmSaveVisible={confirmSaveVisible}
        setConfirmSaveVisible={setConfirmSaveVisible}
        onConfirmSave={async () => {
          setConfirmSaveVisible(false);
          try {
            await save.saveChanges();
          } catch (e: any) {
            console.error("Error guardando:", e?.message ?? e);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
