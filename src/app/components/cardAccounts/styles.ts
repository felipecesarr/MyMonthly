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
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    backgroundColor: Colors.grayBack,
  },
  viewRowHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    height: 34,
    width: 34,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  nameBank: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  viewBalance: {
    backgroundColor: Colors.incomeSecondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBalance: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.incomeBold,
  },
  viewFooter: {
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  viewProgress: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  textMovements: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text,
  },
  viewBarProgress: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textPercent: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayTwo,
  },
  

})