import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert, AppState, Linking } from 'react-native';
import type { User } from '@supabase/supabase-js';
import {
  claimPendingPin,
  clearPendingPin,
  hasPin,
  isValidPin,
  isWeakPin,
  rememberPendingPin,
  removePin,
  savePin,
  verifyPin,
  type PinVerificationResult,
} from '../../lib/app-pin';
import { queryClient } from '../../lib/query-client';
import {
  DEMO_USER_ID,
  isDemoSessionActive,
  setDemoSessionActive,
} from '../../lib/demo-session';
import { supabase } from '../../lib/supabase';

const AUTH_CALLBACK_URL = 'mymonthly://auth/callback';

export type UserData = {
  uid: string;
  userName: string;
  email: string;
  whatsApp: string;
};

export type PinStatus = 'loading' | 'missing' | 'locked' | 'unlocked';

type ProfileUpdate = Pick<UserData, 'userName' | 'whatsApp'>;
type SignUpResult = 'confirmation-required';

type AuthContextData = {
  user: UserData | null;
  signed: boolean;
  loading: boolean;
  pinStatus: PinStatus;
  signUp: (
    userName: string,
    email: string,
    pin: string,
    whatsApp: string,
  ) => Promise<SignUpResult>;
  requestEmailAccess: (email: string) => Promise<void>;
  enterDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  createPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<PinVerificationResult>;
  lockApp: () => void;
  beginPinChange: () => void;
  recoverPin: () => Promise<void>;
  updateProfile: (profile: ProfileUpdate) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

async function fetchUserData(authUser: User): Promise<UserData> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, whatsapp')
    .eq('id', authUser.id)
    .single();

  if (error) throw error;

  return {
    uid: authUser.id,
    userName: data.full_name,
    email: authUser.email ?? '',
    whatsApp: data.whatsapp,
  };
}

