import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerText: {
    width: '100%',
    marginTop: 32,
    paddingHorizontal: 0,
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  textAmount: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  textDescription: {
    color: Colors.gray95,
    fontSize: 14,
    fontWeight: '400',
  },
  progressContainer: {
    // flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    gap: 8,
  },
  viewThisMonth: {
    width: 165,
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.grayBack,
    borderRadius: 16,
    padding: 12
  },
  headercard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  textCard: {
    fontSize: 12,
    color: Colors.gray95,
    fontWeight: '500',
  },
  textCardAmount: {
    fontSize: 16,
    color: Colors. textSecondary,
    fontWeight: '500',
    alignSelf: 'flex-start'
  },
  flatlist: {
    gap: 10,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 22,
    marginTop: 32,
  },
  textTitle: {
    color: Colors.text,
    fontWeight: '500',
  },
  ViewAvarage: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewAvarageColor: {
    width: "48%",
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.grayBack,
    borderRadius: 16,
    padding: 12,
  },
  numberView: {
    // height: 34,
    // width: 34,
    backgroundColor: Colors.grayBack,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  numberText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 12,
  },
  viewRecurrency: {
    width: 136,
    height: 120,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: Colors.grayBack,
    borderRadius: 16,
    padding: 10
  },
  textIcon: {
    fontSize: 30
  },
  textName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary
  },
  ViewSpent: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  textSpent: {
    fontSize: 14,
    fontWeight: '600',
  },
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(33,33,33,0.5)',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  addRecunrrencyModal: {
    width: '100%',
    height: '70%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 20,
    alignItems: 'center',
    paddingVertical: 40,
  },
  texteHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.grayBack,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 100
  },
  textInput: {
    width: '90%',
    height: 54,
    borderWidth: 0.8,
    borderColor: Colors. grayBack,
    borderRadius: 10,
    padding: 10,
    color: Colors. gray95
  },
  modalTitle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.gray95,
  },
  textMovements: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  pillContainer: {
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalText: {
    color: Colors.background,
    fontWeight: '600'
  },
  viewProgressValue: {
    flexDirection: 'row',
    backgroundColor: Colors.incomeSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.incomeBold,
  },

  // Adicione estes estilos ao seu arquivo de estilos existente

// Estilos para o estado de gráfico vazio
emptyChartContainer: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.background,
  borderRadius: 16,
  // padding: 20,
},

emptyChartTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
  marginTop: 16,
  textAlign: 'center',
},

emptyChartSubtitle: {
  fontSize: 14,
  color: Colors.textSecondary,
  marginTop: 8,
  textAlign: 'center',
  maxWidth: '80%',
},

demoChartContainer: {
  marginTop: 20,
  opacity: 0.5,
  width: '100%',
  alignItems: 'center',
},

// Estilos para o tooltip customizado
tooltipContainer: {
  position: 'absolute',
  width: 200,
  backgroundColor: Colors.background,
  borderRadius: 12,
  padding: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 5,
},

tooltipContent: {
  width: '100%',
},

tooltipDate: {
  fontSize: 16,
  fontWeight: '600',
  color: Colors.text,
  marginBottom: 8,
  textAlign: 'center',
},

tooltipRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 4,
},

tooltipIndicator: {
  width: 8,
  height: 8,
  borderRadius: 4,
  marginRight: 6,
},

tooltipLabel: {
  fontSize: 12,
  color: Colors.textSecondary,
  flex: 1,
},

tooltipValue: {
  fontSize: 12,
  fontWeight: '500',
  color: Colors.text,
},

tooltipTotal: {
  marginTop: 6,
  paddingTop: 6,
  borderTopWidth: 1,
  borderTopColor: Colors.gray95 + '30',
},

tooltipLabelTotal: {
  fontSize: 13,
  fontWeight: '500',
  color: Colors.text,
  flex: 1,
},

tooltipValueTotal: {
  fontSize: 13,
  fontWeight: '600',
  color: Colors.text,
},

tooltipCloseButton: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: Colors.gray95 + '20',
  justifyContent: 'center',
  alignItems: 'center',
},

// Adicione estes estilos ao seu arquivo de estilos
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
modalBackdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
transactionModalContainer: {
  backgroundColor: Colors.background,
  borderRadius: 16,
  padding: 0,
  width: '85%',
  maxWidth: 340,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.27,
  shadowRadius: 4.65,
  elevation: 6,
},
transactionModalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: Colors.gray95 + '30',
},
transactionModalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
},
modalCloseButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: Colors.gray95 + '20',
  justifyContent: 'center',
  alignItems: 'center',
},
transactionDetailContainer: {
  padding: 20,
},
transactionDetailRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
transactionDetailLabel: {
  flexDirection: 'row',
  alignItems: 'center',
},
indicator: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 8,
},
transactionLabelText: {
  fontSize: 15,
  color: Colors.textSecondary,
},
transactionLabelBold: {
  fontSize: 15,
  fontWeight: '500',
  color: Colors.text,
  marginLeft: 8,
},
transactionValue: {
  fontSize: 16,
  fontWeight: '500',
},
incomeValue: {
  color: Colors.incomeBold,
},
expenseValue: {
  color: Colors.healthyBold,
},
transactionValueTotal: {
  fontSize: 18,
  fontWeight: '700',
  color: Colors.text,
},
divider: {
  height: 1,
  backgroundColor: Colors.gray95 + '30',
  marginVertical: 16,
},
viewAllButton: {
  backgroundColor: Colors.gray95 + '15',
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
  paddingVertical: 14,
  alignItems: 'center',
},
viewAllButtonText: {
  color: Colors.text,
  fontSize: 14,
  fontWeight: '500',
},

})