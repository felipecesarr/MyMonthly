// ModalPaymentPlus.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Text, 
  Pressable, 
  Image,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ModalPaymentPlusProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalPaymentPlus({ visible, onClose, onConfirm }: ModalPaymentPlusProps) {
  // Estado para gerenciar qual benefício está selecionado
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rolagem dos benefícios a cada 3 segundos
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % benefits.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [visible]);

  // Lista de benefícios do Plus
  const benefits = [
    {
      icon: "wallet",
      title: "Transações ilimitadas",
      description: "Adicione quantas transações quiser sem restrições."
    },
    {
      icon: "chart-line",
      title: "Relatórios detalhados",
      description: "Acesse relatórios avançados sobre seus gastos e rendimentos."
    },
    {
      icon: "tags",
      title: "Categorias personalizadas",
      description: "Crie suas próprias categorias para organizar seus gastos."
    },
    {
      icon: "cloud",
      title: "Backup na nuvem",
      description: "Seus dados seguros e sincronizados em todos os dispositivos."
    }
  ];

  function handleConfirm() {
    onClose();
    onConfirm();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {/* Header */}
            <View style={modalStyles.header}>
              <Pressable style={modalStyles.buttonBack} onPress={onClose}>
                <Ionicons name="chevron-back-outline" size={22} color={Colors.text} />
              </Pressable>
              <Image 
                source={require('../../../../assets/onboardingScreens/logo.png')}
                style={modalStyles.logoImage}
              />
              <View style={modalStyles.buttonFantasy} />
            </View>

            
            {/* Premium badge */}
            <View style={modalStyles.premiumBadge}>
              <MaterialIcons name="verified" size={18} color={Colors.incomeBold} />
              <Text style={modalStyles.premiumText}>PLUS</Text>
            </View>

            {/* Main message */}
            <Text style={modalStyles.modalMessageTitle}>
              Chega de bagunça: organize suas finanças!
            </Text>
            
            {/* Features carousel */}
            <View style={modalStyles.benefitsContainer}>
              <View style={modalStyles.benefitCard}>
                <FontAwesome5 
                  name={benefits[activeIndex].icon} 
                  size={32} 
                  color={Colors.incomeBold} 
                  style={modalStyles.benefitIcon}
                />
                <Text style={modalStyles.benefitTitle}>
                  {benefits[activeIndex].title}
                </Text>
                <Text style={modalStyles.benefitDescription}>
                  {benefits[activeIndex].description}
                </Text>
              </View>
              
              {/* Indicator dots */}
              <View style={modalStyles.indicatorContainer}>
                {benefits.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      modalStyles.indicator, 
                      activeIndex === index && modalStyles.activeIndicator
                    ]} 
                  />
                ))}
              </View>
            </View>

            <Text style={modalStyles.modalMessage}>
              Mantenha cada gasto sob controle com categorias e subcategorias personalizadas.{' '}
              <Text style={modalStyles.highlightText}>Assine </Text> 
              e experimente a sensação de{' '}
              <Text style={modalStyles.highlightText}>liberdade </Text>
              e{' '}
              <Text style={modalStyles.highlightText}>tranquilidade</Text> financeira.
            </Text>
            
            {/* Comparison table */}
            <View style={modalStyles.comparisonContainer}>
              <View style={modalStyles.comparisonHeader}>
                <Text style={modalStyles.comparisonTitle}>Versão Gratuita</Text>
                <Text style={modalStyles.comparisonTitle}>Versão Plus</Text>
              </View>
              
              <View style={modalStyles.comparisonRow}>
                <View style={modalStyles.comparisonCell}>
                  <Text style={modalStyles.comparisonText}>10 transações</Text>
                  <Ionicons name="close" size={16} color={Colors.healthyBold} />
                </View>
                <View style={modalStyles.comparisonCell}>
                  <Text style={modalStyles.comparisonText}>Ilimitadas</Text>
                  <Ionicons name="checkmark" size={16} color={Colors.incomeBold} />
                </View>
              </View>
              
              {/* <View style={modalStyles.comparisonRow}>
                <View style={modalStyles.comparisonCell}>
                  <Text style={modalStyles.comparisonText}>Categorias básicas</Text>
                  <Ionicons name="close" size={16} color={Colors.healthyBold} />
                </View>
                <View style={modalStyles.comparisonCell}>
                  <Text style={modalStyles.comparisonText}>Personalizadas</Text>
                  <Ionicons name="checkmark" size={16} color={Colors.incomeBold} />
                </View>
              </View> */}
            </View>

            <Text style={modalStyles.limitMessage}>
              *Você já adicionou suas 10 transações gratuitas, seja um assinante MyMonthly para continuar melhorando sua organização financeira.
            </Text>

            {/* Price section */}
            <View style={modalStyles.priceContainer}>
              <Text style={modalStyles.pricePeriod}>Assinatura mensal</Text>
              <View style={modalStyles.priceRow}>
                <Text style={modalStyles.currency}>R$</Text>
                <Text style={modalStyles.price}>39,90</Text>
                <Text style={modalStyles.pricePeriodSmall}>/mês</Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Fixed bottom button */}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity 
              style={modalStyles.buttonConfirm} 
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.buttonText}>Assinar agora</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Estilos para o modal
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '100%',
    height: height * 0.85,
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    overflow: 'hidden',
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 12,
  },
  premiumText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
    color: Colors.text + 'CC',
  },
  modalMessageTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
  },
  highlightText: {
    color: Colors.incomeBold,
    fontWeight: '700',
  },
  limitMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '400',
    color: Colors.text + '99',
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.gray95 + '30',
  },
  buttonConfirm: {
    backgroundColor: Colors.text,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  buttonBack: {
    height: 44,
    width: 44,
    backgroundColor: Colors.backgroundIcons,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonFantasy: {
    height: 44,
    width: 44,
  },
  logoImage: {
    height: 40,
    width: 40,
    alignSelf: 'center',
  },
  benefitsContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  benefitCard: {
    width: '100%',
    backgroundColor: Colors.gray95 + '10',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray95 + '20',
  },
  benefitIcon: {
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.text + 'CC',
    lineHeight: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray95 + '40',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.incomeBold,
    width: 16,
  },
  comparisonContainer: {
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.gray95 + '15',
  },
  comparisonTitle: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
    fontSize: 14,
    color: Colors.text,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.gray95 + '30',
  },
  comparisonCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  comparisonText: {
    fontSize: 13,
    color: Colors.text + 'DD',
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  pricePeriod: {
    fontSize: 14,
    color: Colors.text + 'AA',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 40,
  },
  pricePeriodSmall: {
    fontSize: 14,
    color: Colors.text + 'AA',
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginLeft: 4,
  },
});