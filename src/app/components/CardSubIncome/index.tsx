import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from '../CardSubCategories/styles';
import { Colors } from '../../../constants/colors';
import * as Progress from 'react-native-progress';

import { getAuth, getFirestore, collection, query, orderBy, onSnapshot } from '../../../services/api/legacy-data';

import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';

import moment from 'moment';
import 'moment/locale/pt-br';

const formatCurrency = (value?: number): string => {
  return value != null ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$0,00';
};

type IncomeSubcategory = {
  id: string;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  income: number;        // Planejado
  incomeAmount: number;  // Valor global, mas não filtrado
  createdAt?: Date;
};

type CardSubCategoriesProps = {
  data: IncomeSubcategory; 
  clear: () => void;
  title: string;
  onLongPress?: () => void;
};

export default function CardSubIncome({ data, clear, title, onLongPress }: CardSubCategoriesProps) {
  const auth = getAuth();
  const db = getFirestore();

  // Pega o mês e o ano do contexto
  const { selectedMonth } = useMonth();
  const { selectedYear } = useYear();

  const user = auth.currentUser;

  // Valor "planejado" (do Firestore)
  const plannedIncome = data.income ?? 0;

  // Estado para armazenar o valor realmente recebido no PERÍODO
  const [filteredIncomeAmount, setFilteredIncomeAmount] = useState<number>(0);

  // useEffect para filtrar transações de receita dessa subcategoria
  useEffect(() => {
    if (!user) return;

    // Converter selectedMonth e selectedYear
    const monthNames = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();

    // Lê transações
    const ref = collection(db, 'transactions');
    const qRef = query(ref, orderBy('date','desc'));

    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      let sum = 0;

      snapshot.forEach(docSnap => {
        const t = docSnap.data();
        if (!t.date?.toDate) return;

        const docDate = moment(t.date.toDate());
        // Filtrar por ano e, se não for Anual, filtrar mês
        if (selectedMonth === 'Anual') {
          if (docDate.year() !== currentYear) return;
        } else {
          if (docDate.year() !== currentYear) return;
          if (docDate.month() !== monthIndex) return;
        }

        // Se for receita e corresponder a ESTE subcategoryId
        // Ajuste se o nome do campo no Firestore for diferente (ex.: subcategoryId)
        if (t.type === 'receita' && t.subcategoryId === data.id) {
          sum += Number(t.amount) || 0;
        }
      });

      setFilteredIncomeAmount(sum);
    });

    return () => unsubscribe();
  }, [user, db, data.id, selectedMonth, selectedYear]);

  // Valor "restante" = plannedIncome - (valor do período)
  const [remaining, setRemaining] = useState<number>(0);

  // Atualiza o "remaining" sempre que plannedIncome ou filteredIncomeAmount mudar
  useEffect(() => {
    setRemaining(plannedIncome - filteredIncomeAmount);
  }, [plannedIncome, filteredIncomeAmount]);

  // Cálculo de progresso
  const progress = useMemo(() => {
    if (plannedIncome <= 0) return 0;
    return filteredIncomeAmount / plannedIncome;
  }, [plannedIncome, filteredIncomeAmount]);

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onLongPress={onLongPress}>
        <View style={styles.viewRowHeader}>
          <View style={styles.viewLogo}>
            <Text style={{ fontSize: 22 }}>{data.emoji}</Text>
            <Text style={styles.nameBank}>{data.name}</Text>
          </View>
          <View style={[styles.viewBalance, { backgroundColor: data.secondaryColor }]}>
            <Text style={[styles.textBalance, { color: data.boldColor }]}>
              {title}{formatCurrency(plannedIncome)}
            </Text>
          </View>
        </View>

        <View style={styles.viewFooter}>
          {/* Exibe quanto RECEBEU (filteredIncomeAmount) e quanto falta (remaining) */}
          <View style={styles.viewProgress}>
            <Text style={styles.textMovements}>
              {formatCurrency(filteredIncomeAmount)}
            </Text>
            <Text style={styles.textMovements}>
              {formatCurrency(remaining)}
            </Text>
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
            <Text style={styles.textPercent}>
              {percentage}%
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
