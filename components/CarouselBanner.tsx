import React, { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

// Simulación de PortadaSkeleton si no existe
const PortadaSkeleton = () => (
  <View
    style={{
      width: "95%",
      height: "100%",
      backgroundColor: "#eee",
      borderRadius: 8,
    }}
  />
);

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export interface Portada {
  id_portada: number;
  url_imagen: string;
  link_destino: string | null;
  activo?: boolean;
  metadatos?: any;
}

interface Props {
  portadas: Portada[];
  loading?: boolean;
  itemWidth?: number; // ancho de cada portada
  gap?: number; // separación entre portadas
  onPressPortada?: (portada: Portada, index: number) => void;
  autoplay?: boolean; // activar / desactivar autoplay
  autoplayIntervalMs?: number; // intervalo entre slides
}

// Altura responsiva basada en el ancho de la ventana
const HEIGHT = (() => {
  if (WINDOW_WIDTH >= 1024) return 400; // lg
  if (WINDOW_WIDTH >= 768) return 300; // md
  return 180; // base
})();

export const CarouselBanner: React.FC<Props> = ({
  portadas,
  loading = false,
  itemWidth = WINDOW_WIDTH, // usamos el ancho de la ventana como base
  gap = 4,
  onPressPortada,
  autoplay = true,
  autoplayIntervalMs = 4000,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Duplicamos para dar sensación de loop visual
  const data = useMemo(
    () => (portadas.length > 0 ? [...portadas, ...portadas] : []),
    [portadas]
  );
  const items = data.length > 0 ? data : portadas;

  // Cada ítem usa TODO el ancho del carrusel
  const effectiveItemWidth = itemWidth;
  const snapInterval = effectiveItemWidth + gap;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const onContentSizeChange = (w: number) => {
    contentWidthRef.current = w;
  };

  const onLayout = (e: any) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  };

  const getMaxOffset = () => {
    // El máximo offset es el ancho total del contenido menos el ancho visible del contenedor
    const maxOffset = contentWidthRef.current - containerWidthRef.current;
    return maxOffset > 0 ? maxOffset : 0;
  };

  const handleNext = () => {
    if (!scrollRef.current) return;

    const slideSize = snapInterval;
    const maxOffset = getMaxOffset();

    // Si solo hay un item (o el maxOffset es 0), no hacer nada
    if (maxOffset === 0 || portadas.length <= 1) return;

    let target = scrollXRef.current + slideSize;

    // Límite del contenido original (primera mitad de 'items')
    const originalContentEnd = portadas.length * slideSize;
    const isAtEnd = scrollXRef.current >= originalContentEnd - 1; // tolerancia

    if (isAtEnd) {
      // Volvemos al inicio sin animación, luego avanzamos al segundo slide
      scrollRef.current.scrollTo({ x: 0, animated: false });
      target = slideSize;
      scrollXRef.current = 0;
    }

    scrollRef.current.scrollTo({ x: target, animated: true });
    scrollXRef.current = target;
  };

  const startAutoplay = () => {
    if (!autoplay || portadas.length <= 1 || autoplayTimerRef.current) return;

    autoplayTimerRef.current = setInterval(() => {
      handleNext();
    }, autoplayIntervalMs);
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  // Control de autoplay
  useEffect(() => {
    if (autoplay) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => {
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, autoplayIntervalMs, portadas.length, itemWidth, gap]);

  // Estados de carga / vacío
  if (loading || portadas.length === 0) {
    return (
      <View
        style={[
          styles.carouselWrapper,
          { height: HEIGHT, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <PortadaSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={[styles.carouselWrapper, { height: HEIGHT }]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          keyboardShouldPersistTaps="always"
          onScrollBeginDrag={stopAutoplay}
          onScrollEndDrag={startAutoplay}
          onTouchStart={stopAutoplay}
          onTouchEnd={startAutoplay}
          decelerationRate="fast"
          snapToInterval={snapInterval}
          snapToAlignment="start"
          contentContainerStyle={[
            styles.track,
            {
              columnGap: gap,
              // Sin padding horizontal para que no aparezcan barras blancas
              paddingHorizontal: 0,
            },
          ]}
        >
          {items.map((item, index) => (
            <View
              key={`portada-${item.id_portada}-${index}`}
              style={{
                width: effectiveItemWidth,
                height: HEIGHT,
              }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  stopAutoplay();
                  const originalIndex = index % portadas.length;
                  onPressPortada?.(portadas[originalIndex], originalIndex);
                  setTimeout(startAutoplay, 500);
                }}
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              >
                <Image
                  source={{ uri: item.url_imagen }}
                  accessibilityLabel={`Portada ${item.id_portada}`}
                  style={styles.image}
                  resizeMode="cover" // cubre todo el contenedor sin deformarse
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
  },
  carouselWrapper: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden", // recorta la imagen dentro del borderRadius
    backgroundColor: "white",
  },
  track: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
