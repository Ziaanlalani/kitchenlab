import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('us');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const scrollRef = useRef<ScrollView>(null);
  const { theme } = useTheme();

  const apiKey = "AIzaSyCEcuY0wW7olsG_b4tOfXoEEtv9OGUxpvw";

  const welcomeMessages = [
    "Hi! I'm **Chef Gemini**, your AI kitchen buddy. What’s cooking today? 🍳",
    "Hello, hungry soul! Chef Gemini at your service — got a recipe in mind? 🍲",
    "Hey there! Ready to whip up something delicious together? 👩‍🍳",
    "Welcome to my digital kitchen! Ask me anything — from snacks to five-course meals. 🥘",
    "Smells like curiosity in here. What’s on the menu today? 🧁"
  ];

  // Layout animation for Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    const welcomeMessage = {
      sender: 'bot',
      text: welcomeMessages[randomIndex],
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getVoiceOptions = () => {
    switch (selectedVoice) {
      case 'uk':
        return { voice: 'com.apple.ttsbundle.Samantha-compact', language: 'en-GB' };
      case 'india':
        return { language: 'en-IN' };
      default:
        return { language: 'en-US' };
    }
  };

  const speakText = (text) => {
    const cleaned = text.replace(/([\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}])/gu, (emoji) => {
      return ` emoji `;
    });
    Speech.speak(cleaned, {
      ...getVoiceOptions(),
      onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
    });
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const prompt = `
      You are a professional kitchen assistant with deep culinary knowledge.
      Your goal is to provide detailed and friendly cooking advice, recipes, and guidance to users.
      If the user asks specialized cooking questions, respond as if you're a professional chef.
      Respond only with cooking-related information, and make sure your tone is fun, helpful, and informative.
      Do not discuss topics outside of cooking. If the user query is unrelated to kitchen topics, steer the conversation back to cooking.
      User query: ${userInput}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      const botMessage = { sender: 'bot', text: aiText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, I couldn\'t get a response right now. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const startListening = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = (e) => {
        console.error(e);
        setListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setTimeout(() => {
          sendMessage();
        }, 300);
      };      
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      alert("Voice input is only available in modern desktop browsers.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#ffffff' }]}>
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={() => speakText(messages[messages.length - 1]?.text || '')}>
          <Ionicons name="volume-high" size={24} color={theme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <Picker
          selectedValue={selectedVoice}
          onValueChange={setSelectedVoice}
          style={styles.picker}
        >
          <Picker.Item label="US (Male)" value="us" />
          <Picker.Item label="UK (Female)" value="uk" />
          <Picker.Item label="India (Female)" value="india" />
        </Picker>
        {Platform.OS === 'web' && (
          <TouchableOpacity onPress={startListening}>
            <Ionicons name="mic" size={24} color={listening ? 'red' : (theme === 'dark' ? 'white' : 'black')} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView ref={scrollRef} style={styles.chatBox}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={
              msg.sender === 'user'
                ? styles.userBubble
                : [styles.botBubble, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f2f2f2' }]
            }
          >
            <Text
              style={[
                styles.senderLabel,
                msg.sender === 'user' && { color: '#ffffff' },
                msg.sender === 'bot' && theme === 'dark' && { color: '#ffffff' },
              ]}
            >
              {msg.sender === 'user' ? 'You' : 'Chef Gemini'}:
            </Text>
            <Markdown style={msg.sender === 'user' ? markdownStylesUser : markdownStylesBot(theme)}>
              {msg.text}
            </Markdown>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.botBubble, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f2f2f2' }]}>
            <Text
              style={[
                styles.senderLabel,
                theme === 'dark' && { color: '#ffffff' },
              ]}
            >
              Chef Gemini:
            </Text>
            <Text style={{ color: theme === 'dark' ? '#eeeeee' : '#333333' }}>Typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type anything..."
          onSubmitEditing={sendMessage}
          placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
          style={[
            styles.input,
            {
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8',
              color: theme === 'dark' ? '#ffffff' : '#333333',
              borderColor: theme === 'dark' ? '#444' : '#ccc',
            },
          ]}
        />
        <Button title="Send" onPress={sendMessage} color="#ff6b6b" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    paddingHorizontal: 16,
  },
  chatBox: {
    flex: 1,
    marginBottom: 10,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
    gap: 12,
  },
  picker: {
    height: 30,
    width: 130,
    color: Platform.OS === 'web' ? '#333' : undefined,
  },
  userBubble: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  botBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  senderLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
  },
});

const markdownStylesUser = {
  body: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
};

const markdownStylesBot = (theme: 'light' | 'dark') => ({
  body: {
    color: theme === 'dark' ? '#eeeeee' : '#333333',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default Chat;
