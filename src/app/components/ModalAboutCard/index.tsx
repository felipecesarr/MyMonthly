import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Image, 
  Alert, 
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteDoc, doc, db } from '../../../services/api/legacy-data';
import { AuthContext } from '../../../contexts/Auth';

type Card = {
  id: string;
  bankName: string;
  bankIcon: string;
  cardNumber: string;
  validate: string;
  balance: number;
  totalOutFlow: number;
  totalInflow: number;
  type: string;
};

type ModalAboutCardProps = {
  closeModal: () => void;
  card: Card;
  onDeleteSuccess: () => void;
};

export default function ModalAboutCard({ closeModal, card, onDeleteSuccess }: ModalAboutCardProps) {
  const { user } = useContext(AuthContext);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para formatar o número do cartão
  const formatCardNumber = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length !== 16) {
      return 'Número inválido';
    }
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  // Função para formatar a validade
  const formatValidate = (validate: string): string => {
    const cleaned = validate.replace(/\D/g, '');
    if (cleaned.length !== 4) {
      return 'Data inválida';
    }
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  };

  // Função para deletar o cartão
  async function handleDelete() {
    if (!user || !card) return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'creditCard', card.id));
      onDeleteSuccess();
      closeModal();
    } catch (error) {
      console.error('Erro ao excluir cartão de crédito:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cartão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  }

  // Função para confirmar a exclusão
  function confirmDelete() {
    Alert.alert(
      'Excluir Cartão',
      'Você tem certeza que deseja excluir este cartão de crédito? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: handleDelete, style: 'destructive' }
      ],
      { cancelable: true }
    );
  }

  // Calcular saldo atual e métricas derivadas
  const currentBalance = card.totalInflow - card.totalOutFlow;
  const isPositive = currentBalance >= 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.modalView}>
        {/* Header with title */}
        <View style={styles.headerContainer}>
          <Pressable 
            style={styles.backButton} 
            onPress={closeModal}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>
          
          <Text style={styles.headerTitle}>Detalhes do Cartão</Text>
          
          <Pressable 
            style={styles.deleteButton} 
            onPress={confirmDelete}
            disabled={isDeleting}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.healthyBold} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={Colors.healthyBold} />
                <Text style={styles.deleteText}>Excluir</Text>
              </>
            )}
          </Pressable>
        </View>
        
        {/* Content */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Credit Card Display */}
          <View style={styles.cardContainer}>
            <View style={styles.creditCard}>
              <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
                <Image 
                  source={{uri: card.bankIcon}}
                  style={styles.cardLogo}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
                {imageError && (
                  <View style={styles.cardLogoFallback}>
                    <Ionicons name="card" size={24} color={Colors.background} />
                  </View>
                )}
                <Text style={styles.bankName}>{card.bankName}</Text>
                </View>
                
                <Text style={styles.cardType}>{card.type || 'Crédito'}</Text>
              </View>
              
              <Text style={styles.cardNumber}>{formatCardNumber(card.cardNumber)}</Text>
              
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>VÁLIDO ATÉ</Text>
                  <Text style={styles.cardValidate}>{formatValidate(card.validate)}</Text>
                </View>
                <Text style={styles.cardHolderName}>{card.bankName}</Text>
              </View>
            </View>
          </View>
          
          {/* Card information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Dados do Cartão</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRowBordered}>
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <FontAwesome5 name="credit-card" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Número do cartão</Text>
                  </View>
                  <Text style={styles.infoValue}>{formatCardNumber(card.cardNumber)}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Validade</Text>
                  </View>
                  <Text style={styles.infoValue}>{formatValidate(card.validate)}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Emissor</Text>
                  </View>
                  <Text style={styles.infoValue}>{card.bankName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cash flow metrics */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Movimentações</Text>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="trending-up" size={20} color={Colors.incomeBold} />
                  <Text style={styles.metricTitle}>Entradas</Text>
                </View>
                <Text style={styles.incomeValue}>
                  {formatCurrency(card.totalInflow)}
                </Text>
              </View>
              
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="trending-down" size={20} color={Colors.healthyBold} />
                  <Text style={styles.metricTitle}>Saídas</Text>
                </View>
                <Text style={styles.expenseValue}>
                  {formatCurrency(card.totalOutFlow)}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance details card */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Resumo financeiro</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRowBordered}>
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <MaterialIcons name="account-balance-wallet" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Saldo atual</Text>
                  </View>
                  <Text style={[
                    styles.infoValue,
                    isPositive ? styles.positiveColor : styles.negativeColor
                  ]}>
                    {formatCurrency(currentBalance)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <MaterialIcons name="credit-score" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Limite</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {formatCurrency(card.balance)}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <View style={styles.rowWithIcon}>
                    <MaterialIcons name="signal-cellular-alt" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoLabel}>Utilizado</Text>
                  </View>
                  <Text style={[
                    styles.infoValue,
                    { color: card.balance > 0 
                      ? Colors.textSecondary 
                      : Colors.healthyBold 
                    }
                  ]}>
                    {card.balance > 0 
                      ? `${Math.min(Math.abs(card.totalOutFlow / card.balance) * 100, 100).toFixed(0)}%`
                      : "N/A"
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Action button */}
          <Pressable 
            style={styles.actionButton} 
            onPress={closeModal}
            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: false}}
          >
            <Text style={styles.actionButtonText}>Concluído</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
