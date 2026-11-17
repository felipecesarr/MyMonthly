import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // ou 'react-native-linear-gradient'
import { Colors } from '../../../constants/colors';

interface GradientSelectProps {
  onPress: () => void;
  children: React.ReactNode;
}

const GradientBorderSelect: React.FC<GradientSelectProps> = ({ onPress, children }) => {
  return (
    <LinearGradient
      colors={[
        Colors.homePrimary,
        Colors.eatingPrimary, 
        Colors.leisurePrimary, 
        Colors.incomePrimary, 
        Colors.healthyPrimary
        ]} // Suas 5 cores
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBorder}
    >
      <TouchableOpacity onPress={onPress} style={styles.button}>
        {children}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 1, // Largura da borda
    borderRadius: 10, // Raio da borda
  },
  button: {
    // width: 300,
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GradientBorderSelect;
