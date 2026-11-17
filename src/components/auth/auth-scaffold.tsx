import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthScaffoldProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
};

export function AuthScaffold({
  eyebrow,
  title,
  description,
  children,
  footer,
  onBack,
}: AuthScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 10,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          },
        ]}
      >
        <View style={styles.page}>
          <View style={styles.topBar}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={12}
                onPress={onBack}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={22} color="#171717" />
              </Pressable>
            ) : null}

            <View style={styles.brand}>
              <Ionicons name="calendar-clear" size={21} color="#171717" />
              <Text style={styles.brandText}>MyMonthly</Text>
            </View>
          </View>

          <View style={styles.heading}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  page: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
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
  pressed: {
    opacity: 0.5,
  },
  heading: {
    gap: 9,
    marginTop: 54,
  },
  eyebrow: {
    color: '#777773',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 390,
    color: '#171717',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -1.15,
  },
  description: {
    maxWidth: 390,
    color: '#696965',
    fontSize: 16,
    lineHeight: 23,
  },
  body: {
    width: '100%',
    gap: 20,
    marginTop: 38,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
});
