import { ProductSkeleton } from "@/components";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductHeader } from "@/components/product/ProductHeader";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessToast from "@/components/ui/SuccessToast";
import {
  fetchCategorias,
  fetchMarcas,
  fetchProductoById,
  updateProductoById,
  UpdateProductoPayload,
} from "@/services/api";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type ProductoImagenAPI = {
  id_producto?: number;
  is_principal?: boolean;
  orden?: number;
  url_imagen?: string;
};

type ProductAPI = {
  id_producto: number | string;
  slug?: string;
  nombre_producto: string;
  nombre_marca?: string;
  id_marca?: number;
  id_categoria?: number;
  precio: number | string;
  qty?: number | string;
  imagenes?: (string | ProductoImagenAPI)[];
  descripcion?: string;
  is_active?: boolean;
  en_revision?: boolean;
};

type EditableImage = {
  id: string;
  uri: string;
  isLocal?: boolean;
  orden?: number;
  is_principal?: boolean;
};

type Category = {
  id_categoria: number;
  nombre_categoria: string;
  activa: boolean;
  icono?: string;
};

type MarcaRow = {
  id_marca: number;
  nombre_marca: string;
  is_active: boolean;
};

type Option = { id: number; label: string };

function normalizeImageUri(item: unknown): string | null {
  if (!item) return null;

  if (typeof item === "string") {
    const s = item.trim();
    return s.length ? s : null;
  }

  if (typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const candidate =
      (obj.url_imagen as any) ??
      (obj.url as any) ??
      (obj.uri as any) ??
      (obj.src as any) ??
      (obj.path as any) ??
      (obj.location as any) ??
      null;

    if (typeof candidate === "string") {
      const s = candidate.trim();
      return s.length ? s : null;
    }
  }

  return null;
}

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idProducto = Number(id);

  const [producto, setProducto] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos editables
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [imagenes, setImagenes] = useState<EditableImage[]>([]);
  const [isActive, setIsActive] = useState(true);

  // ✅ slug requerido por payload, aunque no lo muestres
  const [slug, setSlug] = useState<string>("");

  // ✅ Precio: lo guardamos como string para controlar input (solo números)
  const [precioText, setPrecioText] = useState<string>("0");

  // Categorías / Marcas
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [marcas, setMarcas] = useState<MarcaRow[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  // Selectores
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const categoriaOptions: Option[] = useMemo(() => {
    return (categories ?? [])
      .filter((c) => c.activa)
      .slice()
      .sort((a, b) =>
        String(a.nombre_categoria).localeCompare(String(b.nombre_categoria))
      )
      .map((c) => ({ id: c.id_categoria, label: c.nombre_categoria }));
  }, [categories]);

  const marcaOptions: Option[] = useMemo(() => {
    return (marcas ?? [])
      .filter((m) => m.is_active)
      .slice()
      .sort((a, b) => String(a.nombre_marca).localeCompare(String(b.nombre_marca)))
      .map((m) => ({ id: m.id_marca, label: m.nombre_marca }));
  }, [marcas]);

  const [savedVisible, setSavedVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSavedToast = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSavedVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setSavedVisible(false), 1400);
  };

  const clampByStock = (val: number, stk: number) =>
    Math.max(1, Math.min(stk || 1, val));

  // Confirm modals
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [confirmSaveVisible, setConfirmSaveVisible] = useState(false);

  // Guardado
  const [saving, setSaving] = useState(false);

  const goToProductsTab = () => router.replace("/(tabs)/products");

  const handlePressExit = () => setConfirmExitVisible(true);
  const handleConfirmExit = () => {
    setConfirmExitVisible(false);
    goToProductsTab();
  };

  const handlePressSave = () => setConfirmSaveVisible(true);

  const handleConfirmSave = async () => {
    setConfirmSaveVisible(false);
    await saveChanges();
  };

  // ✅ sanitizar precio: solo dígitos y (opcional) un punto decimal
  const onChangePrecio = (text: string) => {
    // quita todo lo que no sea dígito o punto
    let cleaned = text.replace(/[^0-9.]/g, "");
    // deja solo un punto decimal
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    // limita decimales a 2 (opcional)
    if (cleaned.includes(".")) {
      const [i, d] = cleaned.split(".");
      cleaned = i + "." + d.slice(0, 2);
    }
    setPrecioText(cleaned);
  };

  // Cargar categorías
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await fetchCategorias();
        if (!mounted) return;
        setCategories(Array.isArray(data) ? (data as Category[]) : []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (!mounted) return;
        setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar marcas
  useEffect(() => {
    let mounted = true;
    const loadMarcas = async () => {
      try {
        setLoadingMarcas(true);
        const data = await fetchMarcas();
        if (!mounted) return;
        setMarcas(Array.isArray(data) ? (data as MarcaRow[]) : []);
      } catch (error) {
        console.error("Error cargando marcas:", error);
        if (!mounted) return;
        setMarcas([]);
      } finally {
        if (!mounted) return;
        setLoadingMarcas(false);
      }
    };
    loadMarcas();
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar producto
  useEffect(() => {
    if (!idProducto || Number.isNaN(idProducto)) return;

    let mounted = true;

    const loadProduct = async () => {
      try {
        const data = await fetchProductoById(idProducto);
        if (!mounted) return;

        setProducto(data);

        setNombre(data?.nombre_producto ?? "");
        setDescripcion(data?.descripcion ?? "");
        setCantidad(Number(data?.qty ?? 1));
        setIsActive(Boolean(data?.is_active ?? true));

        // ✅ requeridos
        setSlug(String(data?.slug ?? ""));
        setPrecioText(String(Number(data?.precio ?? 0)));

        setMarcaId(typeof data?.id_marca === "number" ? data.id_marca : null);
        setCategoriaId(
          typeof data?.id_categoria === "number" ? data.id_categoria : null
        );

        const raw = Array.isArray(data?.imagenes)
          ? (data?.imagenes as (string | ProductoImagenAPI)[])
          : [];

        const imgs: EditableImage[] = raw
          .map((item: string | ProductoImagenAPI, idx: number) => {
            const uri = normalizeImageUri(item);
            if (!uri) return null;

            const meta =
              typeof item === "object" && item
                ? (item as ProductoImagenAPI)
                : undefined;

            return {
              id:
                meta?.orden != null
                  ? `remote-orden-${meta.orden}-${uri}`
                  : `remote-${idx}-${uri}`,
              uri,
              isLocal: false,
              orden: meta?.orden,
              is_principal: meta?.is_principal,
            } as EditableImage;
          })
          .filter((x): x is EditableImage => x !== null)
          .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999));

        setImagenes(imgs);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      mounted = false;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [idProducto]);

  const removeImage = (imageId: string) => {
    setImagenes((prev) => prev.filter((img) => img.id !== imageId));
  };

  const addImagesFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsMultipleSelection: true,
        selectionLimit: 0,
      });

      if (result.canceled) return;
      const assets = result.assets ?? [];
      if (!assets.length) return;

      const newImgs: EditableImage[] = assets
        .filter((a) => typeof a.uri === "string" && a.uri.length > 0)
        .map((a, idx: number) => ({
          id: `local-${Date.now()}-${idx}-${a.uri}`,
          uri: a.uri,
          isLocal: true,
        }));

      setImagenes((prev) => [...prev, ...newImgs]);
    } catch (error) {
      console.error("Error abriendo galería:", error);
    }
  };

  // ✅ Guardar REAL (sin imágenes todavía)
  const saveChanges = async () => {
    if (!idProducto || Number.isNaN(idProducto)) return;

    try {
      if (!nombre.trim()) return;
      if (!categoriaId) return;

      const safeSlug =
        (slug && slug.trim()) ||
        nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "");

      const precioNum = Number(precioText);
      const safePrecio = Number.isFinite(precioNum) ? precioNum : 0;

      setSaving(true);

      const payload: UpdateProductoPayload = {
        nombre_producto: nombre.trim(),
        descripcion: descripcion ?? "",
        qty: Number(cantidad ?? 0),
        is_active: Boolean(isActive),
        id_categoria: Number(categoriaId),
        id_marca: marcaId ?? null,

        slug: safeSlug,
        precio: safePrecio,

        en_revision: false,
      };

      const updated = await updateProductoById(idProducto, payload);

      if (!updated) {
        console.error("No se pudo actualizar (updateProductoById devolvió null)");
        return;
      }

      setProducto((prev) => ({ ...(prev ?? ({} as any)), ...updated }));
      triggerSavedToast();
      goToProductsTab();
    } catch (e: any) {
      console.error("Error guardando cambios:", e?.message ?? e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProductSkeleton />;

  if (!producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <ProductHeader totalItems={0} returnAction={handlePressExit} />

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
              visible={savedVisible}
              text="Cambios guardados"
              iconName="checkmark-circle-outline"
            />

            {/* IMÁGENES (solo UI) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imágenes</Text>

              <View style={styles.imagesWrap}>
                {imagenes.map((img: EditableImage) => (
                  <View key={img.id} style={styles.imageCard}>
                    <Image source={{ uri: img.uri }} style={styles.image} />

                    <TouchableOpacity
                      onPress={() => removeImage(img.id)}
                      style={styles.deleteBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addImagesFromGallery}
                  style={styles.addImageCard}
                  activeOpacity={0.85}
                >
                  <Ionicons name="images-outline" size={22} color="#111" />
                  <Text style={styles.addImageText}>Agregar imágenes</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ESTADO */}
            <View style={[styles.section, styles.rowBetween]}>
              <View>
                <Text style={styles.label}>Activo</Text>
                <Text style={styles.helperText}>
                  Controla si el producto está disponible
                </Text>
              </View>

              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            {/* NOMBRE */}
            <View style={styles.section}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del producto"
                style={styles.input}
              />
            </View>

            {/* ✅ PRECIO (solo números) */}
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
              <Text style={styles.helperText}>
                Solo números (ej: 199 o 199.99)
              </Text>
            </View>

            {/* MARCA */}
            <View style={styles.section}>
              <Text style={styles.label}>Marca</Text>
              <View style={styles.pickerBox}>
                <Picker
                  enabled={!loadingMarcas}
                  selectedValue={marcaId ?? 0}
                  onValueChange={(val: number) =>
                    setMarcaId(val === 0 ? null : val)
                  }
                >
                  <Picker.Item
                    label={
                      loadingMarcas ? "Cargando marcas..." : "Seleccionar marca..."
                    }
                    value={0}
                  />
                  {marcaOptions.map((m) => (
                    <Picker.Item key={m.id} label={m.label} value={m.id} />
                  ))}
                </Picker>
              </View>
              {loadingMarcas && (
                <Text style={styles.helperText}>(Cargando desde la base...)</Text>
              )}
            </View>

            {/* CATEGORÍA */}
            <View style={styles.section}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.pickerBox}>
                <Picker
                  enabled={!loadingCategories}
                  selectedValue={categoriaId ?? 0}
                  onValueChange={(val: number) =>
                    setCategoriaId(val === 0 ? null : val)
                  }
                >
                  <Picker.Item
                    label={
                      loadingCategories
                        ? "Cargando categorías..."
                        : "Seleccionar categoría..."
                    }
                    value={0}
                  />
                  {categoriaOptions.map((c) => (
                    <Picker.Item key={c.id} label={c.label} value={c.id} />
                  ))}
                </Picker>
              </View>
              {loadingCategories && (
                <Text style={styles.helperText}>(Cargando desde la base...)</Text>
              )}
            </View>

            {/* CANTIDAD */}
            <View style={styles.section}>
              <Text style={styles.label}>Cantidad / Stock</Text>
              <ProductActions
                cantidad={cantidad}
                setCantidad={(n) => setCantidad(clampByStock(n, 999999))}
                maxQty={999999}
              />
            </View>

            {/* DESCRIPCIÓN */}
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
          </View>
        }
      />

      {/* BOTÓN GUARDAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handlePressSave}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          activeOpacity={0.9}
          disabled={saving}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.saveText}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL: confirmar salida */}
      <ConfirmModal
        visible={confirmExitVisible}
        title="Salir"
        message="¿Seguro que deseas salir? Los cambios no guardados se perderán."
        icon="alert-circle"
        confirmText="Salir"
        cancelText="Cancelar"
        onCancel={() => setConfirmExitVisible(false)}
        onConfirm={handleConfirmExit}
      />

      {/* MODAL: confirmar guardar */}
      <ConfirmModal
        visible={confirmSaveVisible}
        title="Guardar cambios"
        message="¿Deseas guardar los cambios realizados en este producto?"
        icon="checkmark-circle"
        confirmText="Guardar"
        cancelText="Cancelar"
        onCancel={() => setConfirmSaveVisible(false)}
        onConfirm={handleConfirmSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 6 },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: "#fff",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  imagesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  imageCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },

  image: { width: "100%", height: "100%" },

  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  addImageCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  addImageText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },

  saveBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveBtnDisabled: { opacity: 0.7 },

  saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
