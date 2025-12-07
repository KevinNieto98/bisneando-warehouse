import * as Lucide from "lucide-react-native"; // 👈 versión RN
import { Tags } from "lucide-react-native"; // fallback
import React from "react";

export type AnyIcon = React.ComponentType<{
  color?: string;
  size?: number;
}>;

const ICONS = Lucide as unknown as Record<string, AnyIcon>;

interface IconoProps {
  name?: string; // nombre del icono, ej: "ShoppingCart"
  size?: number;
  color?: string;
}

export function Icono({
  name,
  size = 16,
  color = "#52525b",
  ...rest
}: IconoProps) {
  // fallback si no hay nombre válido
  const LucideIcon =
    (name ? (ICONS[name as keyof typeof ICONS] as AnyIcon | undefined) : undefined) ?? Tags;

  return <LucideIcon size={size} color={color} {...rest} />;
}

export default Icono;
