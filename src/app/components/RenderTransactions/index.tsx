import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView,Alert } from "react-native";
import { Colors } from "../../../constants/colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from "./styles";
import moment from "moment";
import { useMonth } from '../../../contexts/MonthContext';
import { getAuth, getFirestore, collection, onSnapshot, query, where, createIncomeTransaction } from '../../../services/api/legacy-data';
import Button from '../button';
import { useYear } from '../../../contexts/YearContext';

type RenderReceitaProps = {
  onClose: () => void;
  onSuccessTransaction: () => void;
  successVisible: boolean;
};

export default function RenderReceita({ onClose, onSuccessTransaction, successVisible }: RenderReceitaProps) {
  // Firestore e Auth
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Context do mês (se for o seu caso)
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  // Data
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Valor da receita (string para permitir formatação)
  const [incomeValue, setIncomeValue] = useState<string>('');

  // Form fields
  const [transactionName, setTransactionName] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');

  // Selecione o pagamento (conta ou cartão)
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Categorias de receita
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Dados do Firestore
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [incomeSubcategories, setIncomeSubcategories] = useState<any[]>([]);

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

  // Handler para o DateTimePicker
  const handleDateChange = (event: any, date?: Date) => {
    if (date) setSelectedDate(date);
  };

  // Formata valor monetário durante a digitação: R$ 1.234,56
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Buscar contas bancárias
  useEffect(() => {
    if (!user) return;
    
    const ref = collection(db, 'bankAccounts');
    const q = query(ref, where('userId', '==', user.uid));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ Nenhuma conta bancária encontrada para este usuário!");
      }
  
      const newAccounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccounts(newAccounts);
    });
  
    return () => unsubscribe();
  }, [user]);
  
  

  // 2) Buscar Cartões
  useEffect(() => {
    if (user) {
      const ref = collection(db, 'creditCard');
      const q = query(ref, where('userId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newCards = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCards(newCards);
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  // Buscar categorias de receita
  useEffect(() => {
    if (!user) return;
    const refCat = collection(db,'incomeCategories');
    const q = query(refCat, where('userId', '==', user.uid));

    const unsubscribeCat = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncomeCategories(cats);
    });
    return () => unsubscribeCat();
  }, [user]);

  // Buscar subcategorias (quando selectedIncomeCategory mudar)
  useEffect(() => {
    if (user && selectedIncomeCategory) {
      const refSub = collection(
        db, 
        'incomeCategories',
        selectedIncomeCategory,
        'incomeSubcategories'
      );
      const q = query(refSub, where('userId', '==', user.uid));

      const unsubscribeSub = onSnapshot(q, (snapshot) => {
        const subs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIncomeSubcategories(subs);
      });
      return () => unsubscribeSub();
    } else {
      setIncomeSubcategories([]);
    }
  }, [user, selectedIncomeCategory]);

  // Adicionar RECEITA em "users/{uid}/transactions"
  async function handleAddTransaction() {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado!");
      return;
    }
    if (!selectedPaymentType) {
      Alert.alert("Atenção", "Selecione se é conta ou cartão!");
      return;
    }
    if (!selectedAccount) {
      Alert.alert("Atenção", "Selecione a conta/cartão para receber a receita!");
      return;
    }
    if (!selectedIncomeCategory || !selectedSubcategory) {
      Alert.alert("Atenção", "Selecione a categoria e subcategoria antes de adicionar!");
      return;
    }
    if (!transactionName.trim()) {
      Alert.alert("Atenção", "Digite o nome da transação!");
      return;
    }
    if (!incomeValue) {
      Alert.alert("Atenção", "Digite o valor da receita!");
      return;
    }

    // Converter incomeValue formatado em número
    const rawValue = incomeValue
      .replace(/[^\d,]/g, '') // remove R$, pontos etc.
      .replace(',', '.');     // troca vírgula por ponto
    const amountNum = parseFloat(rawValue) || 0;
    if (amountNum <= 0) {
      Alert.alert("Valor inválido", "O valor da receita deve ser maior que zero.");
      return;
    }

    // ------> Obter dados da conta/cartão selecionado
    const selectedAccObj = accounts.find(acc => acc.id === selectedAccount);
    let bankNameOrCardName = selectedAccObj ? selectedAccObj.bankName : '';
    let bankIconOrCardIcon = selectedAccObj ? selectedAccObj.bankIcon : '';

    // Se você também quiser buscar "cards" (caso use cartoes), faça outro state e verifique 
    // qual array deve filtrar. Abaixo é só exemplificativo (depende da sua lógica).
    // Exemplo:
    // const selectedCardObj = cards.find(c => c.id === selectedAccount);

    // ------> Obter dados da categoria selecionada
    const selectedCatObj = incomeCategories.find(cat => cat.id === selectedIncomeCategory);
    let categoryName = selectedCatObj?.name || '';
    let categoryEmoji = selectedCatObj?.emoji || '';
    let categoryPrimaryColor = selectedCatObj?.primaryColor || '';

    // ------> Obter dados da subcategoria selecionada
    const selectedSubObj = incomeSubcategories.find(sub => sub.id === selectedSubcategory);
    let subcategoryName = selectedSubObj?.name || '';
    let subcategoryEmoji = selectedSubObj?.emoji || '';
    let subcategorySecondaryColor = selectedSubObj?.secondaryColor || '';
    let subcategoryBoldColor = selectedSubObj?.boldColor || '';

    // Montar o objeto da transação
    const transactionData = {
      type: "receita",
      date: selectedDate,
      createdAt: new Date(),

      // Dados básicos
      name: transactionName,
      description: transactionDesc,
      amount: amountNum,
      userId: user.uid,

      // Referência a conta/cartão
      paymentType: selectedPaymentType,   // 'contas' ou 'cartoes'
      accountOrCardId: selectedAccount,
      accountOrCardName: bankNameOrCardName,
      accountOrCardIcon: bankIconOrCardIcon,

      // Categoria e subcategoria
      categoryId: selectedIncomeCategory,
      subcategoryId: selectedSubcategory,

      // Categoria e subcategoria "expandida"
      categoryName,
      categoryEmoji,
      categoryPrimaryColor,

      subcategoryName,
      subcategoryEmoji,
      subcategorySecondaryColor,
      subcategoryBoldColor
    };

    try {
      await createIncomeTransaction({
        name: transactionName.trim(),
        description: transactionDesc.trim(),
        amount: amountNum,
        occurredAt: selectedDate,
        paymentType: selectedPaymentType as 'contas' | 'cartoes',
        accountOrCardId: selectedAccount,
        categoryId: selectedIncomeCategory,
        subcategoryId: selectedSubcategory,
      });

      // 4) Depois de salvar, fechamos modal e chamamos o onSuccessTransaction
      onClose();
      onSuccessTransaction();

      // Resetar campos
      setIncomeValue('');
      setTransactionName('');
      setTransactionDesc('');
      setSelectedPaymentType(null);
      setSelectedAccount(null);
      setSelectedIncomeCategory(null);
      setSelectedSubcategory(null);

    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      Alert.alert("Erro", "Não foi possível adicionar a receita.");
    }
  }

  return (
    <View style={styles.container}>
      
      {/* Valor da RECEITA */}
      <Text style={styles.textTitleInput}>Valor da receita</Text>
      <TextInput
        style={styles.inputValue}
        placeholder="R$ 0,00"
        placeholderTextColor={Colors.text}
        value={incomeValue}
        onChangeText={(value) => setIncomeValue(formatCurrency(value))}
        keyboardType="numeric"
      />

      {/* Nome / Descrição */}
      <Text style={styles.textTitleInput}>Nome da transação</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Salário, Venda de bolo, etc."
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

      {/* Selecione se é conta ou cartão */}
      <Text style={styles.textTitleInput}>Meio de pagamento</Text>
      <View style={{ alignSelf: 'flex-start', paddingHorizontal: 20, gap: 14, marginBottom: 24, flexDirection: 'row' }}>
        <TouchableOpacity
          style={[
            styles.chipBase,
            selectedPaymentType === 'contas' && styles.chipSelected,
          ]}
          onPress={() => {
            setSelectedPaymentType('contas');
            setSelectedAccount(null);
          }}
        >
          <Text style={[
            styles.chipText,
            selectedPaymentType === 'contas' && styles.chipSelectedText,
          ]}>
            Conta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipBase,
            selectedPaymentType === 'cartoes' && styles.chipSelected,
          ]}
          onPress={() => {
            setSelectedPaymentType('cartoes');
            setSelectedAccount(null);
          }}
        >
          <Text style={[
            styles.chipText,
            selectedPaymentType === 'cartoes' && styles.chipSelectedText,
          ]}>
            Cartão
          </Text>
        </TouchableOpacity>
      </View>

      {/* Se for conta, renderiza a lista de "accounts" */}
      {selectedPaymentType === 'contas' && (
        <>
          <Text style={styles.textTitleInput}>Selecione uma conta bancária</Text>
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
                  selectedAccount === acc.id && styles.chipSelected,
                ]}
                onPress={() => setSelectedAccount(acc.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Image 
                    style={styles.chipImage} 
                    source={{ uri: acc.bankIcon }}
                  />
                  <Text style={[
                    styles.chipText,
                    selectedAccount === acc.id && styles.chipSelectedText,
                  ]}>
                    {acc.bankName}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {selectedPaymentType === 'cartoes' && (
              <>
                <Text style={styles.textTitleInput}>Selecione um cartão de crédito</Text>
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
                        selectedAccount === card.id && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedAccount(card.id)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image 
                          style={styles.chipImage} 
                          source={{ uri: card.bankIcon }}
                        />
                        <Text style={[
                          styles.chipText,
                          selectedAccount === card.id && styles.chipSelectedText,
                        ]}>
                          {card.bankName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

      {/* Categorias e Subcategorias */}
      <Text style={styles.textTitleInput}>Selecione uma categoria de RECEITA</Text>
      <ScrollView 
        contentContainerStyle={{ gap: 14, marginBottom: 24 }}
        horizontal
        style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
      >
        {incomeCategories.map((cat) => {
          const isCatSelected = selectedIncomeCategory === cat.id;
          const backgroundColor = isCatSelected ? (cat.primaryColor || '#eee') : '#eee';
          const textColor = isCatSelected ? '#fff' : Colors.text;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chipBase, { backgroundColor }]}
              onPress={() => setSelectedIncomeCategory(cat.id)}
            >
              <Text style={[styles.chipText, { color: textColor }]}>
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {incomeSubcategories.length > 0 && (
        <>
          <Text style={styles.textTitleInput}>Selecione a subcategoria</Text>
          <ScrollView
            contentContainerStyle={{ gap: 14, marginBottom: 24 }}
            horizontal
            style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
          >
            {incomeSubcategories.map((sub) => {
              const isSubSelected = selectedSubcategory === sub.id;
              const subBgColor = isSubSelected ? (sub.secondaryColor || '#eee') : '#eee';
              const subTextColor = isSubSelected ? sub.boldColor : Colors.text; // ou sub.boldColor?

              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.chipBase, { backgroundColor: subBgColor }]}
                  onPress={() => setSelectedSubcategory(sub.id)}
                >
                  <Text style={[styles.chipText, { color: subTextColor }]}>
                    {sub.emoji} {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      <Button text="Adicionar" onPress={handleAddTransaction} />
    </View>
  );
}
