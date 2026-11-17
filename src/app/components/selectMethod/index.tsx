import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Easing, 
  ScrollView, 
  TouchableWithoutFeedback,
  StyleSheet,
  Pressable
} from 'react-native';
import { styles } from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Colors } from '../../../constants/colors';

const methods = [
  {
    id: 'Manual',
    title: 'Manual',
    description: 'Cadastre suas contas manualmente',
    icon: 'edit',
    iconType: 'material'
  },
  {
    id: 'Open Finance',
    title: 'Open Finance',
    description: 'Conecte suas contas automaticamente',
    icon: 'bank',
    iconType: 'fontawesome'
  },
];

interface SelectMethodsProps {
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
  fechar: () => void;
}

const SelectMethod: React.FC<SelectMethodsProps> = ({ selectedMethod, onSelectMethod, fechar }) => {
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [isProcessing, setIsProcessing] = useState(false); // Added to prevent multiple clicks

  const openPhilosophyModal = () => {
    setShowPhilosophyModal(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePhilosophyModal = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPhilosophyModal(false);
      // Only execute callback after animation completes and modal is hidden
      if (callback) setTimeout(callback, 300); // Increased timeout for safety
    });
  };

  const handleMethodPress = (methodId: string) => {
    if (methodId === 'Open Finance') {
      openPhilosophyModal();
    } else {
      onSelectMethod(methodId);
    }
  };

  const handleUnderstandButtonPress = () => {
    // Prevent multiple clicks
    if (isProcessing) return;
    setIsProcessing(true);
    
    // First close the modal
    closePhilosophyModal();
    
    // Then select the method after a delay
    setTimeout(() => {
      setIsProcessing(false);
      onSelectMethod('Manual');
    }, 500); // Wait enough time for the modal to close
  };

  const renderIcon = (method: typeof methods[0]) => {
    if (method.iconType === 'material') {
      return <MaterialIcons name={method.icon as any} size={22} color={Colors.text} style={styles.methodIcon} />;
    } else {
      return <FontAwesome name={method.icon as any} size={20} color={Colors.text} style={styles.methodIcon} />;
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.overlay} onPress={fechar}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selecione o método</Text>
          <TouchableOpacity onPress={fechar} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Como você prefere adicionar suas contas e cartões?
        </Text>
        
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id} 
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedCard,
            ]}
            onPress={() => handleMethodPress(method.id)} 
            activeOpacity={0.7}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodIconContainer}>
                {renderIcon(method)}
              </View>
              
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  
                  {method.id === 'Open Finance' && (
                    <TouchableOpacity 
                      onPress={openPhilosophyModal}
                      style={styles.philosophyButton}
                    >
                      <AntDesign name="question-circle" size={16} color={Colors.homeBold} />
                      <Text style={styles.philosophyButtonText}>Por que escolhemos o manual?</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </View>
            
            {selectedMethod === method.id && (
              <View style={styles.checkmarkContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.incomeBold}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Philosophy Modal - FIXED STRUCTURE */}
      <Modal
        visible={showPhilosophyModal}
        transparent={true}
        animationType="none" // Changed to none since we're handling our own animation
        onRequestClose={() => {
          if (!isProcessing) closePhilosophyModal();
        }}
      >
        <View style={styles.modalOverlay}>
          {/* Background pressable to dismiss modal */}
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!isProcessing) closePhilosophyModal();
            }}
          />
          
          {/* Modal content - NOT wrapped in TouchableWithoutFeedback */}
          <Animated.View 
            style={[
              styles.philosophyModal,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.philosophyModalHeader}>
              <Text style={styles.philosophyModalTitle}>
                Nossa filosofia de finanças conscientes
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (!isProcessing) closePhilosophyModal();
                }}
                style={styles.philosophyModalClose}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Fixed ScrollView implementation */}
            <ScrollView 
              style={styles.philosophyScrollContainer}
              contentContainerStyle={styles.philosophyContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              overScrollMode="always"
            >
              <View style={styles.philosophyIconContainer}>
                <AntDesign name="heart" size={36} color={Colors.healthyBold} />
              </View>
              
              <Text style={styles.philosophyText}>
                No MyMonthly, acreditamos que hábitos financeiros saudáveis começam com consciência.
              </Text>
              
              <View style={styles.philosophyPoint}>
                <Ionicons name="arrow-forward-circle" size={20} color={Colors.homeBold} />
                <Text style={styles.philosophyPointText}>
                  <Text style={styles.highlightText}>Conectar-se com suas finanças</Text> significa registrá-las intencionalmente, não automaticamente.
                </Text>
              </View>
              
              <View style={styles.philosophyPoint}>
                <Ionicons name="arrow-forward-circle" size={20} color={Colors.homeBold} />
                <Text style={styles.philosophyPointText}>
                  O ato de <Text style={styles.highlightText}>registrar manualmente</Text> seus gastos e receitas cria uma consciência que a automação remove.
                </Text>
              </View>
              
              <View style={styles.philosophyPoint}>
                <Ionicons name="arrow-forward-circle" size={20} color={Colors.homeBold} />
                <Text style={styles.philosophyPointText}>
                  Quando você adiciona cada transação, você <Text style={styles.highlightText}>reflete sobre suas escolhas financeiras</Text> de uma forma que o Open Finance não permite.
                </Text>
              </View>
              
              <Text style={styles.philosophyTextBold}>
                É por isso que escolhemos o caminho da consciência, não da conveniência.
              </Text>
              
              <TouchableOpacity 
                style={styles.philosophyActionButton}
                onPress={handleUnderstandButtonPress}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Text style={styles.philosophyActionButtonText}>
                    Processando...
                  </Text>
                ) : (
                  <Text style={styles.philosophyActionButtonText}>
                    Entendi, quero estar próximo das minhas finanças!
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default SelectMethod;
