import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

type Unit = 'cups' | 'tablespoons' | 'teaspoons' | 'milliliters' | 'grams' | 'ounces' | 'celsius' | 'fahrenheit';

const conversions: Record<Unit, Record<Unit, number | ((value: number) => number)>> = {
  cups: {
    cups: 1,
    tablespoons: 16,
    teaspoons: 48,
    milliliters: 236.588,
    grams: 236.588,
    ounces: 8,
  },
  tablespoons: {
    cups: 0.0625,
    tablespoons: 1,
    teaspoons: 3,
    milliliters: 14.7868,
    grams: 14.7868,
    ounces: 0.5,
  },
  teaspoons: {
    cups: 0.0208333,
    tablespoons: 0.333333,
    teaspoons: 1,
    milliliters: 4.92892,
    grams: 4.92892,
    ounces: 0.166667,
  },
  milliliters: {
    cups: 0.00422675,
    tablespoons: 0.067628,
    teaspoons: 0.202884,
    milliliters: 1,
    grams: 1,
    ounces: 0.033814,
  },
  grams: {
    cups: 0.00422675,
    tablespoons: 0.067628,
    teaspoons: 0.202884,
    milliliters: 1,
    grams: 1,
    ounces: 0.035274,
  },
  ounces: {
    cups: 0.125,
    tablespoons: 2,
    teaspoons: 6,
    milliliters: 29.5735,
    grams: 28.3495,
    ounces: 1,
  },
  celsius: {
    celsius: 1,
    fahrenheit: (c) => (c * 9/5) + 32,
  },
  fahrenheit: {
    celsius: (f) => (f - 32) * 5/9,
    fahrenheit: 1,
  },
};

export default function ConversionScreen() {
  const { theme, toggleTheme } = useTheme();
  const [amount, setAmount] = useState('');
  const [fromUnit, setFromUnit] = useState<Unit>('cups');
  const [toUnit, setToUnit] = useState<Unit>('tablespoons');
  const [isTemperature, setIsTemperature] = useState(false);

  const convert = (value: number, from: Unit, to: Unit): number => {
    const conversion = conversions[from][to];
    if (typeof conversion === 'function') {
      return conversion(value);
    }
    return value * conversion;
  };

  const result = amount ? convert(parseFloat(amount), fromUnit, toUnit).toFixed(2) : '0';

  const volumeUnits: Unit[] = ['cups', 'tablespoons', 'teaspoons', 'milliliters', 'grams', 'ounces'];
  const tempUnits: Unit[] = ['celsius', 'fahrenheit'];

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Logo size="medium" />
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Measurement Converter</Text>
          <View style={styles.themeToggle}>
            <Text style={styles.themeText}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isTemperature && styles.selectedToggle]}
            onPress={() => setIsTemperature(false)}
          >
            <Text style={[styles.toggleText, !isTemperature && styles.selectedToggleText]}>
              Volume
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isTemperature && styles.selectedToggle]}
            onPress={() => setIsTemperature(true)}
          >
            <Text style={[styles.toggleText, isTemperature && styles.selectedToggleText]}>
              Temperature
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
        />

        <Text style={styles.label}>From</Text>
        <View style={styles.unitContainer}>
          {(isTemperature ? tempUnits : volumeUnits).map(unit => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.unitButton,
                fromUnit === unit && styles.selectedUnit,
              ]}
              onPress={() => setFromUnit(unit)}
            >
              <Text
                style={[
                  styles.unitText,
                  fromUnit === unit && styles.selectedUnitText,
                ]}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>To</Text>
        <View style={styles.unitContainer}>
          {(isTemperature ? tempUnits : volumeUnits).map(unit => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.unitButton,
                toUnit === unit && styles.selectedUnit,
              ]}
              onPress={() => setToUnit(unit)}
            >
              <Text
                style={[
                  styles.unitText,
                  toUnit === unit && styles.selectedUnitText,
                ]}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {amount || '0'} {fromUnit} = {result} {toUnit}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Common Conversions</Text>
        <Text style={styles.commonText}>1 cup = 16 tablespoons</Text>
        <Text style={styles.commonText}>1 tablespoon = 3 teaspoons</Text>
        <Text style={styles.commonText}>1 cup = 236.6 ml</Text>
        <Text style={styles.commonText}>1 cup = 8 fluid ounces</Text>
        <Text style={styles.commonText}>0°C = 32°F</Text>
        <Text style={styles.commonText}>100°C = 212°F</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    color: theme === 'dark' ? '#fff' : '#333',
    marginRight: 8,
  },
  card: {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedToggle: {
    backgroundColor: theme === 'dark' ? '#FF6B6B' : '#FF6B6B',
  },
  toggleText: {
    color: theme === 'dark' ? '#fff' : '#666',
  },
  selectedToggleText: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme === 'dark' ? '#fff' : '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#333',
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedUnit: {
    backgroundColor: '#FF6B6B',
  },
  unitText: {
    color: theme === 'dark' ? '#fff' : '#666',
  },
  selectedUnitText: {
    color: '#fff',
  },
  resultContainer: {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme === 'dark' ? '#fff' : '#333',
  },
  commonText: {
    fontSize: 16,
    color: theme === 'dark' ? '#ccc' : '#666',
    marginBottom: 8,
  },
}); 