// Header.tsx

import React, { useState } from 'react';
import { View, Image, Pressable, Text, Platform } from 'react-native';
import { styles } from './styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MonthPickerModal from '../MonthPickerModal';
import { Colors } from '../../../constants/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackAppParamList } from '../../../navigation/stackApp';
import { useMonth } from '../../../contexts/MonthContext/index';

type MenuScreenNavigationProp = NavigationProp<RootStackAppParamList, 'Menu'>;

export default function Header() {
  const navigation = useNavigation<MenuScreenNavigationProp>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { selectedMonth, setSelectedMonth } = useMonth();

  function handleMenu() {
    navigation.navigate('Menu');
  }

  return (
    <View style={[styles.container, {marginTop: Platform.OS === 'ios' ? 70 : 20}]}>
      <View style={styles.viewRow}>
        <Image 
          source={require('../../../../assets/onboardingScreens/logo.png')}
          style={styles.logo}
        />
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={styles.textSelect}
        >
          <Text style={styles.textMonth}>
            {selectedMonth}
          </Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color={Colors.text}
          />
        </Pressable>
      </View>

      <MonthPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectMonth={(month) => setSelectedMonth(month)}
      />
      <Pressable onPress={handleMenu}>
        <Ionicons name="settings-outline" size={24} color={Colors.grayTwo} />
      </Pressable>
    </View>
  );
}
