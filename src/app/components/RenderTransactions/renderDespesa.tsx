import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ScrollView,
  Alert 
} from "react-native";
import { Colors } from "../../../constants/colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from "./styles";
import moment from "moment";
import { useMonth } from '../../../contexts/MonthContext';
import { getAuth, getFirestore, collection, onSnapshot, query, orderBy, where, createExpenseTransaction } from '../../../services/api/legacy-data';
import Button from '../button';
import SuccessTransactions from '../SuccessTransactions';  // <-- Componente de sucesso
import { useYear } from '../../../contexts/YearContext';

type RenderDespesaProps = {
  onClose: () => void;                // Função do componente pai que fecha o modal
  onSuccessTransaction: () => void;  // Chamado após salvar a despesa
  successVisible: boolean;
};

export default function RenderDespesa({ onClose, onSuccessTransaction }: RenderDespesaProps) {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  // Data e form states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenseValue, setExpenseValue] = useState<string>(''); 
  const [transactionName, setTransactionName] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');

  // Tipo de pagamento ('contas' ou 'cartoes'), e qual conta/cartão foi selecionado
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Categoria/subcategoria
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Arrays obtidos do Firestore
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Para controlar exibição do SuccessTransactions
  const [successVisible, setSuccessVisible] = useState(false);

  // Limites do mês
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
  

  // Handler do DateTimePicker
  const handleDateChange = (event: any, date?: Date) => {
    if (date) setSelectedDate(date);
  };

  // Formata valor monetário enquanto digita ("R$ 1.234,56")
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, '') || '0') / 100;
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // 1) Buscar Contas Bancárias
  useEffect(() => {
    if (user) {
      const ref = collection(db,'bankAccounts');
      const q = query(ref, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newAccounts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(newAccounts);
      });
      return () => unsubscribe();
    }
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

  // 3) Buscar Categorias de despesa
  useEffect(() => {
    if (user) {
      const refCat = collection(db,'categories');
      const q = query(refCat, where('userId', '==', user.uid));

      const catQuery = query(q, orderBy('createdAt', 'asc'));
      const unsubscribeCat = onSnapshot(catQuery, (snapshot) => {
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(cats);
      });
      return () => unsubscribeCat();
    }
  }, [user]);

  // 4) Buscar Subcategorias de despesa (quando selecionar uma categoria)
  useEffect(() => {
    if (user && selectedCategory) {
      const refSub = collection(db,'categories', selectedCategory, 'subcategories');
      const q = query(refSub, where('userId', '==', user.uid));

      const unsubscribeSub = onSnapshot(q, (snapshot) => {
        const subs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubcategories(subs);
      });
      return () => unsubscribeSub();
    } else {
      setSubcategories([]);
    }
  }, [user, selectedCategory]);

  // =========== ADICIONAR DESPESA ===========
  async function handleAddTransaction() {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado!");
      return;
    }
    if (!selectedPaymentType || !selectedAccount) {
      Alert.alert("Atenção", "Selecione Conta ou Cartão!");
      return;
    }
    if (!selectedCategory || !selectedSubcategory) {
      Alert.alert("Atenção", "Selecione a categoria e subcategoria!");
      return;
    }
    if (!transactionName.trim()) {
      Alert.alert("Atenção", "Digite o nome da transação!");
      return;
    }
  
    // Converte expenseValue em número
    const rawValue = expenseValue.replace(/[^\d,]/g, '').replace(',', '.');
    const amountNum = parseFloat(rawValue) || 0;
    if (amountNum <= 0) {
      Alert.alert('Valor inválido', 'O valor da despesa deve ser maior que zero.');
      return;
    }
  
    // Obter dados da conta ou cartão
    let accountOrCardName = '';
    let accountOrCardIcon = '';
    if (selectedPaymentType === 'contas') {
      const accObj = accounts.find((a) => a.id === selectedAccount);
      accountOrCardName = accObj?.bankName || '';
      accountOrCardIcon = accObj?.bankIcon || '';
    } else {
      const cardObj = cards.find((c) => c.id === selectedAccount);
      accountOrCardName = cardObj?.bankName || '';
      accountOrCardIcon = cardObj?.bankIcon || '';
    }
  
    // Obter dados da categoria e subcategoria
    const catObj = categories.find((cat) => cat.id === selectedCategory);
    const catEmoji = catObj?.emoji || '';
    const catPrimaryColor = catObj?.primaryColor || '';
    const catName = catObj?.name || '';
  
    const subObj = subcategories.find((sub) => sub.id === selectedSubcategory);
    const subEmoji = subObj?.emoji || '';
    const subSecondaryColor = subObj?.secondaryColor || '';
    const subBoldColor = subObj?.boldColor || '';
    const subName = subObj?.name || '';
  
    // Monta objeto de despesa
    const transactionData = {
      type: 'despesa',
      date: selectedDate,
      createdAt: new Date(),
      amount: amountNum,
      userId: user.uid,
      name: transactionName,
      description: transactionDesc,
      paymentType: selectedPaymentType,
      accountOrCardId: selectedAccount,
      accountOrCardName,
      accountOrCardIcon,
      categoryId: selectedCategory,
      categoryName: catName,
      categoryEmoji: catEmoji,
      categoryPrimaryColor: catPrimaryColor,
      subcategoryId: selectedSubcategory,
      subcategoryName: subName,
      subcategoryEmoji: subEmoji,
      subcategorySecondaryColor: subSecondaryColor,
      subcategoryBoldColor: subBoldColor,
    };
  
    try {
      await createExpenseTransaction({
        name: transactionName.trim(),
        description: transactionDesc.trim(),
        amount: amountNum,
        occurredAt: selectedDate,
        paymentType: selectedPaymentType as 'contas' | 'cartoes',
        accountOrCardId: selectedAccount,
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory,
      });
  
      onClose();
      onSuccessTransaction();
    } catch (error) {
      console.error('Erro ao adicionar a transação de despesa:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a despesa agora.');
    }
  }
  

  // Quando o "SuccessTransactions" termina de animar a saída (onClose), chamamos onClose
  function handleSuccessClose() {
    onClose(); 
    setSuccessVisible(false);
  }

  return (
    <View style={styles.container}>
        
      {/* Valor da despesa */}
      <Text style={styles.textTitleInput}>Valor da despesa</Text>
      <TextInput
        style={styles.inputValue}
        placeholder="R$ 0,00"
        placeholderTextColor={Colors.text}
        value={expenseValue}
        onChangeText={(value) => setExpenseValue(formatCurrency(value))}
        keyboardType="numeric"
      />

      <Text style={styles.textTitleInput}>Nome da transação</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Padaria Kipão"
        placeholderTextColor={Colors.gray95}
        value={transactionName}
        onChangeText={setTransactionName}
      />
      
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

      {/* Seletor de 'contas' ou 'cartoes' */}
      <Text style={styles.textTitleInput}>Selecione um meio de pagamento</Text>
      <View style={{ 
        alignSelf: 'flex-start', 
        paddingHorizontal: 20, 
        gap: 14, 
        marginBottom: 24, 
        flexDirection: 'row' 
      }}>
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
            Contas
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
            Cartões
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de contas ou cartões */}
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

      {/* Categorias */}
      <Text style={styles.textTitleInput}>Selecione uma categoria de despesa</Text>
      <ScrollView 
        contentContainerStyle={{ gap: 14, marginBottom: 24, paddingEnd: 20 }}
        horizontal 
        style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
      >
        {categories.map((cat) => {
          const isSelected = (selectedCategory === cat.id);
          const backgroundColor = isSelected ? cat.primaryColor || '#eee' : '#eee';
          const textColor = isSelected ? '#fff' : Colors.text;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chipBase, { backgroundColor }]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.chipText, { color: textColor }]}>
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Subcategorias */}
      {subcategories.length > 0 && (
        <>
          <Text style={styles.textTitleInput}>Selecione a subcategoria</Text>
          <ScrollView 
            contentContainerStyle={{ gap: 14, marginBottom: 24, paddingEnd: 20 }}
            horizontal 
            style={{ alignSelf: 'flex-start', paddingHorizontal: 20 }}
          >
            {subcategories.map((sub) => {
              const isSubSelected = (selectedSubcategory === sub.id);
              const bgColor = isSubSelected ? sub.secondaryColor || '#eee' : '#eee';
              const txtColor = isSubSelected ? sub.boldColor || '#fff' : Colors.text;
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.chipBase, { backgroundColor: bgColor }]}
                  onPress={() => setSelectedSubcategory(sub.id)}
                >
                  <Text style={[styles.chipText, { color: txtColor }]}>
                    {sub.emoji} {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Botão final */}
      <Button text="Adicionar" onPress={handleAddTransaction} />

      {/* Exibir mensagem de sucesso quando successVisible == true */}
      {successVisible && (
        <SuccessTransactions
          message="Despesa adicionada com sucesso!"
          onClose={handleSuccessClose}
          successVisible={successVisible}
        />
      )}
    </View>
  );
}
