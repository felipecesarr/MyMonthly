import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 124,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    alignSelf: 'center',
    shadowColor: Colors.text,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    paddingHorizontal: 20,
    padding: 20,
  },
  viewRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewTagAmount: {
    backgroundColor: Colors.background,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: Colors.grayBack,
  },
  textAmount: {
    color: Colors.text,
    fontWeight: '500',
  },
  textTransfer: {
    color: Colors.gray95,
  },
  viewCategory: {
    height: 36,
    width: 36,
    borderRadius: 100,
    backgroundColor: Colors.grayBack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewTransferIcon: {
    height: 30,
    width: 30,
    borderRadius: 100,
    backgroundColor: Colors.grayBack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSubcategory: {
    borderRadius: 100,
    backgroundColor: Colors.grayBack,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
  },
  bankImage: {
    width: 34,
    height: 34,
    borderRadius: 100,
  }
})