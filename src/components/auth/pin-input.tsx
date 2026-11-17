import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { normalizePin } from '../../lib/app-pin';

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  label?: string;
};

export function PinInput({
  value,
  onChange,
  error = false,
  autoFocus = false,
  disabled = false,
  label = 'PIN de quatro dígitos',
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      accessible={false}
      onPress={() => inputRef.current?.focus()}
      style={styles.wrapper}
    >
      <View pointerEvents="none" style={styles.cells}>
        {Array.from({ length: 4 }, (_, index) => {
          const filled = index < value.length;
          const active = index === value.length && !disabled;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                active && styles.cellActive,
                error && styles.cellError,
              ]}
            >
              <Text style={styles.dot}>{filled ? '•' : ''}</Text>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        accessibilityLabel={`${label}. ${value.length} de 4 dígitos preenchidos.`}
        autoFocus={autoFocus}
        caretHidden
        contextMenuHidden
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(text) => onChange(normalizePin(text))}
        secureTextEntry
        selectionColor="transparent"
        style={styles.hiddenInput}
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 68,
    justifyContent: 'center',
  },
  cells: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
    maxWidth: 76,
    aspectRatio: 1,
    minHeight: 62,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1ED',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },
  cellActive: {
    borderWidth: 1.5,
    borderColor: '#171717',
  },
  cellError: {
    borderColor: '#C9364E',
    backgroundColor: '#FFF8F8',
  },
  dot: {
    color: '#171717',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    color: 'transparent',
  },
});
