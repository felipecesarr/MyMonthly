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
      
      // Gerar o PDF diretamente
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
          <td style="text-align:right; color:#FF2688; font-weight:500">
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
          <td style="text-align:right; color:#0097b2; font-weight:500">
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
            <div class="bar" style="width: ${Math.max(5, Math.min(100, category.percentage))}%; background-color: ${category.color || '#FF2688'};"></div>
          </div>
        </div>
      `).join('');

      // Template HTML completo do relatório
      // ...existing code...
// filepath: src/app/screens/menu/reports.tsx

const htmlContent = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Financeiro - ${report.displayDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #f6f8fa;
      color: #222;
      margin: 0;
      padding: 0;
    }
    .report-container {
      max-width: 900px;
      margin: 32px auto;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(60,60,60,0.08);
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(90deg, #4f8cff 0%, #38b6ff 100%);
      color: #fff;
      padding: 40px 32px 32px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #fff;
      color: #4f8cff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-weight: 700;
      margin-right: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .header-info h1 {
      font-size: 2.1rem;
      margin: 0 0 6px 0;
      font-weight: 700;
      letter-spacing: -1px;
    }
    .header-info h2 {
      font-size: 1.2rem;
      margin: 0 0 8px 0;
      font-weight: 400;
      opacity: 0.95;
    }
    .header-info p {
      font-size: 1rem;
      margin: 0;
      opacity: 0.8;
    }
    .company-details {
      text-align: right;
      font-size: 1rem;
      background: rgba(255,255,255,0.12);
      padding: 14px 20px;
      border-radius: 10px;
      min-width: 200px;
    }
    .section {
      padding: 32px;
      border-bottom: 1px solid #f0f0f0;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #4f8cff;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title-emoji {
      font-size: 1.7rem;
      background: #eaf3ff;
      border-radius: 8px;
      padding: 6px 12px;
      margin-right: 8px;
    }
    .info-grid {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }
    .info-box {
      flex: 1;
      background: #f7faff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border: 1px solid #e5e7eb;
      text-align: center;
    }
    .info-box-header {
      font-size: 1rem;
      color: #888;
      margin-bottom: 10px;
    }
    .info-box-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #222;
      margin-bottom: 4px;
    }
    .info-box-description {
      font-size: 0.95rem;
      color: #666;
    }
    .summary-container {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
    }
    .summary-card {
      flex: 1;
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border: 1px solid #e5e7eb;
      margin-bottom: 16px;
      text-align: center;
    }
    .card-header {
      font-size: 1.1rem;
      color: #888;
      margin-bottom: 10px;
    }
    .card-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .income-color { color: #38b000; }
    .expense-color { color: #e63946; }
    .neutral-color { color: #4f8cff; }
    .balance-value {
      font-size: 2rem;
      font-weight: 700;
    }
    .metrics-row {
      display: flex;
      gap: 18px;
      color: #888;
      font-size: 1rem;
      margin-top: 10px;
      justify-content: center;
    }
    .insights-row {
      display: flex;
      gap: 24px;
      margin-top: 32px;
      margin-bottom: 24px;
    }
    .insight-card {
      flex: 1;
      background: #f7faff;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .insight-emoji {
      font-size: 2rem;
      margin-bottom: 8px;
      background: #eaf3ff;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px auto;
    }
    .insight-title {
      font-size: 1rem;
      color: #888;
      margin-bottom: 4px;
    }
    .insight-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #222;
      margin-bottom: 2px;
    }
    .insight-description {
      font-size: 1rem;
      color: #4f8cff;
      font-weight: 600;
    }
    .categories-container {
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }
    .category-card {
      background: #fff;
      border-radius: 10px;
      padding: 18px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .category-emoji {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #f7faff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      margin-right: 8px;
    }
    .category-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #222;
    }
    .category-amount {
      margin-left: auto;
      text-align: right;
    }
    .category-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #222;
    }
    .category-percentage {
      font-size: 0.95rem;
      color: #888;
    }
    .bar-container {
      height: 8px;
      background: #eaf3ff;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    .bar {
      height: 100%;
      border-radius: 4px;
      background: #4f8cff;
      opacity: 0.8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    th, td {
      padding: 14px 12px;
      font-size: 1rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    th {
      background: #f7faff;
      color: #4f8cff;
      font-weight: 700;
      border-bottom: 2px solid #e5e7eb;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      padding: 28px;
      font-size: 1rem;
      color: #888;
      background: #f7faff;
      border-radius: 0 0 18px 18px;
      border-top: 1px solid #e5e7eb;
    }
    .watermark {
      position: fixed;
      bottom: 24px;
      right: 24px;
      opacity: 0.06;
      font-size: 7rem;
      font-weight: bold;
      color: #4f8cff;
      pointer-events: none;
      z-index: 0;
    }
  </style>
</head>
<body>
  <div class="watermark">MyMonthly</div>
  <div class="report-container">
    <div class="header">
      <div style="display:flex;align-items:center;">
        <div class="logo">MM</div>
        <div class="header-info">
          <h1>Relatório Financeiro</h1>
          <h2>${report.displayDate}</h2>
          <p>Gerado em ${moment().format('DD [de] MMMM [de] YYYY [às] HH:mm')}</p>
        </div>
      </div>
      <div class="company-details">
        <div><b>Cliente:</b> ${username}</div>
        <div><b>Ref:</b> MM-${report.year}${(report.monthIndex + 1).toString().padStart(2, '0')}</div>
        <div><b>Período:</b> ${moment().month(report.monthIndex).format('MM')}/${report.year}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span class="section-title-emoji">📊</span>Resumo Financeiro</div>
      <div class="info-grid">
        <div class="info-box">
          <div class="info-box-header">Período</div>
          <div class="info-box-value">${report.displayDate}</div>
          <div class="info-box-description">01/${(report.monthIndex + 1).toString().padStart(2, '0')}/${report.year} a ${daysInMonth}/${(report.monthIndex + 1).toString().padStart(2, '0')}/${report.year}</div>
        </div>
        <div class="info-box">
          <div class="info-box-header">Transações</div>
          <div class="info-box-value">${report.transactionCount}</div>
          <div class="info-box-description">${expenseTransactions.length} despesas, ${incomeTransactions.length} receitas</div>
        </div>
      </div>
      <div class="summary-container">
        <div class="summary-card">
          <div class="card-header">Receitas</div>
          <div class="card-value income-color">${formatCurrency(report.income)}</div>
          <div>Média diária: <b>${formatCurrency(avgIncomePerDay)}</b></div>
        </div>
        <div class="summary-card">
          <div class="card-header">Despesas</div>
          <div class="card-value expense-color">${formatCurrency(report.expense)}</div>
          <div>Média diária: <b>${formatCurrency(avgExpensePerDay)}</b></div>
        </div>
        <div class="summary-card">
          <div class="card-header">Saldo Final</div>
          <div class="card-value ${report.balance >= 0 ? 'income-color' : 'expense-color'}">${formatCurrency(report.balance)}</div>
          <div>Taxa de economia: <b>${formatPercentage(savingsRate)}</b></div>
        </div>
      </div>
      <div class="insights-row">
        <div class="insight-card">
          <div class="insight-emoji">📉</div>
          <div class="insight-title">Dia com maior gasto</div>
          <div class="insight-value">Dia ${maxDaySpent.day}</div>
          <div class="insight-description expense-color">${formatCurrency(maxDaySpent.amount)}</div>
        </div>
        <div class="insight-card">
          <div class="insight-emoji">💰</div>
          <div class="insight-title">Principais categorias</div>
          <div class="insight-value">${sortedCategories.length}</div>
          <div class="insight-description">${sortedCategories.length > 0 ? sortedCategories[0].name : 'Nenhuma'}</div>
        </div>
        <div class="insight-card">
          <div class="insight-emoji">📈</div>
          <div class="insight-title">Dia com maior receita</div>
          <div class="insight-value">Dia ${maxDayIncome.day}</div>
          <div class="insight-description income-color">${formatCurrency(maxDayIncome.amount)}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span class="section-title-emoji">📋</span>Despesas por Categoria</div>
      <div class="categories-container">
        ${categoriesHTML}
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span class="section-title-emoji">📝</span>Registros Financeiros</div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Conta/Cartão</th>
            <th style="text-align:right">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${expenseTransactionsHTML}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Conta/Cartão</th>
            <th style="text-align:right">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${incomeTransactionsHTML}
        </tbody>
      </table>
    </div>
    <div class="footer">
      <div>MyMonthly • Relatório Financeiro • ${report.displayDate}</div>
      <div>Gerado em ${moment().format('DD/MM/YYYY [às] HH:mm')}</div>
    </div>
  </div>
</body>
</html>
`;
// ...existing code...
      
      // Gerar o PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,  // Letter width em pontos (8.5 x 11 polegadas)
        height: 792, // Letter height em pontos
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
      
      // Compartilhar o PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destination, {
          mimeType: 'application/pdf',
          dialogTitle: `Relatório Financeiro - ${report.displayDate}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          "Relatório Gerado",
          "O relatório foi salvo temporariamente no dispositivo. Você pode encontrá-lo na pasta de documentos do app."
        );
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
            <View style={[styles.Icon, {backgroundColor: Colors.incomeSecondary}]}>
              <Ionicons name="calendar-clear" size={22} color={Colors.incomeBold} />
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
              <AntDesign name="download" size={24} color={Colors.text} />
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
        <Text style={styles.titleReports}>Meus relatórios financeiros:</Text>
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
