import { Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';

export default function SelectCategoryIncome() {
  const [category, setCategory] = useState();

 return (
   <TouchableOpacity style={styles.container}>
    <Text>Selecione a categoria</Text>
    <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.text}/>
   </TouchableOpacity>
  );
}
