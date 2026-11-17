import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useYear } from '../YearContext'; // Importa para ler o selectedYear

interface MonthContextProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const MonthContext = createContext<MonthContextProps | undefined>(undefined);

export const MonthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lista de meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Anual'
  ];

  // Lê o ano selecionado do YearContext
  const { selectedYear } = useYear();

  // Estado local para o mês
  const [selectedMonth, setSelectedMonth] = useState<string>(monthNames[new Date().getMonth()]);

  // Exemplo: sempre que o ano muda, você pode:
  // 1) resetar o mês para "Janeiro" (ou pro "mês atual" se for o ano vigente)
  // 2) se for "Anual" no MonthContext, tratar como "Anual" + selectedYear
  useEffect(() => {
    // Exemplo simples: se o ano selecionado for o ano atual,
    // setamos o mês atual. Senão, setamos Janeiro.
    const currentYear = new Date().getFullYear().toString();
    if (selectedYear === currentYear) {
      const currentMonthIndex = new Date().getMonth();
      setSelectedMonth(monthNames[currentMonthIndex]);
    } else {
      // define como Janeiro ao mudar de ano
      setSelectedMonth('Janeiro');
    }
  }, [selectedYear]);

  // Atualiza selectedMonth uma vez por dia, pra garantir sincronia com data real:
  useEffect(() => {
    const interval = setInterval(() => {
      const currentYear = new Date().getFullYear().toString();
      if (selectedYear === currentYear) {
        // se o ano do contexto é o atual, sincroniza o mês
        const currentMonth = new Date().getMonth();
        setSelectedMonth(monthNames[currentMonth]);
      }
      // se não for o ano atual, não mexemos
    }, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, [selectedYear]);

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = (): MonthContextProps => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth deve ser usado dentro de um MonthProvider');
  }
  return context;
};
