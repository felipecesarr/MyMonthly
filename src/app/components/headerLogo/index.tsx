import { View, Image, Pressable, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';

export default function HeaderLogo() {
  const navigation = useNavigation();

 return (
   <View style={[styles.container, {marginTop: Platform.OS === 'ios' ? 70 : 20}]}>
    <Pressable style={styles.buttonBack} onPress={() => navigation.goBack()}>
      <Ionicons name="chevron-back-outline" size={22} color={Colors.text} />
    </Pressable>
    <Image 
    source={require('../../../../assets/onboardingScreens/logo.png')}
    style={styles.logoImage}/>
    <Pressable style={styles.buttonFantasy}>
      <Ionicons name="chevron-back-outline" size={24} color="transparent" />
    </Pressable>
   </View>
  );
}