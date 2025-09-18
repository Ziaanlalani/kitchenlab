import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';

export default function LoadingScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Logo size="large" />
      <Text style={styles.title}>KitchenLab</Text>
      <Text style={styles.subtitle}>Your Kitchen Companion</Text>
      <ActivityIndicator 
        size="large" 
        color={theme === 'dark' ? '#FF6B6B' : '#FF6B6B'} 
        style={styles.loader}
      />
    </View>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: theme === 'dark' ? '#ccc' : '#666',
    marginTop: 8,
  },
  loader: {
    marginTop: 32,
  },
}); 