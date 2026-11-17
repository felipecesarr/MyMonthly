import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../../constants/colors';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Method cards
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.gray95 + '08',
    borderWidth: 1,
    borderColor: Colors.gray95 + '20',
  },
  selectedCard: {
    borderColor: Colors.incomeBold + '50',
    backgroundColor: Colors.incomeBold + '08',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.gray95 + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIcon: {
    opacity: 0.8,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  checkmarkContainer: {
    marginLeft: 16,
  },
  philosophyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.homeBold + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  philosophyButtonText: {
    fontSize: 12,
    color: Colors.homeBold,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Modal styles - FIXED
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center', // Changed from flex-end to center
    alignItems: 'center',
  },
  philosophyModal: {
    width: width * 0.85, // Changed from 100% to 85% of width
    maxHeight: height * 0.7, // Reduced from 0.9 to ensure it's visible
    backgroundColor: Colors.background,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  philosophyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray95 + '20',
  },
  philosophyModalTitle: {
    fontSize: 18, // Increased from 14 to make more prominent
    fontWeight: '700',
    color: Colors.text, // Changed from secondary to primary text
    flex: 1,
    paddingRight: 16,
  },
  philosophyModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray95 + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // FIXED: ScrollView containment
  philosophyScrollContainer: {
    maxHeight: height * 0.6, // Ensure scroll container doesn't exceed modal bounds
  },
  philosophyContent: {
    padding: 24,
    paddingBottom: 32,
    // REMOVED flex: 1 to allow scrolling
  },
  philosophyIconContainer: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.healthyBold + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  philosophyText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  philosophyTextBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  philosophyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  philosophyPointText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
  },
  highlightText: {
    fontWeight: '600',
    color: Colors.homeBold,
  },
  philosophyActionButton: {
    backgroundColor: Colors.text,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  philosophyActionButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});