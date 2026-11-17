import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../../constants/colors';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundClose: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: isSmallDevice ? 16 : 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 12 : 20,
    paddingBottom: isSmallDevice ? 8 : 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray95 + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: isSmallDevice ? 8 : 12,
  },
  
  // Bank selector styles
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray95 + '10',
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedBankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBankLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: Colors.gray95 + '20',
  },
  smallDeviceLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  selectedBankName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  bankPlaceholder: {
    fontSize: 16,
    color: Colors.gray95,
    fontWeight: '500',
  },
  bankListContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.gray95 + '30',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    marginTop: -1,
    zIndex: 999,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '15',
  },
  smallDeviceBankItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedBankItem: {
    backgroundColor: Colors.incomeBold + '10',
  },
  bankLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  bankName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  selectedBankText: {
    fontWeight: '600',
    color: Colors.incomeBold,
  },
  
  // Input fields
  fieldGroup: {
    marginBottom: isSmallDevice ? 12 : 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 4 : 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  smallDeviceLabel: {
    fontSize: 13,
  },
  input: {
    backgroundColor: Colors.gray95 + '10',
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  smallDeviceInput: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  inputCurrency: {
    backgroundColor: Colors.gray95 + '10',
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.incomeBold,
  },
  inputError: {
    borderColor: Colors.healthyBold + '80',
    backgroundColor: Colors.healthyBold + '08',
  },
  errorText: {
    color: Colors.healthyBold,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  
  // Action buttons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: isSmallDevice ? 6 : 10,
    gap: isSmallDevice ? 8 : 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.gray95 + '15',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallDeviceButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: Colors.text,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  smallDeviceText: {
    fontSize: isSmallDevice ? 14 : 16,
  },
});
