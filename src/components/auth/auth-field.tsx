import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  leading?: ReactNode;
};

export function AuthField({ label, error, leading, style, ...props }: AuthFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error && styles.fieldError]}>
        {leading}
        <TextInput
          {...props}
          placeholderTextColor="#9A9A94"
          selectionColor="#820AD1"
          style={[styles.input, style]}
        />
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" selectable style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    color: '#30302E',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  field: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    backgroundColor: '#F1F1ED',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },
  fieldError: {
    borderColor: '#C9364E',
    backgroundColor: '#FFF8F8',
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 0,
    color: '#171717',
    fontSize: 16,
  },
  error: {
    color: '#B3263E',
    fontSize: 12,
    lineHeight: 17,
  },
});
