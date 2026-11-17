import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function EmptyCardAccount() {
 return (
   <View style={styles.container}>
    <TouchableOpacity style={styles.card}>
      <Text style={styles.text}>Adicone uma conta bancária para começar utilizar o seu MyMonthly!!</Text>
      <Text style={styles.text2}>*Recomendamos para melhor organização sua que utilize no máximo 3 contas bancárias.</Text>
    </TouchableOpacity>
   </View>
  );
}