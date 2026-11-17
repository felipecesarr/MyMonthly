import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View, Text, Pressable, Modal, TouchableOpacity, FlatList, Alert,
  TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, RefreshControl
} from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import CardSubCategories from '../../components/CardSubCategories';
import {
  collection, onSnapshot, addDoc, doc, updateDoc, getDocs,
  deleteDoc, getDoc, query, orderBy, Timestamp,
  where,
  db
} from '../../../services/api/legacy-data';
import { AuthContext } from '../../../contexts/Auth';
import ModalAddSub from '../../components/ModalAddSub';
import SuccessAlert from '../../components/SuccessAddSub';
import Button from '../../components/button';
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext'; // <-- IMPORTADO
import { SwipeListView } from 'react-native-swipe-list-view';
import { Feather, Fontisto } from '@expo/vector-icons';

import moment from 'moment';
import 'moment/locale/pt-br';
import ModalPaymentPlus from '../../components/ModalPaymentPlus';
import { useNavigation } from '@react-navigation/native';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';
import ReportModal from '../../components/ReportModal';

const formatCurrency = (value?: number): string => {
  if (value == null) return 'R$0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  percent: number;
  color: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  colorProgress: string;
  budget: number;
  spentAmount: number;
  createdAt?: Date;
};

type SubCategory = {
  id: string;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  budget: number;
  spentAmount: number;
  createdAt?: Date;
};

export default function Categories() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const { user: revUser } = useRevenueCat();
  const [modalPayment, setModalPayment] = useState(false);

  const [modalBudgetVisible, setModalBudgetVisible] = useState(false);

  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear(); // <-- USADO PARA FILTRAR ANO

  const [modalVisible, setModalVisible] = useState(false);
  const [addSubCategoryModalVisible, setAddSubCategoryModalVisible] = useState(false);
  const [editSubCategoryModalVisible, setEditSubCategoryModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editBudget, setEditBudget] = useState<number | null>(null);
  const [calculatedBudget, setCalculatedBudget] = useState<number | null>(null);

  // ==================== LÓGICA DE FILTRO DE TRANSAÇÕES (NOVO) ====================

  // Um mapa categoryId -> totalSpent (apenas do mês/ano selecionado)
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    // Converte selectedMonth e selectedYear
    const monthNames = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();

    // Query para ler transações
    const ref = collection(db, 'transactions');
    const qRef = query(ref, orderBy('date', 'desc'), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      const temp: Record<string, number> = {};

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.date?.toDate) return;

        const docDate = moment(data.date.toDate());

        // Filtrar por ano e, se não for "Anual", também filtrar mês
        if (selectedMonth === 'Anual') {
          if (docDate.year() !== currentYear) return;
        } else {
          if (docDate.year() !== currentYear) return;
          if (docDate.month() !== monthIndex) return;
        }

        // Se for despesa e tiver categoryId
        if (data.type === 'despesa' && data.categoryId) {
          const catId = data.categoryId;
          const amount = Number(data.amount) || 0;
          if (!temp[catId]) temp[catId] = 0;
          temp[catId] += amount;
        }
      });

      setSpentMap(temp);
    });

    return () => unsubscribe();
  }, [user, selectedMonth, selectedYear]);


  // categoriesFiltered: sobrescreve "spentAmount" com base em spentMap
  const categoriesFiltered = useMemo(() => {
    return categories.map(cat => {
      const realSpent = spentMap[cat.id] || 0;
      return {
        ...cat,
        spentAmount: realSpent,
      };
    });
  }, [categories, spentMap]);

  // ADICIONE ESTE useEffect
useEffect(() => {
  if (selectedCategory && categoriesFiltered.length > 0) {
    const updatedCategory = categoriesFiltered.find(cat => cat.id === selectedCategory.id);
    if (updatedCategory) {
      setSelectedCategory(updatedCategory);
    }
  }
}, [categoriesFiltered, selectedCategory?.id]);

  // ===================== FIM DO FILTRO DE TRANSAÇÕES (NOVO) =====================

  // Este useEffect gerencia o % de cada categoria (já levando em conta categoriesFiltered)
  const [categoriesWithPercent, setCategoriesWithPercent] = useState<Category[]>([]);


  useEffect(() => {
    const totalSpentAmount = categoriesFiltered.reduce(
      (total, category) => total + (category.spentAmount || 0),
      0
    );

    const updatedCategories = categoriesFiltered
      .map(category => ({
        ...category,
        percent: totalSpentAmount > 0
          ? (category.spentAmount / totalSpentAmount) * 100
          : 0,
      }))
      .sort((a, b) => b.percent - a.percent);

    setCategoriesWithPercent(updatedCategories);
  }, [categoriesFiltered]);

  // totalBudget e totalSpent agora vêm de categoriesFiltered
  const totalBudget = useMemo(
    () => categoriesFiltered.reduce((acc, c) => acc + (c.budget || 0), 0),
    [categoriesFiltered]
  );
  const totalSpent = useMemo(
    () => categoriesFiltered.reduce((acc, c) => acc + (c.spentAmount || 0), 0),
    [categoriesFiltered]
  );
  const totalSpentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatDisplayedBudget = () => {
    return editBudget !== null ? formatCurrency(editBudget) : 'R$0,00';
  };

  const handleBudgetChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9]/g, '')) / 100;
    setEditBudget(numericValue);
  };

  // Lê a coleção "categories" do Firestore
 // ATUALIZE O useEffect DE FETCH DAS CATEGORIAS
