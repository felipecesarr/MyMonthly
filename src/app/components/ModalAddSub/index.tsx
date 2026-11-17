import React, { useState } from 'react';
import { View, Text, Modal, TextInput, KeyboardAvoidingView, Platform, Pressable, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../../constants/colors';
import Button from '../button';
import { styles } from '../../screens/categories/styles';

type ModalAddSubProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (emoji: string, name: string, budget: number) => void;
  selectedCategory: Category | null;
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  percent: number;
  color: string; 
  primaryColor: string; 
  secondaryColor: string; 
  boldColor: string; 
  colorProgress: string; 
  budget: number;
};

const formatCurrency = (value: string) => {
  const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ModalAddSub({ visible, onClose, onAdd, selectedCategory }: ModalAddSubProps) {
  const [emoji, setEmoji] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [budget, setBudget] = useState('');

  const handleAdd = () => {
    const budgetValue = parseFloat(budget.replace(/\D/g, '')) / 100;
    if (!isNaN(budgetValue)) {
      onAdd(emoji, subCategoryName, budgetValue); 
      setEmoji('');
      setSubCategoryName('');
      setBudget('');
      onClose();  // Fecha o modal após adicionar a subcategoria
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
     
      <Pressable style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
      <Pressable onPress={onClose} style={{flex: 1, width: '100%', height: '20%'}}/> 
      
        {/* Modal Content */}
        <ScrollView style={styles.addSubCategoryModal}
         contentContainerStyle={{ alignItems: 'center', gap: 20, paddingTop: 0,}}
         showsVerticalScrollIndicator={false}
         >

        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
        <View
          style={[
            styles.texteHeaderView,
            {
              backgroundColor: selectedCategory?.secondaryColor,
              alignSelf: 'flex-start',
              marginHorizontal: 20,
            },
          ]}
        >
          <Text>{selectedCategory?.emoji}</Text>
          <Text style={[styles.textMovements, { color: selectedCategory?.boldColor }]}>
            {selectedCategory?.name}
          </Text>
        </View>
        <Pressable
          onPress={handleAdd}
          style={[
            styles.texteHeaderView,
            {
              backgroundColor: selectedCategory?.boldColor,
              alignSelf: 'flex-start',
              marginHorizontal: 20,
              borderRadius: 10,
            },
          ]}
        >
          <Text style={[styles.textMovements, { color: Colors.background }]}>
            Adicionar
          </Text>
        </Pressable>

      </View>


          <Text style={styles.modalTitle}>Adicione um emoji</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: 🧼"
            value={emoji}
            onChangeText={setEmoji}
            placeholderTextColor={Colors.gray95}
          />

          <Text style={styles.modalTitle}>Adicione um nome</Text>
          <TextInput
            style={styles.textInput}
            placeholder="ex: limpeza"
            value={subCategoryName}
            onChangeText={setSubCategoryName}
            placeholderTextColor={Colors.gray95}
          />

          <Text style={styles.modalTitle}>Adicione um orçamento</Text>
          <TextInput
            style={styles.textInputBudget}
            placeholder="R$ 0,00"
            value={budget}
            keyboardType="numeric"
            onChangeText={(value) => setBudget(formatCurrency(value))}
            placeholderTextColor={Colors.gray95}
          />
        </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
