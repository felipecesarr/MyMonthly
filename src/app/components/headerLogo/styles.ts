import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 72,
  },
  buttonBack: {
    height: 44,
    width: 44,
    backgroundColor: Colors.backgroundIcons,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonFantasy: {
    height: 44,
    width: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  logoImage: {
    height: 40,
    width: 40,
    alignSelf: 'center',
  },
  
})