import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Pressable,
  Image,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
  PanResponder
} from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface DemoModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const DemoModal: React.FC<DemoModalProps> = ({ visible, onClose }) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Adicione suas contas bancárias e/ou cartões', completed: false },
    { id: '2', text: 'Adicione suas subcategorias e orçamentos das categorias', completed: false },
    { id: '3', text: 'Adicione suas subcategorias de receitas', completed: false },
    { id: '4', text: 'Adicione suas primeiras transações do dia', completed: false },
    { id: '5', text: 'Conheça seu orçamento e acompanhe suas finanças!', completed: false },
  ]);
  const [minimized, setMinimized] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const miniPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const miniScale = useRef(new Animated.Value(1)).current;
  const viewRef = useRef<View>(null);
  
  // Calculate completion percentage
  const completionPercentage = Math.floor(
    (items.filter(item => item.completed).length / items.length) * 100
  );
  
  // Auto-close when 100% complete
  useEffect(() => {
    if (completionPercentage === 100) {
      // Show completion for a moment before closing
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [completionPercentage, onClose]);
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
      setMinimized(false);
    }
  }, [visible]);
  
  // Create pan responder for draggable mini checklist
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(miniScale, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: miniPosition.x, dy: miniPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(miniScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        
        // Snap to edges if near
        let newX = gestureState.moveX - 30;
        let newY = gestureState.moveY - 30;
        
        // Adjust to keep within screen bounds
        if (newX < 10) newX = 10;
        if (newX > width - 70) newX = width - 70;
        if (newY < 50) newY = 50;
        if (newY > height - 70) newY = height - 70;
        
        Animated.spring(miniPosition, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5
        }).start();
      }
    })
  ).current;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDownload = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('Compartilhamento não está disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6
    }).start();
  };
  
  const handleMinimize = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMinimized(true);
      // Reset position to a good default when minimizing
      miniPosition.setValue({ x: width - 80, y: 100 });
    });
  };
  
  const handleMaximize = () => {
    setMinimized(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Render miniature floating checklist when minimized
  if (minimized && visible) {
    return (
      <Animated.View
        style={[
          styles.miniChecklist,
          {
            transform: [
              { translateX: miniPosition.x },
              { translateY: miniPosition.y },
              { scale: miniScale }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableWithoutFeedback onPress={handleMaximize}>
          <View style={styles.miniContent}>
            <View style={styles.miniProgressContainer}>
              <View style={styles.miniProgressBar}>
                <Animated.View 
                  style={[
                    styles.miniProgressFill, 
                    { width: `${completionPercentage}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.miniText}>{completionPercentage}%</Text>
            <MaterialIcons name="checklist" size={18} color={Colors.homeBold} />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height * 0.5, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View ref={viewRef} style={styles.contentContainer}>
                <View style={styles.header}>
                  <Image 
                    source={require('../../../../assets/onboardingScreens/logo.png')}
                    style={styles.logoImage}
                  />
                  <View style={styles.headerButtons}>
                    <TouchableOpacity 
                      style={styles.minimizeButton} 
                      onPress={handleMinimize}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove-outline" size={24} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.title}>Bem-vindo ao MyMonthly!</Text>
                  
                  <Text style={styles.subHeader}>
                    Antes de começar organizar suas finanças, faça esse checklist:
                  </Text>
                  
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBar}>
                        <Animated.View 
                          style={[
                            styles.progressFill, 
                            { width: `${completionPercentage}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    <Text style={styles.progressText}>
                      <Text style={styles.progressPercentage}>{completionPercentage}%</Text> concluído
                    </Text>
                  </View>
                  
                  {items.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemContainer,
                        { marginBottom: index === items.length - 1 ? 8 : 12 }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => toggleItem(item.id)}
                    >
                      <View style={[
                        styles.checkbox,
                        item.completed && styles.checkboxCompleted
                      ]}>
                        {item.completed && (
                          <AntDesign name="check" size={14} color="#FFF" />
                        )}
                      </View>
                      <Text style={[
                        styles.itemText,
                        item.completed && styles.itemTextCompleted
                      ]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <View style={styles.buttonContainer}>
                  <Animated.View 
                    style={[
                      { transform: [{ scale: buttonScaleAnim }] }
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={onClose}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      style={styles.customButton}
                    >
                      <Text style={styles.buttonText}>Entendi!</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.82 : height * 0.85,
    maxHeight: '95%',
    backgroundColor: Colors.background,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBack,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonBack: {
    height: 40,
    width: 40,
    backgroundColor: Colors.backgroundIcons,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  logoImage: {
    height: 36,
    width: 36,
    resizeMode: 'contain',
  },
  downloadButton: {
    height: 40,
    width: 40,
    backgroundColor: Colors.backgroundIcons,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  minimizeButton: {
    height: 40,
    width: 40,
    backgroundColor: Colors.backgroundIcons,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
    color: Colors.text,
  },
  subHeader: {
    fontSize: Math.min(16, width * 0.04),
    marginBottom: 30,
    textAlign: 'center',
    color: Colors.text,
    fontWeight: '500',
    paddingHorizontal: width * 0.03,
  },
  subObs: {
    fontSize: Math.min(13, width * 0.035),
    marginBottom: 26,
    textAlign: 'center',
    color: Colors.incomeBold,
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    padding: 2,
    backgroundColor: Colors.grayBack,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.homePrimary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  progressPercentage: {
    fontWeight: '600',
    color: Colors.homeBold,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.grayBack,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.text,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.homePrimary,
    borderColor: Colors.homePrimary,
  },
  itemText: {
    fontSize: Math.min(16, width * 0.04),
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.gray95,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: width * 0.05,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 12,
  },
  customButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.homePrimary,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.homeBold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Mini floating checklist styles
  miniChecklist: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    shadowColor: Colors.homeBold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  miniContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.homeProgress,
    padding: 6,
  },
  miniProgressContainer: {
    width: '80%',
    marginBottom: 4,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.grayBack,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: Colors.homePrimary,
    borderRadius: 2,
  },
  miniText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.homeBold,
    marginBottom: 2,
  },
});

export default DemoModal;