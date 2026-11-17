import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../../constants/colors';

interface ButtonProps {
  onPress: () => void;
  text: string;
  buttonStyle?: object;
  textStyle?: object;
}

export default function Button({ onPress, text, buttonStyle, textStyle }: ButtonProps) {
  return (
  <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
    <Text style={[styles.text, textStyle]}>{text}</Text>
  </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  button: {
    width: '65%',
    height: 54,
    backgroundColor: Colors.text,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600'
  },
});

