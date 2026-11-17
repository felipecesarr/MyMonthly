import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

  },
  viewProgressText: {
    alignItems: 'center',
    gap: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
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
    backgroundColor: Colors.grayBack,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewProgress: {
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
    gap: 32,
    alignSelf: 'center'
  },
  viewRowCategories: {
    flexDirection: 'row',
    marginTop: 32
  },
  pillContainer: {
    borderWidth: 0.8,
    borderColor: Colors.grayTwo,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    color: Colors.gray95,
    fontWeight: '500',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  viewBarProgress: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  textPercent: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayTwo,
  },
  containerDataCategories: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 32,
    gap: 20,
  },
  viewRowDataCategories: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texteHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.grayBack,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 100
  },
  containerBudgetData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.grayBack,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 100
  },
  textMovements: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  viewFooter: {
    gap: 14,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.grayBack,
    borderRadius: 20,
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewProgressBarProgress: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33,33,33,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: Colors.background,
    padding: 20,
    gap: 14,
    borderRadius: 20
  },
  modalText: {
    color: Colors.background,
    fontWeight: '600'
  },
  flatListCards: {
    backgroundColor: Colors.background,
    gap: 20,
  },
  buttonAdd: {
    width: '90%',
    height: 54,
    borderWidth: 2,
    borderColor: Colors.grayTwo,
    borderRadius: 10,
    borderStyle: 'dashed',
    marginBottom: 100,
    marginTop: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonAdd: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors. grayTwo
  },
  addSubCategoryModal: {
    width: '100%',
    height: '60%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 20,
    paddingVertical: 40,
    // alignItems: 'center',
  },
  textInput: {
    width: '90%',
    height: 54,
    borderWidth: 0.8,
    borderColor: Colors. grayBack,
    borderRadius: 10,
    padding: 10,
    color: Colors. gray95
  },
  modalTitle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.gray95,
  },
  textInputBudget: {
    width: '90%',
    height: 54,
    borderWidth: 0.8,
    borderColor: Colors. grayBack,
    borderRadius: 10,
    padding: 10,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '500',
  },
  hiddenRow: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  deleteButton: {
    backgroundColor: '#FF268830',
    padding: 10,
    borderRadius: 8,
  },
})