function callbackCode(url: string | null): string | null {
  if (!url?.startsWith(AUTH_CALLBACK_URL)) return null;
  const match = url.match(/[?&]code=([^&#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinStatus, setPinStatus] = useState<PinStatus>('loading');
  const activeUserIdRef = useRef<string | null>(null);
  const activeUserIsDemoRef = useRef(false);

  const synchronizeUser = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      if (isDemoSessionActive()) {
        setLoading(false);
        return;
      }
      activeUserIdRef.current = null;
      activeUserIsDemoRef.current = false;
      setUser(null);
      setPinStatus('loading');
      queryClient.clear();
      setLoading(false);
      return;
    }

    const previousUserId = activeUserIdRef.current;

    try {
      const profile = await fetchUserData(authUser);

      if (__DEV__ && authUser.is_anonymous) {
        activeUserIdRef.current = authUser.id;
        activeUserIsDemoRef.current = true;
        setUser({ ...profile, email: 'demo@mymonthly.local' });
        setPinStatus('unlocked');
        return;
      }

      const claimedPendingPin = await claimPendingPin(authUser.id, authUser.email);
      const configured = claimedPendingPin || (await hasPin(authUser.id));

      activeUserIdRef.current = authUser.id;
      activeUserIsDemoRef.current = false;
      setUser(profile);
      setPinStatus((current) => {
        if (!configured) return 'missing';
        if (previousUserId === authUser.id && current === 'unlocked') return current;
        return 'locked';
      });
    } catch (error) {
      console.error('Unable to load the authenticated profile', error);
      activeUserIdRef.current = null;
      activeUserIsDemoRef.current = false;
      setUser(null);
      setPinStatus('loading');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('Unable to restore the Supabase session', error);
        setLoading(false);
        return;
      }
      void synchronizeUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase recommends keeping this callback synchronous. Defer any query
      // that needs the auth client until the callback has returned.
      setTimeout(() => {
        if (mounted) void synchronizeUser(session?.user ?? null);
      }, 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [synchronizeUser]);

  useEffect(() => {
    let active = true;
    const handledCodes = new Set<string>();

    async function handleAuthUrl(url: string | null) {
      const code = callbackCode(url);
      if (!code || handledCodes.has(code)) return;
      handledCodes.add(code);

      setLoading(true);
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!active) return;

      if (error) {
        setLoading(false);
        Alert.alert(
          'Link inválido',
          'Este link expirou ou já foi usado. Solicite um novo acesso.',
        );
        return;
      }

      await synchronizeUser(data.session?.user ?? null);
    }

    void Linking.getInitialURL().then(handleAuthUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [synchronizeUser]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'inactive' || nextState === 'background') {
        if (activeUserIsDemoRef.current) return;
        setPinStatus((current) => (current === 'unlocked' ? 'locked' : current));
      }
    });

    return () => subscription.remove();
  }, []);

  const signUp = useCallback(
    async (userName: string, email: string, pin: string, whatsApp: string) => {
      if (!isValidPin(pin) || isWeakPin(pin)) {
        throw new Error('PIN must contain four non-obvious digits.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      await rememberPendingPin(normalizedEmail, pin);

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: AUTH_CALLBACK_URL,
          data: {
            full_name: userName.trim(),
            whatsapp: whatsApp.trim(),
          },
        },
      });

      if (error) {
        await clearPendingPin();
        throw error;
      }

      return 'confirmation-required' as const;
    },
    [],
  );

  const requestEmailAccess = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: AUTH_CALLBACK_URL,
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const enterDemo = useCallback(async () => {
    if (!__DEV__) throw new Error('Demo access is only available in development builds.');

    setLoading(true);
    queryClient.clear();
    setDemoSessionActive(true);
    activeUserIdRef.current = DEMO_USER_ID;
    activeUserIsDemoRef.current = true;
    setUser({
      uid: DEMO_USER_ID,
      userName: 'Felipe',
      email: 'demo@mymonthly.local',
      whatsApp: '',
    });
    setPinStatus('unlocked');
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    if (isDemoSessionActive()) {
      setDemoSessionActive(false);
      activeUserIdRef.current = null;
      activeUserIsDemoRef.current = false;
      setUser(null);
      setPinStatus('loading');
      queryClient.clear();
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      setLoading(false);
      throw error;
    }

    activeUserIdRef.current = null;
    activeUserIsDemoRef.current = false;
    setUser(null);
    setPinStatus('loading');
    queryClient.clear();
    setLoading(false);
  }, []);

  const createPin = useCallback(
    async (pin: string) => {
      if (!user || !isValidPin(pin) || isWeakPin(pin)) {
        throw new Error('A valid authenticated user and four-digit PIN are required.');
      }

      await savePin(user.uid, pin);
      setPinStatus('unlocked');
    },
    [user],
  );

  const unlockWithPin = useCallback(
    async (pin: string): Promise<PinVerificationResult> => {
      if (!user || !isValidPin(pin)) return { ok: false };

      const result = await verifyPin(user.uid, pin);
      if (result.ok) setPinStatus('unlocked');
      return result;
    },
    [user],
  );

  const lockApp = useCallback(() => {
    setPinStatus((current) => (current === 'unlocked' ? 'locked' : current));
  }, []);

  const beginPinChange = useCallback(() => {
    if (user) setPinStatus('missing');
  }, [user]);

  const recoverPin = useCallback(async () => {
    if (isDemoSessionActive()) {
      throw new Error('PIN recovery is unavailable in demo mode.');
    }
    if (!user?.email) throw new Error('No authenticated email is available.');

    await requestEmailAccess(user.email);
    await removePin(user.uid);
    await signOut();
    Alert.alert(
      'Confira seu email',
      'Abra o link neste aparelho para verificar sua identidade e criar um novo PIN.',
    );
  }, [requestEmailAccess, signOut, user]);

  const updateProfile = useCallback(async (profile: ProfileUpdate) => {
    if (isDemoSessionActive()) {
      setUser((current) => current ? { ...current, ...profile } : current);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.userName.trim(),
        whatsapp: profile.whatsApp.trim(),
      })
      .eq('id', authData.user.id);
    if (error) throw error;

    setUser((current) =>
      current
        ? {
            ...current,
            userName: profile.userName.trim(),
            whatsApp: profile.whatsApp.trim(),
          }
        : current,
    );
  }, []);

  const deleteAccount = useCallback(async () => {
    const currentUserId = user?.uid;
    setLoading(true);
    try {
      if (isDemoSessionActive()) {
        setDemoSessionActive(false);
        activeUserIdRef.current = null;
        activeUserIsDemoRef.current = false;
        setUser(null);
        setPinStatus('loading');
        queryClient.clear();
        return;
      }

      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });
      if (error) throw error;

      if (currentUserId) await removePin(currentUserId);
      await clearPendingPin();
      await supabase.auth.signOut({ scope: 'local' });
      activeUserIdRef.current = null;
      activeUserIsDemoRef.current = false;
      setUser(null);
      setPinStatus('loading');
      queryClient.clear();
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível excluir sua conta. Entre novamente e tente de novo.',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const value = useMemo<AuthContextData>(
    () => ({
      signed: Boolean(user),
      user,
      loading,
      pinStatus,
      signUp,
      requestEmailAccess,
      enterDemo,
      signOut,
      createPin,
      unlockWithPin,
      lockApp,
      beginPinChange,
      recoverPin,
      updateProfile,
      deleteAccount,
    }),
    [
      beginPinChange,
      createPin,
      deleteAccount,
      enterDemo,
      loading,
      lockApp,
      pinStatus,
      recoverPin,
      requestEmailAccess,
      signOut,
      signUp,
      unlockWithPin,
      updateProfile,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
