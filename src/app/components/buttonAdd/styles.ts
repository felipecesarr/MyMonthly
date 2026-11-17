import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  button: {
    width: 36,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.grayOne,
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  textButton: {
    fontSize: 24,
    color: Colors.grayOne
  },
})