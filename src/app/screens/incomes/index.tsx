import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import * as Progress from 'react-native-progress';
import { collection, getDocs, onSnapshot, doc, updateDoc, deleteDoc, Timestamp, addDoc, query, orderBy, where, db } from '../../../services/api/legacy-data';
import { AuthContext } from '../../../contexts/Auth';
import CardSubIncome from '../../components/CardSubIncome';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Feather, Fontisto } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { Pressable } from 'react-native';
import { TextInput } from 'react-native';
import Button from '../../components/button';
import { ScrollView } from 'react-native';
import { useYear } from '../../../contexts/YearContext';
import { useMonth } from '../../../contexts/MonthContext';
import moment from 'moment';
import ModalPaymentPlus from '../../components/ModalPaymentPlus';
import { useNavigation } from '@react-navigation/native';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';


type IncomeCategory = {
  id: string;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  income: number;
  incomeAmount: number;
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

type IncomeSubcategoryWithPercentage = IncomeSubcategory & {
  percentage: string;
};


export default function Incomes() {
  const navigation = useNavigation();
  const { selectedYear } = useYear();
  const { selectedMonth } = useMonth();
  const { user: revUser } = useRevenueCat();

  const [modalPayment, setModalPayment] = useState(false);

  const [addSubCategoryModalVisible, setAddSubCategoryModalVisible] = useState(false);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory | null>(null);
  const [subcategories, setSubcategories] = useState<IncomeSubcategory[]>([]);
  const { user } = useContext(AuthContext);

  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editIncome, setEditIncome] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<IncomeSubcategory | null>(null);
  const [editSubCategoryModalVisible, setEditSubCategoryModalVisible] = useState(false);

   const [emoji, setEmoji] = useState('');
    const [subCategoryName, setSubCategoryName] = useState('');
    const [income, setIncome] = useState<number | null>(null);

  const formatCurrency = (value?: number): string => {
    if (value == null) return 'R$0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Buscar a categoria de receita (assumindo que há apenas uma)
  useEffect(() => {
    if (!user?.uid) return;
  
    const incomeCategoriesRef = collection(db, 'incomeCategories');
    const q = query(incomeCategoriesRef, where('userId', '==', user?.uid));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnapshot = snapshot.docs[0];
        const incomeCategoryData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as IncomeCategory;
  
        setIncomeCategory(incomeCategoryData);
      } else {
        console.warn('⚠️ Nenhuma categoria de receita encontrada.');
      }
    });
  
    return () => unsubscribe();
  }, [user]);  

  // Buscar subcategorias – apenas atualiza o estado local
  useEffect(() => {
    if (!incomeCategory?.id) return;
  
    const subsRef = collection(db, 'incomeCategories', incomeCategory.id, 'incomeSubcategories');
    const unsubscribe = onSnapshot(subsRef, (snapshot) => {
      const fetchedSubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as IncomeSubcategory[];
  
      setSubcategories(fetchedSubs);
    });
  
    return () => unsubscribe();
  }, [incomeCategory]);


  // Atualizar a categoria com base nos subcategorias, com debounce de 1s
  useEffect(() => {
    if (incomeCategory?.id) {
      const timeout = setTimeout(() => {
        const calculatedIncome = subcategories.reduce(
          (acc, sub) => acc + (Number(sub.income) || 0),
          0
        );
        const calculatedIncomeAmount = subcategories.reduce(
          (sum, sub) => sum + (Number(sub.incomeAmount) || 0),
          0
        );
  
        if (
          incomeCategory.income !== calculatedIncome ||
          incomeCategory.incomeAmount !== calculatedIncomeAmount
        ) {
          const categoryRef = doc(db, 'incomeCategories', incomeCategory.id); // ✅ Correção feita aqui
  
          updateDoc(categoryRef, {
            income: calculatedIncome,
            incomeAmount: calculatedIncomeAmount,
          })
            .then(() => {
              setIncomeCategory(prev => prev ? { ...prev, income: calculatedIncome, incomeAmount: calculatedIncomeAmount } : null);
            })
            .catch(error => {
              console.error("❌ Erro ao atualizar categoria via debounce:", error);
            });
        }
      }, 1000); // 1 segundo de debounce
  
      return () => clearTimeout(timeout);
    }
  }, [subcategories, incomeCategory]);
  

  // Para exibição: total planejado (usado no header)
  const totalIncome = useMemo(() => {
    return subcategories.reduce((acc, sub) => acc + (Number(sub.income) || 0), 0);
  }, [subcategories]);

  // Percentual para o progress bar
  const incomePercentage = useMemo(() => {
    return incomeCategory && incomeCategory.income > 0
      ? ((incomeCategory.incomeAmount / incomeCategory.income) * 100).toFixed(0)
      : '0';
  }, [incomeCategory]);

  // Modal de edição: prepara os dados
  const showEditDeleteModal = (subcategory: IncomeSubcategory) => {
    setSelectedSubCategory(subcategory);
    setEditName(subcategory.name);
    setEditEmoji(subcategory.emoji);
    setEditIncome(subcategory.income);
    setEditSubCategoryModalVisible(true);
  };

  // Função de edição: atualiza a subcategoria; a atualização da categoria ocorrerá via onSnapshot
  const handleEditSubCategory = async () => {
    if (!incomeCategory || !selectedSubCategory || editIncome === null) return;
  
    try {
      const subRef = doc(db, 'incomeCategories', incomeCategory.id, 'incomeSubcategories', selectedSubCategory.id);
      await updateDoc(subRef, {
        name: editName,
        emoji: editEmoji,
        income: editIncome,
      });
  
      setEditSubCategoryModalVisible(false);
    } catch (error) {
      console.error('❌ Erro ao editar subcategoria:', error);
    }
  };
  

  // Função de exclusão: deleta a subcategoria; a atualização da categoria ocorrerá via onSnapshot
  const handleDeleteSubCategory = async (sub: IncomeSubcategory) => {
    if (!incomeCategory || !sub) return;
  
    Alert.alert("Confirmação", "Deseja excluir essa subcategoria?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const subRef = doc(db, 'incomeCategories', incomeCategory.id, 'incomeSubcategories', sub.id);
            await deleteDoc(subRef);
            setEditSubCategoryModalVisible(false);
          } catch (error) {
            console.error('❌ Erro ao excluir subcategoria:', error);
          }
        },
      },
    ]);
  };
  

  const missIncomeCalculated = incomeCategory
    ? incomeCategory.income - incomeCategory.incomeAmount
    : 0;

  const renderItemIncome = ({ item }: { item: IncomeSubcategory }) => {
    return <CardSubIncome data={item} clear={() => {}} title="" onLongPress={() => showEditDeleteModal(item)} />;
  };
  const formatDisplayedBudget = () => {
    return editIncome !== null ? formatCurrency(editIncome) : 'R$0,00';
  };

  const formatDisplayedIncome = () => {
    return income !== null ? formatCurrency(income) : 'R$0,00';
  };

  const handleIncomeChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9]/g, '')) / 100;
    setIncome(numericValue);
  };

  // Função para adicionar uma nova subcategoria de receita
  const addSub = async () => {    
    if (!incomeCategory || !emoji || !subCategoryName || income === null) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      // Referência para a coleção de subcategorias dentro da incomeCategory
      const subcategoriesRef = collection(
        db,
        'incomeCategories',
        incomeCategory.id,
        'incomeSubcategories'
      );
  
      // Criando um novo documento dentro da coleção de subcategorias
      await addDoc(subcategoriesRef, {
        name: subCategoryName,
        emoji: emoji,
        primaryColor: incomeCategory.primaryColor,
        secondaryColor: incomeCategory.secondaryColor,
        boldColor: incomeCategory.boldColor,
        income: income,
        incomeAmount: 0, // Inicialmente 0
        createdAt: Timestamp.now(),
        userId: user?.uid,
      });
  
      // Limpar inputs e fechar modal
      setEmoji('');
      setSubCategoryName('');
      setIncome(null);
      setAddSubCategoryModalVisible(false);
    } catch (error) {
      console.error('❌ Erro ao adicionar subcategoria de receita:', error);
    }
  };

  function addSubVerification(){
    // if (!revUser.plus) {
    //   setModalPayment(true);
    //   return;
    // }   
    setAddSubCategoryModalVisible(true);  
   }
  

  const sortedSubcategories: IncomeSubcategoryWithPercentage[] = useMemo(() => {
    if (!incomeCategory?.incomeAmount) return subcategories.map(sub => ({ ...sub, percentage: "0" }));
  
    return [...subcategories]
      .map(sub => ({
        ...sub,
        percentage: incomeCategory.incomeAmount > 0
          ? ((sub.incomeAmount / incomeCategory.incomeAmount) * 100).toFixed(0)
          : "0"
      }))
      .sort((a, b) => Number(b.percentage) - Number(a.percentage));
  }, [subcategories, incomeCategory?.incomeAmount]);
  
  
    
