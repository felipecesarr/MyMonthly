import { View, Text, Image, Dimensions } from 'react-native';
import { styles } from './styles';
import * as Progress from 'react-native-progress';
import { Colors } from '../../../constants/colors';
import { ScreenWidth } from '@rneui/base';

type Account = {
  id: string;
  nameBank: string;
  logo: any;
  outFlow: number;
  inflow: number;
  balance: number;
};

type RankingBalanceProps = {
  data: Account;
  totalAllBalances: number; // nova prop
};

export default function RankingBalance({ data, totalAllBalances }: RankingBalanceProps) {
  // Evitar divisão por zero
  const progress = totalAllBalances > 0 ? data.balance / totalAllBalances : 0;
  const percent = Math.round(progress * 100);

  const screenWidth = Dimensions.get('window').width;
  const progressBarWidth = ScreenWidth * 0.56; // Largura do componente Progress em número

  return (
    <View style={styles.viewBarProgress}>
      <Image source={data.logo} style={styles.logo}/>
      <Progress.Bar
        width={progressBarWidth}
        height={12}
        color={Colors.text}
        unfilledColor={Colors.grayTwo}
        borderWidth={0}
        progress={progress}
        borderRadius={100}
      />
      <Text style={styles.textPercent}>{percent}%</Text>
    </View>
  );
}