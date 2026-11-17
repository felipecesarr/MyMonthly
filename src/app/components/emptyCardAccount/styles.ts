import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    // padding: 10,
  },
  card: {
    width: 290,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.grayOne,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 10,
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: Colors.gray95
  },
  text2: {
    fontSize: 11,
    color: Colors.grayOne
  },
})