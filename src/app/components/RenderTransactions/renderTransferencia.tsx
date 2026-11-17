import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, 
  Image, ScrollView, Alert 
} from "react-native";
import { Colors } from "../../../constants/colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from "./styles";
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
  createTransfer,
} from '../../../services/api/legacy-data';
import Button from '../button';
import { useYear } from '../../../contexts/YearContext';

type RenderTransferenciaProps = {
  onClose: () => void;
  onSuccessTransaction: () => void;
  successVisible: boolean;
};

export default function RenderTransferencia({ onClose, onSuccessTransaction, successVisible }: RenderTransferenciaProps){
  // Firebase
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Contexto do mês (opcional, caso você use)
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  // Data
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Nome/descrição
  const [transactionName, setTransactionName] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');

  // Valor da transferência (string para poder formatar)
  const [transferValue, setTransferValue] = useState('');

  // Origem (sempre conta bancária)
  const [sourceId, setSourceId] = useState<string | null>(null);

  // Destino: pode ser "contas" ou "cartoes"
  const [targetPaymentType, setTargetPaymentType] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  // Dados do Firestore
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  // ### Lógica de Data e Mês
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
    

  // --- Buscar Contas (para origem e destino) ---
  useEffect(() => {
    if (!user) return;
    const ref = collection(db, 'bankAccounts');
    const q = query(ref, where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAccounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccounts(newAccounts);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Buscar Cartões (somente para destino) ---
  useEffect(() => {
    if (!user) return;
    const ref = collection(db, 'creditCard');
    const q = query(ref, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newCards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCards(newCards);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Formatador de moeda ---
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // --- Handler do DateTimePicker ---
  const handleDateChange = (event: any, date?: Date) => {
    if (date) setSelectedDate(date);
  };

  // --- Adicionar Transferência ---
  async function handleAddTransaction() {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado!");
      return;
    }
    if (!sourceId) {
      Alert.alert("Atenção", "Selecione a conta bancária de ORIGEM!");
      return;
    }
    if (!targetPaymentType || !targetId) {
      Alert.alert("Atenção", "Selecione o meio de pagamento de DESTINO!");
      return;
    }
    // Se destino for conta e for a mesma que a origem -> erro
    if (targetPaymentType === 'contas' && sourceId === targetId) {
      Alert.alert("Atenção", "Origem e destino não podem ser a mesma conta!");
      return;
    }

    // Converter valor formatado em número
    const rawValue = transferValue
      .replace(/[^\d,]/g, '')  // remove R$, pontos etc.
      .replace(',', '.');      // troca vírgula por ponto
    const amountNum = parseFloat(rawValue) || 0;

    if (amountNum <= 0) {
      Alert.alert("Atenção", "Valor inválido para transferência!");
      return;
    }

    try {
      // Precisamos "expandir" os dados (origem e destino) para armazenar:
      // 1. Origem
      const sourceObj = accounts.find((acc) => acc.id === sourceId);
      const sourceName = sourceObj?.bankName || '';
      const sourceIcon = sourceObj?.bankIcon || '';

      // 2. Destino
      let targetName = '';
      let targetIcon = '';
      if (targetPaymentType === 'contas') {
        const accObj = accounts.find((a) => a.id === targetId);
        targetName = accObj?.bankName || '';
        targetIcon = accObj?.bankIcon || '';
      } else {
        // cartoes
        const cardObj = cards.find((c) => c.id === targetId);
        targetName = cardObj?.bankName || '';
        targetIcon = cardObj?.bankIcon || '';
      }

      await createTransfer({
        name: transactionName.trim(),
        description: transactionDesc.trim(),
        amount: amountNum,
        occurredAt: selectedDate,
        sourceAccountId: sourceId,
        destinationType: targetPaymentType as 'contas' | 'cartoes',
        destinationId: targetId,
      });

      // Fecha modal e exibe sucesso
      onClose();
      onSuccessTransaction();

      // Reset
      setTransactionName('');
      setTransactionDesc('');
      setTransferValue('');
      setSourceId(null);
      setTargetPaymentType(null);
      setTargetId(null);

    } catch (error) {
      console.error("Erro ao criar transferência:", error);
      Alert.alert("Erro", "Não foi possível criar a transferência.");
    }
  }

  return (
    <View style={styles.container}>
      {/* Valor */}
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
      <Text style={styles.textTitleInput}>Nome da transferência</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Conta Inter -> Nubank"
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

      {/* Escolher se destino é Conta ou Cartão */}
      <Text style={styles.textTitleInput}>Selecione o tipo de DESTINO</Text>
      <View style={{ alignSelf: 'flex-start', paddingHorizontal: 20, gap: 14, marginBottom: 24, flexDirection: 'row' }}>
        <TouchableOpacity
          style={[
            styles.chipBase,
            targetPaymentType === 'contas' && styles.chipSelected,
          ]}
          onPress={() => {
            setTargetPaymentType('contas');
            setTargetId(null);
          }}
        >
          <Text style={[
            styles.chipText,
            targetPaymentType === 'contas' && styles.chipSelectedText,
          ]}>
            Conta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipBase,
            targetPaymentType === 'cartoes' && styles.chipSelected,
          ]}
          onPress={() => {
            setTargetPaymentType('cartoes');
            setTargetId(null);
          }}
        >
          <Text style={[
            styles.chipText,
            targetPaymentType === 'cartoes' && styles.chipSelectedText,
          ]}>
            Cartão
          </Text>
        </TouchableOpacity>
      </View>

      {/* Se destino for conta */}
      {targetPaymentType === 'contas' && (
        <>
          <Text style={styles.textTitleInput}>Conta de DESTINO</Text>
          <ScrollView
            contentContainerStyle={{ gap: 14, marginBottom: 24 }}
            horizontal
            style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
          >
            {accounts
              // Filtra a conta de origem para não aparecer igual
              .filter((acc) => acc.id !== sourceId)
              .map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.chipBase,
                    targetId === acc.id && styles.chipSelected,
                  ]}
                  onPress={() => setTargetId(acc.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image 
                      style={styles.chipImage} 
                      source={{ uri: acc.bankIcon }}
                    />
                    <Text style={[
                      styles.chipText,
                      targetId === acc.id && styles.chipSelectedText,
                    ]}>
                      {acc.bankName}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </>
      )}

      {/* Se destino for cartão */}
      {targetPaymentType === 'cartoes' && (
        <>
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
        </>
      )}

      <Button text='Adicionar' onPress={handleAddTransaction} />
    </View>
  );
}
