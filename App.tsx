import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider } from './src/context/ThemeContext';
import ConversionScreen from './src/screens/ConversionScreen';
import TimerScreen from './src/screens/TimerScreen';
import NotesScreen from './src/screens/NotesScreen';
import ChatScreen from './src/screens/ChatScreen'


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FF6B6B',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#eee',
            },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Converter"
            component={ConversionScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="scale" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Timer"
            component={TimerScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="timer" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Notes"
            component={NotesScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="notebook" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
          name="ChatBot"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="robot" size={size} color={color} />
            ),
          }}
        />

        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 