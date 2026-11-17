import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Colors } from "../../constants/colors";
import Accounts from "../../app/screens/accounts";
import Cards from "../../app/screens/cards";
import Categories from "../../app/screens/categories";
import Dashboard from "../../app/screens/dashboard";
import Goals from "../../app/screens/goals";
import Incomes from "../../app/screens/incomes";
import Transactions from "../../app/screens/transactions";
import Header from "../../app/components/Header";
import CustomTabBar from "../../app/components/CustomTabBar";

type MyTabParamList = {
  Contas: undefined;
  Cartões: undefined;
  Dashboard: undefined;
  Categorias: undefined;
  Metas: undefined;
  Receitas: undefined;
  Transações: undefined;
};

const Tab = createMaterialTopTabNavigator<MyTabParamList>();

export function MyTab(){
  return(
    <View style={{
      flex: 1,
      backgroundColor: Colors.background,
    }}>
    <Header/>
    <Tab.Navigator
     initialRouteName="Dashboard"
     tabBar={(props) => <CustomTabBar {...props} />} 
      screenOptions={{
        // Remove o indicador padrão
        tabBarIndicatorStyle: { display: 'none' },
        // Define o fundo branco para a Tab Navigator
        tabBarStyle: { backgroundColor: Colors.background },
        swipeEnabled:false,
        }}
     >
      <Tab.Screen name="Contas" component={Accounts}/>
      <Tab.Screen name="Cartões" component={Cards}/>
      <Tab.Screen name="Dashboard" component={Dashboard}/>
      <Tab.Screen name="Categorias" component={Categories}/>
      {/* <Tab.Screen name="Metas" component={Goals}/> */}
      <Tab.Screen name="Receitas" component={Incomes}/>
      <Tab.Screen name="Transações" component={Transactions}/>
    </Tab.Navigator>
    </View>
  )
}