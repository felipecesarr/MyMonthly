import React from 'react';
import {Modal,Text,TouchableOpacity,FlatList, TouchableWithoutFeedback} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMonth: (month: string) => void;
}

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
  'Anual',
];

const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
  onSelectMonth,
}) => {
  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.monthItem}
      onPress={() => {
        onSelectMonth(item);
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
          data={months}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.flatlist}
        />
      </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MonthPickerModal;
