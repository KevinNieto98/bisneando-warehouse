import { ProductSkeleton } from "@/components";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductHeader } from "@/components/product/ProductHeader";
import SuccessToast from "@/components/ui/SuccessToast";
import { fetchProductoById } from "@/services/api";

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
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
};

type EditableImage = {
  id: string;
  uri: string;
  isLocal?: boolean;
  orden?: number;
  is_principal?: boolean;
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
      obj.url_imagen ?? // 👈 tu API
      obj.url ??
      obj.uri ??
      obj.src ??
      obj.path ??
      obj.location ??
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

  const [producto, setProducto] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos editables
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [imagenes, setImagenes] = useState<EditableImage[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Selectores (por ahora estáticos; luego conectas a tu API)
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const marcas: Option[] = [
    { id: 1, label: "Marca 1" },
    { id: 2, label: "Amazon" },
    { id: 3, label: "Marca 3" },
  ];

  const categorias: Option[] = [
    { id: 1, label: "Categoría 1" },
    { id: 2, label: "Categoría 2" },
    { id: 3, label: "Categoría 3" },
  ];

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

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const data = await fetchProductoById(Number(id));
        setProducto(data);

        setNombre(data?.nombre_producto ?? "");
        setDescripcion(data?.descripcion ?? "");
        setCantidad(Number(data?.qty ?? 1));
        setIsActive(Boolean(data?.is_active ?? true));

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
        setLoading(false);
      }
    };

    loadProduct();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [id]);

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

  const saveChanges = async () => {
    try {
      if (!nombre.trim()) return;

      // Aquí conectarás tu API real pronto:
      // await updateProductoById(Number(id), {
      //   nombre_producto: nombre.trim(),
      //   descripcion,
      //   qty: cantidad,
      //   is_active: isActive,
      //   id_marca: marcaId,
      //   id_categoria: categoriaId,
      //   imagenes: ...
      // });

      triggerSavedToast();
    } catch (e) {
      console.error("Error guardando cambios:", e);
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
      <ProductHeader totalItems={0} />

      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.content}>
            <SuccessToast
              visible={savedVisible}
              text="Cambios guardados"
              iconName="checkmark-circle-outline"
            />

            {/* IMÁGENES */}
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

            {/* SELECTOR MARCA */}
            <View style={styles.section}>
              <Text style={styles.label}>Marca</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={marcaId ?? 0}
                  onValueChange={(val: number) =>
                    setMarcaId(val === 0 ? null : val)
                  }
                >
                  <Picker.Item label="Seleccionar marca..." value={0} />
                  {marcas.map((m) => (
                    <Picker.Item key={m.id} label={m.label} value={m.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* SELECTOR CATEGORÍA */}
            <View style={styles.section}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={categoriaId ?? 0}
                  onValueChange={(val: number) =>
                    setCategoriaId(val === 0 ? null : val)
                  }
                >
                  <Picker.Item label="Seleccionar categoría..." value={0} />
                  {categorias.map((c) => (
                    <Picker.Item key={c.id} label={c.label} value={c.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* CANTIDAD / STOCK */}
            <View style={styles.section}>
              <Text style={styles.label}>Cantidad / Stock</Text>
              <ProductActions
                cantidad={cantidad}
                setCantidad={(n) => setCantidad(clampByStock(n, 999999))}
                maxQty={999999}
                // ✅ Quitados WhatsApp/Share (ya no hacen nada)
  
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
              />
            </View>
          </View>
        }
      />

      {/* BOTÓN VERDE DE GUARDAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={saveChanges}
          style={styles.saveBtn}
          activeOpacity={0.9}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.saveText}>Guardar cambios</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  helperText: { fontSize: 12, color: "#6B7280" },

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
    minHeight: 120,
    backgroundColor: "#fff",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  imagesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

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

  saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
