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
  ScrollView,
  Dimensions
} from 'react-native';
import { styles } from './styles';
import { banksList } from '../../../constants/bankList';
import { Colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Firebase imports
import { getFirestore, collection, addDoc, getAuth } from '../../../services/api/legacy-data';

const db = getFirestore();
const auth = getAuth();

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700; // Detector para dispositivos pequenos

interface AddBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (balance: number, bank: string) => void;
}

const formatCurrency = (value: string) => {
  const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ visible, onClose, onSave }) => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [agency, setAgency] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isBankListVisible, setIsBankListVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Calcula altura máxima responsiva para a lista de bancos (menor em dispositivos pequenos)
  const maxBankListHeight = height * (isSmallDevice ? 0.25 : 0.3);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bankListHeightAnim = useRef(new Animated.Value(0)).current;
  
  // Get the selected bank data
  const selectedBankData = banksList.find((bank) => bank.id === selectedBank);
  
  // Set a default bank if none is selected
  useEffect(() => {
    if (!selectedBank && banksList.length > 0) {
      setSelectedBank(banksList[0].id);
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

  // Toggle bank list animation
  const toggleBankList = () => {
    if (isBankListVisible) {
      // Close bank list
      Animated.timing(bankListHeightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setIsBankListVisible(false));
    } else {
      // Open bank list
      setIsBankListVisible(true);
      Animated.timing(bankListHeightAnim, {
        toValue: maxBankListHeight, // Altura responsiva baseada no tamanho da tela
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setSelectedBank(banksList.length > 0 ? banksList[0].id : '');
    setBalance('');
    setAgency('');
    setAccountNumber('');
    setErrors({});
    setIsSubmitting(false);
    setIsBankListVisible(false);
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
    
    if (!agency.trim()) {
      newErrors.agency = 'Informe a agência';
    } else if (agency.length < 3) {
      newErrors.agency = 'Agência muito curta';
    }
    
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Informe o número da conta';
    } else if (accountNumber.length < 5) {
      newErrors.accountNumber = 'Número de conta muito curto';
    }
    
    if (!balance) {
      newErrors.balance = 'Informe o saldo inicial';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleAddBankAccount = async () => {
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
      const numericValue = parseFloat(balance.replace(/\D/g, '')) / 100;
      const bankAccountData = {
        bankName: selectedBankData!.name,
        accountNumber: accountNumber,
        agencyNumber: agency,
        balance: numericValue,
        totalOutFlow: 0,
        totalInflow: 0,
        type: 'Conta Corrente',
        bankIcon: selectedBankData!.logoUrl,
        userId: user.uid,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'bankAccounts'), bankAccountData);
      onSave(numericValue, selectedBankData!.name);
      
      // Show success animation before closing
      setTimeout(() => {
        handleClose();
      }, 500);
      
    } catch (error) {
      console.error("Erro ao adicionar a conta bancária:", error);
      Alert.alert("Erro", "Não foi possível adicionar a conta bancária no momento.");
      setIsSubmitting(false);
    }
  };

  // Apply transformations based on animation values
  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0]
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none" // We'll handle our own animations
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
                {transform: [{translateY: modalTranslateY}],
                maxHeight: height * 0.85} // Limita altura máxima do modal
              ]}
            >
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isSmallDevice && styles.smallDeviceText]}>
                  Adicionar conta bancária
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Bank selection section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isSmallDevice && styles.smallDeviceText]}>
                    Selecione seu banco
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.bankSelector,
                      errors.bank ? styles.inputError : null,
                      isSmallDevice && styles.smallDeviceInput // Ajusta padding para dispositivos pequenos
                    ]}
                    onPress={toggleBankList}
                    disabled={isSubmitting}
                  >
                    {selectedBankData ? (
                      <View style={styles.selectedBankContent}>
                        <Image 
                          source={{ uri: selectedBankData.logoUrl }} 
                          style={[
                            styles.selectedBankLogo,
                            isSmallDevice && styles.smallDeviceLogo
                          ]} 
                        />
                        <Text style={[
                          styles.selectedBankName,
                          isSmallDevice && styles.smallDeviceText
                        ]}>
                          {selectedBankData.name}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.bankPlaceholder}>
                        Selecione um banco
                      </Text>
                    )}
                    
                    <Ionicons 
                      name={isBankListVisible ? "chevron-up" : "chevron-down"} 
                      size={isSmallDevice ? 18 : 22} 
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {errors.bank && (
                    <Text style={styles.errorText}>{errors.bank}</Text>
                  )}
                
                  {/* Expandable bank list */}
                  {isBankListVisible && (
                    <Animated.View 
                      style={[
                        styles.bankListContainer,
                        {height: bankListHeightAnim}
                      ]}
                    >
                      {/* Substituindo FlatList por ScrollView com mapeamento direto dos itens */}
                      <ScrollView showsVerticalScrollIndicator={true}>
                        {banksList.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.bankItem,
                              selectedBank === item.id && styles.selectedBankItem,
                              isSmallDevice && styles.smallDeviceBankItem
                            ]}
                            onPress={() => {
                              setSelectedBank(item.id);
                              toggleBankList();
                            }}
                          >
                            <Image 
                              source={{ uri: item.logoUrl }} 
                              style={[
                                styles.bankLogo,
                                isSmallDevice && styles.smallDeviceLogo
                              ]} 
                            />
                            <Text style={[
                              styles.bankName,
                              selectedBank === item.id && styles.selectedBankText,
                              isSmallDevice && styles.smallDeviceText
                            ]}>
                              {item.name}
                            </Text>
                            
                            {selectedBank === item.id && (
                              <Ionicons 
                                name="checkmark-circle" 
                                size={isSmallDevice ? 16 : 20} 
                                color={Colors.incomeBold} 
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>
                
                {/* Account details section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isSmallDevice && styles.smallDeviceText]}>
                    Dados da conta
                  </Text>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name="account-balance" 
                        size={isSmallDevice ? 14 : 16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={[styles.inputLabel, isSmallDevice && styles.smallDeviceLabel]}>
                        Agência
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.agency ? styles.inputError : null,
                        isSmallDevice && styles.smallDeviceInput
                      ]}
                      placeholder="Ex: 0001"
                      placeholderTextColor={Colors.gray95}
                      keyboardType="numeric"
                      value={agency}
                      onChangeText={(value) => {
                        setAgency(value);
                        if (errors.agency) {
                          setErrors({...errors, agency: ''});
                        }
                      }}
                      maxLength={8}
                      editable={!isSubmitting}
                    />
                    {errors.agency && (
                      <Text style={styles.errorText}>{errors.agency}</Text>
                    )}
                  </View>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name="credit-card" 
                        size={isSmallDevice ? 14 : 16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={[styles.inputLabel, isSmallDevice && styles.smallDeviceLabel]}>
                        Número da conta
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.accountNumber ? styles.inputError : null,
                        isSmallDevice && styles.smallDeviceInput
                      ]}
                      placeholder="Ex: 12345-6"
                      placeholderTextColor={Colors.gray95}
                      keyboardType="numeric"
                      value={accountNumber}
                      onChangeText={(value) => {
                        setAccountNumber(value);
                        if (errors.accountNumber) {
                          setErrors({...errors, accountNumber: ''});
                        }
                      }}
                      maxLength={12}
                      editable={!isSubmitting}
                    />
                    {errors.accountNumber && (
                      <Text style={styles.errorText}>{errors.accountNumber}</Text>
                    )}
                  </View>
                </View>
                
                {/* Balance section */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isSmallDevice && styles.smallDeviceText]}>
                    Saldo inicial
                  </Text>
                  
                  <View style={styles.fieldGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons 
                        name="attach-money" 
                        size={isSmallDevice ? 14 : 16} 
                        color={Colors.textSecondary} 
                      />
                      <Text style={[styles.inputLabel, isSmallDevice && styles.smallDeviceLabel]}>
                        Valor em reais
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.inputCurrency,
                        errors.balance ? styles.inputError : null,
                        isSmallDevice && styles.smallDeviceInput
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
              </ScrollView>
              
              {/* Action buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isSubmitting && styles.disabledButton,
                    isSmallDevice && styles.smallDeviceButton
                  ]}
                  onPress={handleClose}
                  disabled={isSubmitting}
                >
                  <Text style={[
                    styles.cancelButtonText,
                    isSmallDevice && styles.smallDeviceText
                  ]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSubmitting && styles.disabledButton,
                    isSmallDevice && styles.smallDeviceButton
                  ]}
                  onPress={handleAddBankAccount}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={Colors.background} />
                  ) : (
                    <Text style={[
                      styles.saveButtonText,
                      isSmallDevice && styles.smallDeviceText
                    ]}>
                      Adicionar conta
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddBalanceModal;
