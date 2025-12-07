import { Dimensions, Image, StyleSheet, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

export function ProductCarousel({ imagenes }: { imagenes: any[] }) {
  return (
    <View style={styles.carouselWrapper}>
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        data={imagenes}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.url_imagen }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
        )}
        keyExtractor={(item, index) => `${item.url_imagen}-${index}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  slide: {
    width,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: width * 0.8,
    height: 180,
    borderRadius: 12,
  },
});
