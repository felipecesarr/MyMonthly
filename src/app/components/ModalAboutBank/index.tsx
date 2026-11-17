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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteDoc, doc, getFirestore } from '../../../services/api/legacy-data';
import { AuthContext } from '../../../contexts/Auth';

type Account = {
  id: string;
  bankName: string;
  bankIcon: string;
  agencyNumber: string;
  accountNumber: string;
  balance: number;
  totalOutFlow: number;
  totalInflow: number;
  type: string;
};

type ModalAboutBankProps = {
  closeModal: () => void;
  account: Account;
  onDeleteSuccess: () => void;
};

export default function ModalAboutBank({ closeModal, account, onDeleteSuccess }: ModalAboutBankProps) {
  const { user } = useContext(AuthContext);
  const db = getFirestore();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  async function handleDelete() {
    if (!user || !account) return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'bankAccounts', account.id));
      onDeleteSuccess();
      closeModal();
    } catch (error) {
      console.error("Erro ao excluir conta bancária:", error);
      Alert.alert("Erro", "Não foi possível excluir esta conta bancária.");
    } finally {
      setIsDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir Conta',
      'Você tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: handleDelete, style: 'destructive' }
      ],
      { cancelable: true }
    );
  }

  // Calcular saldo atual e métricas derivadas
  const currentBalance = account.totalInflow - account.totalOutFlow;
  const isPositive = currentBalance >= 0;
  const balanceChange = currentBalance - account.balance;
  const balanceChangePercentage = account.balance !== 0 
    ? ((balanceChange / Math.abs(account.balance)) * 100).toFixed(1) 
    : '0.0';
  const isBalanceIncreased = balanceChange > 0;

  return (
      <View style={styles.container}>
        <View style={styles.modalView}>
          {/* Header with title */}
          <View style={styles.headerContainer}>
            <Pressable 
              style={styles.backButton} 
              onPress={closeModal}
            >
              <Ionicons name="close" size={22} color={Colors.text} />
            </Pressable>
            
            
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
            {/* Instagram-style profile header */}
            <View style={styles.profileHeader}>
              {/* Left side - Bank logo */}
              <View style={styles.logoContainer}>
                
                {imageError ? (
                  <View style={styles.logoInner}>
                    <Ionicons name="business-outline" size={28} color={Colors.textSecondary} />
                  </View>
                ) : (
                  <Image 
                    source={{uri: account.bankIcon}}
                    style={styles.logoImage}
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                )}
              </View>
              
              {/* Right side - Bank details */}
              <View style={styles.bankDetails}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                <View style={styles.balanceRow}>
                  <Text style={[
                    styles.balanceValue, 
                    isPositive ? styles.positiveBalance : styles.negativeBalance
                  ]}>
                    {formatCurrency(currentBalance)}
                  </Text>
                </View>
                </View>
                
          
                
                {/* Balance trend indicator */}
                {account.balance !== 0 && (
                  <View style={styles.balanceTrendContainer}>
                    <Ionicons 
                      name={isBalanceIncreased ? "trending-up" : "trending-down"} 
                      size={14} 
                      color={isBalanceIncreased ? Colors.incomeBold : Colors.healthyBold} 
                    />
                    <Text style={[
                      styles.balanceTrendText,
                      isBalanceIncreased ? styles.positiveColor : styles.negativeColor
                    ]}>
                      {Math.abs(Number(balanceChangePercentage))}% 
                      {isBalanceIncreased ? " acima" : " abaixo"} do inicial
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Account information card */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Dados da conta</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRowBordered}>
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="account-balance" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Banco</Text>
                    </View>
                    <Text style={styles.infoValue}>{account.bankName}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="confirmation-number" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Agência</Text>
                    </View>
                    <Text style={styles.infoValue}>{account.agencyNumber}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="credit-card" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Conta</Text>
                    </View>
                    <Text style={styles.infoValue}>{account.accountNumber}</Text>
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
                    {formatCurrency(account.totalInflow)}
                  </Text>
                </View>
                
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="trending-down" size={20} color={Colors.healthyBold} />
                    <Text style={styles.metricTitle}>Saídas</Text>
                  </View>
                  <Text style={styles.expenseValue}>
                    {formatCurrency(account.totalOutFlow)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Balance details card */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Detalhes do saldo</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRowBordered}>
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="account-balance" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Saldo inicial</Text>
                    </View>
                    <Text style={styles.infoValue}>{formatCurrency(account.balance)}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="timeline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Variação</Text>
                    </View>
                    <Text style={[
                      styles.infoValue,
                      isBalanceIncreased ? styles.positiveColor : styles.negativeColor
                    ]}>
                      {isBalanceIncreased ? "+" : ""}{formatCurrency(balanceChange)}
                    </Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <View style={styles.rowWithIcon}>
                      <MaterialIcons name="percent" size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoLabel}>Percentual</Text>
                    </View>
                    <Text style={[
                      styles.infoValue,
                      isBalanceIncreased ? styles.positiveColor : styles.negativeColor
                    ]}>
                      {isBalanceIncreased ? "+" : "-"}{Math.abs(Number(balanceChangePercentage))}%
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
