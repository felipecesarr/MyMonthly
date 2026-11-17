import { View, Text, ImageBackground } from 'react-native';
import { styles } from './styles';
import HeaderLogo from '../../components/headerLogo';
import Button from '../../components/button';

export default function CancelSubscription() {
  function cancelPlan(){
    
  }


 return (
   <View style={styles.container}>
    <ImageBackground 
    source={require('../../../../assets/onboardingScreens/background.png')} 
    style={styles.background}
    >
    <HeaderLogo/>
      <View style={styles.ViewSubscription}>
        <Text style={styles.titleText}>Ahhhh que pena! 😩</Text>
        <Text style={styles.title2}>Por favor, saiba que a MyMonthly sempre estará aqui com a mesma missão de organizar a sua vida financeira!</Text>
        <Text style={styles.title2}>Esperamos você de volta, Atê logo! </Text>
          <Button 
          text='Sim cancelar' 
          onPress={cancelPlan} 
          buttonStyle={styles.buttonConfirmCancelPlan} 
          textStyle={{color: '#212121'}}
          /> 
      </View>
    </ImageBackground>
   </View>
  );
}
