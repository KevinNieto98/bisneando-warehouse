import { ProductActions } from "@/components/product/ProductActions";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  cantidad: number;
  setCantidad: (n: number) => void;
};

export default function ProductQuantitySection({ cantidad, setCantidad }: Props) {
  const clamp = (val: number) => Math.max(1, Math.min(999999, val));

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Cantidad / Stock</Text>
      <ProductActions
        cantidad={cantidad}
        setCantidad={(n) => setCantidad(clamp(n))}
        maxQty={999999}
      />
    </View>
  );
}