// 1) Estado para guardar a soma de receitas do período
const [monthlyIncomeAmount, setMonthlyIncomeAmount] = useState(0);

// 2) Estado para armazenar o % (0 a 100) do quanto já recebemos neste período
const [monthlyIncomePercentage, setMonthlyIncomePercentage] = useState('0');

// 3) useEffect que filtra as transações do Firestore
useEffect(() => {
  if (!user) return;

  // Converter selectedMonth e selectedYear
  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const monthIndex = monthNames.indexOf(selectedMonth);
  const currentYear = Number(selectedYear) || moment().year();

  // Referência às transações
  const ref = collection(db,'transactions');
  const qRef = query(ref, orderBy('date','desc'), where("userId", "==", user.uid));

  const unsubscribe = onSnapshot(qRef, (snapshot) => {
    let sum = 0; // Soma das receitas do período

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.date?.toDate) return;

      const docDate = moment(data.date.toDate());
      // Filtrar por ano e mês (se não for "Anual")
      if (selectedMonth === 'Anual') {
        if (docDate.year() !== currentYear) return;
      } else {
        if (docDate.year() !== currentYear) return;
        if (docDate.month() !== monthIndex) return;
      }

      // Se for transação de RECEITA
      if (data.type === 'receita') {
        sum += Number(data.amount) || 0;
      }
    });

    // Guardar a soma no estado
    setMonthlyIncomeAmount(sum);

    // Calcular o % do quanto já recebemos X o "planejado" (incomeCategory?.income)
    if (incomeCategory?.income && incomeCategory.income > 0) {
      const percent = (sum / incomeCategory.income) * 100;
      setMonthlyIncomePercentage(percent.toFixed(0));
    } else {
      setMonthlyIncomePercentage('0');
    }
  });

  return () => unsubscribe();
}, [user, selectedMonth, selectedYear, incomeCategory]);


  function renderHiddenItemTransaction({ item }: { item: IncomeSubcategory }) {
    return (
      <View style={styles.hiddenRow}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => showEditDeleteModal(item)}>
          <Feather name="edit" size={20} color={Colors.healthyBold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSubCategory(item)}>
          <Fontisto name="trash" size={20} color={Colors.healthyBold} />
        </TouchableOpacity>
      </View>
    );
  }

  const renderHeader = () => {
    const missingThisMonth = (incomeCategory?.income || 0) - monthlyIncomeAmount;

    return (
      <View style={styles.container}>
        <View style={styles.containerDataCategories}>
        <View style={styles.viewRowDataCategories}>
        <View style={styles.texteHeaderCateg}>
          <Text>{incomeCategory?.emoji}</Text>
          <Text style={styles.textMovementsCateg}>
          {incomeCategory?.name}
          </Text>
        </View>
        <View style={styles.texteHeaderCateg}>
          <Text style={styles.textMovementsCateg}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
      </View>
       <View style={styles.viewFooter}>
        <View style={styles.viewProgressBarProgress}>
        <Text style={styles.textMovement}> {formatCurrency(monthlyIncomeAmount)}</Text>
        <Text style={styles.textMovement}> {formatCurrency(missingThisMonth)}</Text>
        </View>
        <View style={styles.viewBarProgress}>
          <View style={{ width: '88%' }}>
          <Progress.Bar
          width={null}
          height={12}
          color={Colors.incomePrimary}
          unfilledColor={Colors.incomeSecondary}
          borderWidth={0}
          progress={
            (incomeCategory?.income ?? 0) > 0
                    ? monthlyIncomeAmount / (incomeCategory?.income ?? 1)
                    : 0
                }
          borderRadius={100}
        />
          </View>
          <Text style={styles.textMovement}>{`${monthlyIncomePercentage}%`}</Text>
        </View>
      </View>
      </View>
        <FlatList
          data={sortedSubcategories} // Agora usamos a lista ordenada
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, marginTop: 30, alignSelf: 'flex-start', width: '100%' }}
          renderItem={({ item: cat }) => (
            <View key={cat.id} style={styles.pillContainer}>
              <View style={{
                height: 8,
                width: 8,
                borderRadius: 100,
                backgroundColor: Colors.incomePrimary,
              }} />
              <Text style={styles.text}>{cat.name}</Text>
              <Text style={styles.text}>{cat.percentage}%</Text>
            </View>
          )}
        />
      </View>
    );
  };

  const renderFooter = () => (
    <View style={{ width: '100%', marginBottom: 50 }}>
      <TouchableOpacity
        style={styles.buttonAdd}
        onPress={addSubVerification}
      >
        <Text style={styles.textButtonAdd}>Adicionar subcategoria</Text>
      </TouchableOpacity>

      <ModalPaymentPlus
        visible={modalPayment}
        onClose={()=> setModalPayment(false)}
        onConfirm={() => navigation.navigate('Subscription' as never)}
        />

    </View>
  );

  return (
    <>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SwipeListView
        data={subcategories}
        keyExtractor={(item) => item.id}
        renderItem={renderItemIncome}
        ListHeaderComponent={renderHeader}
        renderHiddenItem={renderHiddenItemTransaction}
        rightOpenValue={-75}
        leftOpenValue={75}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: Colors.background,
          gap: 20,
          paddingBottom: 60,
        }}
        style={{ backgroundColor: Colors.background }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ color: '#989898', textAlign: 'center' }}>
              Nenhuma subcategoria adicionada para essa categoria!
            </Text>
          </View>
        }
      />
       </TouchableWithoutFeedback>
        <Modal
        visible={editSubCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditSubCategoryModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            
            <Pressable style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
              <Pressable onPress={() => setEditSubCategoryModalVisible(false)} style={{ flex: 1, width: '100%', height: '20%' }} />
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={[styles.addSubCategoryModal, { height: '65%', alignItems: 'center', paddingTop: 18 }]}>

                <View style={{flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', width: '100%', height: 40}}>
                  <Text style={[styles.modalTitle, {marginBottom: 0, paddingBottom:0, alignSelf: 'flex-end'}]}>Editar Emoji</Text>
                 <Pressable
                    onPress={handleEditSubCategory}
                    style={[
                      styles.texteHeaderView,
                      {
                        backgroundColor: incomeCategory?.secondaryColor,
                        alignSelf: 'flex-start',
                        marginHorizontal: 20,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <Feather name="check-square" size={24} color={incomeCategory?.boldColor} />
                  </Pressable>
                </View>
                {/* <Text style={[styles.modalTitle, {marginBottom: 0, paddingBottom:0}]}>Editar Emoji</Text> */}

                  <TextInput
                    style={styles.textInput}
                    placeholder="Emoji"
                    value={editEmoji}
                    onChangeText={setEditEmoji}
                  />
                  <Text style={styles.modalTitle}>Editar nome</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nome"
                    value={editName}
                    onChangeText={setEditName}
                  />
                  <Text style={styles.modalTitle}>Editar valor da receita</Text>
                  <TextInput
                    style={styles.textInputIncome}
                    placeholder="R$ 0,00"
                    value={formatDisplayedBudget()}
                    onChangeText={(value)=> setEditIncome(Number(value.replace(/[^0-9]/g, '')) / 100)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.gray95}
                  />
                </View>
              </TouchableWithoutFeedback>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </Modal>

          <Modal
            visible={addSubCategoryModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setAddSubCategoryModalVisible(false)}
          >
            <KeyboardAvoidingView
              style={{ flex: 1, justifyContent: 'flex-end' }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <Pressable style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
                <Pressable onPress={() => setAddSubCategoryModalVisible(false)} style={{ flex: 1, width: '100%', height: '20%' }} />
      
                {/* Modal Content */}
                <ScrollView
                  style={styles.addSubCategoryModal}
                  contentContainerStyle={{ alignItems: 'center', gap: 20 }}
                  showsVerticalScrollIndicator={false}
                >

                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <View
                    style={[
                      styles.texteHeaderView,
                      {
                        backgroundColor: incomeCategory?.secondaryColor,
                        alignSelf: 'flex-start',
                        marginHorizontal: 20,
                      },
                    ]}
                  >
                    <Text>{incomeCategory?.emoji}</Text>
                    <Text style={[styles.textMovement, { color: incomeCategory?.boldColor }]}>
                      {incomeCategory?.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={addSub}
                    style={[
                      styles.texteHeaderView,
                      {
                        backgroundColor: incomeCategory?.boldColor,
                        alignSelf: 'flex-start',
                        marginHorizontal: 20,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <Text style={[styles.textMovement, { color: Colors.background }]}>
                      Adicionar
                    </Text>
                  </Pressable>

                  </View>
      
                  <Text style={styles.modalTitle}>Adicione um emoji</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: 💵"
                    value={emoji}
                    onChangeText={setEmoji}
                    placeholderTextColor={Colors.gray95}
                  />
      
                  <Text style={styles.modalTitle}>Adicione um nome</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ex: Salário"
                    value={subCategoryName}
                    onChangeText={setSubCategoryName}
                    placeholderTextColor={Colors.gray95}
                  />
      
                  <Text style={styles.modalTitle}>Adicione o valor da receita</Text>
                  <TextInput
                    style={styles.textInputIncome}
                    placeholder="R$0,00"
                    value={formatDisplayedIncome()}
                    keyboardType="numeric"
                    onChangeText={handleIncomeChange}
                    placeholderTextColor={Colors.gray95}
                  />
                </ScrollView>
              </Pressable>
            </KeyboardAvoidingView>
          </Modal>
      
    </>
  );
}
