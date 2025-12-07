// Title.native.tsx (versión mínima de verificación)
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  showDivider?: boolean;
  style?: any;
  titleStyle?: any;
  subtitleStyle?: any;
}

const Title: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  showDivider = true,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>{icon}</View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
        </View>
      </View>

      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { marginTop: 8, 
     marginBottom: 8,backgroundColor: "transparent" },
  row: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    height: 40, width: 40, borderRadius: 12,
    backgroundColor: "#f4f4f5", borderWidth: 1, borderColor: "#e4e4e7",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  textWrap: { flex: 1, minWidth: 0, backgroundColor: "transparent" },
  title: { fontSize: 20, fontWeight: "600", lineHeight: 26, color: "#111" },
  subtitle: { marginTop: 2, fontSize: 13, color: "#333" },
  divider: { marginTop: 6, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(113,113,122,0.6)" },
});

export default Title;
