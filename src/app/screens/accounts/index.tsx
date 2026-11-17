import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, Text, FlatList, ScrollView, Modal, Pressable } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Divider } from '@rneui/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather'; 
import ButtonAdd from '../../components/buttonAdd';
import EmptyCardAccount from '../../components/emptyCardAccount';
import CardAccounts from '../../components/cardAccounts';
import CategoriesProgress from '../../components/categoriesProgress';
import RankingBalance from '../../components/rankingBalance';
import ModalAboutBank from '../../components/ModalAboutBank';
import SelectMethod from '../../components/selectMethod';
import AddBalanceModal from '../../components/AddBalanceModal';
import SuccessAlert from '../../components/SuccesDeleteAccount';

import { getFirestore, collection, onSnapshot, query, orderBy, where } from '../../../services/api/legacy-data';
import { AuthContext } from '../../../contexts/Auth';
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModalPaymentPlus from '../../components/ModalPaymentPlus';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';
import { useNavigation } from '@react-navigation/native';

type Account = {
  id: string;
  bankName: string;
  bankIcon: string;
  agencyNumber: string;
  accountNumber: string;
  balance: number; // Saldo inicial (valor registrado no documento)
  totalOutFlow: number;
  totalInflow: number;
  type: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  spent: number;
  percent: string;
  tintColor: string;
  secondColor: string;
};

// Extensão do tipo Account para incluir os valores filtrados do período
type ExtendedAccount = Account & {
  inflow: number;
  outFlow: number;
  updatedBalance: number;
  nameBank: string;
  logo: string;
};

