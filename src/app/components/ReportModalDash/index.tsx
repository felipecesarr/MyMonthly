import React, { useRef, useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated
} from 'react-native';
import { Colors } from '../../../constants/colors';
import moment from 'moment';
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

export interface DayStats {
  date: Date;
  in: number;
  out: number;
}

interface ReportModalDashProps {
  visible: boolean;
  onClose: () => void;
  dailyStats: DayStats[];
  averageRevenue: number;
  averageExpense: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const windowHeight = Dimensions.get('window').height;

const ReportModalDash: React.FC<ReportModalDashProps> = ({
  visible,
  onClose,
  dailyStats,
  averageRevenue,
  averageExpense,
}) => {
  const { selectedMonth } = useMonth(); 
  const { selectedYear } = useYear();

  const averageBalance = averageRevenue - averageExpense;
  const sortedStats = [...dailyStats].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });

  // Encontrar o dia com maior entrada e saída
  const maxInDay = sortedStats.reduce((max, day) => 
    day.in > max.value ? { date: day.date, value: day.in } : max, 
    { date: new Date(), value: 0 }
  );
  
  const maxOutDay = sortedStats.reduce((max, day) => 
    day.out > max.value ? { date: day.date, value: day.out } : max, 
    { date: new Date(), value: 0 }
  );

  // Calcular totais mensais
  const monthlyIn = sortedStats.reduce((sum, day) => sum + day.in, 0);
  const monthlyOut = sortedStats.reduce((sum, day) => sum + day.out, 0);
  const monthlyBalance = monthlyIn - monthlyOut;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.safeArea}>
        <View style={styles.modalContainer}>
          {/* Header fixo */}
          <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>Relatório Financeiro</Text>
              <Text style={styles.subHeaderText}>{selectedMonth} • {selectedYear}</Text>
            </View>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Conteúdo completo com scroll */}
          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {/* Cartões de resumo */}
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, styles.cardShadow]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="stats-chart" size={20} color={Colors.text} />
                  <Text style={styles.cardTitle}>Resumo Mensal</Text>
                </View>
                <View style={styles.cardDivider} />
                
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Entradas</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(monthlyIn)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Saídas</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(monthlyOut)}
                    </Text>
                  </View>
                </View>

                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Saldo Final</Text>
                  <Text style={[
                    styles.balanceValue,
                    monthlyBalance >= 0 ? styles.positiveValue : styles.negativeValue
                  ]}>
                    {formatCurrency(monthlyBalance)}
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryCard, styles.cardShadow]}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="trending-up" size={20} color={Colors.text} />
                  <Text style={styles.cardTitle}>Médias Diárias</Text>
                </View>
                <View style={styles.cardDivider} />

                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>Receita média</Text>
                  <Text style={styles.averageValue}>{formatCurrency(averageRevenue)}</Text>
                </View>

                <View style={styles.averageItem}>
                  <Text style={styles.averageLabel}>Despesa média</Text>
                  <Text style={styles.averageValue}>{formatCurrency(averageExpense)}</Text>
                </View>

                <View style={[styles.averageItem, styles.totalItem]}>
                  <Text style={styles.averageLabelBold}>Saldo médio</Text>
                  <Text style={[
                    styles.averageValueBold,
                    averageBalance >= 0 ? styles.positiveValue : styles.negativeValue
                  ]}>
                    {formatCurrency(averageBalance)}
                  </Text>
                </View>
              </View>

              {/* Destaques do mês */}
              <View style={[styles.highlightsCard, styles.cardShadow]}>
                <View style={styles.cardHeader}>
                  <FontAwesome name="star" size={18} color={Colors.text} />
                  <Text style={styles.cardTitle}>Destaques</Text>
                </View>
                <View style={styles.cardDivider} />

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>
                    Maior entrada
                    <Text style={styles.highlightDate}> 
                      {maxInDay.value > 0 ? ` (dia ${moment(maxInDay.date).format('DD')})` : ''}
                    </Text>
                  </Text>
                  <Text style={[styles.highlightValue, styles.positiveValue]}>
                    {formatCurrency(maxInDay.value)}
                  </Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>
                    Maior saída
                    <Text style={styles.highlightDate}> 
                      {maxOutDay.value > 0 ? ` (dia ${moment(maxOutDay.date).format('DD')})` : ''}
                    </Text>
                  </Text>
                  <Text style={[styles.highlightValue, styles.negativeValue]}>
                    {formatCurrency(maxOutDay.value)}
                  </Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>Dias com transações</Text>
                  <Text style={styles.highlightValue}>
                    {sortedStats.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tabela de movimentações diárias */}
            <View style={[styles.tableContainer, styles.cardShadow]}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar" size={20} color={Colors.text} />
                <Text style={styles.cardTitle}>Movimentações Diárias</Text>
              </View>
              <View style={styles.cardDivider} />

              {/* Cabeçalho da tabela */}
              <View style={styles.tableHeader}>
                <View style={styles.cellContainerLeft}>
                  <Text style={styles.columnHeader}>Dia</Text>
                </View>
                <View style={styles.cellContainerRight}>
                  <Text style={styles.columnHeader}>Entradas</Text>
                </View>
                <View style={styles.cellContainerRight}>
                  <Text style={styles.columnHeader}>Saídas</Text>
                </View>
                <View style={styles.cellContainerRight}>
                  <Text style={styles.columnHeader}>Saldo</Text>
                </View>
              </View>

              {/* Conteúdo da tabela */}
              {sortedStats.length > 0 ? (
                sortedStats.map((day, index) => {
                  const dayBalance = day.in - day.out;
                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.dayRow, 
                        index % 2 === 0 ? styles.evenRow : null
                      ]}
                    >
                      <View style={styles.cellContainerLeft}>
                        <Text style={styles.dayText}>
                          {moment(day.date).format('DD')}
                          {/* <Text style={styles.dayName}>
                            {` (${moment(day.date).format('ddd')})`}
                          </Text> */}
                        </Text>
                      </View>
                      
                      <View style={styles.cellContainerRight}>
  <Text style={styles.dayText} numberOfLines={1} ellipsizeMode="tail">
    {formatCurrency(day.in)}
  </Text>
</View>
                      
<View style={styles.cellContainerRight}>
  <Text style={styles.dayText} numberOfLines={1} ellipsizeMode="tail">
    {formatCurrency(day.out)}
  </Text>
</View>

<View style={styles.cellContainerRight}>
  <Text 
    style={[
      styles.dayText,
      dayBalance >= 0 ? styles.positiveBalance : styles.negativeBalance,
    ]}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {formatCurrency(dayBalance)}
  </Text>
</View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Sem movimentações neste período</Text>
                </View>
              )}
            </View>

            {/* Espaçamento inferior */}
            <View style={styles.bottomSpace} />
          </Animated.ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
  },
  headerContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeIcon: {
    padding: 5,
  },
  scrollView: {
    backgroundColor: Colors.background,
    maxHeight: windowHeight * 0.85,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.gray95 + '20',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray95 + '20',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  positiveValue: {
    color: Colors.incomeBold,
  },
  negativeValue: {
    color: Colors.healthyBold,
  },
  averageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  averageValue: {
    fontSize: 14,
    color: Colors.text,
  },
  totalItem: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray95 + '20',
    marginTop: 4,
  },
  averageLabelBold: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  averageValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  highlightsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  highlightDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray95 + '30',
    marginHorizontal: -4, // Compensar o padding das células
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  // Novos estilos para as células da tabela com melhor espaçamento
  cellContainerLeft: {
    flex: 1.3,  // Aumentado para dar mais espaço para o texto da data
    paddingHorizontal: 6,
    alignItems: 'flex-start',
  },
  
  cellContainerRight: {
    flex: 2,  // Aumentado para comportar os valores monetários
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  dayRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
    marginHorizontal: -4, // Compensar o padding das células
  },
  evenRow: {
    backgroundColor: Colors.gray95 + '08',
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,  // Permite que o texto se comprima antes de quebrar
  },
  dayName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  positiveBalance: {
    color: Colors.incomeBold,
  },
  negativeBalance: {
    color: Colors.healthyBold,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomButtonContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray95 + '20',
  },
  closeButton: {
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 100,
  },
});

export default ReportModalDash;
