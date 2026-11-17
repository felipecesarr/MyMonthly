import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  containerSUBS: {
    flex: 1,
  },
  ViewRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    padding: 14,
    borderBottomWidth: 1.2,
    borderBottomColor: Colors.grayBack,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  ViewReportsList: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1.2,
    borderBottomColor: Colors.grayBack,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  ViewColumn: {
    gap: 10,
  },
  title: {
    color: Colors.gray95,
    fontSize: 16,
    fontWeight: '500'
  },
  title2: {
    color: Colors.gray95,
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 20,
    textAlign: 'left',
    alignSelf: 'flex-start'
  },
  textName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600'
  },
  textYear: {
    color: Colors.gray95,
    fontSize: 18,
    fontWeight: '500'
  },
  avatar: {
    height: 54,
    width: 54,
    borderRadius: 100,
  },
  avatarEdit: {
    height: 84,
    width: 84,
    borderRadius: 100,
  },
  ViewIcons: {
    gap: 20,
    paddingHorizontal: 20,
    width: '100%',
    marginVertical: 34,
  },
  ViewReports: {
    gap: 20,
    paddingHorizontal: 20,
    width: '100%',
    marginVertical: 16,
  },
  ViewRowIcons: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center'
  },
  Icon: {
    height: 40,
    width: 40,
    borderRadius: 100,
    backgroundColor: Colors.grayBack,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textRoute: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500'
  },
  ViewLogOut: {
    backgroundColor: Colors.text,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 80,
  },
  textLogOut: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '400'
  },
  editAvatar: {
    width: 84,
    height: 42,
    backgroundColor: '#21212180',
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  textEditAvatar: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500'
  },
  AreaInputs: {
    width: '100%',
    alignSelf: 'center',
    gap: 30,
    alignItems: 'center'
  },
  ViewInput: {
    width: '90%',
    alignSelf: 'center',
    gap: 8,
  },
  textInput: {
  color: Colors.text,
  fontSize: 16,
  },
  input: {
    width: '100%',
    height: 54,
    borderWidth: 0.7,
    borderColor: Colors.grayOne,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  icon: {
    paddingRight: 10
  },
  ViewLinks: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center'
  },
  flag: {
    width: 30,
    height: 20,
    resizeMode: 'cover',
    marginLeft: 10,
    marginRight: 10,
  },
  buttonEdit: {
    backgroundColor: Colors.text,
    width: 200,
    height: 54,
    alignSelf: 'center',
    borderRadius: 10,
  },
  background:{
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  ViewSubscription: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    gap: 32,
  },
  buttonChangePlan: {
    width: '45%',
  },
  buttonCancelPlan: {
    width: '45%',
    backgroundColor: '#21212120',
    borderWidth: 0.7,
    borderColor: '#212121'
  },
  buttonConfirmCancelPlan: {
    backgroundColor: '#21212120',
    borderWidth: 0.7,
    borderColor: '#212121'
  },
  titleText:{
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 14,
    paddingHorizontal: 20,
    alignSelf: 'flex-start'
  },
  titleReports: {
    color: Colors.gray95,
    fontSize: 20,
    fontWeight: '500',
    alignSelf: 'flex-start',
 
  },
  viewLink: {
    paddingHorizontal: 20,
    paddingVertical: 10, 
    alignSelf: 'flex-end',
  },
  deleteAccountButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.healthyBold,
    borderRadius: 10,
  },
  deleteAccountText: {
    color: Colors.healthyBold,
    fontWeight: '600',
    fontSize: 16,
  },
})
