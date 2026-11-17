import { useContext, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { AuthButton } from '../../../../components/auth/auth-button';
import { AuthField } from '../../../../components/auth/auth-field';
import { AuthScaffold } from '../../../../components/auth/auth-scaffold';
import { AuthContext } from '../../../../contexts/Auth';
import { authErrorMessage } from '../../../../lib/auth-errors';
import type { RootStackParamList } from '../../../../navigation/stack';

type LoginNavigation = NavigationProp<RootStackParamList, 'LogIn'>;

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LogIn() {
  const navigation = useNavigation<LoginNavigation>();
  const { enterDemo, requestEmailAccess } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function sendAccessLink() {
    if (!validEmail(email)) {
      setError('Digite um email válido.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await requestEmailAccess(email);
      setSentTo(email.trim().toLowerCase());
    } catch (requestError) {
      setError(authErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function openDemo() {
    setDemoLoading(true);
    setError('');
    try {
      await enterDemo();
    } catch {
      setError('Não foi possível abrir a demonstração. Tente novamente.');
    } finally {
      setDemoLoading(false);
    }
  }

  if (sentTo) {
    return (
      <AuthScaffold
        eyebrow="Link enviado"
        title="Confira seu email."
        description="Abra o link no mesmo aparelho para confirmar que a conta é sua."
        footer={
          <Pressable accessibilityRole="button" onPress={() => setSentTo(null)}>
            <Text style={styles.link}>Usar outro email</Text>
          </Pressable>
        }
      >
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={20} color="#237A4B" />
          <Text style={styles.statusText}>Enviado para</Text>
        </View>
        <Text selectable style={styles.email}>{sentTo}</Text>
        <Text style={styles.helper}>
          O link expira e funciona uma única vez. Se não aparecer, confira o spam.
        </Text>
        <View style={styles.actions}>
          <AuthButton label="Abrir email" onPress={() => void Linking.openURL('mailto:')} />
          <AuthButton
            label="Enviar novamente"
            loading={loading}
            onPress={() => void sendAccessLink()}
            variant="secondary"
          />
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      eyebrow="Entrar"
      title="Acesse sua conta."
      description="Informe seu email. Vamos enviar um link de confirmação para este aparelho."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.link}>Criar conta</Text>
          </Pressable>
        </View>
      }
    >
      <AuthField
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={error}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => {
          setEmail(value);
          setError('');
        }}
        onSubmitEditing={() => void sendAccessLink()}
        placeholder="voce@email.com"
        returnKeyType="send"
        value={email}
      />

      <AuthButton
        disabled={!email.trim()}
        label="Continuar"
        loading={loading}
        onPress={() => void sendAccessLink()}
      />

      {__DEV__ ? (
        <View style={styles.demoAccess}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>DESENVOLVIMENTO</Text>
            <View style={styles.dividerLine} />
          </View>
          <AuthButton
            label="Visualizar o app sem entrar"
            loading={demoLoading}
            onPress={() => void openDemo()}
            variant="secondary"
          />
          <Text style={styles.demoHint}>Acesso temporário, sem email e sem PIN.</Text>
        </View>
      ) : null}

      <View style={styles.pinNote}>
        <Ionicons name="lock-closed-outline" size={15} color="#686864" />
        <Text style={styles.pinNoteText}>
          Depois da confirmação, você entra com seu PIN de 4 números.
        </Text>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
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
  demoAccess: {
    gap: 10,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DADAD5',
  },
  dividerLabel: {
    color: '#8A8A85',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  demoHint: {
    color: '#7A7A75',
    fontSize: 12,
    textAlign: 'center',
  },
  pinNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  pinNoteText: {
    flex: 1,
    color: '#686864',
    fontSize: 12,
    lineHeight: 17,
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
  email: {
    marginTop: -10,
    color: '#171717',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.35,
  },
  helper: {
    color: '#696965',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
