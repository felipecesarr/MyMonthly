import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
container: {
alignItems: 'center',
},
choiceChip: {
  backgroundColor: '#eee',
  borderRadius: 100,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginRight: 8,
  marginBottom: 8,
},
choiceChipSelected: {
  backgroundColor: Colors.background, 
},
choiceChipText: {
  color: Colors.text,
  fontSize: 14,
},
input: {
  width: '90%',
  height: 54,
  borderWidth: 1,
  borderColor: Colors.grayOne,
  borderRadius: 14,
  padding: 10,
  marginBottom: 20,
  fontSize: 14,
},
inputValue: {
  width: '90%',
  height: 74,
  padding: 10,
  marginBottom: 20,
  fontSize: 34,
  color: Colors.text,
  fontWeight: '700',
},
textTitleInput: {
  color: Colors.text,
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 12,
  alignSelf: 'flex-start',
  marginLeft: 20,
},
textValueInput: {
  color: Colors.text,
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 12,
  alignSelf: 'flex-start',
  marginLeft: 20,
},
typeSelect: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: Colors.text,
  alignSelf: 'center',
  paddingHorizontal: 16,
  paddingVertical: 4,
  borderRadius: 100,
  marginBottom: 30
},
textType: {
  color: Colors.background,
  fontSize: 16,
  fontWeight: '500'
},
chipBase: {
  backgroundColor: '#eee', // cor cinza para quando não selecionado
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 8,
},
chipSelectedIncome: {
  backgroundColor: Colors.incomePrimary, // ou outra cor
},
chipSelectedSubIncome: {
  backgroundColor: Colors.incomeSecondary, // ou outra cor
},
chipSelected: {
  backgroundColor: Colors.text, // ou outra cor
},
chipSelectedText: {
  color: Colors.background, // ou Colors.white se quiser texto claro quando selecionado
  fontSize: 14,
},
chipSelectedTextSub: {
  color: Colors.incomeBold, // ou Colors.white se quiser texto claro quando selecionado
  fontSize: 14,
},
chipText: {
  color: Colors.text, // ou Colors.white se quiser texto claro quando selecionado
  fontSize: 14,
},
chipImage: {
  width: 24,
  height: 24,
  resizeMode: 'contain',
  borderRadius: 100,
  
},
})