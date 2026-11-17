import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRevenueCat } from '../../../contexts/RevenueCatContext'; // ajuste o path
import { styles } from './styles';
import { Colors } from '../../../constants/colors';
import { PurchasesPackage } from 'react-native-purchases';

interface SelectPlanProps {
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

function getPlanTitle(pkg: PurchasesPackage): string {
  if (pkg.packageType === 'MONTHLY') {
    return 'MyMonthly (Mensal)';
  } else if (pkg.packageType === 'ANNUAL') {
    return 'MyMonthly (Anual)';
  }
  return pkg.identifier; // fallback
}

const SelectPlan: React.FC<SelectPlanProps> = ({ selectedPlan, onSelectPlan }) => {
  const { packages } = useRevenueCat();

  // Se ainda não carregou nada:
  if (!packages.length) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>
          Nenhum plano disponível no momento.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {packages.map((pkg) => {
        const planId = pkg.identifier;
        const title = getPlanTitle(pkg);
        const priceString = pkg.product.priceString;

        return (
          <TouchableOpacity
            key={planId}
            style={[
              styles.selectView,
              selectedPlan === planId && styles.selected,
            ]}
            onPress={() => onSelectPlan(planId)}
          >
            <View style={styles.textsView}>
              <Text style={styles.textPrimary}>{title}</Text>
              <Text style={styles.textSecondary}>{priceString}</Text>
            </View>
            {selectedPlan === planId && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.text}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SelectPlan;
