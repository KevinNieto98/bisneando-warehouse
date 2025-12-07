import { useCartStore } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { Product } from "../ProductSlideItem";
import { CartButton } from "../ui/CartButttom"; // *** IMPORTAR CartButton ***

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
  onBack?: () => void;

  // Se dispara cuando el usuario da Enter / Search
  onSubmitSearch?: (payload: { query: string; results: Product[] }) => void;
}

export const Search: React.FC<Props> = ({
  products,
  onSelect,
  onBack,
  onSubmitSearch,
}) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [showOverlay, setShowOverlay] = useState(false); // 👈 controla el “modalsito”

  // *** OBTENER EL CONTEO DEL CARRITO ***
  const totalItems = useCartStore((s) => s.totalItems());

  const handleSearch = (text: string) => {
    setQuery(text);

    if (text.length >= 3) {
      const results = products.filter((p) =>
        p.title.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(results);
      setShowOverlay(true); // escribiendo con 3+ chars → mostramos overlay
    } else {
      setFiltered([]);
      // si borra casi todo, solo mostramos mensaje de “escribe más” si hay texto
      setShowOverlay(text.length > 0);
    }
  };

  // cuando el usuario toca Enter / Search en el teclado
  const handleSubmit = () => {
    if (query.length >= 3) {
      onSubmitSearch?.({ query, results: filtered });
    } else {
      onSubmitSearch?.({ query: "", results: [] });
    }
    setShowOverlay(false); // 👈 cerramos el dropdown
  };

  const handleClear = () => {
    setQuery("");
    setFiltered([]);
    setShowOverlay(false); // 👈 cerramos también al limpiar
    onSubmitSearch?.({ query: "", results: [] });
  };

  const showMinCharsMsg =
    showOverlay && query.length > 0 && query.length < 3;
  const showNoResultsMsg =
    showOverlay && query.length >= 3 && filtered.length === 0;

  return (
    <View style={styles.container}>
      {/* 🔙 Header amarillo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Searchbar
          placeholder="Buscar producto..."
          onChangeText={handleSearch}
          value={query}
          // *** AJUSTE: El flex: 1 se mueve a styles.searchbar ***
          style={styles.searchbar} 
          icon="magnify"
          onSubmitEditing={handleSubmit}   // ENTER
          onClearIconPress={handleClear}   // X
        />

        {/* *** AÑADIR BOTÓN DEL CARRITO *** */}
        <CartButton count={totalItems} /> 
      </View>

      {/* 🔍 Mensaje flotante (solo cuando NO hay resultados o faltan caracteres) */}
      {(showMinCharsMsg || showNoResultsMsg) && (
        <View pointerEvents="none" style={styles.messageBox}>
          <Text style={styles.messageText}>
            {showMinCharsMsg
              ? "Debes escribir al menos 3 caracteres"
              : "No hay resultados"}
          </Text>
        </View>
      )}

      {/* 📦 Resultados flotantes, pegados al amarillo */}
      {showOverlay && filtered.length > 0 && (
        <View style={styles.resultsBox}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  setShowOverlay(false); // 👈 al elegir, también cerramos
                  onSelect(item);
                }}
              >
                <Text>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const DROPDOWN_TOP = 72; // altura donde empieza el dropdown

const styles = StyleSheet.create({
  container: {
    position: "relative", 
    paddingBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },

  searchbar: {
    // *** AJUSTE CLAVE: Permite que el Searchbar se comprima y deje espacio al CartButton ***
    flex: 1, 
    borderRadius: 25,
    // Agregamos un margen a la derecha para separarlo del botón del carrito
    marginRight: 8, 
  },

  // 🔽 Mensaje flotante
  messageBox: {
    position: "absolute",
    left: 16,
    right: 16,
    top: DROPDOWN_TOP,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  messageText: {
    textAlign: "center",
    color: "#444",
    fontSize: 15,
    fontWeight: "500",
  },

  // 📦 Caja de resultados flotante
  resultsBox: {
    position: "absolute",
    left: 16,
    right: 16,
    top: DROPDOWN_TOP,
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
    zIndex: 20,
  },

  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
});