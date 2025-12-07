import { Category } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoriesContainerProps {
  categories: Category[];
  /** Id de la categoría seleccionada; si no se pasa, el componente es no-controlado */
  selectedId?: number | "all";
  /** Callback al seleccionar una categoría (o "all" para Todo) */
  onSelect?: (id: number | "all") => void;
}

const YELLOW = "#FFD600";
const PALE_YELLOW = "#FFF4A3";

export const CategoriesContainer: React.FC<CategoriesContainerProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // estado interno si no es controlado
  const [internalSelected, setInternalSelected] = useState<number | "all">("all");
  const currentSelected = selectedId ?? internalSelected;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setAtStart(contentOffset.x <= 0);
    setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 1);
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  const select = (id: number | "all") => {
    if (onSelect) onSelect(id);
    else setInternalSelected(id);
  };

  const chips = useMemo(() => {
    // Insertamos "Todo" al principio como entrada virtual
    return [
      { id_categoria: "all" as const, nombre_categoria: "Todo", _isAll: true },
      ...categories.map((c) => ({ ...c, _isAll: false })),
    ];
  }, [categories]);

  return (
    <View style={styles.container}>
      {!atStart && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => scrollBy(-100)}
          accessibilityRole="button"
          accessibilityLabel="Desplazar categorías hacia la izquierda"
        >
          <Ionicons name="chevron-back" size={20} color="#444" />
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((cat) => {
          const id = (cat as any).id_categoria as number | "all";
          const label = (cat as any).nombre_categoria as string;
          const isAll = (cat as any)._isAll as boolean;
          const isSelected = currentSelected === id;

          return (
            <TouchableOpacity
              key={`${id}`}
              onPress={() => select(id)}
              style={[
                styles.chip,
                isAll ? { backgroundColor: PALE_YELLOW } : { backgroundColor: YELLOW },
                isSelected && styles.chipSelected,
              ]}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Categoría ${label}${isSelected ? " seleccionada" : ""}`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!atEnd && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => scrollBy(100)}
          accessibilityRole="button"
          accessibilityLabel="Desplazar categorías hacia la derecha"
        >
          <Ionicons name="chevron-forward" size={20} color="#444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 10,
  },
  navButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipSelected: {
    borderColor: "#111827",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  chipTextSelected: {
    textDecorationLine: "underline",
  },
});
