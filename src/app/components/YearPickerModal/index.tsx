// YearPickerModal.tsx
import React from 'react';
import {
  Modal, Text, TouchableOpacity,
  FlatList, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { useYear } from '../../../contexts/YearContext/index'; // Ajuste o caminho

interface YearPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectYear: (year: string) => void;
}

const years = ["2025","2026","2027","2028","2029","2030"];

const YearPickerModal: React.FC<YearPickerModalProps> = ({
  visible,
  onClose,
}) => {
  // Aqui consumimos o contexto
  const { setSelectedYear } = useYear();

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.monthItem}
      onPress={() => {
        // Define o ano no contexto
        setSelectedYear(item);
        // Fecha o modal
        onClose();
      }}
    >
      <Text style={styles.monthText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <SafeAreaView style={styles.modalContent}>
          <FlatList
            data={years}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.flatlist}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default YearPickerModal;
