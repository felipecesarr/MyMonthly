import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Alert,
  Animated,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { styles } from './styles';
import { banksList } from '../../../constants/bankList';
import { Colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// Firebase imports
import { getFirestore, collection, addDoc, getAuth } from '../../../services/api/legacy-data';

const db = getFirestore();
const auth = getAuth();

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (balance: number, bank: string) => void;
}

// Função para formatar valores monetários
const formatCurrency = (value: string) => {
  const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função para formatar o número do cartão
const formatCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  const limited = cleaned.slice(0, 16);
  const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
  return formatted;
};

// Função para formatar a validade
const formatValidate = (validate: string): string => {
  const cleaned = validate.replace(/\D/g, '');
  const limited = cleaned.slice(0, 4);
  if (limited.length > 2) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  }
  return limited;
};

const AddCardModal: React.FC<AddCardModalProps> = ({ visible, onClose, onSave }) => {
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [validate, setValidate] = useState<string>('');
  const [bankSelectorModalVisible, setBankSelectorModalVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Get the selected bank data
  const selectedBankData = banksList.find((bank) => bank.id === selectedCard);
  
  // Set a default bank if none is selected
  useEffect(() => {
    if (!selectedCard && banksList.length > 0) {
      setSelectedCard(banksList[0].id);
    }
  }, []);
  
  // Animation when the modal becomes visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset values when modal closes
      resetForm();
    }
  }, [visible]);
  
  // Reset form fields
  const resetForm = () => {
    setSelectedCard(banksList.length > 0 ? banksList[0].id : '');
    setBalance('');
    setCardNumber('');
    setValidate('');
    setErrors({});
    setIsSubmitting(false);
  };
  
  // Bank selector functions
  const openBankSelector = () => {
    setBankSelectorModalVisible(true);
  };
  
  const closeBankSelector = () => {
    setBankSelectorModalVisible(false);
  };
  
  const selectBank = (bankId: string) => {
    setSelectedCard(bankId);
    if (errors.bank) {
      setErrors({...errors, bank: ''});
    }
    closeBankSelector();
  };
  
  // Close modal with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      resetForm();
    });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedBankData) {
      newErrors.bank = 'Selecione um banco';
    }
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Informe o número do cartão';
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Número do cartão deve ter 16 dígitos';
    }
    
    if (!validate.trim()) {
      newErrors.validate = 'Informe a validade';
    } else if (validate.replace(/\D/g, '').length !== 4) {
      newErrors.validate = 'Validade deve estar no formato MM/AA';
    }
    
    if (!balance) {
      newErrors.balance = 'Informe o limite do cartão';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleAddCreditCard = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Extract raw data
      const rawCardNumber = cardNumber.replace(/\s/g, '');
      const rawValidate = validate.replace(/\D/g, '');
      const numericValue = parseFloat(balance.replace(/\D/g, '')) / 100;
      
      const creditCardData = {
        bankName: selectedBankData!.name,
        cardNumber: rawCardNumber,
        validate: rawValidate,
        balance: numericValue,
        totalOutFlow: 0,
        totalInflow: 0,
        type: 'Crédito',
        bankIcon: selectedBankData!.logoUrl,
        userId: user.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'creditCard'), creditCardData);
      onSave(numericValue, selectedBankData!.name);
      
      // Show success animation before closing
      setTimeout(() => {
        handleClose();
      }, 500);
      
    } catch (error) {
      console.error("Erro ao adicionar cartão de crédito:", error);
      Alert.alert("Erro", "Não foi possível adicionar o cartão de crédito no momento.");
      setIsSubmitting(false);
    }
  };

  // Apply transformations based on animation values
  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0]
  });

  // Credit card preview
  const renderCreditCardPreview = () => {
    const maskedNumber = cardNumber || '•••• •••• •••• ••••';
    const maskedValidate = validate || 'MM/AA';
    
    return (
      <View style={styles.creditCardPreview}>
        <View style={styles.creditCardHeader}>
          <Text style={styles.creditCardType}>Crédito</Text>
          {selectedBankData && (
            <Image 
              source={{ uri: selectedBankData.logoUrl }}
              style={styles.creditCardLogo}
              resizeMode="contain"
            />
          )}
        </View>
        
        <Text style={styles.creditCardNumber}>{maskedNumber}</Text>
        
        <View style={styles.creditCardFooter}>
          <View>
            <Text style={styles.creditCardLabel}>Validade</Text>
            <Text style={styles.creditCardValidate}>{maskedValidate}</Text>
          </View>
          
          <View style={styles.creditCardChip}>
            <FontAwesome5 name="credit-card" size={16} color="#FFD700" />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) handleClose();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.overlay, 
              {opacity: opacityAnim}
            ]}
          >
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={styles.backgroundClose} />
            </TouchableWithoutFeedback>
          </Animated.View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingContainer}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                {transform: [{translateY: modalTranslateY}]}
              ]}
            >
              {/* Modal header - Keep outside ScrollView */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar cartão de crédito</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEventThrottle={16}
                directionalLockEnabled={true}
                scrollEnabled={true}
                >
                {/* Card Preview Section */}
                <View style={styles.section}>
                  {renderCreditCardPreview()}
                </View>
                
                {/* Bank selection section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Banco emissor</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.bankSelector,
                      errors.bank ? styles.inputError : null
                    ]}
                    onPress={openBankSelector}
                    disabled={isSubmitting}
                  >
                    {selectedBankData ? (
                      <View style={styles.selectedBankContent}>
                        <Image 
                          source={{ uri: selectedBankData.logoUrl }} 
                          style={styles.selectedBankLogo} 
                        />
                        <Text style={styles.selectedBankName}>
                          {selectedBankData.name}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.bankPlaceholder}>
                        Selecione um banco
                      </Text>
                    )}
                    
                    <Ionicons 
                      name="chevron-down" 
                      size={22} 
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {errors.bank && (
                    <Text style={styles.errorText}>{errors.bank}</Text>
                  )}
                </View>
                
                {/* Card details section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dados do cartão</Text>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 
                        name="credit-card" 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={styles.inputLabel}>Número do cartão</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.cardNumber ? styles.inputError : null
                      ]}
                      placeholder="Ex: 1234 5678 9012 3456"
                      placeholderTextColor={Colors.gray95}
                      keyboardType="numeric"
                      value={cardNumber}
                      onChangeText={(value) => {
                        const formatted = formatCardNumber(value);
                        setCardNumber(formatted);
                        if (errors.cardNumber) {
                          setErrors({...errors, cardNumber: ''});
                        }
                      }}
                      maxLength={19} // 16 digits + 3 spaces
                      editable={!isSubmitting}
                    />
                    {errors.cardNumber && (
                      <Text style={styles.errorText}>{errors.cardNumber}</Text>
                    )}
                  </View>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name="date-range" 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={styles.inputLabel}>Validade (MM/AA)</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.validate ? styles.inputError : null
                      ]}
                      placeholder="Ex: 12/25"
                      placeholderTextColor={Colors.gray95}
                      keyboardType="numeric"
                      value={validate}
                      onChangeText={(value) => {
                        const formatted = formatValidate(value);
                        setValidate(formatted);
                        if (errors.validate) {
                          setErrors({...errors, validate: ''});
                        }
                      }}
                      maxLength={5} // MM/YY format
                      editable={!isSubmitting}
                    />
                    {errors.validate && (
                      <Text style={styles.errorText}>{errors.validate}</Text>
                    )}
                  </View>
                </View>
                
                {/* Limit section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Limite do cartão</Text>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name="attach-money" 
                        size={16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={styles.inputLabel}>Valor em reais</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.inputCurrency,
                        errors.balance ? styles.inputError : null
                      ]}
                      placeholder="R$ 0,00"
                      placeholderTextColor={Colors.gray95}
                      keyboardType="numeric"
                      value={balance}
                      onChangeText={(value) => {
                        setBalance(formatCurrency(value));
                        if (errors.balance) {
                          setErrors({...errors, balance: ''});
                        }
                      }}
                      editable={!isSubmitting}
                    />
                    {errors.balance && (
                      <Text style={styles.errorText}>{errors.balance}</Text>
                    )}
                  </View>
                </View>
                
                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      isSubmitting && styles.disabledButton
                    ]}
                    onPress={handleClose}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isSubmitting && styles.disabledButton
                    ]}
                    onPress={handleAddCreditCard}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={Colors.background} />
                    ) : (
                      <Text style={styles.saveButtonText}>Adicionar cartão</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
          
            {/* Bank Selector Modal - Separate Modal to avoid VirtualizedList nesting */}
            <Modal
              transparent={true}
              visible={bankSelectorModalVisible}
              animationType="fade"
              statusBarTranslucent={true}
              onRequestClose={closeBankSelector}
            >
              <View style={styles.bankSelectorModalOverlay}>
                <TouchableWithoutFeedback onPress={closeBankSelector}>
                  <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
                </TouchableWithoutFeedback>
                
                <View style={styles.bankSelectorModalContainer}>
                  <View style={styles.bankSelectorModalHeader}>
                    <Text style={styles.bankSelectorModalTitle}>Selecione o banco</Text>
                    <TouchableOpacity 
                      style={styles.closeButton} 
                      onPress={closeBankSelector}
                    >
                      <Ionicons name="close" size={22} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={banksList}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.bankSelectorModalList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.bankItem,
                          selectedCard === item.id && styles.selectedBankItem
                        ]}
                        onPress={() => selectBank(item.id)}
                        activeOpacity={0.7}
                      >
                        <Image 
                          source={{ uri: item.logoUrl }} 
                          style={styles.bankLogo} 
                        />
                        <Text style={[
                          styles.bankName,
                          selectedCard === item.id && styles.selectedBankText
                        ]}>
                          {item.name}
                        </Text>
                        
                        {selectedCard === item.id && (
                          <Ionicons 
                            name="checkmark-circle" 
                            size={20} 
                            color={Colors.incomeBold} 
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddCardModal;
