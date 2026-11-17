import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 32,
  },
  viewProgressText: {
    alignItems: 'center',
    gap: 12,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.incomeBold,
  },
  progressBalance: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  viewProgressValue: {
    flexDirection: 'row',
    backgroundColor: Colors.incomeSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewMovements: {
    width: '75%',
    height: 64,
    backgroundColor: Colors.grayBack,
    marginTop: 30,
    marginBottom: 44,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  viewTextMovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textMovement: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500'
  },
  messageView: {
    backgroundColor: Colors.incomeSecondary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 44,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.incomeBold,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 32
  },
  textCard: {
    color: Colors.text,
    fontWeight: '500',
  },
  numberView: {
    height: 34,
    width: 34,
    backgroundColor: Colors.grayBack,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberText: {
    color: Colors.text,
    fontWeight: '500',
  },
  accountsListContainer: {
    marginTop: 20,
    width: '100%',
  },
  accountsList: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankingList: {
    paddingHorizontal: 20,
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grayBack,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
  },
  headerContainer: {
    alignItems: 'center', // Centraliza o header horizontalmente
    width: '100%',
  },
  accountItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  bankLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  bankName: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
},
categoriesListContainer: {
  marginTop: 10,
  width: '100%',
},
categoriesList: {
  paddingHorizontal: 20,
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center'
},
categoryItem: {
  marginRight: 16,
  alignItems: 'center',
  width: 100,
},
categoryIcon: {
  fontSize: 60,
  textAlign: 'center',
},
categoryName: {
  marginTop: 8,
  fontSize: 14,
  color: Colors.text,
  textAlign: 'center',
},
categorySpent: {
  fontSize: 12,
  color: Colors.grayTwo,
  textAlign: 'center',
  marginTop: 4,
},
sectionContainer: {
  marginBottom: 32,
},
})