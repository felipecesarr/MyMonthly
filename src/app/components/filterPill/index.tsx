import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function FilterPill() {
  const [selectedFilter, setSelectedFilter] = useState<'Dia' | 'Semana' | 'Mês'>('Dia');

  function handleSelect(filter: 'Dia' | 'Semana' | 'Mês') {
    setSelectedFilter(filter);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={selectedFilter === 'Dia' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Dia')}
      >
        <Text style={selectedFilter === 'Dia' ? styles.textSelected : styles.textUnselected}>Dia</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={selectedFilter === 'Semana' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Semana')}
      >
        <Text style={selectedFilter === 'Semana' ? styles.textSelected : styles.textUnselected}>Semana</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={selectedFilter === 'Mês' ? styles.pillSelected : styles.pillUnselected}
        onPress={() => handleSelect('Mês')}
      >
        <Text style={selectedFilter === 'Mês' ? styles.textSelected : styles.textUnselected}>Mês</Text>
      </TouchableOpacity>
    </View>
  );
}

