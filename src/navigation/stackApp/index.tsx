import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HeaderLogo from "../../app/components/headerLogo";
import Header from "../../app/components/Header";
import { MyTab } from "../tabs";
import Menu from "../../app/screens/menu";
import Profile from "../../app/screens/menu/profile";
import Reports from "../../app/screens/menu/reports";
import Subscription from "../../app/screens/menu/subscription";
import CancelSubscription from "../../app/screens/menu/cancelSubscription";

export type RootStackAppParamList = {
  HeaderLogo: undefined;
  MyTab: undefined; 
  Menu: undefined;
  Profile: undefined;
  Reports: undefined;
  Subscription: undefined;
  Header: undefined;
  CancelSubscription: undefined;
};

const Stack = createNativeStackNavigator<RootStackAppParamList>();

export function MyStackApp(){
  return(
    <Stack.Navigator initialRouteName="MyTab" screenOptions={{ headerShown: false}}>
      <Stack.Screen name="HeaderLogo" component={HeaderLogo}/>
      <Stack.Screen name="Header" component={Header}/>
      <Stack.Screen name="MyTab" component={MyTab}/>
      <Stack.Screen name="Menu" component={Menu}/>
      <Stack.Screen name="Profile" component={Profile}/>
      <Stack.Screen name="Reports" component={Reports}/>
      <Stack.Screen name="Subscription" component={Subscription}/>
      <Stack.Screen name="CancelSubscription" component={CancelSubscription}/>
    </Stack.Navigator>
  )
}
