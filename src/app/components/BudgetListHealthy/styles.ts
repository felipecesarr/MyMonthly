import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";
import { color } from "@rneui/base";

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
    backgroundColor: Colors.healthyPrimary,
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
    backgroundColor: Colors.healthySecondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    gap: 6,
  },
  textNameSubcategory: {
    fontSize: 14,
    color: Colors.healthyBold,
    fontWeight: '500'
  },
  textPercent: {
    fontSize: 8,
    color: Colors.healthyPrimary,
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