import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import * as Progress from 'react-native-progress';

import AntDesign from '@expo/vector-icons/AntDesign'; // se precisar
import { getAuth, getFirestore, collection, query, orderBy, onSnapshot } from '../../../services/api/legacy-data';

import moment from 'moment';
import 'moment/locale/pt-br';

// Importar MonthContext e YearContext
import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';

type SubCategory = {
  id: string;              // subcategoryId
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  budget: number;          // valor global
  spentAmount: number;     // valor global, se vier do Firestore
};

type CardSubCategoriesProps = {
  data: SubCategory;
  clear: () => void;
  title: string;
  onLongPress?: () => void;
};

const formatCurrency = (value?: number): string => {
  return value != null
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$0,00';
};

export default function CardSubCategories({
  data,
  clear,
  title,
  onLongPress
}: CardSubCategoriesProps) {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  // Importar selectedMonth e selectedYear
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  // Se você precisar filtrar por categoryId também, precisa vir como prop ou algo.
  // Aqui, assumimos que "subcategories" está global. Se precisar filtrar por categoryId, adicione.

  // Este estado armazenará o 'spentAmount' filtrado deste subcategory no PERÍODO selecionado.
  const [filteredSpent, setFilteredSpent] = useState<number>(0);

  // budget do Firestore (global, se quiser)
  const budget = data.budget ?? 0;

  // =================== Query para filtrar transações do PERÍODO ===================
  useEffect(() => {
    if (!user) return;

    const monthNames = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();

    const ref = collection(db,'transactions');
    const qRef = query(ref, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      let sum = 0;

      snapshot.forEach(docSnap => {
        const t = docSnap.data();
        if (!t.date?.toDate) return;

        const docDate = moment(t.date.toDate());
        // Filtrar ano e mês (se não for 'Anual')
        if (selectedMonth === 'Anual') {
          if (docDate.year() !== currentYear) return;
        } else {
          if (docDate.year() !== currentYear) return;
          if (docDate.month() !== monthIndex) return;
        }

        // Verifica se a transação corresponde a ESTE subcategoryId
        if (t.type === 'despesa' && t.subcategoryId === data.id) {
          sum += Number(t.amount) || 0;
        }
      });

      setFilteredSpent(sum);
    });

    return () => unsubscribe();
  }, [user, selectedMonth, selectedYear, data.id]);

  // Cálculo do total “restante”
  const totalBudget = budget - filteredSpent;

  // Cálculo de progresso
  const progress = budget > 0 ? filteredSpent / budget : 0;
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onLongPress={onLongPress}>
        {/* HEADER */}
        <View style={styles.viewRowHeader}>
          <View style={styles.viewLogo}>
            <Text style={{ fontSize: 22 }}>{data.emoji}</Text>
            <Text style={styles.nameBank}>{data.name}</Text>
          </View>
          <View style={[styles.viewBalance, { backgroundColor: data.secondaryColor }]}>
            <Text style={[styles.textBalance, { color: data.boldColor }]}>
              {title}: {formatCurrency(budget)}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.viewFooter}>
          <View style={styles.viewProgress}>
            <Text style={styles.textMovements}>{formatCurrency(filteredSpent)}</Text>
            <Text style={styles.textMovements}>{formatCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.viewBarProgress}>
            <View style={{ width: '88%' }}>
              <Progress.Bar
                width={null}
                height={12}
                color={Colors.text}
                unfilledColor={Colors.grayTwo}
                borderWidth={0}
                progress={progress}
                borderRadius={100}
              />
            </View>
            <Text style={styles.textPercent}>{percentage}%</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
