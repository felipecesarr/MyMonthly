import { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AuthContext } from '../../contexts/Auth';
import { authErrorMessage } from '../../lib/auth-errors';
import { isWeakPin } from '../../lib/app-pin';
import { AuthButton } from './auth-button';
import { AuthScaffold } from './auth-scaffold';
import { PinInput } from './pin-input';

function haptic(type: 'success' | 'error') {
  if (process.env.EXPO_OS !== 'ios') return;
  void Haptics.notificationAsync(
    type === 'success'
      ? Haptics.NotificationFeedbackType.Success
      : Haptics.NotificationFeedbackType.Error,
  );
}

export function PinSetup() {
  const { createPin, signOut } = useContext(AuthContext);
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pin.length !== 4 || saving) return;

    if (!firstPin) {
      if (isWeakPin(pin)) {
        haptic('error');
        setError('Escolha números menos óbvios.');
        setPin('');
        return;
      }

      const timer = setTimeout(() => {
        setFirstPin(pin);
        setPin('');
        setError('');
      }, 180);
      return () => clearTimeout(timer);
    }

    if (pin !== firstPin) {
      haptic('error');
      setError('Os PINs não coincidem. Tente outra vez.');
      setPin('');
      return;
    }

    setSaving(true);
    void createPin(pin)
      .then(() => haptic('success'))
      .catch(() => {
        haptic('error');
        setError('Não foi possível salvar o PIN. Tente novamente.');
        setPin('');
      })
      .finally(() => setSaving(false));
  }, [createPin, firstPin, pin, saving]);

  return (
    <AuthScaffold
      eyebrow={firstPin ? 'Confirmar PIN' : 'PIN deste aparelho'}
      title={firstPin ? 'Digite outra vez.' : 'Escolha 4 números.'}
      description={
        firstPin
          ? 'Repita o PIN para confirmar.'
          : 'Você vai usar este PIN para abrir o MyMonthly neste aparelho.'
      }
      footer={
        <Pressable accessibilityRole="button" onPress={() => void signOut()}>
          <Text style={styles.link}>Usar outra conta</Text>
        </Pressable>
      }
    >
      <PinInput
        autoFocus
        disabled={saving}
        error={Boolean(error)}
        label={firstPin ? 'Confirmação do PIN' : 'Novo PIN'}
        onChange={(value) => {
          setError('');
          setPin(value);
        }}
        value={pin}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" selectable style={styles.error}>
          {error}
        </Text>
      ) : (
        <Text style={styles.hint}>
          {saving ? 'Salvando…' : firstPin ? 'Repita os mesmos 4 números.' : 'Evite 1234 e datas óbvias.'}
        </Text>
      )}
    </AuthScaffold>
  );
}

export function PinUnlock() {
  const { user, unlockWithPin, recoverPin } = useContext(AuthContext);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const submitPin = useCallback(async () => {
    if (pin.length !== 4 || verifying) return;

    setVerifying(true);
    try {
      const result = await unlockWithPin(pin);
      if (result.ok) {
        haptic('success');
        return;
      }

      haptic('error');
      setError(
        result.retryAfterSeconds
          ? `Muitas tentativas. Aguarde ${result.retryAfterSeconds} segundos.`
          : 'PIN incorreto. Tente novamente.',
      );
      setPin('');
    } finally {
      setVerifying(false);
    }
  }, [pin, unlockWithPin, verifying]);

  useEffect(() => {
    if (pin.length === 4) void submitPin();
  }, [pin, submitPin]);

  const firstName = user?.userName.trim().split(/\s+/)[0] || 'você';

  return (
    <AuthScaffold
      eyebrow="MyMonthly"
      title={`Olá, ${firstName}.`}
      description="Digite seu PIN para continuar."
      footer={
        <Pressable
          accessibilityRole="button"
          disabled={recovering}
          onPress={() => {
            setRecovering(true);
            setError('');
            void recoverPin()
              .catch((requestError) => setError(authErrorMessage(requestError)))
              .finally(() => setRecovering(false));
          }}
        >
          <Text style={styles.link}>{recovering ? 'Enviando link…' : 'Esqueci meu PIN'}</Text>
        </Pressable>
      }
    >
      <PinInput
        autoFocus
        disabled={verifying || recovering}
        error={Boolean(error)}
        label="PIN para desbloquear"
        onChange={(value) => {
          setError('');
          setPin(value);
        }}
        value={pin}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" selectable style={styles.error}>
          {error}
        </Text>
      ) : (
        <Text style={styles.hint}>{verifying ? 'Verificando…' : '4 números'}</Text>
      )}

      <AuthButton
        disabled={pin.length !== 4}
        label="Entrar"
        loading={verifying}
        onPress={() => void submitPin()}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: '#696965',
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    color: '#B3263E',
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: '#6D12B5',
    fontSize: 14,
    fontWeight: '600',
    padding: 10,
  },
});
