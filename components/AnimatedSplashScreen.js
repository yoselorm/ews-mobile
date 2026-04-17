import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function AnimatedSplashScreen({ onFinish }) {
  // Use useRef for Animated.Values to keep them persistent
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo Sequence: Fade in, stay, then fade out
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true, // Uses GPU for smooth performance
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      // Wait for a bit
      Animated.delay(1800),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Underline grows (Cannot useNativeDriver for width, so use transform instead)
    Animated.delay(700).start(() => {
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false, // Width/height don't support native driver
      }).start();
    });

    // Tagline fades in
    Animated.delay(1000).start(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    const timer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Use Animated.View instead of Animated.View from reanimated */}
      <Animated.View 
        style={[
          styles.logoWrapper, 
          { 
            opacity: opacity, 
            transform: [{ scale: scale }] 
          }
        ]}
      >
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>EWS</Text>
        </View>

        <Text style={styles.appName}>Early Warning</Text>
        <Text style={styles.appNameAccent}>System</Text>

        <Animated.View 
          style={[
            styles.underline, 
            { 
              width: lineWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '60%']
              }) 
            }
          ]} 
        />
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Stay ahead. Stay safe.
      </Animated.Text>

      <Animated.Text style={[styles.footer, { opacity: taglineOpacity }]}>
        Powered by Precision GIS & Technology
      </Animated.Text>
    </View>
  );
}

// ... styles remain the same as your previous code

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
  },
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  iconText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 2,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 1,
  },
  appNameAccent: {
    fontSize: 32,
    fontWeight: "700",
    color: "#22c55e",
    letterSpacing: 1,
    marginTop: -6,
  },
  underline: {
    height: 3,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    marginTop: 10,
  },
  tagline: {
    marginTop: 24,
    fontSize: 14,
    color: "#6b7280",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 48,
    fontSize: 12,
    color: "#d1d5db",
    letterSpacing: 1,
  },
});