useEffect(() => {
  if (!user) return;

  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, orderBy("createdAt", "asc"), where("userId", "==", user.uid));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedCategories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];

    setCategories(fetchedCategories);

    // Atualiza a categoria selecionada com base nos dados filtrados
    setSelectedCategory((prevCategory) => {
      if (!prevCategory) return fetchedCategories[0] || null;
      const updatedCat = fetchedCategories.find(cat => cat.id === prevCategory.id);
      return updatedCat ? { ...updatedCat, spentAmount: spentMap[updatedCat.id] || 0 } : fetchedCategories[0] || null;
    });
  });

  return () => unsubscribe();
}, [user, spentMap]); // Adicione spentMap como dependência
  

  // Lê as subcategorias do selectedCategory
  useEffect(() => {
    if (selectedCategory) {
      const subcategoriesRef = collection(db, "categories", selectedCategory.id, "subcategories");
  
      const unsubscribe = onSnapshot(subcategoriesRef, (snapshot) => {
        const fetchedSubcategories = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        }) as SubCategory[];
  
        setSubcategories(fetchedSubcategories);
      });
  
      return () => unsubscribe();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);  
  
  
  // Atualiza a category no Firestore (budget e spentAmount) fora do onSnapshot
  const [lastUpdatedSpent, setLastUpdatedSpent] = useState<number | null>(null);



  useEffect(() => {
  if (!user) return;

  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, orderBy("date", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tempSpentMap: Record<string, number> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.date?.toDate || data.type !== "despesa" || !data.categoryId) return;

      const catId = data.categoryId;
      const amount = Number(data.amount) || 0;
      if (!tempSpentMap[catId]) tempSpentMap[catId] = 0;
      tempSpentMap[catId] += amount;
    });

    setSpentMap(tempSpentMap);
  });

  return () => unsubscribe();
}, [user]);

  

  useEffect(() => {
    if (calculatedBudget !== null && selectedCategory) {
      setSelectedCategory((prevCategory) =>
        prevCategory ? { ...prevCategory, budget: calculatedBudget } : null
      );
    }
  }, [calculatedBudget]);

  // ==================================== Funções de manipulação de SubCategorias ====================================

  const addSubCategory = async (emoji: string, name: string, budget: number) => {
    if (selectedCategory) {
      try {
        const subcategoryData = {
          name,
          emoji,
          budget,
          primaryColor: selectedCategory.primaryColor,
          secondaryColor: selectedCategory.secondaryColor,
          boldColor: selectedCategory.boldColor,
          spentAmount: 0,
          createdAt: Timestamp.now(),
          userId: user?.uid,
        };
  
        const subcategoriesRef = collection(db, "categories", selectedCategory.id, "subcategories");
        await addDoc(subcategoriesRef, subcategoryData);
  
        // Atualizar orçamento em tempo real
        updateCategoryBudget(selectedCategory.id);
  
        setAddSubCategoryModalVisible(false);
        setTimeout(() => setShowSuccessAlert(true), 500);
      } catch (error) {
        console.error("❌ Erro ao adicionar subcategoria:", error);
      }
    }
  };  

  const handleEditSubCategory = async () => {
    if (selectedCategory && selectedSubCategory && editBudget !== null) {
      try {
        const subcategoryRef = doc(
          db,
          "categories",
          selectedCategory.id,
          "subcategories",
          selectedSubCategory.id
        );
  
        await updateDoc(subcategoryRef, {
          name: editName,
          emoji: editEmoji,
          budget: editBudget,
        });
  
        // Atualizar orçamento em tempo real
        updateCategoryBudget(selectedCategory.id);
  
        setEditSubCategoryModalVisible(false);
      } catch (error) {
        console.error("❌ Erro ao editar subcategoria:", error);
      }
    }
  };

  const handleDeleteSubCategory = async (sub: SubCategory) => {
    if (selectedCategory && sub) {
      Alert.alert(
        "Confirmação",
        "Deseja excluir essa subcategoria?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                const subcategoryRef = doc(
                  db,
                  "categories",
                  selectedCategory.id,
                  "subcategories",
                  sub.id
                );
  
                await deleteDoc(subcategoryRef);
  
                  // 🔥 Pequeno delay para evitar loop antes da atualização
              setTimeout(() => {
                updateCategoryBudget(selectedCategory.id);
              }, 300);
  
                setEditSubCategoryModalVisible(false);
              } catch (error) {
                console.error("❌ Erro ao excluir subcategoria:", error);
              }
            },
          },
        ]
      );
    } else {
      console.error("⚠️ ID de categoria ou subcategoria inválido.");
    }
  };

  const showEditDeleteModal = (subcategory: SubCategory) => {
    setSelectedSubCategory(subcategory);
    setEditName(subcategory.name);
    setEditEmoji(subcategory.emoji);
    setEditBudget(subcategory.budget);
    setEditSubCategoryModalVisible(true);
  };

  const handleSuccessAlertClose = () => {
    setShowSuccessAlert(false);
  };

  const updateCategoryBudget = (categoryId: string) => {
    if (!categoryId) return;
  
    // Criando uma referência para as subcategorias dentro da categoria
    const subcategoriesRef = collection(db, "categories", categoryId, "subcategories");
  
    return onSnapshot(subcategoriesRef, async (snapshot) => {
      const totalBudget = snapshot.docs.reduce((total, doc) => {
        const subcategory = doc.data() as SubCategory;
        return total + (subcategory.budget || 0);
      }, 0);
  
      // Atualizar no Firestore
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, { budget: totalBudget });
  
    });
  };

 function addSubVerification(){
  // if (!revUser.plus) {
  //   setModalPayment(true);
  //   return;
  // }
  setAddSubCategoryModalVisible(true)
 }
  
  

  const progressPercentage = selectedCategory?.budget
  ? Math.min((selectedCategory.spentAmount || 0) / selectedCategory.budget, 1)
  : 0;

