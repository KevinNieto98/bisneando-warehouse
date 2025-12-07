// PortadaSkeleton.tsx
import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"

const { width } = Dimensions.get("window")

const HEIGHT = (() => {
  if (width >= 1024) return 400
  if (width >= 768) return 300
  return 180
})()

const PortadaSkeleton = () => {
  return (
    <View style={[styles.carouselWrapper, { height: HEIGHT }]}>
      <View style={styles.slide}>
        <View style={styles.skeletonBox} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  carouselWrapper: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  slide: {
    width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonBox: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e7eb", // gris claro
  },
})
export default PortadaSkeleton;