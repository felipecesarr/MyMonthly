import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: Colors.grayOne,
    borderRadius: 14,
    padding: 10,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  }
})