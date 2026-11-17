import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  viewBarProgress: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textPercent: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayTwo,
  },
  logo: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    borderRadius: 100,
  },
})