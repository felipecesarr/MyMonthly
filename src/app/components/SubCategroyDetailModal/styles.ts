// SubCategoryDetailsModal/styles.ts

import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '75%',
    backgroundColor: Colors.background,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20, 
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ViewBudget: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 100,
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    paddingHorizontal: 20,
  },
  rowNumberTransaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginTop: 56,
    marginBottom: 20,
  },
  viewCountTransactions: {
    height: 30,
    width: 30,
    borderRadius: 100,
    backgroundColor: Colors.grayBack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNumber: {
    alignContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: Colors.gray95,
    paddingVertical: 5,
    marginBottom: 10,
    color: Colors.text,
  },
  transactionItem: {
    justifyContent: 'center',
    gap: 10,
    height: 80,
    width: '90%',
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: Colors.text,
    shadowOpacity:0.5,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    padding: 10,
    alignSelf: 'center',
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.gray95,
  },
  transactionAmount: {
    fontSize: 14,
    color: Colors.text,
  },
  noTransactions: {
    color: Colors.gray95,
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.background,
    fontSize: 16,
  },
  rowTransaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewPillBank: {
    backgroundColor: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPillBank: {
    color: Colors.background,
    fontSize: 14,
  }
});
