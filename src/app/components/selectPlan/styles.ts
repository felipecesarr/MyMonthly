import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 14
  },
  selectView: {
    flexDirection: 'row',
    width: '90%',
    height: 80,
    borderWidth: 0.7,
    borderColor: Colors.grayOne,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  selected: {
    borderColor: Colors.text,
  },
  textsView: {
    gap: 6,
  },
  textPrimary: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600'
  },
  textSecondary: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400'
  },
})