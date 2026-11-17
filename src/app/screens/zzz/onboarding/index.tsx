import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { completeOnboarding } from '../../../../lib/onboarding-state';
import type { RootStackParamList } from '../../../../navigation/stack';

type OnboardingNavigation = NavigationProp<RootStackParamList, 'Onboarding'>;

type Slide = {
  id: string;
  title: string;
  description: string;
  visual: 'dashboard' | 'categories' | 'pin';
  image?: ImageSourcePropType;
};

const slides: Slide[] = [
  {
    id: 'dashboard',
    title: 'Tudo do mês.\nNo mesmo lugar.',
    description: 'Contas, cartões, orçamento e saldo em uma visão direta.',
    visual: 'dashboard',
    image: require('../../../../../assets/onboardingScreens/screen-2.png'),
  },
  {
    id: 'categories',
    title: 'Veja para onde\ncada real foi.',
    description: 'Categorias mostram o que pesa no mês antes que vire surpresa.',
    visual: 'categories',
    image: require('../../../../../assets/onboardingScreens/screen-6.png'),
  },
  {
    id: 'pin',
    title: 'Entre com\n4 números.',
    description: 'Seu email confirma a conta. Seu PIN abre o app neste aparelho.',
    visual: 'pin',
  },
];

function ProductVisual({ slide, width, compact }: { slide: Slide; width: number; compact: boolean }) {
  const imageWidth = width * 1.24;
  const imageHeight = imageWidth * (2688 / 1242);
  const top = imageHeight * -0.245;

  return (
    <View style={[styles.productWindow, compact && styles.productWindowCompact, { width }]}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={slide.image}
        style={[
          styles.productImage,
          {
            width: imageWidth,
            height: imageHeight,
            left: (width - imageWidth) / 2,
            top,
          },
        ]}
      />
    </View>
  );
}

function PinVisual({ width, compact }: { width: number; compact: boolean }) {
  return (
    <View style={[styles.pinPanel, compact && styles.productWindowCompact, { width }]}>
      <View style={styles.pinPanelTop}>
        <Text style={styles.pinPanelBrand}>MYMONTHLY</Text>
        <Text style={styles.pinPanelStep}>04 / 04</Text>
      </View>

      <View style={styles.pinPanelContent}>
        <Text style={styles.pinPanelLabel}>PIN DE ACESSO</Text>
        <View style={styles.pinCells}>
          {[0, 1, 2, 3].map((item) => (
            <View key={item} style={styles.pinCell}>
              <View style={styles.pinDot} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.pinPanelBottom}>
        <View style={styles.verifiedDot} />
        <Text style={styles.pinPanelMeta}>EMAIL VERIFICADO · PIN LOCAL</Text>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const navigation = useNavigation<OnboardingNavigation>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const compact = height < 760;
  const visualWidth = Math.min(width - (compact ? 40 : 48), 430);

  const haptic = useCallback((kind: 'light' | 'success') => {
    if (process.env.EXPO_OS !== 'ios') return;
    if (kind === 'success') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const finish = useCallback(
    async (destination: 'LogIn' | 'Register') => {
      await completeOnboarding();
      haptic('success');
      navigation.reset({ index: 0, routes: [{ name: destination }] });
    },
    [haptic, navigation],
  );

  const next = useCallback(() => {
    if (currentIndex === slides.length - 1) {
      void finish('Register');
      return;
    }

    listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    haptic('light');
  }, [currentIndex, finish, haptic]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken<Slide>> }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === 'number') setCurrentIndex(nextIndex);
    },
  ).current;

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.15, 1, 0.15],
      extrapolate: 'clamp',
    });
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [24, 0, -24],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width, paddingHorizontal: compact ? 20 : 24 }]}>
        <Animated.View style={[styles.copy, { opacity, transform: [{ translateX }] }]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
          <Text style={[styles.description, compact && styles.descriptionCompact]}>
            {item.description}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.visual, { opacity, transform: [{ translateX }] }]}>
          {item.visual === 'pin' ? (
            <PinVisual compact={compact} width={visualWidth} />
          ) : (
            <ProductVisual compact={compact} slide={item} width={visualWidth} />
          )}
        </Animated.View>
      </View>
    );
  };

  const lastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brand}>
          <Ionicons name="calendar-clear" size={21} color="#171717" />
          <Text style={styles.brandText}>MyMonthly</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Entrar em uma conta existente"
          hitSlop={12}
          onPress={() => void finish('LogIn')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.loginLink}>Entrar</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={slides}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 8 }]}>
        <View style={styles.pagination}>
          <Text style={styles.pageNumber}>0{currentIndex + 1}</Text>
          <View style={styles.progressTrack}>
            {slides.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.progressSegment, index <= currentIndex && styles.progressSegmentActive]}
              />
            ))}
          </View>
          <Text style={styles.pageNumber}>0{slides.length}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lastSlide ? 'Criar minha conta' : 'Continuar'}
          onPress={next}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>{lastSlide ? 'Criar conta' : 'Continuar'}</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#171717',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  loginLink: {
    color: '#171717',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: '#A8A8A2',
  },
  pressed: {
    opacity: 0.5,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
    paddingBottom: 4,
  },
  copy: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    gap: 12,
  },
  title: {
    maxWidth: 380,
    color: '#171717',
    fontSize: 40,
    lineHeight: 43,
    fontWeight: '700',
    letterSpacing: -1.65,
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 37,
    letterSpacing: -1.3,
  },
  description: {
    maxWidth: 360,
    color: '#686864',
    fontSize: 16,
    lineHeight: 23,
  },
  descriptionCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  visual: {
    alignItems: 'center',
  },
  productWindow: {
    height: 360,
    overflow: 'hidden',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#EEEEEA',
    borderWidth: 1,
    borderColor: '#E1E1DC',
  },
  productWindowCompact: {
    height: 292,
  },
  productImage: {
    position: 'absolute',
  },
  pinPanel: {
    height: 360,
    padding: 22,
    justifyContent: 'space-between',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#191919',
  },
  pinPanelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinPanelBrand: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pinPanelStep: {
    color: '#8D8D88',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pinPanelContent: {
    gap: 17,
  },
  pinPanelLabel: {
    color: '#A4A49E',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  pinCells: {
    flexDirection: 'row',
    gap: 9,
  },
  pinCell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: '#292929',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B669EF',
  },
  pinPanelBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#54B782',
  },
  pinPanelMeta: {
    color: '#A4A49E',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
    backgroundColor: '#FAFAF8',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageNumber: {
    color: '#777773',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#DEDED9',
  },
  progressSegmentActive: {
    backgroundColor: '#171717',
  },
  primaryButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: '#171717',
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
