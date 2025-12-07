import { Category } from "@/store/useAppStore";
import { router } from "expo-router";
import React, { useRef } from "react";
// Asegúrate de importar PressableStateCallbackType si es necesario para el tipado, 
// pero Pressable y el tipado general deberían ser suficientes.
import { Platform, Pressable, PressableStateCallbackType, StyleSheet, Text, View } from "react-native";
import Icono from "./ui/Icon.native";

type Props = {
  categories: Category[];
};

const pastelColors = [
  "#FDE68A",
  "#BBF7D0",
  "#FBCFE8",
  "#FECACA",
  "#E9D5FF",
  "#A5F3FC",
];

const CategorySection: React.FC<Props> = ({ categories }) => {
  
  // Usamos un ref para controlar si ya hemos iniciado la navegación, evitando dobles clics
  const isNavigating = useRef(false);

  const goToExplore = (categoryId?: number) => {
    // Evita doble navegación
    if (isNavigating.current) return;
    isNavigating.current = true;
    
    // Deberías ver este log si el onPressIn se dispara
    console.log("GO TO EXPLORE ->", categoryId); 

    // Usamos un setTimeout mínimo (50ms) para diferir la navegación.
    // Esto evita que iOS lo confunda con un gesto de scroll al salir del componente.
    setTimeout(() => {
        if (categoryId != null) {
            router.push(`/explore?categoryId=${categoryId}`);
        } else {
            router.push("/explore");
        }
        
        // Resetear el estado después de una breve pausa
        setTimeout(() => {
            isNavigating.current = false;
        }, 300); 
    }, 50); 
  };

  return (
    <View style={styles.container}>
      {categories.map((item, index) => {
        const bgColor = pastelColors[index % pastelColors.length];

        return (
          // Usamos Pressable y onPressIn
          <Pressable
            key={item.id_categoria}
            style={({ pressed }: PressableStateCallbackType) => [
                styles.card, 
                { backgroundColor: bgColor },
                Platform.OS === 'ios' && pressed && { opacity: 0.7 } 
            ]}
            onPressIn={() => goToExplore(item.id_categoria)} 
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            // *** delayPressIn ELIMINADO ***
          >
            <View style={styles.iconWrapper}>
              <Icono name={item.icono || "Tag"} size={22} color="black" />
            </View>
            <Text style={styles.text}>{item.nombre_categoria}</Text>
          </Pressable>
        );
      })}

      <Pressable
        style={({ pressed }: PressableStateCallbackType) => [
            styles.card, 
            { backgroundColor: "#f4f4f5" },
            Platform.OS === 'ios' && pressed && { opacity: 0.7 } 
        ]}
        onPressIn={() => goToExplore()}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        // *** delayPressIn ELIMINADO ***
      >
        <View style={styles.iconWrapper}>
          <Icono name="EllipsisHorizontal" size={22} color="black" />
        </View>
        <Text style={styles.text}>Ver más</Text>
      </Pressable>
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 6,
    zIndex: 1,
  },
  card: {
    width: "30%",
    minWidth: 90,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
});