// src/components/MonthPickerModal/styles.ts

import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  flatlist: {
    width: 200,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  monthItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayOne,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500'
  },
});
