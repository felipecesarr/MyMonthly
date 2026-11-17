import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Dimensions, TouchableOpacity, FlatList, TouchableWithoutFeedback, Alert, Pressable } from 'react-native';
import { styles } from '../SubCategroyDetailModal/styles';
import { Colors } from '../../../constants/colors';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useMonth } from '../../../contexts/MonthContext';

const formatCurrency = (value?: number): string => {
  return value != null ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$0,00';
};

type SubCategoryDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  subCategory: IncomeSubcategory;
};

type IncomeSubcategory = {
  id: string;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  income: number;
  incomeAmount: number;
  createdAt?: Date;
};

export default function SubIncomeDetailsModal({ visible, onClose, subCategory }: SubCategoryDetailsModalProps) {
  const {selectedMonth} = useMonth();
  const [totalIncome, setTotalIncome] = useState<number>(subCategory.income-subCategory.incomeAmount);

  const transactions = [
    { id: '1', date: '01/09', amount: 50, account: "Itaú", title: "Imposto pf 2024" },
    { id: '2', date: '02/09', amount: 30, account: "Nubank", title: "Imposto mei" },
    { id: '3', date: '03/09', amount: 70, account: "Itaú", title: "Imposto shoppee" },
    { id: '4', date: '04/09', amount: 10, account: "Itaú", title: "Imposto importação" },
  ];

  const chartWidth = Dimensions.get('window').width * 1.0;
  const chartHeight = 200;
  const accumulatedBalance = transactions.reduce((acc, transaction) => {
    const lastBalance = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(lastBalance + transaction.amount);
    return acc;
  }, [] as number[]);

  const maxBalance = Math.max(...accumulatedBalance);
  const xStep = chartWidth / (accumulatedBalance.length - 1);

  const createPath = () => {
    return accumulatedBalance.reduce((path, balance, index, arr) => {
      const x = index * xStep;
      const y = chartHeight - (balance / maxBalance) * chartHeight;

      if (index === 0) {
        return `M ${x} ${y}`;
      } else {
        const prevX = (index - 1) * xStep;
        const prevY = chartHeight - (arr[index - 1] / maxBalance) * chartHeight;
        const controlX = (prevX + x) / 2;

        return `${path} C ${controlX},${prevY} ${controlX},${y} ${x},${y}`;
      }
    }, '');
  };

  const [editName, setEditName] = useState(subCategory.name);
  const [editBudget, setEditBudget] = useState(subCategory.income);

  const handlePressOnEmptyPart = () => {
    Alert.alert(
      `${subCategory.emoji} ${subCategory.name}`,
      `Falta ${formatCurrency(totalIncome)} para receber toda sua receita`,
    );
  };


  const renderHeader = () => (
    <View>
     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <View style={styles.header}>
          <TextInput style={styles.emoji}>{subCategory.emoji}</TextInput>
          <TextInput style={styles.title}>{editName}</TextInput>
        </View>
        <View style={[styles.ViewBudget, { backgroundColor: subCategory.secondaryColor }]}>
          <Text style={[styles.title, { color: subCategory.boldColor }]}>
            Receita acumulada: {formatCurrency(subCategory.incomeAmount)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={{padding: 20}} onPress={handlePressOnEmptyPart}>
        <AntDesign name="info-circle" size={24} color={Colors.grayTwo} />
      </TouchableOpacity>

      <Svg width={chartWidth} height={chartHeight} style={{ alignSelf: 'center', marginTop: 20 }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={subCategory.primaryColor} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={subCategory.primaryColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={`${createPath()} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#grad)" />
      </Svg>
      <View style={styles.rowNumberTransaction}>
        <Text style={styles.sectionTitle}>Transações</Text>
        <View style={styles.viewCountTransactions}>
          <Text style={styles.textNumber}>{transactions.length}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}> 
          <Pressable onPress={onClose} style={{flex: 1, width: '100%', height: '20%'}}/>  
          
        <View style={styles.modalContent}>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View style={styles.rowTransaction}>
                  <Text style={styles.transactionDate}>{item.title}</Text>
                  <View style={styles.viewPillBank}>
                    <Text style={styles.textPillBank}>{item.account}</Text>
                  </View>
                </View>
                <View style={styles.rowTransaction}>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                  <Text style={styles.transactionAmount}>{formatCurrency(Number(item.amount))}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noTransactions}>Nenhuma transação encontrada para este mês.</Text>
            }
            contentContainerStyle={{ gap: 20, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
        </View> 
    </Modal>
  );
}
