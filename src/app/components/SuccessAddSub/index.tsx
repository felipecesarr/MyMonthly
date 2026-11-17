import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type SuccessAlertProps = {
  message: string;
  onClose: () => void;
};

export default function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      // Animação de saída
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onClose);
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
      <MaterialIcons name="check-circle" size={24} color={Colors.background} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: Colors.text,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
    gap: 20,
  },
  text: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
});
