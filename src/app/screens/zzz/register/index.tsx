import { useContext, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { AuthButton } from '../../../../components/auth/auth-button';
import { AuthField } from '../../../../components/auth/auth-field';
import { AuthScaffold } from '../../../../components/auth/auth-scaffold';
import { PinInput } from '../../../../components/auth/pin-input';
import { AuthContext } from '../../../../contexts/Auth';
import { authErrorMessage } from '../../../../lib/auth-errors';
import { isWeakPin } from '../../../../lib/app-pin';
import type { RootStackParamList } from '../../../../navigation/stack';

type RegisterNavigation = NavigationProp<RootStackParamList, 'Register'>;

type FormErrors = {
  name?: string;
  email?: string;
  pin?: string;
  confirmation?: string;
};

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Register() {
  const navigation = useNavigation<RegisterNavigation>();
  const { enterDemo, signUp } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [sent, setSent] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) nextErrors.name = 'Digite seu nome.';
    if (!validEmail(email)) nextErrors.email = 'Digite um email válido.';
    if (pin.length !== 4) {
      nextErrors.pin = 'Crie um PIN com quatro números.';
    } else if (isWeakPin(pin)) {
      nextErrors.pin = 'Escolha números menos óbvios.';
    }
    if (confirmation !== pin) nextErrors.confirmation = 'Os PINs não coincidem.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function createAccount() {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp(name, email, pin, whatsApp);
      setSent(true);
    } catch (requestError) {
      setErrors((current) => ({
        ...current,
        email: authErrorMessage(requestError),
      }));
    } finally {
      setLoading(false);
    }
  }

  async function openDemo() {
    setDemoLoading(true);
    setDemoError('');
    try {
      await enterDemo();
    } catch {
      setDemoError('Não foi possível abrir a demonstração. Tente novamente.');
    } finally {
      setDemoLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthScaffold
        eyebrow="Quase pronto"
        title="Confirme seu email."
        description="Abra o link no mesmo aparelho para ativar sua conta."
        footer={
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LogIn')}>
            <Text style={styles.link}>Voltar para entrar</Text>
          </Pressable>
        }
      >
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={20} color="#237A4B" />
          <Text style={styles.statusText}>Enviado para</Text>
        </View>
        <Text selectable style={styles.sentEmail}>{email.trim().toLowerCase()}</Text>
        <Text style={styles.sentText}>
          Seu PIN fica neste aparelho e será salvo com segurança depois da confirmação.
        </Text>
        <View style={styles.sentActions}>
          <AuthButton label="Abrir email" onPress={() => void Linking.openURL('mailto:')} />
          {__DEV__ ? (
            <AuthButton
              label="Visualizar o app agora"
              loading={demoLoading}
              onPress={() => void openDemo()}
              variant="secondary"
            />
          ) : null}
          {demoError ? <Text style={styles.error}>{demoError}</Text> : null}
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      eyebrow="Nova conta"
      title="Comece seu mês."
      description="Confirme seu email e escolha um PIN de 4 números para entrar neste aparelho."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LogIn')}>
            <Text style={styles.link}>Entrar</Text>
          </Pressable>
        </View>
      }
      onBack={() => navigation.goBack()}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seus dados</Text>
        <Text style={styles.sectionText}>O email serve para confirmar e recuperar sua conta.</Text>
      </View>

      <AuthField
        autoCapitalize="words"
        autoComplete="name"
        error={errors.name}
        label="Nome"
        onChangeText={(value) => {
          setName(value);
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        placeholder="Seu nome"
        returnKeyType="next"
        value={name}
      />
      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => {
          setEmail(value);
          setErrors((current) => ({ ...current, email: undefined }));
        }}
        placeholder="voce@email.com"
        returnKeyType="next"
        value={email}
      />
      <AuthField
        autoComplete="tel"
        keyboardType="phone-pad"
        label="WhatsApp (opcional)"
        onChangeText={(value) => setWhatsApp(formatWhatsApp(value))}
        placeholder="(11) 99999-9999"
        returnKeyType="done"
        value={whatsApp}
      />

      <View style={styles.rule} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PIN de acesso</Text>
        <Text style={styles.sectionText}>Use 4 números que você lembre. Evite 1234 e datas óbvias.</Text>
      </View>

      <View style={styles.pinGroup}>
        <Text style={styles.pinLabel}>Novo PIN</Text>
        <PinInput
          error={Boolean(errors.pin)}
          label="Novo PIN"
          onChange={(value) => {
            setPin(value);
            setErrors((current) => ({ ...current, pin: undefined }));
          }}
          value={pin}
        />
        {errors.pin ? <Text style={styles.error}>{errors.pin}</Text> : null}
      </View>

      <View style={styles.pinGroup}>
        <Text style={styles.pinLabel}>Confirme o PIN</Text>
        <PinInput
          error={Boolean(errors.confirmation)}
          label="Confirmação do PIN"
          onChange={(value) => {
            setConfirmation(value);
            setErrors((current) => ({ ...current, confirmation: undefined }));
          }}
          value={confirmation}
        />
        {errors.confirmation ? <Text style={styles.error}>{errors.confirmation}</Text> : null}
      </View>

      <AuthButton label="Criar conta" loading={loading} onPress={() => void createAccount()} />
      <Text style={styles.terms}>
        Ao continuar, você aceita os Termos de Uso e a Política de Privacidade.
      </Text>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  sentActions: {
    gap: 12,
  },
  section: {
    gap: 3,
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  sectionText: {
    color: '#696965',
    fontSize: 13,
    lineHeight: 19,
  },
  rule: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#E4E4DF',
  },
  pinGroup: {
    gap: 7,
  },
  pinLabel: {
    color: '#30302E',
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#B3263E',
    fontSize: 12,
    lineHeight: 17,
  },
  terms: {
    color: '#7B7B76',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: '#696965',
    fontSize: 14,
  },
  link: {
    color: '#6D12B5',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusText: {
    color: '#686864',
    fontSize: 13,
  },
  sentEmail: {
    marginTop: -10,
    color: '#171717',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.35,
  },
  sentText: {
    color: '#696965',
    fontSize: 14,
    lineHeight: 21,
  },
});
