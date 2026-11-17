import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, Modal } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Divider } from '@rneui/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import ButtonAdd from '../../components/buttonAdd';
import EmptyCardAccount from '../../components/emptyCardAccount';
import CardItem from '../../components/cardItem';
import CategoriesProgress from '../../components/categoriesProgress';
import RankingBalance from '../../components/rankingBalance';
import SelectMethod from '../../components/selectMethod';
import AddCardModal from '../../components/AddCardModal';
import { AuthContext } from '../../../contexts/Auth';
import { collection, onSnapshot, orderBy, query, where, db } from '../../../services/api/legacy-data';
import ModalAboutCard from '../../components/ModalAboutCard';
import Feather from '@expo/vector-icons/Feather';
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';
import moment from 'moment';
import 'moment/locale/pt-br';
import ModalPaymentPlus from '../../components/ModalPaymentPlus';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';
import { useNavigation } from '@react-navigation/native';


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

type Category = {
  id: string;
  name: string;
  icon: string;
  spent: number;
  percent: string;
  tintColor: string;
  secondColor: string;
};

export default function Card() {
  const navigation = useNavigation();
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();
  const [txMap, setTxMap] = useState<Record<string, { inflow: number; outflow: number }>>({});

  const { user: revUser } = useRevenueCat();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMethodVisible, setModalMethodVisible] = useState(false);
  const [addBalanceVisible, setAddBalanceVisible] = useState(false);
  const [modalPayment, setModalPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<Card | null>(null);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const { user, loading } = useContext(AuthContext);
  const [categories, setCategories] = useState<Category[]>([]);

  // Buscar cartões
  useEffect(() => {
    if (!loading && user?.uid) {
      const q = query(collection(db, 'creditCard'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedCards: Card[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Card[];
  
        setCards(updatedCards);
      });
  
      return unsubscribe;
    }
  }, [user, loading, db]);
  
  
  // Filtrar transações do período
  useEffect(() => {
    if (!user) return;
  
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();
  
    const txRef = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const qTx = query(txRef, orderBy('date', 'desc'));
  
    const unsubscribe = onSnapshot(qTx, (snapshot) => {
      const newTxMap: Record<string, { inflow: number; outflow: number }> = {};
  
      snapshot.forEach(docSnap => {
        const t = docSnap.data();
        if (!t.date?.toDate) return;
        const docDate = moment(t.date.toDate());
  
        if (selectedMonth === 'Anual') {
          if (docDate.year() !== currentYear) return;
        } else {
          if (docDate.year() !== currentYear) return;
          if (docDate.month() !== monthIndex) return;
        }
  
        if (t.paymentType === 'cartoes' && t.accountOrCardId) {
          const cardId = t.accountOrCardId;
          if (!newTxMap[cardId]) {
            newTxMap[cardId] = { inflow: 0, outflow: 0 };
          }
  
          if (t.type === 'despesa') {
            newTxMap[cardId].outflow += Number(t.amount) || 0;
          } else if (t.type === 'receita') {
            newTxMap[cardId].inflow += Number(t.amount) || 0;
          }
        }
      });
  
      setTxMap({ ...newTxMap });
    });
  
    return () => unsubscribe();
  }, [user, db, selectedMonth, selectedYear]);
  
  // Atualizar saldos dos cartões
  const updatedAccounts = useMemo(() => {
    return cards.map(card => ({
      ...card,
      updatedBalance: card.balance + card.totalInflow - card.totalOutFlow, // ✅ Pegamos totalOutFlow do Firestore
    }));
  }, [cards]);


 // ✅ Cálculos totais
 const totalBalance = updatedAccounts.reduce((acc, curr) => acc + curr.balance, 0);
 const totalInflow = updatedAccounts.reduce((acc, curr) => acc + curr.totalInflow, 0);
 const totalOutflow = updatedAccounts.reduce((acc, curr) => acc + curr.totalOutFlow, 0);
 const totalAvailable = totalBalance + totalInflow - totalOutflow;
 const maximumLimit = totalBalance + totalInflow;
 const totalProgress = maximumLimit > 0 ? (totalOutflow / maximumLimit) * 100 : 0;


  // Buscar categorias
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

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Funções de interação
  function handleOpenModal(card: Card) {
    setSelectedAccount(card);
    setModalVisible(true);
  }

  const renderAccountItem = ({ item }: { item: Card & { updatedBalance: number } }) => (
    <CardItem
      data={{
        id: item.id,
        nameBank: item.bankName,
        logo: { uri: item.bankIcon },
        outFlow: item.totalOutFlow,
        inflow: item.totalInflow,
        balance: item.updatedBalance,
      }}
      openModal={() => handleOpenModal(item)}
    />
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoriesProgress data={item} />
  );

  const handleAddAccount = () => {
     // Se o user do RevenueCat (revUser) NÃO é plus, abre modalPayment
    //  if (!revUser.plus) {
    //   setModalPayment(true);
    //   return;
    // }
    // Se for plus, abre o modal normal
    setModalMethodVisible(true);
  };

  function handleDeleteSuccess() {
    setModalVisible(false);
    setSuccessAlertVisible(true);
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setModalMethodVisible(false);
    if (method === 'Manual') {
      setAddBalanceVisible(true);
    }
  };

  const handleSaveBalance = (_balance: number, _bank: string) => undefined;

  // Ranking
  const rankingAccounts = useMemo(() => {
    const clone = [...updatedAccounts];
    clone.sort((a, b) => b.updatedBalance - a.updatedBalance);
    return clone;
  }, [updatedAccounts]);

  const totalAllValues = useMemo(() => {
    return rankingAccounts.reduce(
      (acc, curr) => acc + curr.updatedBalance,
      0
    );
  }, [rankingAccounts]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.progressTitle}>Limite disponível</Text>
              <Text style={styles.progressBalance}>{formatCurrency(totalAvailable)}</Text>
              <View style={styles.viewProgressValue}>
                <Feather name="arrow-down-right" size={16} color={Colors.incomeBold} />
                <Text style={styles.progressValue}>{totalProgress}%</Text>
              </View>
            </View>
          )}
        </AnimatedCircularProgress>
        <View style={styles.viewMovements}>
          <View style={styles.viewTextMovement}>
            <Ionicons name="arrow-up-circle" size={24} color={Colors.text} />
            <Text style={styles.textMovement}>{formatCurrency(totalInflow)}</Text>
          </View>
          <Divider width={1} color={Colors.grayOne} orientation="vertical" />
          <View style={styles.viewTextMovement}>
            <Text style={styles.textMovement}>{formatCurrency(totalOutflow)}</Text>
            <Ionicons name="arrow-down-circle" size={24} color="black" />
          </View>
        </View>

        <View style={styles.messageView}>
          <Text style={styles.messageText}>Restam {formatCurrency(totalAvailable)} nos seus cartões!</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.textHeader}>
          <Text style={styles.textCard}>Meus Cartões</Text>
          <View style={styles.numberView}>
            <Text style={styles.numberText}>{cards.length}</Text>
          </View>
        </View>
        <FlatList
          data={updatedAccounts}
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
        animationType="fade"
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        {selectedAccount && (
          <ModalAboutCard
            closeModal={() => setModalVisible(false)}
            card={selectedAccount}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </Modal>

      <Modal
        transparent={true}
        visible={modalMethodVisible}
        animationType="fade"
        onRequestClose={() => setModalMethodVisible(false)}
      >
        <SelectMethod
          selectedMethod={selectedMethod}
          onSelectMethod={handleMethodSelect}
          fechar={() => setModalMethodVisible(false)}
        />
      </Modal>

      <ModalPaymentPlus
      visible={modalPayment}
      onClose={()=> setModalPayment(false)}
      onConfirm={() => navigation.navigate('Subscription' as never)}
      />

      <AddCardModal
        visible={addBalanceVisible}
        onClose={() => setAddBalanceVisible(false)}
        onSave={handleSaveBalance}
      />

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

      <View style={styles.sectionContainer}>
        <View style={styles.textHeader}>
          <Text style={styles.textCard}>Maiores limites</Text>
        </View>
        <View style={styles.rankingList}>
          {rankingAccounts.map((item) => (
            <RankingBalance
              key={item.id}
              data={{
                id: item.id,
                nameBank: item.bankName,
                logo: { uri: item.bankIcon },
                outFlow: item.totalOutFlow,
                inflow: item.totalInflow,
                balance: item.updatedBalance,
              }}
              totalAllBalances={totalAllValues}
            />
          ))}
        </View>
      </View>
      <View style={{ height: 50, width: '100%' }} />
    </ScrollView>
  );
}
