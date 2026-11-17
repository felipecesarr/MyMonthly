import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  Linking, 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Image,
  Platform
} from 'react-native';
import { styles as baseStyles } from './styles';
import HeaderLogo from '../../components/headerLogo';
import Button from '../../components/button';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackAppParamList } from '../../../navigation/stackApp';
import { useRevenueCat } from '../../../contexts/RevenueCatContext';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { PurchasesPackage } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

type CancelSubscriptionScreenNavigationProp = NavigationProp<RootStackAppParamList, 'CancelSubscription'>;

export default function Subscription() {
  const navigation = useNavigation<CancelSubscriptionScreenNavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user, packages, purchasePackage } = useRevenueCat();
  
  // Set initial plan selection to monthly if available
  useEffect(() => {
    if (packages.length > 0) {
      const monthlyPkg = packages.find(pkg => pkg.packageType === 'MONTHLY');
      if (monthlyPkg) {
        setSelectedPlan(monthlyPkg.identifier);
      }
    }
  }, [packages]);

  // Find chosen package
  const chosenPackage: PurchasesPackage | undefined = 
    selectedPlan ? packages.find((pkg) => pkg.identifier === selectedPlan) : undefined;
    
  // Calculate discount for annual plan
  let discount = '';
  let discountValue = '';
  let monthlyEquivalent = '';
  
  if (chosenPackage?.packageType === 'ANNUAL') {
    const monthlyPack = packages.find((p) => p.packageType === 'MONTHLY');
    if (monthlyPack) {
      const monthlyPrice = monthlyPack.product.price;
      const annualPrice = chosenPackage.product.price;
      const totalMensalAnual = monthlyPrice * 12;
      const discountPercent = (((totalMensalAnual - annualPrice) / totalMensalAnual) * 100).toFixed(0);
      
      discount = `${discountPercent}% OFF`;
      discountValue = `R$ ${(annualPrice / 12).toFixed(2)}`;
      monthlyEquivalent = `R$ ${(annualPrice / 12).toFixed(2)}/mês`;
    }
  }

  // Handle subscription purchase
  const handlePress = async () => {
    if (!selectedPlan) {
      Alert.alert('Atenção', 'Por favor, selecione um plano primeiro.');
      return;
    }
    if (!chosenPackage) {
      Alert.alert('Atenção', `Pacote não encontrado: ${selectedPlan}`);
      return;
    }

    try {
      const purchased = await purchasePackage(chosenPackage);
      if (purchased) {
        Alert.alert('Sucesso!', 'Sua assinatura foi realizada com sucesso.');
      }
    } catch (error) {
      Alert.alert('Erro na compra', String(error));
    }
  };

  // Get features based on selected plan
  const getFeatures = () => {
    const basicFeatures = [
      {
        icon: "account-balance-wallet",
        text: "Um app, todos os bancos e cartões"
      },
      {
        icon: "show-chart",
        text: "Rastreie cada receita e despesa"
      },
      {
        icon: "category",
        text: "Categorias personalizáveis"
      },
      {
        icon: "phone-iphone",
        text: "Organização total na palma da mão"
      },
      {
        icon: "bar-chart",
        text: "Relatórios detalhados de gastos"
      }
    ];
    
    const annualFeatures = [
      ...basicFeatures,
      {
        icon: "verified",
        text: "Prioridade no suporte técnico"
      },
      {
        icon: "savings",
        text: "Economia de 27% versus plano mensal"
      }
    ];
    
    return chosenPackage?.packageType === 'ANNUAL' ? annualFeatures : basicFeatures;
  };

  return (
    <ImageBackground
      source={require('../../../../assets/onboardingScreens/background.png')}
      style={subscriptionStyles.background}
      imageStyle={subscriptionStyles.backgroundImage}
    >
      <ScrollView 
        style={subscriptionStyles.container} 
        contentContainerStyle={subscriptionStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HeaderLogo />
        
        <View style={subscriptionStyles.mainContent}>
          {/* Header Section */}
          <View style={subscriptionStyles.headerSection}>
            <Text style={subscriptionStyles.title}>
              {user.plus ? "Gerenciar assinatura" : "Escolha seu plano"}
            </Text>
            
            {!user.plus && (
              <Text style={subscriptionStyles.subtitle}>
                Organize suas finanças com precisão e descubra para onde vai seu dinheiro
              </Text>
            )}
            
            {user.plus && (
              <View style={subscriptionStyles.plusBadge}>
                <MaterialIcons name="verified" size={20} color={Colors.incomeBold} />
                <Text style={subscriptionStyles.plusBadgeText}>Você já é MyMonthly Plus</Text>
              </View>
            )}
          </View>
          
          {/* Plan Selection Section */}
          <View style={subscriptionStyles.plansContainer}>
            {packages.map((pkg, index) => {
              const isMonthly = pkg.packageType === 'MONTHLY';
              const isAnnual = pkg.packageType === 'ANNUAL';
              const isSelected = selectedPlan === pkg.identifier;
              
              // Format price display
              const price = pkg.product.priceString;
              let period = isMonthly ? '/mês' : '/ano';
              let priceDisplay = isMonthly ? price : price;
              let monthlyEquiv = isAnnual ? (pkg.product.price / 12).toFixed(2) : null;
              
              let discountPercentage = '';
              if (isAnnual && packages.find(p => p.packageType === 'MONTHLY')) {
                const monthlyPkg = packages.find(p => p.packageType === 'MONTHLY')!;
                const annualCost = pkg.product.price;
                const monthlyCostPerYear = monthlyPkg.product.price * 12;
                const savings = ((monthlyCostPerYear - annualCost) / monthlyCostPerYear * 100).toFixed(0);
                discountPercentage = `${savings}% OFF`;
              }
              
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    subscriptionStyles.planCard,
                    isSelected && subscriptionStyles.planCardSelected,
                    isAnnual && subscriptionStyles.planCardAnnual
                  ]}
                  onPress={() => setSelectedPlan(pkg.identifier)}
                  activeOpacity={0.9}
                >
                  
                  <View style={subscriptionStyles.planHeader}>
                    <View style={subscriptionStyles.planTypeContainer}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={subscriptionStyles.planType}>
                        {isMonthly ? 'Plano Mensal' : 'Plano Anual'}
                      </Text>
                      {isAnnual && discountPercentage && (
                        <View style={subscriptionStyles.discountBadge}>
                          <Text style={subscriptionStyles.discountText}>{discountPercentage}</Text>
                        </View>
                      )}
                      </View>
                      {isSelected && (
                        <View style={subscriptionStyles.selectedIndicator}>
                          <MaterialIcons name="check-circle" size={20} color={Colors.incomeBold} />
                        </View>
                      )}
                    </View>
                    
                    <View style={subscriptionStyles.priceContainer}>
                      <Text style={subscriptionStyles.currency}>R$</Text>
                      <Text style={subscriptionStyles.price}>
                        {isMonthly 
                          ? pkg.product.price.toFixed(2) 
                          : (pkg.product.price / 12).toFixed(2)}
                      </Text>
                      <Text style={subscriptionStyles.period}>
                        {isMonthly ? '/mês' : '/mês*'}
                      </Text>
                    </View>
                    
                    {isAnnual && (
                      <Text style={subscriptionStyles.annualNote}>
                        *Cobrança anual de {pkg.product.priceString}
                      </Text>
                    )}
                  </View>
                  
                  {isSelected && (
                    <View style={subscriptionStyles.selectedGradient} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Features Section */}
          {chosenPackage && (
            <View style={subscriptionStyles.featuresContainer}>
              <Text style={subscriptionStyles.featuresTitle}>
                {chosenPackage.packageType === 'MONTHLY' 
                  ? 'Benefícios Inclusos' 
                  : 'Benefícios Premium'}
              </Text>
              
              {getFeatures().map((feature, index) => (
                <View key={index} style={subscriptionStyles.featureRow}>
                  <MaterialIcons 
                    name={feature.icon as any} 
                    size={22} 
                    color={Colors.incomeBold} 
                    style={subscriptionStyles.featureIcon}
                  />
                  <Text style={subscriptionStyles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Action Button */}
          <View style={subscriptionStyles.actionContainer}>
            <View style={subscriptionStyles.actionButton}>
            <Button
                onPress={handlePress}
                text={user.plus ? "Gerenciar assinatura" : "Assinar agora"}
                buttonStyle={{ width: '100%' }} // Apply width directly to the Button
              />
            </View>
            
            {!user.plus && (
              <Text style={subscriptionStyles.secureNote}>
                <MaterialIcons name="lock" size={14} color={Colors.textSecondary} />{" "}
                Pagamento seguro através da App Store
              </Text>
            )}
          </View>
          
          {/* Terms and Conditions */}
          <View style={subscriptionStyles.termsContainer}>
            <Text style={subscriptionStyles.termsText}>
              Ao utilizar este app, você concorda com os{' '}
              <Text
                style={subscriptionStyles.termsLink}
                onPress={() => {
                  Linking.openURL('https://mymonthly.framer.website/terms-conditions');
                }}
              >
                Termos de Uso da Apple
              </Text>{' '}
              e nossa{' '}
              <Text
                style={subscriptionStyles.termsLink}
                onPress={() => {
                  Linking.openURL('https://mymonthly.framer.website/privacy-policy');
                }}
              >
                Política de Privacidade
              </Text>.
            </Text>
            
            <Text style={subscriptionStyles.cancelInfo}>
              Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta na App Store.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// Estilos integrados ao componente
const subscriptionStyles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.9,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainContent: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    paddingTop: 20,
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 22,
  },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.incomeBold + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  plusBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.incomeBold,
    marginLeft: 8,
  },
  plansContainer: {
    width: '100%',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: Colors.incomeBold,
    borderWidth: 2,
    shadowColor: Colors.incomeBold,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  planCardAnnual: {
    backgroundColor: Colors.background,
  },
  selectedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)', // Simple color instead of gradient
  },
  discountBadge: {
    backgroundColor: Colors.incomeSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: Colors.incomeBold,
    fontWeight: '700',
    fontSize: 12,
  },
  planHeader: {
    width: '100%',
  },
  planTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.incomeBold,
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 2,
    marginBottom: 3,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  period: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 2,
    marginBottom: 4,
  },
  annualNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray95 + '30',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIcon: {
    marginRight: 12,
    backgroundColor: Colors.incomeBold + '15',
    padding: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
  secureNote: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  termsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  termsLink: {
    color: Colors.incomeBold,
    textDecorationLine: 'underline',
  },
  cancelInfo: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary + 'AA',
    textAlign: 'center',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.incomeBold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
