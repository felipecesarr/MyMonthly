import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AntDesign from '@expo/vector-icons/AntDesign';

import moment from 'moment';
import 'moment/locale/pt-br';

import { styles } from './styles';
import { Colors } from '../../../constants/colors';

import { getAuth, getFirestore, doc, collection, onSnapshot, orderBy, query, where } from '../../../services/api/legacy-data';

// Importar MonthContext e YearContext para filtrar data
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';
import { AuthContext } from '../../../contexts/Auth';

// Tipo do documento da categoria “Others” (ou “Tax”)
interface CategoryDoc {
  id: string;
  name: string;           
  emoji: string;          
  budget: number;         
  spentAmount: number;    
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
}

// Tipo para cada subcategoria
interface SubcategoryDoc {
  id: string;
  name: string;
  emoji: string;
  budget: number;
  spentAmount: number;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
}

// Tipo para transações
interface TransactionDoc {
  id: string;
  date: any;        // Timestamp
  type: string;     // 'despesa' | 'receita', etc.
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  direction?: string;
}

export default function BudgetListOthers() {
  const { user } = useContext(AuthContext);
  const db = getFirestore();

  // Obter mês e ano do contexto
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  // Estado do doc principal da categoria
  const [category, setCategory] = useState<CategoryDoc | null>(null);
  // Subcategorias
  const [subcategories, setSubcategories] = useState<SubcategoryDoc[]>([]);

  // Exibir ou ocultar subcategorias
  const [subcategoriesVisible, setSubcategoriesVisible] = useState(false);

  // ID do documento no Firestore para “Others” (ou “Tax”)
  // Ajuste conforme o seu Firestore
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.uid) return;
  
    const categoryRef = query(
      collection(db, 'categories'),
      where('name', '==', 'Outros'),
      where("userId", "==", user.uid)
    );
    const unsubCat = onSnapshot(categoryRef, (snapshot) => {
      if (!snapshot.empty) {
        const catDoc = snapshot.docs[0];
        setCategoryId(catDoc.id);
      }
    });
    return () => unsubCat();
      }, [db, user]);
  

  useEffect(() => {
         if (!categoryId) return;
     
         const categoryRef = query(collection(db, 'categories'), where('__name__', '==', categoryId), where("userId", "==", user?.uid));
         const unsubCat = onSnapshot(categoryRef, (snapshot) => {
           if (!snapshot.empty) {
             const catData = snapshot.docs[0].data() as Partial<CategoryDoc>;
             setCategory({
               id: snapshot.docs[0].id,
               name: catData.name || 'Outros',
               emoji: catData.emoji || '🪙',
               budget: catData.budget || 0,
               spentAmount: catData.spentAmount || 0,
               primaryColor: catData.primaryColor || Colors.eatingPrimary,
               secondaryColor: catData.secondaryColor || Colors.eatingSecondary,
               boldColor: catData.boldColor || Colors.eatingBold,
             });
           } else {
             setCategory(null);
           }
         });
     
         return () => unsubCat();
       }, [db, categoryId]);
     
       useEffect(() => {
         if (!categoryId) return;
     
         // 📌 Acessando a subcoleção "subcategories" DENTRO da categoria
         const subRef = collection(db, 'categories', categoryId, 'subcategories');
     
         const unsubSub = onSnapshot(subRef, (snapshot) => {
           const list: SubcategoryDoc[] = snapshot.docs.map((subDoc) => {
             const data = subDoc.data() as Partial<SubcategoryDoc>;
             return {
               id: subDoc.id,
               name: data.name || '',
               emoji: data.emoji || '🪙',
               spentAmount: data.spentAmount || 0,
               budget: data.budget || 0,
               primaryColor: data.primaryColor || Colors.eatingPrimary,
               secondaryColor: data.secondaryColor || Colors.eatingSecondary,
               boldColor: data.boldColor || Colors.eatingBold,
             };
           });
     
           setSubcategories(list);
         });
     
         return () => unsubSub();
       }, [db, categoryId]); 

  // ================== 2) Snapshot de transações (filtradas por MÊS/ANO e categoryId) ==================
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});

  useEffect(() => {
        if (!user || !categoryId) return;
    
        const monthArray = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthIndex = monthArray.indexOf(selectedMonth);
        const currentYear = Number(selectedYear) || moment().year();
    
        const ref = query(collection(db, 'transactions'),
          where('userId', '==', user.uid),
          where('categoryId', '==', categoryId),
          orderBy('date', 'desc')
        );
    
        const unsubTx = onSnapshot(ref, (snapshot) => {
          const tempSpent: Record<string, number> = {};
    
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (!data.date?.toDate) return;
    
            const docDate = moment(data.date.toDate());
            if (selectedMonth === 'Anual') {
              if (docDate.year() !== currentYear) return;
            } else {
              if (docDate.year() !== currentYear || docDate.month() !== monthIndex) return;
            }
    
            const subId = data.subcategoryId || 'no-sub';
            if (!tempSpent[subId]) tempSpent[subId] = 0;
            tempSpent[subId] += Number(data.amount) || 0;
          });
    
          setSpentMap(tempSpent);
        });
    
        return () => unsubTx();
      }, [user, db, categoryId, selectedMonth, selectedYear]);

  // ================== 3) Mesclar subcategories com spentMap ==================
  const subcategoriesWithSpent = useMemo(() => {
    return subcategories.map((sc) => {
      const realSpent = spentMap[sc.id] || 0;
      return {
        ...sc,
        spentAmount: realSpent,
      };
    });
  }, [subcategories, spentMap]);

  // ================== 4) Calcular totalSpent e totalBudget ==================
  const totalSpent = useMemo(() => {
    return subcategoriesWithSpent.reduce((sum, sc) => sum + sc.spentAmount, 0);
  }, [subcategoriesWithSpent]);

  const totalBudget = useMemo(() => {
    return subcategoriesWithSpent.reduce((sum, sc) => sum + sc.budget, 0);
  }, [subcategoriesWithSpent]);

  const averagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Toggle subcategorias
  function toggleSubcategories() {
    setSubcategoriesVisible(!subcategoriesVisible);
  }

  // Se a categoria “Others” (ou “Tax”) não existir
  if (!category) {
    return (
      <View style={[styles.container, { padding: 20 }]}>
        <ActivityIndicator size='small' color='#a47456'/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Linha principal da categoria */}
      <Pressable onPress={toggleSubcategories} style={styles.rowView}>
        <View style={[styles.categoryView, { backgroundColor: category.primaryColor }]}>
          <Text>{category.emoji}</Text>
          <Text style={styles.textNameCategory}>{category.name}</Text>
        </View>
        <View style={styles.viewAlign}>
          <View style={styles.corrcetView}>
            <AnimatedCircularProgress
              size={34}
              width={4}
              fill={averagePercent}
              tintColor={category.primaryColor}
              backgroundColor={category.secondaryColor}
              rotation={0}
              lineCap="round"
            >
              {() => (
                <Text style={[styles.textPercent, { color: category.boldColor }]}>
                  {`${averagePercent.toFixed(0)}%`}
                </Text>
              )}
            </AnimatedCircularProgress>

            <Text style={styles.textBudget}>
              R${totalSpent.toLocaleString('pt-BR')}
            </Text>
          </View>
          <Pressable onPress={toggleSubcategories}>
            <AntDesign
              name={subcategoriesVisible ? 'down' : 'right'}
              size={16}
              color={Colors.gray95}
            />
          </Pressable>
        </View>
      </Pressable>

      {/* Subcategorias */}
      {subcategoriesVisible && (
        <View style={styles.subcategories}>
          {subcategoriesWithSpent.map((sc) => {
            const fill = sc.budget > 0
              ? (sc.spentAmount / sc.budget) * 100
              : 0;

            return (
              <View key={sc.id} style={styles.rowView}>
                <View style={[styles.subcategoryView, { backgroundColor: category.secondaryColor }]}>
                  <Text>{sc.emoji}</Text>
                  <Text style={[styles.textNameSubcategory, { color: category.boldColor }]}>
                    {sc.name}
                  </Text>
                </View>
                <View style={styles.viewAlign}>
                  <View style={styles.corrcetView}>
                    <AnimatedCircularProgress
                      size={34}
                      width={4}
                      fill={fill}
                      tintColor={sc.primaryColor}
                      backgroundColor={sc.secondaryColor}
                      rotation={0}
                      lineCap="round"
                    >
                      {() => (
                        <Text style={[styles.textPercent, { color: category.boldColor }]}>
                          {`${fill.toFixed(0)}%`}
                        </Text>
                      )}
                    </AnimatedCircularProgress>

                    <Text style={styles.textBudgetSub}>
                      R${sc.spentAmount.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                  <Pressable>
                    <AntDesign name="right" size={16} color="transparent" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
