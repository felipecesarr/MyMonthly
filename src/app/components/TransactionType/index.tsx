import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface TransactionTypeProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

const Types = [
  { id: '1', typeName: 'Receita', typeIcon: <Feather name="arrow-up-right" size={24} color={Colors.text} /> },
  { id: '2', typeName: 'Despesa', typeIcon: <Feather name="arrow-down-right" size={24} color={Colors.text} /> },
  { id: '3', typeName: 'Transferência', typeIcon: <FontAwesome6 name="arrows-rotate" size={20} color={Colors.text} /> },
  { id: '4', typeName: 'Fatura', typeIcon: <MaterialCommunityIcons  name="credit-card-sync" size={20} color={Colors.text} /> },
];

const TransactionType: React.FC<TransactionTypeProps> = ({
  visible,
  onClose,
  onSelectType,
}) => {
  const renderItem = ({ item }: { item: { id: string; typeName: string; typeIcon: React.ReactElement } }) => (
    <TouchableOpacity
      style={styles.monthItem}
      onPress={() => {
        onSelectType(item.typeName);
        onClose();
      }}
    >
      <View style={styles.itemContent}>
        {item.typeIcon}
        <Text style={styles.monthText}>{item.typeName}</Text>
      </View>
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
            data={Types}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatlist}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TransactionType;
