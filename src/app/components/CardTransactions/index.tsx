import React from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from './styles';



type CardData = {
  id: string;
  type: string;  // 'receita' | 'despesa' | 'transferencia'
  title: string;
  bank: string;
  direction: string;  // 'entrada' | 'saida'
  bankIcon?: string;
  toIcon?: string;
  fromIcon?: string;
  
  categoryEmoji?: string;           // ex: "🍔"
  categoryPrimaryColor?: string;    // ex: "#E02020"
  
  subcategoryEmoji?: string;        // ex: "🍟"
  subcategoryName?: string;         // ex: "Fritas"
  subcategorySecondaryColor?: string; 
  subcategoryBoldColor?: string;    // cor do texto se quiser
 
  icon?: any;      // arrow-up/down/transfer
  amount: number;  // valor
};

type CardTransactionsProps = {
  data: CardData;
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};


export default function CardTransactions({ data }: CardTransactionsProps) {
  const normalizedType = data.type.toLowerCase().trim();
  const isTransfer = normalizedType === 'transferencia';
  // Se o type contém "fatura", consideramos que é um pagamento de fatura
  const isPaymentCard = normalizedType.includes('fatura');
  const displayIcon = data.bankIcon?.trim() || '';



  return (
    <View style={styles.container}>

      {/* Linha superior: Ícone + Título, e do outro lado o "banco" e (se quiser) a bankIcon */}
      <View style={styles.viewRow}>
        <View style={styles.contentRow}>
          {data.icon}
          <Text>{data.title}</Text>
        </View>

        <View style={styles.viewTagAmount}>
          {/* Se tiver bankIcon e quiser exibir sempre (inclusive em transferência) */}
          {displayIcon ? (
              <Image source={{ uri: displayIcon }} style={styles.bankImage} />
            ) : null}
        </View>
      </View>

      {/* Linha inferior: 
          - Se for transferência, texto fixo: "Transferência entre contas"
          - Se for pagamento da fatura, texto fixo: "Pagamento da fatura"
          - Se for receita/despesa, mostra category + subcategory 
      */}
      <View style={styles.viewRow}>
        <View style={styles.contentRow}>
          {isTransfer || isPaymentCard ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Text style={styles.textTransfer}>
          
          { isPaymentCard ? (
            'Pagamento da fatura'
          ): (
            'Transferência entre contas'
          )}
          </Text>
        </View>
          ) : (
            <>
              {/* View da CATEGORIA (fundo primaryColor, texto claro) */}
              <View
                style={[
                  styles.viewCategory,
                  { backgroundColor: data.categoryPrimaryColor || '#eee' },
                ]}
              >
                <Text style={[styles.textAmount, { color: '#fff' }]}>
                  {data.categoryEmoji}
                </Text>
              </View>

              {/* Subcategoria (fundo secondaryColor, texto boldColor) */}
              <View
                style={[
                  styles.viewSubcategory,
                  {
                    backgroundColor: data.subcategorySecondaryColor || '#eee',
                  },
                ]}
              >
                <Text
                  style={{
                    color: data.subcategoryBoldColor || '#000',
                  }}
                >
                  {data.subcategoryEmoji} {data.subcategoryName}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Valor */}
        <Text style={styles.textAmount}>
  {data.type === 'despesa'
    ? `- ${formatCurrency(data.amount)}`
    : data.type === 'transferencia' || data.type === 'fatura'
      ? data.direction === 'saida'
        ? `- ${formatCurrency(data.amount)}`
        : `+ ${formatCurrency(data.amount)}`
      : `+ ${formatCurrency(data.amount)}`
  }
</Text>
      </View>
    </View>
  );
}