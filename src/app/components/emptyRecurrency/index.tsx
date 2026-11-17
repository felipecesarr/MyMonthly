import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function EmptyRecurrency() {
 return (
  <View style={styles.container}>
  <TouchableOpacity style={styles.card}>
    <Text style={styles.text}>Adicone suas contas fixas e recorrêntes aqui</Text>
    <Text style={styles.text2}>*como por exemplo sua Netflix, aluguel, transporte e etc...</Text>
  </TouchableOpacity>
 </View>
  );
}