import React, { useRef } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { Colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  percent: number;
  budget: number;
  primaryColor?: string;   // Cor principal para textos ou bordas
  secondaryColor?: string;
  boldColor?: string;
}

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMonth: string;
  totalBudget: number;
  categories: Category[];
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  selectedMonth,
  totalBudget,
  categories,
}) => {
    // Crie uma referência para a view que contém o relatório
    const viewRef = useRef<View>(null);

    // Função para capturar a view e compartilhar a imagem
    const handleDownload = async () => {
      try {
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          alert('Compartilhamento não está disponível neste dispositivo');
        }
      } catch (error) {
        console.error('Erro ao capturar imagem:', error);
      }
    };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent} ref={viewRef}>

              <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              <View>
                <Text style={styles.headerText}>Orçamento de {selectedMonth}</Text>
                 <Text style={styles.totalText}>
                  Total: {formatCurrency(totalBudget)}
                </Text>
              </View>

                <TouchableOpacity onPress={handleDownload}>
                  <Ionicons name="download-outline" size={34} color="#989898" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                  {categories.map((category) => {
                    const categoryPercentage = totalBudget > 0 
                      ? (category.budget / totalBudget) * 100 
                      : 0;
                    return (
                      <View key={category.id} style={styles.categoryRow}>
                        <Text style={styles.categoryText}>
                          {category.emoji} {category.name}
                        </Text>

                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',width: '48%'}}>
                        <Text style={styles.categoryText}>
                          {formatCurrency(category.budget)}
                        </Text>
                        <View style={{
                          backgroundColor: category.secondaryColor,
                          borderRadius: 100,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          }}>
                          <Text style={[styles.categoryText, {color: category.boldColor}]}>
                          {categoryPercentage.toFixed(0)}%
                          </Text>
                        </View>
                        </View>

                      </View>
                    );
                  })}
                </ScrollView>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    color: Colors.text,
  },
  totalText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 22,
    color: '#747474',
    fontWeight: 'bold'
  },
  scrollContainer: {
    flexGrow: 0,
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  categoryText: {
    fontSize: 16,
    color: Colors.gray95,
  },
  closeButton: {
    backgroundColor: '#212121',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
