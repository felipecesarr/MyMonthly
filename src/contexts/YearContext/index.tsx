import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react';

// 1) Define a forma (tipagem) do contexto:
interface YearContextProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

// 2) Cria o contexto
const YearContext = createContext<YearContextProps | undefined>(undefined);

// 3) Provider
export const YearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicia com o ano atual, ou outro valor padrão
  const currentYear = new Date().getFullYear().toString();

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
};

// 4) Hook para consumir o contexto
export const useYear = (): YearContextProps => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear deve ser usado dentro de um YearProvider');
  }
  return context;
};
