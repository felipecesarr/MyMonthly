import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, FlatList,
  Pressable, TouchableOpacity, Dimensions, Platform,
  Modal
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather'; 
import AntDesign from '@expo/vector-icons/AntDesign';

import Svg, { 
  Defs, LinearGradient, Path, Stop, Rect, G, Circle 
} from 'react-native-svg';

import moment from 'moment';
import 'moment/locale/pt-br';

import { getAuth, getFirestore, collection, query, orderBy, onSnapshot, where } from '../../../services/api/legacy-data';

import { useMonth } from '../../../contexts/MonthContext';
import { useYear } from '../../../contexts/YearContext';

import { styles } from './styles';
import { Colors } from '../../../constants/colors';

// Components
import BudgetListHome from '../../components/BudgetListHome';
import BudgetListEating from '../../components/BudgetListEating';
import BudgetListHealthy from '../../components/BudgetListHealthy';
import BudgetListEntretenaiment from '../../components/budgetListEntretenaiment';
import BudgetListPet from '../../components/BudgetListPet';
import BudgetListGoal from '../../components/BudgetListGoal';
import BudgetListTransport from '../../components/BudgetListTransport';
import BudgetListInvestment from '../../components/BudgetListInvestment';
import BudgetListEducation from '../../components/BudgetListEducation';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import BudgetListOthers from '../../components/BudgetListOthers';
import ReportModalDash from '../../components/ReportModalDash';
import DemoModal from '../../components/DemoModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Exemplos de dados "thisMonth" e "recurencys"
type thisMonthProps = {
  id: string;
  type: string;
  amount: string;
  icon: React.ReactElement;
};

const thisMonth: thisMonthProps[] = [
  {id: "1", type: "Receitas", amount: "R$4.220,35", icon: <Ionicons name="trending-up" size={24} color={Colors.grayTwo} />},
  {id: "2", type: "Despesas", amount: "R$3.220,35", icon: <Ionicons name="trending-down" size={24} color={Colors.grayTwo} />},
  {id: "3", type: "Poupado", amount: "R$1.000,00", icon: <FontAwesome6 name="piggy-bank" size={20} color={Colors.grayTwo} />},
];

// ==== Tipos p/ agrupar por dia ====
interface DayStats {
  date: Date;
  in: number;    // total entradas no dia
  out: number;   // total saídas no dia
}
interface AccDay {
  date: Date;
  accOut: number; // acumulado de despesas até aquele dia
}

