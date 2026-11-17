import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { Colors } from '../../../constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

type SuccessTransactionsProps = {
  message: string;
  onClose: () => void;
  successVisible: boolean;
};

export default function SuccessTransactions({ successVisible, message, onClose }: SuccessTransactionsProps) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Timer para a animação de saída
    const timer = setTimeout(() => {
      // Animação de saída
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onClose);
    }, 4000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onClose]);

  return (
    <Modal
    transparent
    visible={successVisible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.alertContainer}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.text} />
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
    </View>
  </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertContainer: {
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertMessage: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});