const amountCurrent = selectedCategory?.budget
  ? selectedCategory.budget - (selectedCategory.spentAmount || 0)
  : 0;


  function handlePressOnEmptyPart() {
    setModalBudgetVisible(true);
  }

  const fetchCategories = async () => {
    if (user?.uid) {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      setCategories(fetchedCategories);

      setSelectedCategory((prevCategory) => {
        return prevCategory || fetchedCategories[0] || null;
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const renderItemCategory = ({ item }: { item: SubCategory }) => {
    return <CardSubCategories data={item} clear={() => {}} title="Orçamento" />;
  };

  function renderHiddenItemTransaction({ item }: { item: SubCategory }) {
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

  const renderHeader = () => (
    <View style={styles.container}>
      <TouchableOpacity style={{ paddingLeft: 20, paddingTop: 40 }} onPress={handlePressOnEmptyPart}>
        <AntDesign name="info-circle" size={24} color={Colors.grayBack} />
      </TouchableOpacity>

      <View style={styles.viewProgress}>
        <TouchableOpacity onPress={handlePressOnEmptyPart} activeOpacity={0.8}>
          <AnimatedCircularProgress
            size={270}
            width={18}
            fill={totalSpentPercentage}
            tintColor={selectedCategory?.primaryColor || '#8c52ff'}
            backgroundColor="#eee"
            rotation={0}
            lineCap="round"
          >
            {() => (
              <View style={styles.donutCenter}>
                <Text style={styles.progressTitle}>Total Gasto</Text>
                <Text style={styles.progressBalance}>{formatCurrency(totalSpent)}</Text>
                <View style={styles.viewProgressValue}>
                  <Text style={styles.progressValue}>{totalSpentPercentage.toFixed(1)}%</Text>
                </View>
              </View>
            )}
          </AnimatedCircularProgress>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categoriesWithPercent}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, marginTop: 50 }}
        renderItem={({ item: category }) => {
          const totalSpentAll = totalSpent || 0;
          const catPercent = totalSpentAll > 0
            ? ((category.spentAmount || 0) / totalSpentAll) * 100
            : 0;

          return (
            <View key={category.id} style={styles.pillContainer}>
              <View
                style={{
                  height: 8,
                  width: 8,
                  borderRadius: 100,
                  backgroundColor: category.primaryColor || "#eee",
                }}
              />
              <Text style={styles.text}>{category.name}</Text>
              <Text style={styles.text}>{catPercent.toFixed(0)}%</Text>
            </View>
          );
        }}
      />

      <View style={styles.containerDataCategories}>
        <View style={styles.viewRowDataCategories}>
          <Pressable
            style={[styles.texteHeaderView, { backgroundColor: selectedCategory?.secondaryColor }]}
            onPress={() => setModalVisible(true)}
          >
            <Text>{selectedCategory?.emoji}</Text>
            <Text style={[styles.textMovements, { color: selectedCategory?.boldColor }]}>
              {selectedCategory?.name}
            </Text>
            <AntDesign name={'down'} size={14} color={selectedCategory?.boldColor} />
          </Pressable>
          <View style={[styles.containerBudgetData, { backgroundColor: selectedCategory?.secondaryColor }]}>
            <Text style={[styles.textMovements, { color: selectedCategory?.boldColor }]}>
              Orçamento: {selectedCategory ? `${formatCurrency(selectedCategory.budget)}` : 'R$0'}
            </Text>
          </View>
        </View>

        <View style={[styles.viewFooter, { backgroundColor: selectedCategory?.boldColor }]}>
          <View style={styles.viewProgressBarProgress}>
            <Text style={[styles.textMovements, { color: 'white' }]}>
              {formatCurrency(selectedCategory?.spentAmount ?? 0)}
            </Text>
            <Text style={[styles.textMovements, { color: 'white' }]}>
              {formatCurrency(amountCurrent)}
            </Text>
          </View>
          <View style={styles.viewBarProgress}>
            <View style={{ width: '88%' }}>
              <Progress.Bar
                width={null}
                height={12}
                color={selectedCategory?.primaryColor}
                unfilledColor={selectedCategory?.secondaryColor}
                borderWidth={0}
                progress={progressPercentage}
                borderRadius={100}
              />
            </View>
            <Text style={[styles.textPercent, { color: selectedCategory?.primaryColor }]}>
              {`${(progressPercentage * 100).toFixed(0)}%`}
            </Text>
          </View>
        </View>

        {/* Modal de Seleção de Categoria */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.pillContainer,
                    {
                      backgroundColor: category.secondaryColor,
                      borderWidth: 0,
                      borderColor: 'transparent',
                      paddingVertical: 8,
                    },
                  ]}
                  onPress={() => {
                    const updatedSpent = spentMap[category.id] || 0;
                    setSelectedCategory({
                      ...category,
                      spentAmount: updatedSpent,
                    });
                    setModalVisible(false);
                  }}
                >
                  <Text>{category.emoji}</Text>
                  <Text style={[styles.modalText, { color: category.boldColor }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.buttonAdd}
        onPress={addSubVerification}
      >
        <Text style={styles.textButtonAdd}>Adicionar subcategoria</Text>
      </TouchableOpacity>
      {showSuccessAlert && (
        <SuccessAlert message="Subcategoria adicionada com sucesso!" onClose={() => setShowSuccessAlert(false)} />
      )}
      <ModalAddSub
        visible={addSubCategoryModalVisible}
        onClose={() => setAddSubCategoryModalVisible(false)}
        onAdd={addSubCategory}
        selectedCategory={selectedCategory}
      />

      <ModalPaymentPlus
        visible={modalPayment}
        onClose={()=> setModalPayment(false)}
        onConfirm={() => navigation.navigate('Subscription' as never)}
        />

      <ReportModal
        visible={modalBudgetVisible}
        onClose={() => setModalBudgetVisible(false)}
        selectedMonth={selectedMonth}
        totalBudget={totalBudget}  // totalBudget calculado anteriormente
        categories={categoriesWithPercent} // ou a lista de categorias que contém o percentual
      />

    </View>
  );

  return (
    <>
      <SwipeListView
        data={subcategories}
        keyExtractor={(item: SubCategory) => item.id}
        renderItem={renderItemCategory}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={editSubCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditSubCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
            <Pressable
              onPress={() => setEditSubCategoryModalVisible(false)}
              style={{ flex: 1, width: '100%', height: '20%' }}
            />
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={[styles.addSubCategoryModal, {alignItems: 'center', paddingTop: 20}]}>
                <View style={{flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', width: '100%', height: 40}}>
                  <Text style={[styles.modalTitle, {marginBottom: 0, paddingBottom:0, alignSelf: 'flex-end'}]}>Editar Emoji</Text>
                  <Pressable
                    onPress={handleEditSubCategory}
                    style={[
                      styles.texteHeaderView,
                      {
                        backgroundColor: selectedCategory?.secondaryColor,
                        alignSelf: 'flex-start',
                        marginHorizontal: 20,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <Feather name="check-square" size={24} color={selectedCategory?.boldColor} />
                  </Pressable>
                </View>
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

                <Text style={styles.modalTitle}>Editar orçamento</Text>
                <TextInput
                  style={styles.textInputBudget}
                  placeholder="R$ 0,00"
                  value={formatDisplayedBudget()}
                  onChangeText={handleBudgetChange}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.gray95}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
