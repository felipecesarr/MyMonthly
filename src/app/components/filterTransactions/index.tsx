import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type FilterType = 'Todas' | 'Entradas' | 'Saídas';

type FilterTransactionsProps = {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export default function FilterTransactions({
  selectedFilter,
  onFilterChange
}: FilterTransactionsProps) {
  
  function handleSelect(filter: FilterType) {
    onFilterChange(filter);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={selectedFilter === 'Todas' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Todas')}
      >
        <Text style={selectedFilter === 'Todas' ? styles.textSelected : styles.textUnselected}>
          Todas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={selectedFilter === 'Entradas' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Entradas')}
      >
        <Text style={selectedFilter === 'Entradas' ? styles.textSelected : styles.textUnselected}>
          Entradas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={selectedFilter === 'Saídas' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Saídas')}
      >
        <Text style={selectedFilter === 'Saídas' ? styles.textSelected : styles.textUnselected}>
          Saídas
        </Text>
      </TouchableOpacity>
    </View>
  );
}
