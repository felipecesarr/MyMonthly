import { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import HeaderLogo from '../../components/headerLogo';
import { Colors } from '../../../constants/colors';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../../contexts/Auth';

export default function Profile() {
  const {
    user,
    signOut,
    deleteAccount,
    updateProfile,
    beginPinChange,
    lockApp,
  } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [whatsApp, setWhatsApp] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  async function loadUserProfile() {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setUserName(user.userName);
    setEmail(user.email);
    setWhatsApp(user.whatsApp);
    setIsLoading(false);
  }

  async function handleSaveProfile() {
    if (!user) return;
    
    if (!userName.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, informe seu nome.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        userName,
        whatsApp,
      });

      Alert.alert('Perfil atualizado', 'Suas informações foram atualizadas com sucesso.');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro ao atualizar', 'Não foi possível salvar suas informações.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Excluir conta',
      'Esta ação é permanente e todos os seus dados serão excluídos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir conta', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
            }
          }
        }
      ]
    );
  }

  function handleChangePin() {
    Alert.alert(
      'Alterar PIN',
      'Você criará um novo PIN de quatro dígitos para este aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: beginPinChange,
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.text} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HeaderLogo />

          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          
          <Text style={styles.headerText}>
            {isEditing ? 'Editar perfil' : `Olá, ${userName || 'Usuário'}`}
          </Text>
        </View>

        {isEditing ? (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputContainer}>
                <Feather name="user" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#999"
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  placeholder="Seu email"
                  placeholderTextColor="#999"
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
              <Text style={styles.inputHint}>
                Por segurança, a alteração de email exige uma confirmação separada.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={styles.inputContainer}>
                <Feather name="phone" size={18} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={whatsApp}
                  onChangeText={setWhatsApp}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
              </View>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setIsEditing(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="user" size={18} color="#666" />
                <Text style={styles.sectionTitle}>Informações pessoais</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome</Text>
                <Text style={styles.infoValue}>{userName || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email || 'Não informado'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WhatsApp</Text>
                <Text style={styles.infoValue}>{whatsApp || 'Não informado'}</Text>
              </View>

              <TouchableOpacity 
                style={styles.editProfileButton} 
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <Feather name="edit-2" size={16} color={Colors.text} />
                <Text style={styles.editProfileButtonText}>Editar informações</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="settings" size={18} color="#666" />
                <Text style={styles.sectionTitle}>Configurações</Text>
              </View>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={handleChangePin}
                activeOpacity={0.6}
              >
                <Feather name="hash" size={18} color="#666" />
                <Text style={styles.optionText}>Alterar PIN</Text>
                <Feather name="chevron-right" size={18} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={lockApp}
                activeOpacity={0.6}
              >
                <Feather name="lock" size={18} color="#666" />
                <Text style={styles.optionText}>Bloquear agora</Text>
                <Feather name="chevron-right" size={18} color="#ccc" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={signOut}
                activeOpacity={0.6}
              >
                <Feather name="log-out" size={18} color="#666" />
                <Text style={styles.optionText}>Sair da conta</Text>
                <Feather name="chevron-right" size={18} color="#ccc" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dangerSection}>
              <TouchableOpacity 
                style={styles.deleteAccountButton} 
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={18} color="#e53935" />
                <Text style={styles.deleteAccountText}>Excluir minha conta</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999'
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa'
  },
  contentContainer: {
    paddingBottom: 40
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 30,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '500',
    color: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    height: 50,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  readOnlyInput: {
    color: '#777',
  },
  inputHint: {
    color: '#888',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.text,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    height: 46,
    marginTop: 20,
  },
  editProfileButtonText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffe5e5',
    borderRadius: 12,
    height: 50,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(229,57,53,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  deleteAccountText: {
    color: '#e53935',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 8,
  },
});
