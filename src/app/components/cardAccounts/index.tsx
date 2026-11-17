import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './styles';
import * as Progress from 'react-native-progress';
import { Colors } from '../../../constants/colors';

type Account = {
  id: string;
  nameBank: string;
  logo: { uri: string }; 
  outFlow: number;    // Total de saídas no período
  inflow: number;     // Total de entradas no período
  balance: number;    // Saldo atualizado = initialBalance + inflow - outFlow
};

type CardAccountsProps = {
  data: Account; 
  openModal: () => void;
};

export default function CardAccounts({ data, openModal }: CardAccountsProps) {
  // O saldo atual, que é o valor que sobra na conta:
  const available = data.balance;
  const maximum =  data.balance + data.outFlow; 
  const value = maximum + data.outFlow;

  // Percentual gasto: quanto das entradas foi usado (ou seja, o total de saídas dividido pelo valor máximo)
  const progress = maximum > 0 ? (data.outFlow / maximum) * 100 : 0;

  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={openModal}>
        <View style={styles.viewRowHeader}>
          <View style={styles.viewLogo}>
            {/* Aqui data.logo.uri é uma string contendo o URL */}
            <Image source={{ uri: data.logo.uri }} style={styles.logo} />
          </View>
          <View style={styles.viewBalance}>
            <Text style={styles.textBalance}>
              {/* Exibe o valor disponível (saldo atualizado) */}
              {available.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.viewFooter}>
          <View style={styles.viewProgress}>
            <Text style={styles.textMovements}>
              {/* Exibe o total de saídas */}
              {data.outFlow.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
            <Text style={styles.textMovements}>
              {/* Exibe o valor máximo que a conta teve: initialBalance + inflow */}
              {maximum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
          </View>
          <View style={styles.viewBarProgress}>
            <Progress.Bar 
              width={230}
              height={12}
              color={Colors.text}
              unfilledColor={Colors.grayTwo}
              borderWidth={0}
              progress={maximum > 0 ? data.outFlow / maximum : 0}
              borderRadius={100}
            />
            <Text style={styles.textPercent}>{`${Math.round(progress)}%`}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
