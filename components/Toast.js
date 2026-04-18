import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── The visual Toast component (internal) ────────────────────────────────────
const ToastItem = forwardRef((_, ref) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type,    setType]    = useState('success');
  const timerRef  = useRef(null);

  const config = {
    success: { color: '#10b981', icon: <Ionicons name="checkmark-circle" size={22} color="white" /> },
    error:   { color: '#ef4444', icon: <MaterialCommunityIcons name="close-circle" size={22} color="white" /> },
    warning: { color: '#f59e0b', icon: <Ionicons name="warning" size={22} color="white" /> },
    info:    { color: '#3b82f6', icon: <Ionicons name="information-circle" size={22} color="white" /> },
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 300, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  const show = (msg, toastType = 'success', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    translateY.setValue(-100);
    opacity.setValue(0);

    setMessage(msg);
    setType(toastType);
    setVisible(true);

    Animated.parallel([
      Animated.timing(translateY, { toValue: 10, duration: 400, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 1,  duration: 400, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(hide, duration);
  };

  useImperativeHandle(ref, () => ({ show, hide }));

  if (!visible) return null;

  const theme = config[type] || config.success;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.color, opacity, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.iconContainer}>{theme.icon}</View>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  container: {
    width: width * 0.92,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    pointerEvents: 'auto',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
});

// ─── Singleton ref ─────────────────────────────────────────────────────────────
const toastRef = React.createRef();

export const toast = {
  show:    (message, type = 'success', duration = 3000) => toastRef.current?.show(message, type, duration),
  success: (message, duration = 3000) => toastRef.current?.show(message, 'success', duration),
  error:   (message, duration = 4000) => toastRef.current?.show(message, 'error',   duration),
  warning: (message, duration = 3500) => toastRef.current?.show(message, 'warning', duration),
  info:    (message, duration = 3000) => toastRef.current?.show(message, 'info',    duration),
};

// ─── Mount once at app root ───────────────────────────────────────────────────
export const ToastProvider = () => <ToastItem ref={toastRef} />;

export default toast;