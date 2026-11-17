import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    width: 80,
    height: 100,
    borderRadius: 100,
  
  },
  viewProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLogo: {
    fontSize: 24,
  },
  progressPercent: {
    fontSize: 12,
    color: Colors.gray95
  }
})