export default function Accounts() {
  const navigation = useNavigation();
  const { user, loading } = useContext(AuthContext);
  const db = getFirestore();

  const { user: revUser } = useRevenueCat();

  // Contextos de data
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMethod, setModalMethod] = useState(false);
  const [modalPayment, setModalPayment] = useState(false);
  const [addBalanceVisible, setAddBalanceVisible] = useState(false); 
  const [selectedMethod, setSelectedMethod] = useState("Manual");
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);

  // Contas originais
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Categorias (sem alterações)
  const [categories, setCategories] = useState<Category[]>([]);

  // 1) Buscar as contas do Firestore
  useEffect(() => {
    if (!loading && user?.uid) {
      const q = query(collection(db, 'bankAccounts'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newAccounts: Account[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Account[];

        setAccountsData(newAccounts);
      });
      return () => unsubscribe();
    }
}, [user, loading, db]);


  // 2) Filtrar transações do período (usando os campos "paymentType" e "accountOrCardId")
  const [txMap, setTxMap] = useState<Record<string, { inflow: number; outflow: number }>>({});

  useEffect(() => {
    const monthNames = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();
  
    const txRef = collection(db, 'transactions');
    let qTx = query(txRef, where('userId', '==', user?.uid), orderBy('date', 'desc'));
  
    const unsubscribe = onSnapshot(qTx, (snapshot) => {
      const filteredTxMap: Record<string, { inflow: number; outflow: number }> = {};
      const processedFaturas = new Set(); // Set para evitar duplicação de faturas
  
      snapshot.forEach(docSnap => {
        const t = docSnap.data();
        if (!t.date?.seconds) return;
  
        const docDate = moment.unix(t.date.seconds);
        const firestoreMonth = docDate.month();
        const firestoreYear = docDate.year();
  
        // ✅ Filtrar pelo mês e ano selecionado
        if (firestoreYear !== currentYear || (selectedMonth !== 'Anual' && firestoreMonth !== monthIndex)) {
          return;
        }
  
        // ✅ Definir qual conta será afetada
        let accId = t.accountOrCardId || t.fromId || t.toId;
        if (!accId) return;
  
        // ✅ Inicializar objeto no mapa se ainda não existir
        if (!filteredTxMap[accId]) {
          filteredTxMap[accId] = { inflow: 0, outflow: 0 };
        }
  
        // ✅ Somar despesas no outflow
        if (t.type === 'despesa') {
          filteredTxMap[accId].outflow += Number(t.amount) || 0;
        } 
        
        // ✅ Somar faturas no outflow **APENAS se ainda não processamos essa fatura**
        else if (t.type === 'fatura') {
          if (!processedFaturas.has(t.transferGroupId)) {
            filteredTxMap[accId].outflow += Number(t.amount) || 0;
            processedFaturas.add(t.transferGroupId);
          } else {
            // console.warn(`⚠️ Fatura ignorada (duplicada): ${t.transferGroupId}`);
          }
        } 
        
        // ✅ Somar receitas no inflow
        else if (t.type === 'receita') {
          filteredTxMap[accId].inflow += Number(t.amount) || 0;
        }
      });
  
      setTxMap(prev => (JSON.stringify(prev) === JSON.stringify(filteredTxMap) ? prev : filteredTxMap));
    });
  
    return () => unsubscribe();
  }, [db, selectedMonth, selectedYear, user]);
  
  // 3) Mesclar as contas com os valores filtrados
  const filteredAccounts = useMemo<ExtendedAccount[]>(() => {
    return accountsData.map(acc => {
      const tx = txMap[acc.id] || { inflow: 0, outflow: 0 };

      // ✅ Pegamos o balance diretamente do Firestore
      const balanceFromFirestore = acc.balance;
      const outFlow = tx.outflow ?? 0;
      const inflow = tx.inflow ?? 0;

      // ✅ Atualizamos corretamente o balance
      const updatedBalance = balanceFromFirestore + inflow;

      return {
        ...acc,
        inflow,
        outFlow,
        updatedBalance,
      } as ExtendedAccount;
    });
}, [accountsData, txMap]); 


  // 4) Cálculos Totais com base nas contas filtradas
  const totalBalance = filteredAccounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInflow = filteredAccounts.reduce((acc, curr) => acc + curr.inflow, 0);
  const totalOutflow = filteredAccounts.reduce((acc, curr) => acc + curr.outFlow, 0);
  const totalAmount = totalBalance + totalInflow + totalOutflow;
  const totalValue = totalAmount - totalOutflow;
  const totalCurrency = totalBalance + totalInflow;
  const initialSum = accountsData.reduce((acc, curr) => acc + curr.balance + curr.totalOutFlow, 0);
  const InflowAmount = initialSum + totalInflow;
  const totalProgress = InflowAmount > 0 ? (totalOutflow / totalAmount) * 100 : 0;


  // 5) Buscar categorias (sem alteração)
  useEffect(() => {
    if (!loading && user?.uid) {
      const catRef = query(collection(db, 'categories'), where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
      const unsubCat = onSnapshot(catRef, (snapshot) => {
        const catDocs = snapshot.docs.map(doc => {
          const data = doc.data();
          const spentAmount = data.spentAmount || 0;
          const emoji = data.emoji || 'opa';
          const primaryColor = data.primaryColor || Colors.grayTwo;
          const secondaryColor = data.secondaryColor || Colors.grayTwo;
          const name = data.name || 'Sem nome';
          const percentNum = totalOutflow > 0 ? (spentAmount / totalOutflow) * 100 : 0;
          const percent = `${Math.round(percentNum)}%`;
          return {
            id: doc.id,
            name,
            icon: emoji,
            spent: spentAmount,
            percent,
            tintColor: primaryColor,
            secondColor: secondaryColor
          };
        });
        setCategories(catDocs);
      });
      return () => unsubCat();
    }
  }, [user, loading, db, totalOutflow]);

  const formatCurrencyFunc = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // 6) Funções de interação
  function handleOpenModal(account: Account) {
    setSelectedAccount(account);
    setModalVisible(true);
  }

  const renderAccountItem = ({ item }: { item: ExtendedAccount }) => {
    return (
      <CardAccounts 
        data={{
          id: item.id,
          nameBank: item.bankName,
          logo: { uri: item.bankIcon },
          outFlow: item.outFlow,
          inflow: item.inflow,
          balance: item.updatedBalance,
        }} 
        openModal={() => handleOpenModal(item)}
      />
    );
  };
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoriesProgress data={item}/>
  );

  function handleAddAccount() {
    // Se o user do RevenueCat (revUser) NÃO é plus, abre modalPayment
    // if (!revUser.plus) {
    //   setModalPayment(true);
    //   return;
    // }
    // Se for plus, abre o modal normal
    setModalMethod(true);
  }

  function handleDeleteSuccess() {
    setModalVisible(false);
    setSuccessAlertVisible(true);
  }

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setModalMethod(false);
    if (methodId === 'Manual') {
      setAddBalanceVisible(true);
    }
  };

  const handleSaveBalance = (_balance: number, _bank: string) => undefined;

  // 7) Ranking
  const rankingAccounts = useMemo<ExtendedAccount[]>(() => {
    const clone = [...filteredAccounts];
    clone.sort((a, b) => b.updatedBalance - a.updatedBalance);
    return clone;
  }, [filteredAccounts]);

  const totalAllValues = useMemo(() => {
    return rankingAccounts.reduce((acc, curr) => acc + curr.updatedBalance, 0);
  }, [rankingAccounts]);

  // 8) Renderização
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.headerContainer}>
        <AnimatedCircularProgress
          size={270}
          width={18}
          fill={totalProgress}
          tintColor="#212121"
          backgroundColor="#eee"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <View style={styles.viewProgressText}>
              <Text style={styles.progressTitle}>Saldo total</Text>
              <Text style={styles.progressBalance}>{formatCurrencyFunc(totalValue)}</Text>
              <View style={styles.viewProgressValue}>
                <Feather name="arrow-down-right" size={16} color={Colors.incomeBold}/>
                <Text style={styles.progressValue}>{Math.round(totalProgress)}%</Text>
              </View>
            </View>
          )}
        </AnimatedCircularProgress>

        <View style={styles.viewMovements}>
          <View style={styles.viewTextMovement}>
            <Ionicons name="arrow-up-circle" size={24} color={Colors.text} />
            <Text style={styles.textMovement}>{formatCurrencyFunc(totalInflow)}</Text>
          </View>
          <Divider width={1} color={Colors.grayOne} orientation="vertical" />
          <View style={styles.viewTextMovement}>
            <Text style={styles.textMovement}>{formatCurrencyFunc(totalOutflow)}</Text>
            <Ionicons name="arrow-down-circle" size={24} color="black" />
          </View>
        </View>

        <View style={styles.messageView}>
          <Text style={styles.messageText}>
            Restam {formatCurrencyFunc(totalValue)} nas suas contas!
          </Text>
        </View>
      </View>
      
      {/* Meus bancos */}
      <View style={styles.sectionContainer}>
        <View style={styles.textHeader}>
          <Text style={styles.textCard}>Meus bancos</Text>
          <View style={styles.numberView}>
            <Text style={styles.numberText}>{filteredAccounts.length}</Text>
          </View>
        </View>
        <FlatList
          data={filteredAccounts} 
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountsList}
          ListHeaderComponent={<ButtonAdd onPress={handleAddAccount} />}
          ListEmptyComponent={<EmptyCardAccount />}
        />
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType='fade'
        onRequestClose={()=> setModalVisible(false)}
      >
        {selectedAccount && (
          <ModalAboutBank 
            closeModal={() => setModalVisible(false)}
            account={selectedAccount}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </Modal>
      
      <SuccessAlert
        visible={successAlertVisible}
        message="A conta bancária foi excluída com sucesso."
        onClose={() => setSuccessAlertVisible(false)}
      />

      <Modal
        transparent={true}
        visible={modalMethod}
        animationType='fade'
        onRequestClose={()=> setModalMethod(false)}
      >
        <SelectMethod
          selectedMethod={selectedMethod}
          onSelectMethod={handleSelectMethod}
          fechar={() => setModalMethod(false)}
        />
      </Modal>

        <ModalPaymentPlus
        visible={modalPayment}
        onClose={()=> setModalPayment(false)}
        onConfirm={() => navigation.navigate('Subscription' as never)}
        />

      
      <AddBalanceModal
        visible={addBalanceVisible}
        onClose={() => setAddBalanceVisible(false)}
        onSave={handleSaveBalance}
      />
      
      {/* Categorias */}
      <View style={styles.sectionContainer}>
        <View style={styles.textHeader}>
          <Text style={styles.textCard}>Categorias</Text>
          <View style={styles.numberView}>
            <Text style={styles.numberText}>{categories.length}</Text>
          </View>
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Maiores saldos */}
      <View style={styles.sectionContainer}>
        <View style={styles.textHeader}>
          <Text style={styles.textCard}>Maiores saldos</Text>
        </View>
        <View style={styles.rankingList}>
          {rankingAccounts.map((item) => (
            <RankingBalance 
              key={item.id} 
              data={{
                id: item.id,
                nameBank: item.bankName,
                logo: { uri: item.bankIcon },
                outFlow: item.outFlow,
                inflow: item.inflow,
                balance: item.updatedBalance, 
              }} 
              totalAllBalances={totalAllValues}
            />
          ))}
        </View>
      </View>
      <View style={{height: 50, width: '100%'}}></View>
    </ScrollView>
  );
}
