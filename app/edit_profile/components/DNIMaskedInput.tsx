// components/inputs/DNIMaskedInput.tsx
import FloatingInput from "@/components/ui/FloatingInput";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  /** Puede venir en crudo ("0801199912345") o formateado ("0801-1999-12345") */
  value?: string | null;
  /** Te devolvemos el valor formateado (con guiones) cada vez que cambia */
  onChangeMasked?: (masked: string) => void;
  /** Te devolvemos el valor crudo (solo dígitos) cada vez que cambia */
  onChangeRaw?: (raw: string) => void;
  /** Campo requerido (solo para UI) */
  required?: boolean;
  /** Deshabilitar input */
  disabled?: boolean;
  /** Muestra la leyenda debajo */
  showHint?: boolean;
};

const MAX_DIGITS = 13; // 0000 0000 00000 -> 13 dígitos
const MAX_LEN_WITH_DASHES = 15; // 4 + 1 + 4 + 1 + 5

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const formatDNI = (raw: string) => {
  const d = onlyDigits(raw).slice(0, MAX_DIGITS);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
};

const toRaw = (maybeMasked: string) => onlyDigits(maybeMasked).slice(0, MAX_DIGITS);

export const isValidDNI = (value?: string | null) => {
  if (!value) return false;
  return toRaw(value).length === MAX_DIGITS;
};

export default function DNIMaskedInput({
  value,
  onChangeMasked,
  onChangeRaw,
  required,
  disabled,
  showHint = true,
}: Props) {
  // normalizamos el valor inicial (tolera null o ya formateado)
  const initialMasked = useMemo(() => formatDNI(value ?? ""), [value]);
  const [masked, setMasked] = useState(initialMasked);
  const [touched, setTouched] = useState(false);

  // Si el padre cambia `value`, sincronizamos
  useEffect(() => {
    const nextMasked = formatDNI(value ?? "");
    setMasked(nextMasked);
  }, [value]);

  const handleChangeText = (text: string) => {
    // permitimos que el usuario pegue con o sin guiones; siempre lo normalizamos
    const raw = toRaw(text);
    const nextMasked = formatDNI(raw);
    setMasked(nextMasked);
    onChangeMasked?.(nextMasked);
    onChangeRaw?.(raw);
  };

  const valid = isValidDNI(masked);

  return (
    <View style={styles.container}>
      <FloatingInput
        label="DNI"
        value={masked}
        onChangeText={handleChangeText}
        required={required}
        disabled={disabled}
        keyboardType="number-pad"
        placeholder="0000-0000-00000"
        maxLength={MAX_LEN_WITH_DASHES}
        onBlur={() => setTouched(true)}
        autoComplete="off"
        autoCorrect={false}
      />



      {touched && !valid && masked.length > 0 && (
        <Text style={styles.error}>DNI incompleto. Debe tener 13 dígitos.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  hint: { marginTop: 4, fontSize: 12, color: "#6b7280" },
  error: { marginTop: 4, fontSize: 12, color: "#dc2626", fontWeight: "600" },
});
