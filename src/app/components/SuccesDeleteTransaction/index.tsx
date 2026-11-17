import React, { useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../../constants/colors';
import { styles } from './styles'; // crie/adapte seu styles

type SuccessDeleteTransactionProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number; 
};

export default function SuccessDeleteTransaction({
  visible,
  message,
  onClose,
  duration = 3000
}: SuccessDeleteTransactionProps) {
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (visible) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, duration, onClose]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Ícone diferente, se quiser */}
          <Ionicons name="checkmark-circle" size={64} color={Colors.text} />
          <Text style={styles.alertMessage}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