export default function Dashboard() {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();
  // MÊS e ANO via context
  const { selectedMonth } = useMonth(); 
  const { selectedYear } = useYear();

  const [modalReportVisible, setModalReportVisible] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Dimensões do gráfico
  const chartWidth = Dimensions.get('window').width * 1.0;
  const chartHeight = 300;

  // dailyStats p/ cada dia: { date, in, out }
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  // accumulatedDays p/ desenhar apenas o "acumulado de despesas (out)"
  const [accumulatedDays, setAccumulatedDays] = useState<AccDay[]>([]);
  // Total de despesas do mês
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  // Hover
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isFocused = useIsFocused();
  
  // Tooltip state
  // Modifique o estado do tooltipData (remova coordenadas x, y que não são mais necessárias)
const [tooltipData, setTooltipData] = useState<{
  visible: boolean;
  date: string;
  dayIn: string;
  dayOut: string;
  accOut: string;
  selectedIndex: number | null;
}>({
  visible: false,
  date: '',
  dayIn: '',
  dayOut: '',
  accOut: '',
  selectedIndex: null
});

  // === Carregar transações do Firestore, agrupar por dia ===
  useEffect(() => {
    if (!user || !isFocused) return;

    const monthArray = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    const monthIndex = monthArray.indexOf(selectedMonth);
    const currentYear = Number(selectedYear) || moment().year();

    const ref = collection(db, 'transactions');
    const q = query(ref, orderBy('date', 'desc'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Agrupamento
      const dayMap = new Map<string, { date: Date; in: number; out: number }>();

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.date?.toDate) return;

        const docDate = moment(data.date.toDate());
        const docYear = docDate.year();
        const docMonth = docDate.month();

        // Filtrar
        if (selectedMonth === 'Anual') {
          if (docYear !== currentYear) return;
        } else {
          if (docYear !== currentYear) return;
          if (docMonth !== monthIndex) return;
        }

        // Formatar a "chave" do dia
        const dayKey = docDate.format('YYYY-MM-DD');
        if (!dayMap.has(dayKey)) {
          dayMap.set(dayKey, {
            date: docDate.toDate(),
            in: 0,
            out: 0
          });
        }
        const entry = dayMap.get(dayKey)!;

        // Se for despesa, soma em out; se receita, soma em in
        if (data.type === 'despesa') {
          entry.out += Number(data.amount);
        } else if (data.type === 'receita') {
          entry.in += Number(data.amount);
        }
      });

      // Converte em array e ordena
      let statsArray = Array.from(dayMap.values());
      statsArray.sort((a, b) => a.date.getTime() - b.date.getTime());

      // define no state
      setDailyStats(statsArray);

      // total de despesas
      const totalOut = statsArray.reduce((sum, day) => sum + day.out, 0);
      setTotalExpenses(totalOut);

      // Montar array p/ "acumulado de despesas"
      let runningOut = 0;
      const accDays: AccDay[] = statsArray.map(day => {
        runningOut += day.out;
        return { date: day.date, accOut: runningOut };
      });
      setAccumulatedDays(accDays);
    });

    return () => unsubscribe();
  }, [user, db, selectedMonth, selectedYear, isFocused]);

  // Limpa o tooltip quando o usuário toca em outro lugar da tela
  useEffect(() => {
    const handleOutsideTouch = () => {
      if (tooltipData.visible) {
        setTooltipData(prev => ({...prev, visible: false}));
      }
    };

    const subscription = Dimensions.addEventListener('change', handleOutsideTouch);
    
    return () => subscription.remove();
  }, [tooltipData.visible]);

  // === Montar path do acumulado de despesas (out) ===
  function createPath() {
    if (accumulatedDays.length === 0) return '';
    const maxVal = Math.max(...accumulatedDays.map(d => d.accOut));
    if (maxVal <= 0) return '';

    const xStep = accumulatedDays.length > 1
      ? chartWidth / (accumulatedDays.length - 1)
      : 0;

    return accumulatedDays.reduce((path, { accOut }, index, arr) => {
      const x = index * xStep;
      const y = chartHeight - (accOut / maxVal) * chartHeight;
      if (index === 0) {
        return `M ${x} ${y}`;
      } else {
        const prevX = (index - 1) * xStep;
        const prevY = chartHeight - (arr[index - 1].accOut / maxVal) * chartHeight;
        const controlX = (prevX + x) / 2;
        return `${path} C ${controlX},${prevY} ${controlX},${y} ${x},${y}`;
      }
    }, '');
  }

  // Quando clica no gráfico
  // Modificação do handleGraphPress
