import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

type Category = {
  id: string;
  name: string;
  icon: string;
  spent: number;
  percent: string; // algo como "65%"
  tintColor: string;
  secondColor: string;
};

type CategoriesProgressProps = {
  data: Category; 
};

export default function CategoriesProgress({ data }: CategoriesProgressProps) {
  // Converter "65%" para 65
  const progressNumber = useMemo(() => {
    const numericValue = parseFloat(data.percent.replace('%','')) || 0;
    return numericValue; 
  }, [data.percent]);

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={80}
        width={8}
        fill={progressNumber}
        tintColor={data.tintColor}
        backgroundColor={data.secondColor}
        rotation={0}
        lineCap="round"
      >
        {(_fill: number) => (
          <View style={styles.viewProgress}>
            <Text style={styles.categoryLogo}>{data.icon}</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
}
