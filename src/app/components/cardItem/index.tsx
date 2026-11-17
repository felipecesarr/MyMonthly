import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './styles';
import * as Progress from 'react-native-progress';
import { Colors } from '../../../constants/colors';

type Card = {
  id: string;
  nameBank: string;
  logo: { uri: string }; 
  outFlow: number;
  inflow: number;
  balance: number; // Este é o updatedBalance = initialBalance + totalInflow - totalOutFlow
};

type CardItemProps = {
  data: Card; 
  openModal: () => void;
};

export default function CardItem({ data, openModal }: CardItemProps) {
 // O saldo atual, que é o valor que sobra na conta:
 const available = data.balance + data.inflow + data.outFlow; 
 const currency = available - data.outFlow;

 // O valor máximo que a conta teve durante o período, isto é,
 // o que estava disponível antes de serem subtraídas as saídas.
 // Sabemos que: data.balance = initialBalance + inflow - outFlow,
 // então initialBalance + inflow = data.balance + outFlow.
 const maximum = data.outFlow + data.inflow + data.balance;
 const value = maximum + data.outFlow;
 const limited = maximum + data.inflow;

 // Percentual gasto: quanto das entradas foi usado (ou seja, o total de saídas dividido pelo valor máximo)
 const progress = maximum > 0 ? (data.outFlow / limited) * 100 : 0;


  return (
    <View style={styles.container}>
      <Pressable style={styles.card} onPress={openModal}>
      <View style={styles.viewRowHeader}>
          <View style={styles.viewLogo}>
            <Image source={{ uri: data.logo.uri }} style={styles.logo}/>
          </View>
          <View style={styles.viewBalance}>
            <Text style={styles.textBalance}> 
            {currency.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.viewFooter}>
          <View style={styles.viewProgress}>
            <Text style={styles.textMovements}> 
            {data.outFlow.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Text>
            <Text style={styles.textMovements}> 
            {limited.toLocaleString('pt-BR', {
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
              progress={maximum > 0 ? data.outFlow / value : 0}
              borderRadius={100}
            />
            <Text style={styles.textPercent}>{`${Math.round(progress)}%`}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
