import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, Modal, TouchableOpacity,
  Pressable, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, 
  Alert, ScrollView
} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';

import CardTransactions from '../../components/CardTransactions';
import FilterTransactions from '../../components/filterTransactions';
import TransactionType from '../../components/TransactionType';
import RenderReceita from '../../components/RenderTransactions';
import RenderDespesa from '../../components/RenderTransactions/renderDespesa';
import RenderTransferencia from '../../components/RenderTransactions/renderTransferencia';
import RenderPaymentCard from '../../components/RenderTransactions/renderPaymentCard';
import SuccessTransactions from '../../components/SuccessTransactions';
import SuccessDeleteTransaction from '../../components/SuccesDeleteTransaction';

import { getAuth, getFirestore, collection, query, orderBy, onSnapshot, where, deleteFinancialTransaction } from '../../../services/api/legacy-data';

import { useMonth } from '../../../contexts/MonthContext';
// ADIÇÃO para YEAR:
import { useYear } from '../../../contexts/YearContext';

import { SwipeListView } from 'react-native-swipe-list-view';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalPaymentPlus from '../../components/ModalPaymentPlus';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';

// Adicione no início do componente, junto com outros imports
import * as Haptics from 'expo-haptics';


export default function Transactions() {
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const isFocused = useIsFocused();

  const calendarRef = React.useRef<ScrollView>(null);

  const { user: revUser } = useRevenueCat();
  const [modalPayment, setModalPayment] = useState(false);

  // Filtro de transações (Todas / Entradas / Saídas)
  const [selectedFilter, setSelectedFilter] = useState<'Todas' | 'Entradas' | 'Saídas'>('Todas');

  // Mês selecionado via contexto
  const { selectedMonth } = useMonth(); 
  // ADIÇÃO para YEAR:
  // Ler o ano selecionado do YearContext
  const { selectedYear } = useYear();

  const currentDay = moment();

  // Lista de transações
  const [transactions, setTransactions] = useState<any[]>([]);
  

  // Modais e estados de sucesso
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTypeVisible, setModalTypeVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('receita');
  const [selectedType, setSelectedType] = useState<string | null>('Receita');
  const [successVisible, setSuccessVisible] = useState(false);

  // Alerta de deleção bem-sucedida
  const [successDeleteVisible, setSuccessDeleteVisible] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Mapeando nome do mês para índice
  const monthNames = useMemo(
    () => [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ],
    []
  );
  const monthIndex = monthNames.indexOf(selectedMonth);

  // === ADIÇÃO para YEAR ===
  // 1) Criar um moment base
  let monthMoment = moment();

  // 2) Se temos um selectedYear válido, definimos o ANO
  //    Ex: se selectedYear = '2025', parseInt para 2025
  if (selectedYear) {
    monthMoment = monthMoment.year(Number(selectedYear));
  }

  // 3) Se for 'Anual' ou se monthIndex = -1, significa que "não" definimos .month()
  //    Caso contrário, definimos o mês
  if (selectedMonth !== 'Anual' && monthIndex !== -1) {
    monthMoment = monthMoment.month(monthIndex);
  }

  // Número total de dias no mês (se for 'Anual', vamos tratar daqui a pouco)
  const numberOfDays = (selectedMonth === 'Anual')
    ? 0 // ou outro valor, se não queremos criar dias
    : monthMoment.daysInMonth();

  // Array de dias somente se não for 'Anual'
  const daysArray = useMemo(() => {
    if (selectedMonth === 'Anual') {
      return []; // sem dias, pois é anual
    }
    return Array.from({ length: numberOfDays }, (_, i) => {
      return monthMoment.clone().date(i + 1);
    });
  }, [monthMoment, numberOfDays, selectedMonth]);

  // selectedDay inicia com 'hoje'
  const [selectedDay, setSelectedDay] = useState<string>(
    moment().format('YYYY-MM-DD') 
  );

  // Sempre que o 'selectedMonth' mudar, definimos o dia inicial (hoje, se estiver no mesmo ano/mês, senão dia 1)
  useEffect(() => {
    // Se for Anual, podemos definir ou não um dia
    if (selectedMonth === 'Anual') {
      // Exemplo: define 1º dia do ANO
      const yearToNumber = Number(selectedYear) || moment().year();
      const startOfYear = moment().year(yearToNumber).startOf('year');
      setSelectedDay(startOfYear.format('YYYY-MM-DD'));
      return;
    }
    // Se for mês normal:
    const today = moment();
    const thisYear = Number(selectedYear) || moment().year();
    // Verifica se 'today' está no mesmo ano e mês
    if (today.year() === thisYear && today.month() === monthMoment.month()) {
      setSelectedDay(today.format('YYYY-MM-DD'));
    } else {
      // dia 1 do monthMoment
      setSelectedDay(monthMoment.clone().date(1).format('YYYY-MM-DD'));
    }
  }, [selectedMonth, selectedYear]); // rodar sempre que mês ou ano mudar

  // Busca transações do Firestore
  useEffect(() => {
    if (!user || !isFocused) return;
    const ref = collection(db,'transactions');
    const q = query(ref, orderBy('date', 'desc'), where("userId", "==", user.uid),);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(newTransactions);
    });
    return () => unsubscribe();
  }, [user, db, isFocused]);

  // Formata valores monetários
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filtra as transações (Todas, Entradas, Saídas)
  function applyFilter(txList: any[]) {
    if (selectedFilter === 'Todas') {
      return txList;
    } else if (selectedFilter === 'Entradas') {
      return txList.filter(tx => 
        tx.type === 'receita' || (tx.type === 'transferencia' && tx.direction === 'entrada')
      );
    } else {
      // 'Saídas'
      return txList.filter(tx =>
        tx.type === 'despesa' || (tx.type === 'transferencia' && tx.direction === 'saida')
      );
    }
  }

  // Transações do dia (ou do ano, se Anual)
  const transactionsForSelectedDay = useMemo(() => {
    // Se for 'Anual', filtramos tudo que pertença a selectedYear
    if (selectedMonth === 'Anual') {
      const yearNum = Number(selectedYear) || moment().year();
      return transactions.filter(tx => {
        if (tx.date?.toDate) {
          const txYear = moment(tx.date.toDate()).year();
          return txYear === yearNum;
        }
        return false;
      });
    } else {
      // Mês normal
      return transactions.filter(tx => {
        if (tx.date?.toDate) {
          const txDate = moment(tx.date.toDate()).format('YYYY-MM-DD');
          return txDate === selectedDay;
        }
        return false;
      });
    }
  }, [transactions, selectedDay, selectedMonth, selectedYear]);

  // Aplica o filtro (Entradas, Saídas, etc.)
  const filteredTransactions = useMemo(() => {
    return applyFilter(transactionsForSelectedDay);
  }, [transactionsForSelectedDay, selectedFilter]);

  // Calcular Entradas e Saídas
  const totalEntradas = useMemo(() => {
    return transactionsForSelectedDay.reduce((sum, tx) => {
      if (tx.type === 'receita' || (tx.type === 'transferencia' && tx.direction === 'entrada')) {
        return sum + Number(tx.amount);
      }
      return sum;
    }, 0);
  }, [transactionsForSelectedDay]);

  const totalSaidas = useMemo(() => {
    return transactionsForSelectedDay.reduce((sum, tx) => {
      if (tx.type === 'despesa' || (tx.type === 'transferencia' && tx.direction === 'saida')) {
        return sum + Number(tx.amount);
      }
      return sum;
    }, 0);
  }, [transactionsForSelectedDay]);

  // Handler de transação salva
  function handleSuccessTransaction() {
    setModalVisible(false);
    setSuccessVisible(true);
  }
  function handleCloseSuccess() {
    setSuccessVisible(false);
  }

  function handleDeleteTransaction(id: string) {
    if (!user) return;
    Alert.alert(
      'Excluir transação',
      'O saldo e os totais relacionados também serão revertidos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFinancialTransaction(id);
              setDeleteMessage('Transação deletada com sucesso!');
              setSuccessDeleteVisible(true);
            } catch (error) {
              console.error('Erro ao deletar transação:', error);
              Alert.alert('Erro', 'Não foi possível excluir a transação.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  function handleCloseDeleteAlert() {
    setSuccessDeleteVisible(false);
  }

  // Render cada transação
  function renderItemTransaction({ item }: { item: any }) {
    let finalBankIcon = item.accountOrCardIcon || '';
  
    if (item.type === 'transferencia') {
      finalBankIcon = (item.direction === 'saida') ? (item.fromIcon || item.bankIcon || '') : (item.toIcon || item.bankIcon || '');
    } 
    else if (item.type === 'fatura') {
      finalBankIcon = (item.direction === 'saida') ? (item.fromIcon || item.bankIcon || '') : (item.toIcon || item.bankIcon || '');
    }

  
    return (
      <CardTransactions
      data={{
        id: item.id,
        type: item.type,
        title: item.name || '',
        bank: item.accountOrCardName || '',
        bankIcon: finalBankIcon, // Agora deve passar corretamente
        direction: item.direction || 'entrada',

        // 🛠️ Aqui verificamos se os dados de categoria estão vindo corretamente
        categoryEmoji: item.categoryEmoji || '❓',
        categoryPrimaryColor: item.categoryPrimaryColor || '#EEE',
        subcategoryEmoji: item.subcategoryEmoji || '',
        subcategoryName: item.subcategoryName || '',
        subcategorySecondaryColor: item.subcategorySecondaryColor || '#EEE',
        subcategoryBoldColor: item.subcategoryBoldColor || '#000',

        amount: item.amount || 0,
        icon: getIconByType(item.type),
      }}
    />
    );
  }

  // Render oculto (swipe)
  function renderHiddenItemTransaction({ item }: { item: any }) {
    return (
      <View style={styles.hiddenRow}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Fontisto name="trash" size={20} color={Colors.healthyBold} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Fontisto name="trash" size={20} color={Colors.healthyBold} />
        </TouchableOpacity>
      </View>
    );
  }

  // Ícone
  function getIconByType(type: string) {
    if (type === 'receita') {
      return <Feather name="arrow-up-right" size={24} color={Colors.text} />;
    } else if (type === 'despesa') {
      return <Feather name="arrow-down-right" size={24} color={Colors.text} />;
    } else if (type === 'fatura'){
      return <MaterialCommunityIcons  name="credit-card-sync" size={26} color={Colors.text} />;
    } else {
      return <FontAwesome6 name="arrows-rotate" size={20} color={Colors.text} />;
    }
  }

  function addTransactionVerification() {
    // Se o usuário for plus, pode adicionar transações sem limites
    if (revUser.plus) {
      setModalVisible(true);
      return;
    }
    // Se não for plus, vamos checar quantas transações ele já criou
    // As transações do usuário atual já estão em `transactions`
    const userTxCount = transactions.length; // pois a query filtra userId = user.uid
    // Se ele tiver menos de 10 transações, ainda pode adicionar
    if (userTxCount < 10) {
      setModalVisible(true);
    } else {
      // Caso já tenha 10 ou mais, bloqueia e abre o modal de pagamento
      setModalPayment(true);
    }
  }

  // Adicione esta função dentro do componente Transactions

// Função para calcular a porcentagem (evitando divisão por zero)
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
  

  // Cabeçalho da lista de transações
  function renderHeader() {
    // Se for 'Anual', não renderizamos o calendário de dias
    if (selectedMonth === 'Anual') {
      return (
        <View style={styles.container}>
          {/* Entradas / Saídas */}
          <View style={styles.viewsRowMovements}>
            <View style={styles.viewMovements}>
              <View style={styles.viewTextRow}>
                <Text style={styles.textState}>Entradas</Text>
                <Ionicons name="trending-up" size={24} color={Colors.gray95} />
              </View>
              <Text style={styles.textValue}>{formatCurrency(totalEntradas)}</Text>
            </View>

            <View style={styles.viewMovements}>
              <View style={styles.viewTextRow}>
                <Text style={styles.textState}>Saídas</Text>
                <Ionicons name="trending-down" size={24} color={Colors.gray95} />
              </View>
              <Text style={styles.textValue}>{formatCurrency(totalSaidas)}</Text>
            </View>
          </View>

          {/* Título "Transações" e quantidade */}
          <View style={styles.textHeader}>
            <Text style={styles.textCard}>Transações (Anual)</Text>
            <View style={styles.numberView}>
              <Text style={styles.numberText}>{filteredTransactions.length}</Text>
            </View>
          </View>

          {/* Filtro de transações */}
          <View style={styles.topFlatList}>
            <FilterTransactions
              selectedFilter={selectedFilter}
              onFilterChange={(newFilter) => setSelectedFilter(newFilter)}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>

        {/* Calendário (ScrollView horizontal) */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarControls}>
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={() => {
                  const today = moment().format('YYYY-MM-DD');
                  setSelectedDay(today);
                  // Scroll para hoje (com referência)
                  if (calendarRef.current) {
                    const todayIndex = daysArray.findIndex(d => 
                      d.format('YYYY-MM-DD') === today
                    );
                    if (todayIndex > -1) {
                      calendarRef.current.scrollTo({ 
                        x: todayIndex * 60, 
                        animated: true 
                      });
                    }
                  }
                }}
              >
                <Text style={styles.todayButtonText}>Hoje</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.calendarMonthText}>
              {monthMoment.format('YYYY')}
            </Text>
          </View>
          
          <ScrollView 
            ref={calendarRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
            onLayout={() => {
              // Scroll para o dia selecionado quando o componente carrega
              if (calendarRef.current) {
                const selectedIndex = daysArray.findIndex(d => 
                  d.format('YYYY-MM-DD') === selectedDay
                );
                if (selectedIndex > -1) {
                  calendarRef.current.scrollTo({ 
                    x: selectedIndex * 60, 
                    animated: true 
                  });
                }
              }
            }}
          >
            {daysArray.map((dayMoment, index) => {
              const dayString = dayMoment.format('YYYY-MM-DD');
              const isSelected = dayString === selectedDay;
              const isToday = dayMoment.isSame(moment(), 'day');
              const isWeekend = [0, 6].includes(dayMoment.day());
              
              // Agrupar por semanas visualmente
              const isStartOfWeek = dayMoment.day() === 0;
              
              return (
                <React.Fragment key={dayString}>
                  {isStartOfWeek && index > 0 && (
                    <View style={styles.weekSeparator} />
                  )}
                  
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.dayContainer,
                      isWeekend && styles.weekendDay,
                      isSelected && styles.selectedDayContainer,
                      isToday && styles.todayContainer
                    ]}
                    onPress={() => {
                      setSelectedDay(dayString);
                      // Feedback haptico sutil (iOS)
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.weekDayText,
                        isWeekend && styles.weekendText,
                        isSelected ? styles.selectedDayText : (isToday ? styles.todayDayText : {})
                      ]}
                    >
                      {dayMoment.format('ddd').toUpperCase()}
                    </Text>
                    
                    <View style={[
                      styles.dayNumberContainer,
                      isSelected && styles.selectedDayNumberContainer,
                      isToday && !isSelected && styles.todayDayNumberContainer
                    ]}>
                      <Text
                        style={[
                          styles.dayNumberText,
                          isSelected ? styles.selectedDayNumberText : 
                          (isToday ? styles.todayDayNumberText : {})
                        ]}
                      >
                        {dayMoment.format('D')}
                      </Text>
                    </View>
                    
                    {(isToday && !isSelected) && (
                      <View style={styles.todayIndicator} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>

              <View style={styles.financialSummaryContainer}>
                <View style={styles.cardsRow}>
                  {/* Entradas */}
                  <Pressable 
                    style={({pressed}) => [
                      styles.financialCard,
                      pressed && styles.cardPressed
                    ]}
                    onPress={() => {
                      setSelectedFilter('Entradas');
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <View style={[styles.cardIndicator, { backgroundColor: Colors.incomeBold }]} />
                    <View style={styles.cardContentMinimal}>
                      <Text style={styles.cardAmount}>{formatCurrency(totalEntradas)}</Text>
                      <Text style={styles.cardLabel}>Entradas</Text>
                    </View>
                  </Pressable>

                  {/* Saídas */}
                  <Pressable 
                    style={({pressed}) => [
                      styles.financialCard,
                      pressed && styles.cardPressed
                    ]}
                    onPress={() => {
                      setSelectedFilter('Saídas');
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <View style={[styles.cardIndicator, { backgroundColor: Colors.healthyBold }]} />
                    <View style={styles.cardContentMinimal}>
                      <Text style={styles.cardAmount}>{formatCurrency(totalSaidas)}</Text>
                      <Text style={styles.cardLabel}>Saídas</Text>
                    </View>
                  </Pressable>
                </View>
                
                {/* Saldo - versão ainda mais minimalista */}
                <View style={styles.balanceContainerMinimal}>
                  <View style={styles.balanceLabelContainer}>
                    <Text style={styles.balanceLabel}>Saldo</Text>
                  </View>
                  <Text style={[
                    styles.balanceValue, 
                    (totalEntradas - totalSaidas) >= 0 
                      ? styles.positiveBalance 
                      : styles.negativeBalance
                  ]}>
                    {formatCurrency(totalEntradas - totalSaidas)}
                  </Text>
                </View>
              </View>

                {/* Título "Transações" e quantidade */}
                <View style={styles.textHeader}>
                  <Text style={styles.textCard}>Transações</Text>
                  <View style={styles.numberView}>
                    <Text style={styles.numberText}>{filteredTransactions.length}</Text>
                  </View>
                </View>

                {/* Filtro de transações */}
                <View style={styles.topFlatList}>
                  <FilterTransactions
                    selectedFilter={selectedFilter}
                    onFilterChange={(newFilter) => setSelectedFilter(newFilter)}
                  />
                </View>
              </View>
            );
          }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SwipeListView
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItemTransaction}
        renderHiddenItem={renderHiddenItemTransaction}
        rightOpenValue={-75}
        leftOpenValue={75}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: Colors.grayBack,
          gap: 20,
          paddingBottom: 60,
        }}
        style={{ backgroundColor: Colors.background }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>
              Sem transações no dia selecionado!
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.ButtonAdd} onPress={addTransactionVerification}>
            <Text style={styles.buttonAddText}>Adicionar transação</Text>
          </TouchableOpacity>
        }
      />

      <ModalPaymentPlus
      visible={modalPayment}
      onClose={()=> setModalPayment(false)}
      onConfirm={() => navigation.navigate('Subscription' as never)}
      />
      

      {/* Modal de Deleção Sucesso */}
      <SuccessDeleteTransaction
        visible={successDeleteVisible}
        message={deleteMessage}
        onClose={handleCloseDeleteAlert}
      />

      {/* Modal Principal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                  
                  {/* Seletor de tipo */}
                  <TouchableOpacity
                    onPress={() => setModalTypeVisible(true)}
                    style={styles.typeSelect}
                  >
                    <Text style={styles.textType}>{selectedType}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.background} />
                  </TouchableOpacity>

                  <TransactionType
                    visible={modalTypeVisible}
                    onSelectType={(type) => {
                      const normalizedType = type.toLowerCase();
                      setSelectedType(type);
                      setTransactionType(normalizedType);
                      setModalTypeVisible(false);
                    }}
                    onClose={() => setModalTypeVisible(false)}
                  />

                  {/* Renderizar Receitas / Despesas / Transferências */}
                  {transactionType === 'receita' && (
                    <RenderReceita
                      onClose={() => setModalVisible(false)}
                      onSuccessTransaction={handleSuccessTransaction}
                      successVisible={successVisible}
                    />
                  )}
                  {transactionType === 'despesa' && (
                    <RenderDespesa
                      onClose={() => setModalVisible(false)}
                      onSuccessTransaction={handleSuccessTransaction}
                      successVisible={successVisible}
                    />
                  )}
                  {transactionType === 'transferência' && (
                    <RenderTransferencia
                      onClose={() => setModalVisible(false)}
                      onSuccessTransaction={handleSuccessTransaction}
                      successVisible={successVisible}
                    />
                  )}
                  {transactionType === 'fatura' && (
                    <RenderPaymentCard
                      onClose={() => setModalVisible(false)}
                      onSuccessTransaction={handleSuccessTransaction}
                      successVisible={successVisible}
                    />
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Modal de sucesso (Transação adicionada) */}
      {successVisible && (
        <SuccessTransactions
          message="Transação adicionada com sucesso!"
          onClose={handleCloseSuccess}
          successVisible={successVisible}
        />
      )}
    </View>
  );
}
