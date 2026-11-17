import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../../constants/colors';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,  // Added zIndex
  },
  backgroundClose: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    zIndex: 2,  // Added zIndex
  },
  modalContainer: {
    backgroundColor: Colors.background,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20, // Add horizontal padding for header
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContainer: {
    maxHeight: height * 0.8,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
    marginBottom: 20,
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
  
  // Credit Card Preview
  creditCardPreview: {
    width: '100%',
    aspectRatio: 1.586, // Standard credit card ratio
    backgroundColor: Colors.text,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditCardType: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  creditCardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20, // Changed to half width
  },
  creditCardNumber: {
    color: Colors.background,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
    marginVertical: 20,
  },
  creditCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardLabel: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  creditCardValidate: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  creditCardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
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
  
  // Bank item in list
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '15',
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
  
  // Bank selector modal styles - FIXED
  bankSelectorModalOverlay: {
    ...StyleSheet.absoluteFill,  // Use absolute fill
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,  // Added high zIndex
  },
  bankSelectorModalContainer: {
    width: width * 0.85,
    backgroundColor: Colors.background,
    borderRadius: 16,
    minHeight: 200,  // Added minimum height
    maxHeight: height * 0.7,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  bankSelectorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
  },
  bankSelectorModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  bankSelectorModalList: {
    maxHeight: height * 0.5,
  },
  
  // Input fields
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 6,
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
    marginTop: 10,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.gray95 + '15',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
});
