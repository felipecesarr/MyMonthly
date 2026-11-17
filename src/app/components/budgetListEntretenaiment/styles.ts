import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    gap: 14
  },
  rowView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryView: {
    flexDirection: 'row',
    backgroundColor: Colors.leisurePrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    gap: 6,
  },
  textNameCategory: {
    fontSize: 14,
    color: Colors.background,
    fontWeight: '600'
  },
  subcategoryView: {
    flexDirection: 'row',
    backgroundColor: Colors.leisureSecondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    gap: 6,
  },
  textNameSubcategory: {
    fontSize: 14,
    color: Colors.leisureBold,
    fontWeight: '500'
  },
  textPercent: {
    fontSize: 8,
    color: Colors.leisurePrimary,
    fontWeight: '600'
  },
  textBudget: {
    fontSize: 14,
    color: Colors.gray95,
    fontWeight: '600'
  },
  textBudgetSub: {
    fontSize: 14,
    color: Colors.grayTwo,
    fontWeight: '600'
  },
  viewAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    width: '50%'
  },
  corrcetView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  subcategories: {
    width: '100%',
    gap: 8
  }

})