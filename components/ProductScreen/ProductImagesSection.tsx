import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { EditableImage } from "../../app/product/_types";
import { styles } from "./styles";

type Props = {
  imagenes: EditableImage[];
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export default function ProductImagesSection({ imagenes, onRemove, onAdd }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Imágenes</Text>

      <View style={styles.imagesWrap}>
        {imagenes.map((img) => (
          <View key={img.id} style={styles.imageCard}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity
              onPress={() => onRemove(img.id)}
              style={styles.deleteBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={onAdd} style={styles.addImageCard} activeOpacity={0.85}>
          <Ionicons name="images-outline" size={22} color="#111" />
          <Text style={styles.addImageText}>Agregar imágenes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
