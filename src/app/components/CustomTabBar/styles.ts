import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

export const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    alignItems: 'center',
    gap: 10,
    height: 50,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItemFocused: {
    backgroundColor: Colors.text,
    borderColor: 'transparent',
  },
  tabItemDefault: {
    backgroundColor: Colors.grayBack,
    borderColor: 'transparent'
  },
  tabTextFocused: {
    color: Colors.background,
    fontWeight: '500',
  },
  tabTextDefault: {
    color: Colors.text,
    fontWeight: '500',
  },
});
