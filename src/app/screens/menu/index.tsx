import { useState, useContext } from 'react';
import { View, Text, Image, Pressable, Switch, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import HeaderLogo from '../../components/headerLogo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

import { Colors } from '../../../constants/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackAppParamList } from '../../../navigation/stackApp';
import { AuthContext } from '../../../contexts/Auth';
import YearPickerModal from '../../components/YearPickerModal';
// Importa o YearContext
import { useYear } from '../../../contexts/YearContext';

type ProfileScreenNavigationProp = NavigationProp<RootStackAppParamList, 'Profile'>;

export default function Menu() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { signOut, user } = useContext(AuthContext);

  // Estados para modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Acesso ao YearContext
  const { selectedYear, setSelectedYear } = useYear();

  // Estado do switch
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((prev) => !prev);

  async function logOut(){
    signOut();
  }

  return (
    <View style={styles.container}>
      <HeaderLogo/>

      <View style={styles.ViewRow}>
        <View style={styles.ViewColumn}>
          <Text style={styles.title}>MyMonthly de:</Text>
          <Text style={styles.textName} numberOfLines={1}>{user?.userName}</Text>
        </View>

        {/* BOTÃO para abrir o YearPickerModal */}
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6 }}
          onPress={() => setIsModalVisible(true)}
        >
           <Text style={styles.textYear}>
            {selectedYear}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color={Colors.gray95}
          />
        </Pressable>
      </View>

      {/* MODAL DE SELEÇÃO DE ANO */}
      <YearPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectYear={(year) => setSelectedYear(year)}
      />

      <View style={styles.ViewIcons}>
        <Pressable style={styles.ViewRowIcons} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.Icon}>
            <Ionicons name="person-sharp" size={22} color={Colors.gray95} />
          </View>
          <Text style={styles.textRoute}>Meus dados</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.gray95}/>
        </Pressable>

        <Pressable style={styles.ViewRowIcons} onPress={() => navigation.navigate('Reports')}>
          <View style={styles.Icon}>
            <Ionicons name="stats-chart" size={22} color={Colors.gray95} />
          </View>
          <Text style={styles.textRoute}>Relatórios</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.gray95}/>
        </Pressable>
        
        <Pressable style={styles.ViewRowIcons} onPress={() => navigation.navigate('Subscription')}>
          <View style={styles.Icon}>
            <FontAwesome name="credit-card-alt" size={20} color={Colors.gray95} />
          </View>
          <Text style={styles.textRoute}>Assinatura</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.gray95}/>
        </Pressable>


        {/* <Pressable style={styles.ViewRowIcons}>
          <View style={styles.Icon}>
            <MaterialCommunityIcons name="bell" size={22} color={Colors.gray95} />
          </View>
          <Text style={styles.textRoute}>Notificações</Text>
          <Switch
            trackColor={{false: Colors.grayBack, true: Colors.homePrimary}}
            thumbColor={Colors.background}
            ios_backgroundColor={Colors.grayBack}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={{ marginLeft: 30 }}
          />
        </Pressable> */}
      </View>

      <TouchableOpacity style={styles.ViewLogOut} onPress={logOut}>
        <AntDesign name="logout" size={24} color={Colors.background} />
        <Text style={styles.textLogOut}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
