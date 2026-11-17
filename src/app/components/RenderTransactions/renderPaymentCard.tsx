import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, 
  Image, ScrollView, Alert 
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";
import { useMonth } from '../../../contexts/MonthContext';
import { 
  getAuth,
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  query,
  where,
  createCardPayment,
} from '../../../services/api/legacy-data';
import Button from '../button';
import { styles } from "./styles";
import { Colors } from '../../../constants/colors';
import { useYear } from '../../../contexts/YearContext';

type RenderPaymentCardProps = {
  onClose: () => void;
  onSuccessTransaction: () => void;
  successVisible: boolean;
};

export default function RenderPaymentCard({ onClose, onSuccessTransaction, successVisible }: RenderPaymentCardProps){
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactionName, setTransactionName] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const [transferValue, setTransferValue] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetPaymentType, setTargetPaymentType] = useState<string | null>('cartoes');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  const getMonthLimits = () => {
    const monthIndex = moment().month(selectedMonth).month();
    const startDate = moment().month(monthIndex).startOf('month').toDate();
    const endDate = moment().month(monthIndex).endOf('month').toDate();
    return { startDate, endDate };
  };
  const { startDate, endDate } = getMonthLimits();

  useEffect(() => {
      const { startDate, endDate } = getMonthLimits();
      // Se a data selecionada atual estiver fora dos limites, ajusta para, por exemplo, o último dia do mês
      if (selectedDate < startDate || selectedDate > endDate) {
        setSelectedDate(endDate);
      }
    }, [selectedMonth, selectedYear]);
    
  
  useEffect(() => {
    if (!user) return;
    const ref = collection(db,'bankAccounts');
    const q = query(ref, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ref = collection(db,'creditCard');
    const q = query(ref, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) setSelectedDate(date);
  };

  async function handleAddTransaction() {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado!");
      return;
    }
    if (!sourceId || !targetId) {
      Alert.alert("Atenção", "Selecione a conta de origem e o cartão de destino!");
      return;
    }

    const rawValue = transferValue.replace(/[^\d,]/g, '').replace(',', '.');
    const amountNum = parseFloat(rawValue) || 0;
    if (amountNum <= 0) {
      Alert.alert("Atenção", "Valor inválido!");
      return;
    }

    try {
      const sourceObj = accounts.find(acc => acc.id === sourceId);
      const cardObj = cards.find(c => c.id === targetId);
      if (!sourceObj || !cardObj) {
        Alert.alert("Erro", "Conta de origem ou cartão de destino não encontrado!");
        return;
      }

      await createCardPayment({
        name: transactionName.trim(),
        description: transactionDesc.trim(),
        amount: amountNum,
        occurredAt: selectedDate,
        sourceAccountId: sourceId,
        destinationCardId: targetId,
      });

      onClose();
      onSuccessTransaction();
      setTransactionName('');
      setTransactionDesc('');
      setTransferValue('');
      setSourceId(null);
      setTargetId(null);
    } catch (error) {
      console.error("Erro ao criar pagamento da fatura:", error);
      Alert.alert("Erro", "Não foi possível criar o pagamento da fatura.");
    }
  }

  return (
    <View style={styles.container}>
      {/* Valor da Transferência */}
      <Text style={styles.textTitleInput}>Valor da transferência</Text>
      <TextInput
        style={styles.inputValue}
        placeholder="R$ 0,00"
        placeholderTextColor={Colors.text}
        value={transferValue}
        onChangeText={(value) => setTransferValue(formatCurrency(value))}
        keyboardType="numeric"
      />

      {/* Nome e Descrição */}
      <Text style={styles.textTitleInput}>Nome da transação</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Pagamento fatura cartão"
        placeholderTextColor={Colors.gray95}
        value={transactionName}
        onChangeText={setTransactionName}
      />

      {/* Data */}
      <Text style={styles.textTitleInput}>Data da transação</Text>
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        minimumDate={startDate}
        maximumDate={endDate}
        onChange={handleDateChange}
        style={{ 
          alignSelf: 'flex-start', 
          borderRadius: 100, 
          marginBottom: 24, 
          paddingHorizontal: 20 
        }}
      />

      {/* Conta de ORIGEM */}
      <Text style={styles.textTitleInput}>Conta de ORIGEM</Text>
      <ScrollView
        contentContainerStyle={{ gap: 14, marginBottom: 24 }}
        horizontal
        style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
      >
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[
              styles.chipBase,
              sourceId === acc.id && styles.chipSelected,
            ]}
            onPress={() => setSourceId(acc.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image 
                style={styles.chipImage} 
                source={{ uri: acc.bankIcon }}
              />
              <Text style={[
                styles.chipText,
                sourceId === acc.id && styles.chipSelectedText,
              ]}>
                {acc.bankName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Destino: para pagamento, o destino deve ser um cartão */}
      <Text style={styles.textTitleInput}>Cartão de DESTINO</Text>
      <ScrollView
        contentContainerStyle={{ gap: 14, marginBottom: 24 }}
        horizontal
        style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
      >
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.chipBase,
              targetId === card.id && styles.chipSelected,
            ]}
            onPress={() => setTargetId(card.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image 
                style={styles.chipImage} 
                source={{ uri: card.bankIcon }}
              />
              <Text style={[
                styles.chipText,
                targetId === card.id && styles.chipSelectedText,
              ]}>
                {card.bankName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Button text='Adicionar' onPress={handleAddTransaction} />
    </View>
  );
}
