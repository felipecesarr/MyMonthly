import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { styles } from './styles';
import HeaderLogo from '../../components/headerLogo';
import { Colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../contexts/Auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from '../../../services/api/legacy-data';
import moment from 'moment';
import 'moment/locale/pt-br';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';

// Tipo expandido com informações adicionais necessárias para o relatório
type MonthReport = {
  id: string;
  month: string;
  year: string;
  monthIndex: number;
  displayDate: string;
  transactionCount: number;
  income: number;
  expense: number;
  balance: number;
};

export default function Reports() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [monthReports, setMonthReports] = useState<MonthReport[]>([]);
  const [processingMonth, setProcessingMonth] = useState<string | null>(null);

  // Carregar dados quando o componente montar
  useEffect(() => {
    moment.locale('pt-br');
    loadUserReports();
  }, [user]);

  // Função para carregar relatórios do usuário a partir do Firestore
  const loadUserReports = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const db = getFirestore();
      
      // Buscar todas as transações do usuário
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMonthReports([]);
        setIsLoading(false);
        return;
      }
      
      // Agrupar transações por ano e mês
      const yearMonthData: Record<string, Record<number, any[]>> = {};
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.date) {
          const date = data.date.toDate();
          const year = moment(date).format('YYYY');
          const monthIndex = moment(date).month();
          
          if (!yearMonthData[year]) {
            yearMonthData[year] = {};
          }
          
          if (!yearMonthData[year][monthIndex]) {
            yearMonthData[year][monthIndex] = [];
          }
          
          yearMonthData[year][monthIndex].push({
            id: doc.id,
            ...data,
            date
          });
        }
      });
      
      // Processar os dados para criar relatórios mensais
      const reports: MonthReport[] = [];
      
      // Anos disponíveis (ordem decrescente)
      const years = Object.keys(yearMonthData).sort().reverse();
      
      for (const year of years) {
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
          const transactions = yearMonthData[year]?.[monthIndex] || [];
          
          if (transactions.length > 0) {
            // Calcular totais para o mês
            let income = 0;
            let expense = 0;
            
            transactions.forEach((tx: any) => {
              if (tx.type === 'receita') {
                income += Number(tx.amount) || 0;
              } else {
                expense += Number(tx.amount) || 0;
              }
            });
            
            // Criar objeto de relatório mensal
            const monthName = moment().month(monthIndex).format('MMMM');
            const displayName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            
            reports.push({
              id: `${monthIndex}-${year}`,
              month: displayName,
              year: year,
              monthIndex: monthIndex,
              displayDate: `${displayName} de ${year}`,
              transactionCount: transactions.length,
              income: income,
              expense: expense,
              balance: income - expense
            });
          }
        }
      }
      
      setMonthReports(reports);
      
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar seus relatórios.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para preparar e gerar o relatório
  const handleDownloadReport = async (item: MonthReport) => {
    try {
      setProcessingMonth(item.id);
      
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado");
        setProcessingMonth(null);
        return;
      }
      
      // Buscar transações do mês selecionado
      const db = getFirestore();
      const monthStart = moment().year(parseInt(item.year)).month(item.monthIndex).startOf('month').toDate();
      const monthEnd = moment().year(parseInt(item.year)).month(item.monthIndex).endOf('month').toDate();
      
      const q = query(
        collection(db, 'transactions'),
        where("userId", "==", user.uid),
        where("date", ">=", monthStart),
        where("date", "<=", monthEnd),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        Alert.alert("Aviso", "Não há transações neste mês.");
        setProcessingMonth(null);
        return;
      }
      
      // Processar transações para o formato esperado pelo relatório
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Sem descrição',
          amount: Number(data.amount) || 0,
          date: data.date.toDate(),
          type: data.type || 'despesa',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || 'Sem categoria',
          categoryEmoji: data.categoryEmoji || '📋',
          categoryColor: data.categoryPrimaryColor || '#CCCCCC',
          accountOrCardName: data.accountOrCardName || 'Não especificado',
        };
      });
      
      // Gerar o PDF diretamente com expo-print
      await generatePDF(item, transactions, user?.userName || 'Usuário');
      
    } catch (error) {
      console.error("Erro ao preparar relatório:", error);
      Alert.alert("Erro", "Não foi possível gerar seu relatório.");
    } finally {
      setProcessingMonth(null);
    }
  };

  // Função para gerar PDF diretamente com HTML
  const generatePDF = async (report: MonthReport, transactions: any[], username: string) => {
    try {
      moment.locale('pt-br');
      
      // Calcular métricas financeiras
      const daysInMonth = moment().year(parseInt(report.year)).month(report.monthIndex).daysInMonth();
      const avgExpensePerDay = report.expense / daysInMonth;
      const avgIncomePerDay = report.income / daysInMonth;
      const savingsRate = report.balance > 0 && report.income > 0
        ? ((report.balance / report.income) * 100)
        : 0;
        
      // Análise de categorias
      const categoriesMap: {[key: string]: {
        id: string;
        name: string;
        emoji: string;
        color: string;
        amount: number;
        percentage: number;
        transactions: any[];
      }} = {};
      
      // Identificar dias de maior movimento
      let maxDaySpent = { day: 0, amount: 0 };
      let maxDayIncome = { day: 0, amount: 0 };
      
      // Analisar transações por dia
      const dailyData: {[key: number]: {expenses: number, income: number}} = {};
      for (let i = 1; i <= daysInMonth; i++) {
        dailyData[i] = { expenses: 0, income: 0 };
      }
      
      // Processamento de transações
      transactions.forEach(tx => {
        const txDate = moment(tx.date);
        const day = txDate.date();
        
        if (tx.type === 'despesa') {
          dailyData[day].expenses += tx.amount;
          
          if (dailyData[day].expenses > maxDaySpent.amount) {
            maxDaySpent = { day, amount: dailyData[day].expenses };
          }
          
          if (!categoriesMap[tx.categoryId]) {
            categoriesMap[tx.categoryId] = {
              id: tx.categoryId,
              name: tx.categoryName,
              emoji: tx.categoryEmoji,
              color: tx.categoryColor,
              amount: 0,
              percentage: 0,
              transactions: []
            };
          }
          
          categoriesMap[tx.categoryId].amount += tx.amount;
          categoriesMap[tx.categoryId].transactions.push(tx);
          
        } else {
          dailyData[day].income += tx.amount;
          
          if (dailyData[day].income > maxDayIncome.amount) {
            maxDayIncome = { day, amount: dailyData[day].income };
          }
        }
      });
      
      // Calcular percentuais para categorias
      Object.values(categoriesMap).forEach(category => {
        category.percentage = report.expense > 0 
          ? (category.amount / report.expense) * 100 
          : 0;
      });
      
      // Ordenar categorias por valor
      const sortedCategories = Object.values(categoriesMap)
        .sort((a, b) => b.amount - a.amount);
      
      // Separar transações por tipo
      const expenseTransactions = transactions
        .filter(tx => tx.type === 'despesa')
        .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
      
      const incomeTransactions = transactions
        .filter(tx => tx.type === 'receita')
        .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
      
      // Índice de saúde financeira
      let financialHealthIndex = 50; // Base neutra
      
      // Fatores positivos
      if (savingsRate > 20) financialHealthIndex += 20;
      else if (savingsRate > 10) financialHealthIndex += 10;
      
      // Fatores negativos
      if (report.balance < 0) financialHealthIndex -= 30;
      
      // Limites
      financialHealthIndex = Math.max(0, Math.min(100, financialHealthIndex));
     
      // Funções de formato
      const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      };
      
      const formatPercentage = (value: number): string => {
        return `${value.toFixed(1)}%`;
      };
      
      const formatDate = (date: Date): string => {
        return moment(date).format('DD/MM/YYYY');
      };

      // Gerar HTML para transações de despesas
      const expenseTransactionsHTML = expenseTransactions.map(tx => `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>
            <div class="transaction-category">
              ${tx.categoryEmoji} ${tx.categoryName}
            </div>
          </td>
          <td>${tx.name}</td>
          <td>${tx.accountOrCardName}</td>
          <td style="text-align:right; color:#F44336; font-weight:500">
            ${formatCurrency(tx.amount)}
          </td>
        </tr>
      `).join('');
      
      // Gerar HTML para transações de receitas
      const incomeTransactionsHTML = incomeTransactions.map(tx => `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${tx.name}</td>
          <td>${tx.accountOrCardName}</td>
          <td style="text-align:right; color:#4CAF50; font-weight:500">
            ${formatCurrency(tx.amount)}
          </td>
        </tr>
      `).join('');
      
      // Gerar HTML para categorias
      const categoriesHTML = sortedCategories.map(category => `
        <div class="category-card">
          <div class="category-header">
            <div class="category-name-container">
              <div class="category-emoji" style="background-color: ${category.color}30">
                ${category.emoji}
              </div>
              <span class="category-name">${category.name}</span>
            </div>
            
            <div class="category-amount">
              <div class="category-value">${formatCurrency(category.amount)}</div>
              <div class="category-percentage">${formatPercentage(category.percentage)}</div>
            </div>
          </div>
          
          <div class="bar-container">
            <div class="bar" style="width: ${Math.max(5, Math.min(100, category.percentage))}%; background-color: ${category.color || '#F44336'};"></div>
          </div>
        </div>
      `).join('');

      // Template HTML completo do relatório
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Financeiro - ${report.displayDate}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            font-size: 14px;
          }
          
          .report-container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
          }
          
          .header {
            background: linear-gradient(135deg, #376FDD, #2956B2);
            color: #fff;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .header-content {
            display: flex;
            align-items: center;
          }
          
          .logo-container {
            margin-right: 20px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background-color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          
          .header-text h1 {
            font-size: 28px;
            margin: 0 0 5px 0;
          }
          
          .header-text h2 {
            font-size: 18px;
            font-weight: normal;
            margin: 0 0 5px 0;
            text-transform: capitalize;
          }
          
          .header-text p {
            font-size: 14px;
            opacity: 0.8;
            margin: 0;
          }
          
          .company-details {
            text-align: right;
            font-size: 13px;
          }
          
          .section {
            padding: 25px;
            border-bottom: 1px solid #eee;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1A1A1A;
            display: flex;
            align-items: center;
          }
          
          .section-title-emoji {
            margin-right: 8px;
            font-size: 22px;
          }
          
          .summary-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .summary-column {
            flex: 1;
            min-width: 200px;
          }
          
          .summary-card {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .card-header {
            font-size: 15px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .card-value {
            font-size: 24px;
            font-weight: 600;
          }
          
          .income-color {
            color: #4CAF50;
          }
          
          .expense-color {
            color: #F44336;
          }
          
          .secondary-color {
            color: #23C9B6;
          }
          
          .balance-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .balance-label {
            font-size: 16px;
            font-weight: 500;
          }
          
          .balance-value {
            font-size: 24px;
            font-weight: 600;
          }
          
          .metrics-row {
            display: flex;
            gap: 10px;
            color: #666;
            font-size: 13px;
          }
          
          .metrics-item {
            margin-right: 20px;
          }
          
          .insights-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .insight-card {
            flex: 1;
            background: #F8F9FA;
            border-radius: 8px;
            padding: 15px;
            min-width: 150px;
            text-align: center;
          }
          
          .insight-emoji {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .insight-title {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .insight-value {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 3px;
          }
          
          .insight-description {
            font-size: 13px;
            color: #666;
          }
          
          .health-container {
            background: #F8F9FA;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .health-title {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .progress-container {
            height: 10px;
            background-color: #E0E0E0;
            border-radius: 5px;
            margin-bottom: 10px;
          }
          
          .progress-bar {
            height: 100%;
            border-radius: 5px;
          }
          
          .health-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .health-score {
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .health-description {
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          
          .categories-container {
            margin-bottom: 10px;
          }
          
          .category-card {
            background: #fff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .category-name-container {
            display: flex;
            align-items: center;
          }
          
          .category-emoji {
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background-color: #F5F5F5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            font-size: 18px;
          }
          
          .category-name {
            font-size: 15px;
            font-weight: 500;
          }
          
          .category-amount {
            text-align: right;
          }
          
          .category-value {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 3px;
          }
          
          .category-percentage {
            font-size: 12px;
            color: #666;
          }
          
          .bar-container {
            height: 8px;
            background-color: #F5F5F5;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .bar {
            height: 100%;
            border-radius: 4px;
          }
          
          .transactions-section {
            margin-bottom: 30px;
          }
          
          .section-header {
            background-color: #F5F5F5;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            border-radius: 8px;
          }
          
          .section-header-title {
            font-size: 16px;
            font-weight: 600;
          }
          
          .transaction-count {
            font-size: 13px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          th {
            background-color: #F8F9FA;
            text-align: left;
            padding: 12px 15px;
            font-size: 13px;
            font-weight: 600;
            color: #666;
            border-bottom: 2px solid #E0E0E0;
          }
          
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #E0E0E0;
            font-size: 14px;
          }
          
          .transaction-category {
            display: inline-block;
            background-color: #F5F5F5;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 12px;
            color: #666;
            margin-top: 3px;
          }
          
          .table-footer {
            background-color: #F8F9FA;
            padding: 12px 15px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            font-weight: 600;
            border-radius: 0 0 8px 8px;
          }
          
          .table-footer-label {
            margin-right: 10px;
            font-size: 14px;
          }
          
          .table-footer-value {
            font-size: 16px;
            font-weight: 700;
          }
          
          .tax-info {
            margin-top: 30px;
            padding: 20px;
            background: #F8F9FA;
            border-radius: 8px;
          }
          
          .tax-info h3 {
            font-size: 16px;
            margin-top: 0;
            margin-bottom: 15px;
          }
          
          .tax-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dotted #E0E0E0;
          }
          
          .tax-label {
            font-weight: 500;
          }
          
          .tax-doc-number {
            font-family: monospace;
            background: #fff;
            padding: 3px 5px;
            border-radius: 3px;
            font-size: 13px;
          }
          
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #666;
            background-color: #F5F5F5;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          @media print {
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="header-content">
              <div class="logo-container">
                <div class="logo">MM</div>
              </div>
              <div class="header-text">
                <h1>Relatório Financeiro</h1>
                <h2>${report.displayDate}</h2>
                <p>Gerado em ${moment().format('DD [de] MMMM [de] YYYY')}</p>
              </div>
            </div>
            <div class="company-details">
              <p><strong>Cliente:</strong> ${username}</p>
              <p><strong>Ref. do documento:</strong> MM-${report.year}${(report.monthIndex + 1).toString().padStart(2, '0')}</p>
            </div>
          </div>
        
          <div class="section">
            <div class="section-title">
              <span class="section-title-emoji">📊</span>
              <span>Resumo Contábil - ${report.displayDate}</span>
            </div>
            
            <div class="summary-container">
              <div class="summary-column">
                <div class="summary-card">
                  <p class="card-header">Receitas</p>
                  <p class="card-value income-color">${formatCurrency(report.income)}</p>
                  <p style="margin:5px 0 0;color:#666;">Média diária: ${formatCurrency(avgIncomePerDay)}</p>
                </div>
                
                <div class="summary-card">
                  <p class="card-header">Despesas</p>
                  <p class="card-value expense-color">${formatCurrency(report.expense)}</p>
                  <p style="margin:5px 0 0;color:#666;">Média diária: ${formatCurrency(avgExpensePerDay)}</p>
                </div>
              </div>
              
              <div class="summary-column">
                <div class="summary-card">
                  <div class="balance-container">
                    <p class="balance-label">Saldo Final</p>
                    <p class="balance-value ${report.balance >= 0 ? 'income-color' : 'expense-color'}">
                      ${formatCurrency(report.balance)}
                    </p>
                  </div>
                  
                  <div class="metrics-row">
                    <span class="metrics-item">Total de transações: ${report.transactionCount}</span>
                    ${report.balance >= 0 ? `<span class="metrics-item">Taxa de economia: ${formatPercentage(savingsRate)}</span>` : ''}
                  </div>
                </div>
                
                <div class="health-container">
                  <p class="health-title">Índice de Saúde Financeira</p>
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${financialHealthIndex}%; background-color: ${
                      financialHealthIndex > 70 ? '#4CAF50' : 
                      financialHealthIndex > 40 ? '#FFC107' : '#F44336'
                    };"></div>
                  </div>
                  
                  <div class="health-labels">
                    <span>Crítico</span>
                    <span>Regular</span>
                    <span>Excelente</span>
                  </div>
                  
                  <p class="health-score">${financialHealthIndex}/100</p>
                  <p class="health-description">
                    ${financialHealthIndex > 80 ? 'Excelente! Sua saúde financeira está em ótimo estado.' :
                      financialHealthIndex > 60 ? 'Bom trabalho! Sua saúde financeira está em um bom caminho.' :
                      financialHealthIndex > 40 ? 'Sua saúde financeira está regular. Há espaço para melhorias.' :
                      financialHealthIndex > 20 ? 'Atenção! Sua saúde financeira precisa de cuidados.' :
                      'Alerta! Sua saúde financeira está em estado crítico.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="insights-row">
              <div class="insight-card">
                <div class="insight-emoji">📉</div>
                <p class="insight-title">Dia com maior gasto</p>
                <p class="insight-value">Dia ${maxDaySpent.day}</p>
                <p class="insight-description">${formatCurrency(maxDaySpent.amount)}</p>
              </div>
              
              <div class="insight-card">
                <div class="insight-emoji">💰</div>
                <p class="insight-title">Total de transações</p>
                <p class="insight-value">${report.transactionCount}</p>
                <p class="insight-description">${expenseTransactions.length} despesas, ${incomeTransactions.length} receitas</p>
              </div>
              
              <div class="insight-card">
                <div class="insight-emoji">📈</div>
                <p class="insight-title">Dia com maior receita</p>
                <p class="insight-value">Dia ${maxDayIncome.day}</p>
                <p class="insight-description">${formatCurrency(maxDayIncome.amount)}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <span class="section-title-emoji">📋</span>
              <span>Despesas por Categoria</span>
            </div>
            
            ${sortedCategories.length > 0 ? `
              <div class="categories-container">
                ${categoriesHTML}
              </div>
            ` : `
              <div style="text-align:center; padding:30px;">
                <p style="font-size:22px;">🔍</p>
                <p style="color:#666;">Não foram encontradas despesas por categoria neste período.</p>
              </div>
            `}
          </div>
          
          <div class="page-break"></div>
          
          <div class="section">
            <div class="section-title">
              <span class="section-title-emoji">📝</span>
              <span>Registro Detalhado de Movimentações</span>
            </div>
            
            ${expenseTransactions.length > 0 ? `
              <div class="transactions-section">
                <div class="section-header">
                  <span class="section-header-title">Despesas</span>
                  <span class="transaction-count">${expenseTransactions.length} transações</span>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th width="17%">Data</th>
                      <th width="15%">Categoria</th>
                      <th>Descrição</th>
                      <th width="20%">Conta/Cartão</th>
                      <th width="15%" style="text-align:right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expenseTransactionsHTML}
                  </tbody>
                </table>
                
                <div class="table-footer">
                  <span class="table-footer-label">Total de Despesas:</span>
                  <span class="table-footer-value expense-color">${formatCurrency(report.expense)}</span>
                </div>
              </div>
            ` : ''}
            
            ${incomeTransactions.length > 0 ? `
              <div class="transactions-section" style="${expenseTransactions.length > 0 ? 'margin-top:30px' : ''}">
                <div class="section-header">
                  <span class="section-header-title">Receitas</span>
                  <span class="transaction-count">${incomeTransactions.length} transações</span>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th width="17%">Data</th>
                      <th>Descrição</th>
                      <th width="20%">Conta/Cartão</th>
                      <th width="15%" style="text-align:right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${incomeTransactionsHTML}
                  </tbody>
                </table>
                
                <div class="table-footer">
                  <span class="table-footer-label">Total de Receitas:</span>
                  <span class="table-footer-value income-color">${formatCurrency(report.income)}</span>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">
              <span class="section-title-emoji">📑</span>
              <span>Informações para Contabilidade</span>
            </div>
            
            <div class="tax-info">
              <h3>Dados para Declaração</h3>
              
              <div class="tax-row">
                <span class="tax-label">Período de Referência</span>
                <span>${report.month} de ${report.year}</span>
              </div>
              
              <div class="tax-row">
                <span class="tax-label">Número do Relatório</span>
                <span class="tax-doc-number">MM-${report.year}-${(report.monthIndex + 1).toString().padStart(2, '0')}</span>
              </div>
              
              <div class="tax-row">
                <span class="tax-label">Total de Despesas</span>
                <span>${formatCurrency(report.expense)}</span>
              </div>
              
              <div class="tax-row">
                <span class="tax-label">Total de Receitas</span>
                <span>${formatCurrency(report.income)}</span>
              </div>
              
              <div class="tax-row">
                <span class="tax-label">Saldo do Período</span>
                <span>${formatCurrency(report.balance)}</span>
              </div>
              
              ${sortedCategories.length > 0 ? `
                <h3>Resumo por Categoria</h3>
                ${sortedCategories.map((category, index) => `
                  <div class="tax-row">
                    <span class="tax-label">${index + 1}. ${category.name}</span>
                    <span>${formatCurrency(category.amount)} (${formatPercentage(category.percentage)})</span>
                  </div>
                `).join('')}
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>MyMonthly • Relatório Financeiro • ${report.displayDate}</p>
            <p>Este documento foi gerado automaticamente em ${moment().format('DD/MM/YYYY [às] HH:mm')}</p>
          </div>
        </div>
      </body>
      </html>
      `;
      
      // Gerar o PDF diretamente com HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612, // Letter width em pontos (8.5 x 11 polegadas)
        height: 792, // Letter height em pontos
        margins: {
          left: 18,
          top: 18,
          right: 18,
          bottom: 18
        }
      });
      
      // Nome do arquivo para salvar
      const timestamp = new Date().getTime();
      const filename = `MyMonthly_${report.month}_${report.year}_${timestamp}.pdf`;
      const destination = FileSystem.documentDirectory + filename;
      
      // Copiar para o diretório de documentos
      await FileSystem.copyAsync({
        from: uri,
        to: destination
      });
      
      // Verificar se o compartilhamento está disponível
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destination, {
          mimeType: 'application/pdf',
          dialogTitle: `Relatório Financeiro - ${report.displayDate}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        // Se o compartilhamento não estiver disponível, tente salvar na galeria
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            await MediaLibrary.createAssetAsync(destination);
            Alert.alert("Sucesso", "O relatório foi salvo no armazenamento do dispositivo.");
          } else {
            Alert.alert("Relatório Gerado", "O relatório foi salvo temporariamente no dispositivo.");
          }
        } catch (error) {
          console.error("Erro ao salvar na biblioteca de mídia:", error);
          Alert.alert("Relatório Gerado", "O relatório foi salvo temporariamente, mas não foi possível salvá-lo permanentemente.");
        }
      }
    } catch (error) {
      console.error("Erro na geração do PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF do relatório.");
      throw error;
    }
  };
  
  // Componente de item da lista
  const ListMonths = ({item}: {item: MonthReport}) => {
    return(
      <View style={styles.ViewReports}>
        <View style={styles.ViewReportsList}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 14}}>
            <View style={styles.Icon}>
              <Ionicons name="calendar-clear" size={22} color={Colors.gray95} />
            </View>
            <Text style={styles.textRoute}>{item.month} - {item.year}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleDownloadReport(item)}
            disabled={!!processingMonth}
          >
            {processingMonth === item.id ? (
              <ActivityIndicator color={Colors.gray95} />
            ) : (
              <AntDesign name="file-pdf" size={24} color={Colors.gray95} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({item}: {item: MonthReport}) => (
    <ListMonths item={item}/>
  );

  return (
    <View style={styles.container}>
      <HeaderLogo/>
      <View style={styles.ViewRow}>
        <Text style={styles.titleReports}>Meus relatórios contábeis:</Text>
      </View>
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.text} />
        </View>
      ) : (
        <FlatList
          data={monthReports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: Colors.gray95, textAlign: 'center' }}>
                Nenhum relatório disponível. Registre transações para gerar relatórios.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