function handleGraphPress(evt: any) {
  if (accumulatedDays.length < 1) return;
  const xStep = accumulatedDays.length > 1
    ? chartWidth / (accumulatedDays.length - 1)
    : 0;

  const { locationX } = evt.nativeEvent;
  let index = Math.round(locationX / xStep);
  if (index < 0) index = 0;
  if (index >= accumulatedDays.length) {
    index = accumulatedDays.length - 1;
  }

  const selectedDay = accumulatedDays[index];
  const dayInfo = dailyStats.find(ds => ds.date.getTime() === selectedDay.date.getTime());
  const dayIn = dayInfo?.in || 0;
  const dayOut = dayInfo?.out || 0;

  // Atualiza o hover index para destacar o ponto no gráfico
  setHoveredIndex(index);

  // Use Haptic feedback se disponível
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // Mostrar o modal centralizado em vez do tooltip
  setTooltipData({
    visible: true,
    date: moment(selectedDay.date).format('DD/MM'),
    dayIn: formatCurrency(dayIn),
    dayOut: formatCurrency(dayOut),
    accOut: formatCurrency(selectedDay.accOut),
    selectedIndex: index
  });
}

  // Formatador de valor
  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function handleAverageData() {
    if (dailyStats.length === 0) {
      Alert.alert('Médias', 'Não há dados suficientes para calcular as médias.');
      return;
    }
    setModalReportVisible(true);
  }

  function getValue(item: thisMonthProps) {
      const totalIn = dailyStats.reduce((sum, ds) => sum + ds.in, 0);
      const totalOut = dailyStats.reduce((sum, ds) => sum + ds.out, 0);
  
      if (item.type === 'Receitas') {
        return formatCurrency(totalIn); 
      } else if (item.type === 'Despesas') {
        return formatCurrency(totalOut);
      } else {
        // Exemplo: "Poupado"
        return formatCurrency(totalIn - totalOut);
      }
  }

  // Função para calcular a porcentagem (evitando divisão por zero)
  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // 1) Calcular totalIn e totalOut (se ainda não tiver)
  const totalIn = dailyStats.reduce((sum, day) => sum + day.in, 0);
  const totalOut = dailyStats.reduce((sum, day) => sum + day.out, 0);

  // 2) Evitar divisão por zero
  const percentGastos = totalIn === 0
    ? 0
    : (totalOut / totalIn) * 100;

  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const monthIndex = monthNames.indexOf(selectedMonth);
  const daysInMonth = moment(`${selectedYear}-${monthIndex + 1}`, 'YYYY-M').daysInMonth();
  
  // Agora, ao calcular as médias:
  const averageRevenue = totalIn / daysInMonth;
  const averageExpense = totalOut / daysInMonth;

  useEffect(() => {
    // Verifica se o modal de demo já foi mostrado
    const checkDemoShown = async () => {
      try {
        const hasSeenDemo = await AsyncStorage.getItem('hasSeenDemo');
        if (!hasSeenDemo) {
          setShowDemo(true);
        }
      } catch (error) {
        console.error('Erro ao verificar a flag de demo:', error);
      }
    };
    checkDemoShown();
  }, []);

  const handleCloseDemo = async () => {
    setShowDemo(false);
    try {
      await AsyncStorage.setItem('hasSeenDemo', 'true');
    } catch (error) {
      console.error('Erro ao salvar a flag de demo:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
   
      <TouchableOpacity style={{paddingLeft: 20, paddingTop: 40, position: 'absolute'}} onPress={handleAverageData}>
        <AntDesign name="info-circle" size={24} color={Colors.grayBack} />
      </TouchableOpacity>

      <View style={styles.headerText}>
        <Text style={styles.textDescription}>Gastos totais</Text>
        <Text style={styles.textAmount}>{formatCurrency(totalExpenses)}</Text>
        <View style={styles.viewProgressValue}>
          <Feather name="arrow-up-right" size={16} color={Colors.incomeBold}/>
          <Text style={styles.progressValue}>{percentGastos.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Container relativo para SVG e tooltip */}
      <View style={{
        position: 'relative',
        width: chartWidth,
        height: chartHeight,
        alignSelf: 'center',
        marginTop: 20,
      }}>
        {accumulatedDays.length > 0 ? (
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.incomePrimary} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={Colors.incomePrimary} stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={Colors.incomeBold} />
                <Stop offset="100%" stopColor={Colors.incomePrimary} />
              </LinearGradient>
            </Defs>

            {/* Linhas de grade horizontal */}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <Path
                key={`grid-${ratio}`}
                d={`M 0 ${chartHeight * ratio} H ${chartWidth}`}
                stroke={Colors.gray95 + '40'}
                strokeWidth={1}
                strokeDasharray="5,5"
              />
            ))}

            {/* Path do acumulado de despesas (área) */}
            {(() => {
              const path = createPath();
              if (!path) return null;
              return (
                <Path
                  d={`${path} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                  fill="url(#grad)"
                />
              );
            })()}
            
            {/* Path da linha principal (contorno) */}
            {(() => {
              const path = createPath();
              if (!path) return null;
              return (
                <Path
                  d={path}
                  stroke="url(#line-grad)"
                  strokeWidth={2.5}
                  fill="none"
                />
              );
            })()}

            {/* Retângulo transparente para capturar clique */}
            <Rect
              x={0}
              y={0}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
              onPress={handleGraphPress}
            />

            {/* Círculo do ponto selecionado */}
            {hoveredIndex != null && hoveredIndex >= 0 && hoveredIndex < accumulatedDays.length && (
              <G>
                {(() => {
                  const day = accumulatedDays[hoveredIndex];
                  const maxVal = Math.max(...accumulatedDays.map(d => d.accOut));
                  if (maxVal <= 0) return null;

                  const xStep = accumulatedDays.length > 1
                    ? chartWidth / (accumulatedDays.length - 1)
                    : 0;
                  const x = hoveredIndex * xStep;
                  const y = chartHeight - (day.accOut / maxVal) * chartHeight;
                  return (
                    <>
                      {/* Linha vertical auxiliar */}
                      <Path 
                        d={`M ${x} ${chartHeight} V ${y}`}
                        stroke={Colors.incomeBold}
                        strokeWidth={1.5}
                        strokeDasharray="3,3"
                      />
                      {/* Círculo do ponto */}
                      <Circle
                        cx={x}
                        cy={y}
                        r={8}
                        fill={Colors.background}
                        stroke={Colors.incomeBold}
                        strokeWidth={2.5}
                      />
                      <Circle
                        cx={x}
                        cy={y}
                        r={4}
                        fill={Colors.incomeBold}
                      />
                    </>
                  );
                })()}
              </G>
            )}
          </Svg>
        ) : (
          <View style={[styles.emptyChartContainer, {width: chartWidth}]}>
          <AntDesign name="line-chart" size={60} color={Colors.gray95 + '70'} />
          <Text style={styles.emptyChartTitle}>Sem dados para exibir</Text>
          <Text style={styles.emptyChartSubtitle}>
            Adicione transações para visualizar seu gráfico de despesas
          </Text>
          
          {/* Gráfico de demonstração com opacidade reduzida */}
          <View style={[styles.demoChartContainer, { width: chartWidth }]}>
            <Svg width={chartWidth} height={80}>
              {/* Criação dinâmica do caminho baseado na largura real da tela */}
              {(() => {
                // Pontos de controle como porcentagens da largura total
                const w = chartWidth;
                const p1 = { x: 0, y: 80 };
                const c1 = { x: w * 0.1, y: 60 };
                const c2 = { x: w * 0.2, y: 40 };
                const p2 = { x: w * 0.3, y: 50 };
                
                const c3 = { x: w * 0.4, y: 60 };
                const c4 = { x: w * 0.5, y: 10 };
                const p3 = { x: w * 0.6, y: 30 };
                
                const c5 = { x: w * 0.7, y: 50 };
                const c6 = { x: w * 0.8, y: 20 };
                const p4 = { x: w * 0.95, y: 40 }; // Um pouco antes do final (95%)
                
                // Construção do caminho
                const pathLine = `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y} 
                                C ${c3.x},${c3.y} ${c4.x},${c4.y} ${p3.x},${p3.y} 
                                C ${c5.x},${c5.y} ${c6.x},${c6.y} ${p4.x},${p4.y}`;
                
                const pathFill = `${pathLine} L ${w},80 L 0,80 Z`;
                
                return (
                  <>
                    {/* Linha do gráfico */}
                    <Path
                      d={pathLine}
                      stroke={Colors.gray95 + '40'}
                      strokeWidth={2}
                      fill="none"
                    />
                    {/* Área sob a curva */}
                    <Path
                      d={pathFill}
                      fill={Colors.gray95 + '10'}
                    />
                  </>
                );
              })()}
            </Svg>
          </View>
        </View>
        )}

       {/* Modal de Detalhes da Transação */}
        <Modal
          visible={tooltipData.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTooltipData(prev => ({...prev, visible: false}))}
        >
          <View style={styles.modalOverlay}>
            <Pressable 
              style={styles.modalBackdrop}
              onPress={() => setTooltipData(prev => ({...prev, visible: false}))}
            />
            <View style={styles.transactionModalContainer}>
              {/* Cabeçalho do Modal */}
              <View style={styles.transactionModalHeader}>
                <Text style={styles.transactionModalTitle}>
                  Detalhes do Dia {tooltipData.date}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setTooltipData(prev => ({...prev, visible: false}))}
                >
                  <AntDesign name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Conteúdo do Modal */}
              <View style={styles.transactionDetailContainer}>
                {/* Entrada */}
                <View style={styles.transactionDetailRow}>
                  <View style={styles.transactionDetailLabel}>
                    <View style={[styles.indicator, {backgroundColor: Colors.incomeBold}]} />
                    <Text style={styles.transactionLabelText}>Entradas</Text>
                  </View>
                  <Text style={[styles.transactionValue, styles.incomeValue]}>
                    {tooltipData.dayIn}
                  </Text>
                </View>

                {/* Saída */}
                <View style={styles.transactionDetailRow}>
                  <View style={styles.transactionDetailLabel}>
                    <View style={[styles.indicator, {backgroundColor: Colors.healthyBold}]} />
                    <Text style={styles.transactionLabelText}>Saídas</Text>
                  </View>
                  <Text style={[styles.transactionValue, styles.expenseValue]}>
                    {tooltipData.dayOut}
                  </Text>
                </View>

                {/* Linha divisória */}
                <View style={styles.divider} />

                {/* Acumulado */}
                <View style={styles.transactionDetailRow}>
                  <View style={styles.transactionDetailLabel}>
                    <AntDesign name="line-chart" size={16} color={Colors.text} />
                    <Text style={styles.transactionLabelBold}>Acumulado</Text>
                  </View>
                  <Text style={[styles.transactionValueTotal]}>
                    {tooltipData.accOut}
                  </Text>
                </View>
              </View>

              {/* Botão de ação (opcional) */}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  setTooltipData(prev => ({...prev, visible: false}));
                  setModalReportVisible(true)
                }}
              >
                <Text style={styles.viewAllButtonText}>Ver Todas Transações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <ReportModalDash
        visible={modalReportVisible}
        onClose={() => setModalReportVisible(false)}
        dailyStats={dailyStats}
        averageRevenue={averageRevenue}
        averageExpense={averageExpense}
      />

      {/* Exibir o DemoModal apenas se showDemo for true */}
      <DemoModal visible={showDemo} onClose={handleCloseDemo} />

      {/* Exemplo: "Esse mês..." */}
      <View style={styles.textHeader}>
        <Text style={styles.textTitle}>Esse mês...</Text>
      </View>
      <FlatList 
        data={thisMonth}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item)=> item.id}
        renderItem={( { item }) => (
          <View style={styles.viewThisMonth}>
            <View style={styles.headercard}>
              <Text style={styles.textCard}>{item.type}</Text>
              {item.icon}
            </View>
            <Text style={styles.textCardAmount}>{getValue(item)}</Text>
          </View>
        )}
        contentContainerStyle={styles.flatlist}
      />

      {/* Exemplo: Orçamentos */}
      <View style={styles.textHeader}>
        <Text style={styles.textTitle}>Orçamentos</Text>
        <View style={styles.numberView}>
          <Text style={styles.numberText}>10</Text>
        </View>
      </View>
      <View style={{ flex: 1, width: '100%', gap: 14 }}>
        <BudgetListHome/>
        <BudgetListEating/>
        <BudgetListHealthy/>
        <BudgetListEntretenaiment/>
        <BudgetListPet/>
        <BudgetListGoal/>
        <BudgetListTransport/>
        <BudgetListInvestment/>
        <BudgetListEducation/>
        <BudgetListOthers/>
      </View>
      <View style={{ height: 100 }}/>
    </ScrollView>
  );
}
