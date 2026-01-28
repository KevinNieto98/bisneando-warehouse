// components/ProductScreen/styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 6 },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: "#fff",
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  imagesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  imageCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },

  image: { width: "100%", height: "100%" },

  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  addImageCard: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  addImageText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },

  saveBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveBtnDisabled: { opacity: 0.7 },

  saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
