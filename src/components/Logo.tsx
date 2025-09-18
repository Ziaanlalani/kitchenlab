import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48,
  };

  const fontSizeMap = {
    small: 16,
    medium: 20,
    large: 28,
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="flask"
          size={sizeMap[size]}
          color="#FF6B6B"
        />
        <MaterialCommunityIcons
          name="food"
          size={sizeMap[size]}
          color="#FF6B6B"
          style={styles.foodIcon}
        />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: fontSizeMap[size] }]}>
          KitchenLab
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodIcon: {
    marginLeft: -8,
  },
  text: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
}); 