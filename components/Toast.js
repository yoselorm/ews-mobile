import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Bulletproof message formatter ─────────────────────────────────────────────
// Recursively digs into ANY shape (Error, Axios error, validation-errors object,
// arrays, nested objects, numbers, booleans, null/undefined) and guarantees
// a plain, renderable string comes out the other end. Never returns non-string.
const formatMessage = (msg, depth = 0) => {
  // Hard stop against accidental infinite recursion from circular/self-referential objects
  if (depth > 5) return 'Something went wrong';

  if (msg === null || msg === undefined) return 'Something went wrong';

  if (typeof msg === 'string') return msg.trim() || 'Something went wrong';

  if (typeof msg === 'number' || typeof msg === 'boolean') return String(msg);

  if (msg instanceof Error) {
    return typeof msg.message === 'string' && msg.message.trim()
      ? msg.message
      : 'Something went wrong';
  }

  if (Array.isArray(msg)) {
    const parts = msg.map((m) => formatMessage(m, depth + 1)).filter(Boolean);
    return parts.length ? parts.join(', ') : 'Something went wrong';
  }

  if (typeof msg === 'object') {
    // Common API error shapes, checked in priority order.
    // Each candidate is re-run through formatMessage in case it's ALSO
    // an object/array instead of a plain string (e.g. Laravel-style
    // { message: { field: ["error"] } } validation payloads).
    const candidates = [
      msg?.response?.data?.message,
      msg?.response?.data?.error,
      msg?.response?.data?.errors,
      msg?.data?.message,
      msg?.error,
      msg?.message,
    ];

    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        return formatMessage(candidate, depth + 1);
      }
    }

    // Last resort: try to serialize the object so at least something
    // legible shows up, rather than crashing or showing nothing.
    try {
      const json = JSON.stringify(msg);
      // Avoid dumping a giant/ugly blob into the UI
      return json && json !== '{}' ? 'Something went wrong' : 'Something went wrong';
    } catch {
      return 'Something went wrong';
    }
  }

  return 'Something went wrong';
};

// Final safety net used only at the render site — guarantees <Text> NEVER
// receives anything but a primitive string, no matter what slipped through above.
const toSafeString = (value) => {
  if (typeof value === 'string') return value;
  try {
    return String(value ?? 'Something went wrong');
  } catch {
    return 'Something went wrong';
  }
};

// ─── The visual Toast component (internal) ────────────────────────────────────
const ToastItem = forwardRef((_, ref) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.96)).current;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type,    setType]    = useState('success');
  const timerRef = useRef(null);
  const animRef  = useRef(null);

  const config = {
    success: { color: '#10b981', icon: <Ionicons name="checkmark-circle" size={20} color="white" /> },
    error:   { color: '#ef4444', icon: <MaterialCommunityIcons name="close-circle" size={20} color="white" /> },
    warning: { color: '#f59e0b', icon: <Ionicons name="warning" size={20} color="white" /> },
    info:    { color: '#3b82f6', icon: <Ionicons name="information-circle" size={20} color="white" /> },
  };

  const hide = () => {
    if (animRef.current) animRef.current.stop();
    animRef.current = Animated.timing(opacity, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    });
    animRef.current.start(({ finished }) => {
      if (finished) setVisible(false);
    });
  };

  const show = (msg, toastType = 'success', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animRef.current) animRef.current.stop();

    opacity.setValue(0);
    scale.setValue(0.96);

    // Defensive even against a bad `toastType` — fall back to 'success' theme
    // rather than letting `config[type]` resolve to undefined downstream.
    const safeType = typeof toastType === 'string' && config[toastType] ? toastType : 'success';
    const safeDuration = typeof duration === 'number' && duration > 0 ? duration : 3000;

    let safeMessage;
    try {
      safeMessage = formatMessage(msg);
    } catch {
      safeMessage = 'Something went wrong';
    }

    setMessage(safeMessage);
    setType(safeType);
    setVisible(true);

    animRef.current = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, friction: 8 }),
    ]);
    animRef.current.start();

    timerRef.current = setTimeout(hide, safeDuration);
  };

  useImperativeHandle(ref, () => ({ show, hide }));

  if (!visible) return null;

  const theme = config[type] || config.success;
  const displayMessage = toSafeString(message);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconContainer}>{theme.icon}</View>
        <Text style={styles.text} numberOfLines={2}>{displayMessage}</Text>
      </Animated.View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  container: {
    width: width * 0.9,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
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
  show: (message, type = 'success', duration = 3000) => {
    if (!toastRef.current) {
      console.warn('[toast] ToastProvider is not mounted yet — message dropped:', message);
      return;
    }
    try {
      toastRef.current.show(message, type, duration);
    } catch (e) {
      // Absolute last line of defense: never let a toast call crash the app.
      console.error('[toast] Failed to show toast:', e);
    }
  },
  success: (message, duration = 3000) => toast.show(message, 'success', duration),
  error:   (message, duration = 4000) => toast.show(message, 'error',   duration),
  warning: (message, duration = 3500) => toast.show(message, 'warning', duration),
  info:    (message, duration = 3000) => toast.show(message, 'info',    duration),
};

// ─── Mount once at app root ───────────────────────────────────────────────────
export const ToastProvider = () => <ToastItem ref={toastRef} />;

export default toast;