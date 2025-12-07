// components/skeletons/ExploreSkeleton.tsx
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

// --- AJUSTES CLAVE ---
// 1. Usaremos 3 columnas (numColumns={3}).
const NUM_COLUMNS = 3;
// 2. Definimos el espacio deseado entre las tarjetas (gap).
const ITEM_GAP = 8;
// 3. El padding horizontal total del ScrollView es 32 (16 + 16).
const SCREEN_PADDING = 32;

// Cálculo del ancho: (Ancho total disponible - (Gap interno * (Columnas - 1))) / Columnas
const CARD_WIDTH = (width - SCREEN_PADDING - (ITEM_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
// ---------------------

const ExploreSkeleton = () => {
  // placeholders: 9 para asegurar 3 filas completas
  const placeholders = Array.from({ length: 9 }).map((_, i) => ({ id: i.toString() }));

  // Reemplazamos la FlatList por un View que renderiza la rejilla para simplicidad
  // y para evitar problemas de anidamiento de ScrollView/FlatList.

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔹 Chips (categorías) */}
      <View style={styles.chipsRow}>
        {[...Array(5)].map((_, idx) => (
          <View key={idx} style={styles.chip} />
        ))}
      </View>

      {/* 🔹 Grid de productos (Usamos un View simple con FlexWrap) */}
      <View style={styles.gridContainer}>
        {placeholders.map((item, index) => (
          <View 
            key={item.id} 
            style={[
              styles.card,
              // Aplicamos margen derecho solo si no es la última columna
              (index + 1) % NUM_COLUMNS !== 0 && { marginRight: ITEM_GAP },
              // Aplicamos margen inferior (gap)
              { marginBottom: ITEM_GAP }
            ]} 
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default ExploreSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 16, // Padding de 16, total 32 horizontal
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  
  // --- ESTILOS DE LA REJILLA REPARADOS ---
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Alineamos a la izquierda
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH, // Ancho calculado correctamente para 3 columnas
    height: 140, // Altura ajustada para que no sea excesivamente grande
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    // Eliminamos 'margin' y usamos marginRight y marginBottom condicionalmente arriba
  },
  // ----------------------------------------
});