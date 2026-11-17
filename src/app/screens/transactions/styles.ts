import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

const DAY_WIDTH = 50;
const DAY_MARGIN_HORIZONTAL = 2;
const TOTAL_DAY_WIDTH = DAY_WIDTH + 2 * DAY_MARGIN_HORIZONTAL;


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  viewCalendar: {
    width: '90%',
    height: 120,
    backgroundColor: Colors.grayBack,
    borderRadius: 16,
    alignItems: 'center',
    padding: 10,
    marginVertical: 34,
    alignSelf: 'center',
  },
  disabledDayContainer: {
    backgroundColor: "transparent", // Pode ser uma cor mais clara para dias desabilitados
  },
  textDisabled: {
    color: Colors.gray95, // Defina uma cor para texto desabilitado
  },
  viewsRowMovements: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  viewMovements: {
    width: '48%',
    height: 80,
    backgroundColor: Colors.grayBack,
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
  },
  viewTextRow: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textState: {
    fontSize: 16,
    color: Colors.gray95
  },
  textValue: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 32,
    marginTop: 50,
  },
  textCard: {
    color: Colors.text,
    fontWeight: '500',
  },
  numberView: {
    height: 34,
    width: 34,
    backgroundColor: Colors.grayBack,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  numberText: {
    color: Colors.text,
    fontWeight: '500',
  },
  topFlatList: {
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: Colors.grayBack,
    width: '100%',
    alignItems: 'center',
  },
  ButtonAdd: {
    width: '90%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.grayOne,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignSelf: 'center'
  },
  buttonAddText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    width: '100%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // padding: 20,
    alignSelf:'baseline'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  pickerButton: {
    backgroundColor: Colors.grayBack,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  pickerText: {
    color: Colors.text,
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: Colors.grayOne,
    borderRadius: 14,
    padding: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pillButton: {
    borderWidth: 1,
    borderColor: Colors.grayOne,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  pillText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    width: '48%',
    backgroundColor: Colors.text,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 30,
    marginTop: 20,
  },
  textType: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500'
  },
  typeView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Espaçamento entre o ícone e o texto
  },
  textTitleInput: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12
  },
  hiddenRow: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  deleteButton: {
    backgroundColor: '#FF268830',
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Adicione esses estilos ao objeto styles

calendarContainer: {
  backgroundColor: Colors.background,
  width: '100%',
  alignSelf: 'center',
  marginTop: 34,
  marginBottom: 30,
  borderRadius: 16,
},

calendarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 30,
  marginBottom: 12,
},

calendarMonthText: {
  fontSize: 16,
  fontWeight: '600',
  color: Colors.text,
  textTransform: 'capitalize',
},

calendarControls: {
  flexDirection: 'row',
  alignItems: 'center',
},

todayButton: {
  backgroundColor: Colors.text + '20', // 20% opacity
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 100,
},

todayButtonText: {
  fontSize: 12,
  color: Colors.text,
  fontWeight: '600',
},

calendarScrollContent: {
  paddingHorizontal: 20,
  paddingVertical: 4,
},

dayContainer: {
  width: 50,
  height: 80,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 4,
  borderRadius: 20,
},

selectedDayContainer: {
  backgroundColor: Colors.text + '15', // Fundo leve
},

todayContainer: {
  borderWidth: 1,
  borderColor: Colors.text + '30',
},

weekendDay: {
  opacity: 0.8,
},

weekSeparator: {
  width: 1,
  height: 50,
  backgroundColor: Colors.gray95 + '40',
  marginHorizontal: 8,
},

weekDayText: {
  fontSize: 11,
  fontWeight: '500',
  color: Colors.textSecondary,
  marginBottom: 4,
},

selectedDayText: {
  color: Colors.text,
  fontWeight: '600',
},

todayDayText: {
  color: Colors.text,
},

weekendText: {
  color: Colors.textSecondary + '90',
},

dayNumberContainer: {
  width: 36,
  height: 36,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 18,
},

selectedDayNumberContainer: {
  backgroundColor: Colors.text,
},

todayDayNumberContainer: {
  borderWidth: 1,
  borderColor: Colors.text,
},

dayNumberText: {
  fontSize: 16,
  fontWeight: '600',
  color: Colors.text,
},

selectedDayNumberText: {
  color: Colors.background,
  fontWeight: '700',
},

todayDayNumberText: {
  color: Colors.text,
},

todayIndicator: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: Colors.text,
  position: 'absolute',
  bottom: 6,
},

/// Adicione/modifique estes estilos:

financialSummaryContainer: {
  paddingHorizontal: 16,
  marginBottom: 16,
},

cardsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
},

financialCard: {
  flexDirection: 'row',
  backgroundColor: Colors.background,
  borderRadius: 12,
  width: '48%',
  height: 74,
  paddingVertical: 14,
  paddingHorizontal: 0,
},

cardPressed: {
  opacity: 0.8,
},

cardIndicator: {
  width: 4,
  height: '100%',
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
},

cardContentMinimal: {
  flex: 1,
  paddingLeft: 12,
  justifyContent: 'center',
},

cardAmount: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
  color: Colors.text,
},

cardLabel: {
  fontSize: 12,
  color: Colors.textSecondary,
  fontWeight: '400',
},

balanceContainerMinimal: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTopWidth: 1,
  borderTopColor: Colors.gray95 + '40',
  paddingTop: 14,
  paddingHorizontal: 4,
},

balanceLabelContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},

balanceLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: Colors.textSecondary,
},

balanceValue: {
  fontSize: 16,
  fontWeight: '600',
},

positiveBalance: {
  color: Colors.incomeBold,
},

negativeBalance: {
  color: Colors.healthyBold,
},
})