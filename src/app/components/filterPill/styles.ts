import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    backgroundColor: Colors.grayBack,
    borderRadius: 100,
  },
  pillSelected: {
    backgroundColor: Colors.text,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillUnselected: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSelected: {
    color: Colors.background,
    fontWeight: '500',
  },
  textUnselected: {
    color: Colors.gray95,
  },
})