import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../../constants/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: Colors.background,
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', 
    maxHeight: '80%',
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '15',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray95 + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.healthyBold + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  deleteText: {
    color: Colors.healthyBold,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Scroll container styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: 20,
    paddingBottom: 70,
  },
  
  // Instagram-style profile header
  profileHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  
  // Logo styles
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 34,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray95 + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: Colors.gray95 + '20',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Bank details styles
  bankDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  balanceRow: {
    marginBottom: 0,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveBalance: {
    color: Colors.incomeBold,
  },
  negativeBalance: {
    color: Colors.healthyBold,
  },
  accountTypeTag: {
    backgroundColor: Colors.gray95 + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  accountTypeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  balanceTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: Colors.gray95 + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  balanceTrendText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Section styles
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  
  // Info card styles
  infoCard: {
    backgroundColor: Colors.gray95 + '08',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray95 + '20',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoRowBordered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  rowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  
  // Metrics section styles
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.gray95 + '08',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray95 + '20',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  incomeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.incomeBold,
  },
  expenseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.healthyBold,
  },
  positiveColor: {
    color: Colors.incomeBold,
  },
  negativeColor: {
    color: Colors.healthyBold,
  },
  
  // Action button
  actionButton: {
    backgroundColor: Colors.text,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  }
});