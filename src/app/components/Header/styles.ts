import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 20,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  logo: {
    height: 36,
    width: 36,
    resizeMode: 'cover'
  },
  textSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textMonth: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '500'
  }
})