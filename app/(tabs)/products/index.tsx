import { ExploreSkeleton } from "@/components";
import { CategoriesContainer } from "@/components/CategoriesContainer";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/components/ProductSlideItem";
import { InternetError } from "@/components/ui/InternetError";
import { Search } from "@/components/ui/Search";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Selected = number | "all";

const getProductCategoryId = (p: any): number | undefined => {
  if (!p || typeof p !== "object") return undefined;
  return (
    (typeof p.id_categoria === "number" ? p.id_categoria : undefined) ??
    (typeof p.categoryId === "number" ? p.categoryId : undefined) ??
    (typeof p.categoria_id === "number" ? p.categoria_id : undefined)
  );
};

export default function ExploreScreen() {
  const {
    categories,
    loadingCategories,
    products,
    loadingProducts,
    loadCategories,
    loadProducts,
  } = useAppStore();

  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedCat, setSelectedCat] = useState<Selected>("all");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para "posible error de red"
  const [networkError, setNetworkError] = useState(false);
  const [networkErrorMessage] = useState(
    "No pudimos cargar los productos. Revisa tu conexión a internet."
  );

  // Cargar data inicial
  useEffect(() => {
    const loadInitial = async () => {
      setNetworkError(false);
      await Promise.all([loadCategories(), loadProducts()]);
    };

    loadInitial();
  }, [loadCategories, loadProducts]);

  // Detectar "posible error de red" cuando termina de cargar y no hay datos
  useEffect(() => {
    if (!loadingCategories && !loadingProducts) {
      if (categories.length === 0 && products.length === 0) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    }
  }, [
    loadingCategories,
    loadingProducts,
    categories.length,
    products.length,
  ]);

  // Inicializar categoría desde la ruta
  useEffect(() => {
    if (categoryId != null && categoryId !== "") {
      const idNum = Number(categoryId);
      setSelectedCat(Number.isFinite(idNum) ? idNum : "all");
    } else {
      setSelectedCat("all");
    }
  }, [categoryId]);

  // Si cambio categoría, limpio resultados de búsqueda aplicados
  useEffect(() => {
    setSearchResults(null);
  }, [selectedCat]);

  const loading = loadingCategories || loadingProducts;

  // Filtrar por categoría
  const filteredProducts = useMemo(() => {
    if (selectedCat === "all") return products;
    return products.filter((p) => getProductCategoryId(p) === selectedCat);
  }, [products, selectedCat]);

  // Productos que se muestran en el grid
  const gridProducts = useMemo(() => {
    if (searchResults && searchResults.length > 0) return searchResults;
    if (searchResults && searchResults.length === 0) return [];
    return filteredProducts;
  }, [filteredProducts, searchResults]);

  const hasActiveSearch = searchResults !== null;
  const noMatches = hasActiveSearch && searchResults?.length === 0;

  const selectedCategoryName =
    selectedCat !== "all"
      ? categories.find((c) => c.id_categoria === selectedCat)
          ?.nombre_categoria ?? "Categoría"
      : null;

  // Cuando el usuario selecciona un producto del buscador
  const handleSelectProduct = (product: Product | null) => {
    if (!product) {
      setSearchResults(null);
      return;
    }
    setSearchResults([product]); // Muestra solo ese producto en el grid
  };

  // Limpiar filtros + limpiar buscador
  const handleClearFilters = () => {
    setSelectedCat("all");
    setSearchResults(null);
    setSearchResetKey((prev) => prev + 1); // fuerza remount del <Search />
  };

  // Pull-to-refresh de la grilla
  const handleRefresh = async () => {
    setRefreshing(true);
    setNetworkError(false);
    await Promise.all([loadCategories(), loadProducts()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* key para poder resetear el input del Search */}
      <Search
        key={searchResetKey}
        products={filteredProducts}
        onSelect={handleSelectProduct}
        onBack={() => router.push("/home")}
        onSubmitSearch={({ query, results }) => {
          if (!query || query.trim().length < 3) {
            setSearchResults(null);
          } else {
            setSearchResults(results);
          }
        }}
      />

      <View
        style={[
          styles.productsContainer,
          // *** CAMBIO 2: Eliminar marginTop: -8 para corregir espacio amarillo en Android ***
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight ? 0 : 0 }, 
        ]}
      >
        {loading ? (
          <ExploreSkeleton />
        ) : networkError ? (
          // Vista de "sin conexión"
          <InternetError
            message={networkErrorMessage}
            onRetry={handleRefresh}
          />
        ) : (
          <>
            {/* Banner de filtro activo */}
            {selectedCat !== "all" && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>
                  Filtrando por:{" "}
                  <Text style={styles.bold}>{selectedCategoryName}</Text>
                </Text>

                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearFilters}
                >
                  <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                  <Text style={styles.clearButtonText}>Quitar</Text>
                </TouchableOpacity>
              </View>
            )}

            <CategoriesContainer
              categories={categories}
              selectedId={selectedCat}
              onSelect={(id) => setSelectedCat(id)}
            />

            {noMatches ? (
              <View style={styles.noMatchesBox}>
                <Text style={styles.noMatchesText}>
                  No se encontraron coincidencias en esta categoría
                </Text>

                <TouchableOpacity onPress={handleClearFilters}>
                  <Text style={styles.removeFilterText}>
                    Buscar en todas las categorías
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ProductGrid
                products={gridProducts}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600",
  },
  productsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    // *** CAMBIO 2: Eliminamos la superposición (marginTop: -8) ***
    // Esto se maneja mejor en la prop de View condicional en Android
  },

  /* Banner tipo "pill" elegante */
  filterPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF8C8",
    // *** CAMBIO 1: Reducción de la altura vertical ***
    paddingVertical: 8, // Reducido de 10 a 8
    paddingHorizontal: 14,
    borderRadius: 50,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillText: {
    color: "#4b5563",
    fontSize: 14,
  },
  bold: {
    fontWeight: "700",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#ffe2e2",
  },
  clearButtonText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Sin coincidencias */
  noMatchesBox: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  noMatchesText: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  removeFilterText: {
    marginTop: 10,
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
});