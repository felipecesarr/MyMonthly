import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { env } from '../../lib/env';
import { AuthContext } from '../Auth';

export interface UserProps {
  items: string[];
  plus: boolean;
}

interface RevenueCatProps {
  user: UserProps;
  packages: PurchasesPackage[];
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
  restorePurchasesUser: () => Promise<void>;
  isReady: boolean;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

const EMPTY_USER: UserProps = { items: [], plus: false };

function getRevenueCatApiKey(): string | undefined {
  if (__DEV__ && env.revenueCatTestStoreApiKey) {
    return env.revenueCatTestStoreApiKey;
  }

  if (Platform.OS === 'ios') return env.revenueCatIosApiKey;
  if (Platform.OS === 'android') return env.revenueCatAndroidApiKey;
  return undefined;
}

function mapCustomerInfo(customerInfo: CustomerInfo): UserProps {
  const plus = customerInfo.entitlements.active.plus;

  return plus
    ? { items: [plus.identifier], plus: true }
    : EMPTY_USER;
}

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const [user, setUser] = useState<UserProps>(EMPTY_USER);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const updateCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    setUser(mapCustomerInfo(customerInfo));
  }, []);

  const loadOfferings = useCallback(async () => {
    const offerings = await Purchases.getOfferings();
    const allPackages = Object.values(offerings.all).flatMap(
      (offering) => offering.availablePackages,
    );
    setPackages(allPackages);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      setIsReady(true);
      return;
    }

    const apiKey = getRevenueCatApiKey();
    if (!apiKey) {
      // Purchases are intentionally optional for local development. A
      // RevenueCat Test Store key enables the complete simulator flow.
      setIsReady(true);
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.INFO : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);
    setIsConfigured(true);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(updateCustomerInfo);
    };
  }, [updateCustomerInfo]);

  useEffect(() => {
    if (!isConfigured || authLoading) return;

    let cancelled = false;

    async function initializeForCurrentIdentity() {
      try {
        if (authUser) {
          const { customerInfo } = await Purchases.logIn(authUser.uid);
          if (!cancelled) updateCustomerInfo(customerInfo);
        } else if (!(await Purchases.isAnonymous())) {
          const anonymousCustomerInfo = await Purchases.logOut();
          if (!cancelled) updateCustomerInfo(anonymousCustomerInfo);
        }

        await Promise.all([
          loadOfferings(),
          Purchases.getCustomerInfo().then(updateCustomerInfo),
        ]);
      } catch (error) {
        console.warn('Unable to synchronize subscription identity', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    setIsReady(false);
    void initializeForCurrentIdentity();
    return () => {
      cancelled = true;
    };
  }, [authLoading, authUser, isConfigured, loadOfferings, updateCustomerInfo]);

  const purchasePackage = useCallback(
    async (pack: PurchasesPackage): Promise<boolean> => {
      if (!isConfigured) {
        throw new Error('Subscriptions are not configured for this build.');
      }

      try {
        const { customerInfo } = await Purchases.purchasePackage(pack);
        updateCustomerInfo(customerInfo);
        return true;
      } catch (error: any) {
        if (error?.userCancelled) return false;
        throw error;
      }
    },
    [isConfigured, updateCustomerInfo],
  );

  const restorePurchasesUser = useCallback(async () => {
    if (!isConfigured) {
      throw new Error('Subscriptions are not configured for this build.');
    }

    const customerInfo = await Purchases.restorePurchases();
    updateCustomerInfo(customerInfo);
  }, [isConfigured, updateCustomerInfo]);

  const value = useMemo<RevenueCatProps>(
    () => ({ user, packages, purchasePackage, restorePurchasesUser, isReady }),
    [isReady, packages, purchasePackage, restorePurchasesUser, user],
  );

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat(): RevenueCatProps {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider');
  }
  return context;
}
