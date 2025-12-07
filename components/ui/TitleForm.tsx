// components/Title.tsx
import React from "react";
import { StyleSheet, Text } from "react-native";

interface TitleProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export default function TitleForm({ text, size = "md" }: TitleProps) {
  const sizeMap: Record<NonNullable<TitleProps["size"]>, number> = {
    sm: 14,
    md: 16,
    lg: 24,
    xl: 28,
    "2xl": 32,
    "3xl": 36,
  };

  return <Text style={[styles.title, { fontSize: sizeMap[size] }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 10,
    marginBottom: 10,
  },
});
