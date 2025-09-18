import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';

interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
}

export default function TimerScreen() {
  const { theme } = useTheme();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState('');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(currentTimers =>
        currentTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (time === 0 && isRunning) {
      setIsRunning(false);
      playAlarm();
    }
  }, [time, isRunning]);

  const addTimer = () => {
    if (!newTimerName || !newTimerMinutes) return;
    
    const duration = parseInt(newTimerMinutes) * 60;
    const newTimer: Timer = {
      id: Date.now().toString(),
      name: newTimerName,
      duration: duration,
      remaining: duration,
      isRunning: false,
    };

    setTimers([...timers, newTimer]);
    setNewTimerName('');
    setNewTimerMinutes('');
  };

  const toggleTimer = (id: string) => {
    setTimers(currentTimers =>
      currentTimers.map(timer =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers(currentTimers =>
      currentTimers.map(timer =>
        timer.id === id ? { ...timer, remaining: timer.duration, isRunning: false } : timer
      )
    );
  };

  const deleteTimer = (id: string) => {
    setTimers(currentTimers => currentTimers.filter(timer => timer.id !== id));
  };

  const playAlarm = async () => {
    try {
      const { sound: alarmSound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3')
      );
      setSound(alarmSound);
      await alarmSound.playAsync();
      Vibration.vibrate([500, 500, 500]); // Vibrate pattern: vibrate, pause, vibrate, pause, vibrate
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const addTime = (minutes: number) => {
    setTime(prevTime => prevTime + minutes * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="medium" />
        <Text style={styles.headerText}>Kitchen Timer</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => addTime(1)}
        >
          <Text style={styles.buttonText}>+1 min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => addTime(5)}
        >
          <Text style={styles.buttonText}>+5 min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => addTime(10)}
        >
          <Text style={styles.buttonText}>+10 min</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={startTimer}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopTimer}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={() => {
            stopTimer();
            setTime(0);
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Timer name"
          value={newTimerName}
          onChangeText={setNewTimerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Minutes"
          value={newTimerMinutes}
          onChangeText={setNewTimerMinutes}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTimer}>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.timerList}>
        {timers.map(timer => (
          <View key={timer.id} style={styles.timerItem}>
            <View style={styles.timerInfo}>
              <Text style={styles.timerName}>{timer.name}</Text>
              <Text style={styles.timerTime}>{formatTime(timer.remaining)}</Text>
            </View>
            <View style={styles.timerControls}>
              <TouchableOpacity onPress={() => toggleTimer(timer.id)}>
                <MaterialCommunityIcons
                  name={timer.isRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FF6B6B"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => resetTimer(timer.id)}>
                <MaterialCommunityIcons name="restart" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTimer(timer.id)}>
                <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
    marginTop: 8,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF5252',
  },
  resetButton: {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
  },
  buttonText: {
    color: theme === 'dark' ? '#fff' : '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  timerList: {
    flex: 1,
  },
  timerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  timerInfo: {
    flex: 1,
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timerTime: {
    fontSize: 20,
    color: '#666',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
}); 