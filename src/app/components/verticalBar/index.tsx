import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors } from '../../../constants/colors';

type VerticalBarProps = {
  progress: number; // Progresso entre 0 e 1
  label: string; // Nome do dia
  title: string; // Nome do dia
  color: string;
  unfilledColor: string;
  width: number;
  height: number;
  inflow: number;
  outflow: number;
};

const VerticalBar = ({ progress, label, title, color, unfilledColor, width, height, inflow, outflow }: VerticalBarProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const filledHeight = height * progress;

  const handlePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.barContainer}>
      <Pressable onPress={handlePress}>
        <Svg height={height} width={width}>
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill={unfilledColor}
            rx={width / 2} 
            ry={width / 2}
          />
      
          <Rect
            x="0"
            y={height - filledHeight}
            width={width}
            height={filledHeight}
            fill={color}
            rx={width / 2} // Arredondamento com metade da largura para efeito "pílula"
            ry={width / 2}
          />
        </Svg>
      </Pressable>
      <Text style={styles.dayLabel}>{label}</Text>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={handleCloseModal}>
          <View style={styles.modalContent}>
            <Text>{title}</Text>
            <View style={styles.ViewInFlow}>
            <Text style={styles.textInFlow}>Entrada: R$ {inflow.toFixed(2)}</Text>
            </View>
            <View style={styles.ViewOutFlow}>
            <Text style={styles.textOutFlow}>Saída: R$ {outflow.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 10
  },
  textInFlow: {
    fontSize: 14,
    color: Colors.homeBold,
    fontWeight: '500'
  },
  ViewInFlow: {
    backgroundColor: Colors.homeSecondary,
    width: '90%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  textOutFlow: {
    fontSize: 14,
    color: Colors.healthyBold,
    fontWeight: '500'
  },
  ViewOutFlow: {
    backgroundColor: Colors.healthySecondary,
    width: '90%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
});

export default VerticalBar;
