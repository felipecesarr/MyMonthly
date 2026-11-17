import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type ButtonAddProps = {
  onPress: () => void;
};

export default function ButtonAdd({ onPress }: ButtonAddProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.textButton}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
