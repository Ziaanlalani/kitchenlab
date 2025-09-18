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
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const recognitionRef = useRef(null);
  const scrollRef = useRef<ScrollView>(null);
  
  const { theme } = useTheme();
  const pinnedMessageRef = useRef(null); // Reference for the pinned message
  const [mood, setMood] = useState('cheerful'); // Default mood is cheerful
  
  const apiKey = "AIzaSyCEcuY0wW7olsG_b4tOfXoEEtv9OGUxpvw";

  // Layout animation for Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  
  useEffect(() => {
    const welcomeMessagesByMood = {
      cheerful: [
        "Hi! I'm **Chef Gemini**, your AI kitchen buddy. What’s cooking today? 🍳",
        "Hello, hungry soul! Chef Gemini at your service — got a recipe in mind? 🍲",
        "Hey there! Ready to whip up something delicious together? 👩‍🍳"
      ],
      friendly: [
        "Hey there! Chef Gemini here to help you feel right at home in the kitchen. 😊",
        "Welcome! Let's cook something cozy and comforting today. 🍲",
        "Hi! I’m here to guide you through any recipe, no pressure. 👋"
      ],
      professional: [
        "Greetings. I am Chef Gemini, your culinary assistant. How may I assist you today?",
        "Hello. Ready to explore precise, expert-level cooking together?",
        "Welcome. I'm here to provide you with accurate and professional cooking advice."
      ],
    };
  
    const selectedWelcomeMessages = welcomeMessagesByMood[mood];
    const randomIndex = Math.floor(Math.random() * selectedWelcomeMessages.length);
    const welcomeMessage = {
      sender: 'bot',
      text: selectedWelcomeMessages[randomIndex],
    };
    setMessages([welcomeMessage]);
  }, [mood]);
  
  
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
      return  emoji ;
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
  
    // Adjust the prompt based on mood
    const moodPrompts = {
      cheerful: "You are a friendly and upbeat kitchen assistant, always enthusiastic about helping users with cooking. Respond with a cheerful and positive tone, making the user feel excited about cooking.",
      friendly: "You are a warm and welcoming kitchen assistant. Respond with a friendly and approachable tone, creating a sense of comfort for the user.",
      professional: "You are a professional and knowledgeable kitchen assistant. Your responses should be clear, formal, and focused on providing precise cooking advice."
    };
  
    const prompt = `You are a professional kitchen assistant with deep culinary knowledge. ${moodPrompts[mood]} User query: ${userInput}`;
  
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
  

  const pinMessage = (message, index) => {
    setPinnedMessages([message]);
    setTimeout(() => {
      pinnedMessageRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to pinned message
    }, 100); // Allow time for the message to be added before scrolling
  };
  
  const unpinMessage = (index) => {
    setPinnedMessages(prev => prev.filter((_, i) => i !== index));
  };

  const startListening = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false; // Don't send results until speech has finished
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = (e) => {
        console.error(e);
        setListening(false);
      };
      
      // This will run when speech is detected
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript); // Update the text input with the captured speech
  
        // Automatically send the message after voice input
        sendMessage(); // This will automatically send the message when the voice input ends
      };
  
      recognition.start(); // Start listening
      recognitionRef.current = recognition; // Store the reference for future use
    } else {
      alert("Voice input is only available in modern desktop browsers.");
    }
  };
  

  const handleQuickReply = (reply) => {
    setUserInput(reply);
    sendMessage();
  };

  const getMoodButtonStyle = (moodType) => {
    const isSelected = mood === moodType;
  
    const baseColorLight = isSelected ? '#d0d0d0' : '#f0f0f0'; // light mode
    const baseColorDark = isSelected ? '#2b2b2b' : '#3a3a3a';   // dark mode
  
    return {
      backgroundColor: theme === 'dark' ? baseColorDark : baseColorLight,
      padding: 12,
      borderRadius: 4, // square corners
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    };
  };  

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#ffffff' }]}>
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <View style={styles.pinnedMessagesContainer}>
          {pinnedMessages.map((msg, index) => (
            <View ref={pinnedMessageRef} key={index} style={styles.pinnedMessage}>
              <Text style={[styles.senderLabel, { fontSize: 14, color: '#ffffff' }]}>{msg.sender === 'user' ? 'You' : 'Chef Gemini'}:</Text>
              <ScrollView style={styles.pinnedMessageContent} nestedScrollEnabled={true}>
                <Markdown style={markdownStylesUser}>{msg.text}</Markdown>
              </ScrollView>
              <TouchableOpacity onPress={() => unpinMessage(index)}>
                <Ionicons name="pin" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}


      <View style={styles.headerControls}>
        <TouchableOpacity onPress={() => speakText(messages[messages.length - 1]?.text || '')}>
          <Ionicons name="volume-high" size={24} color={theme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <Picker selectedValue={selectedVoice} onValueChange={setSelectedVoice} style={styles.picker}>
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

      <View style={styles.moodControls}>
        {['cheerful', 'friendly', 'professional'].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMood(m)}
            style={getMoodButtonStyle(m)}
          >
            <Text style={{ color: theme === 'dark' ? 'white' : 'black' }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      <ScrollView ref={scrollRef} style={styles.chatBox}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={msg.sender === 'user'
              ? styles.userBubble
              : [styles.botBubble, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f2f2f2' }]} >
            <Text
              style={[styles.senderLabel, msg.sender === 'user' && { color: '#ffffff' }, msg.sender === 'bot' && theme === 'dark' && { color: '#ffffff' }]}>
              {msg.sender === 'user' ? 'You' : 'Chef Gemini'}:
            </Text>
            <Markdown style={msg.sender === 'user' ? markdownStylesUser : markdownStylesBot(theme)}>
              {msg.text}
            </Markdown>
            <TouchableOpacity onPress={() => pinMessage(msg, index)} style={styles.pinButton}>
              <Ionicons name="pin" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.botBubble, { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f2f2f2' }]}>
            <Text style={[styles.senderLabel, theme === 'dark' && { color: '#ffffff' }]}>
              Chef Gemini:
            </Text>
            <Text style={{ color: theme === 'dark' ? '#eeeeee' : '#333333' }}>Typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <View style={styles.quickRepliesContainer}>
        <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply('What can I cook today?')}>
          <Text style={styles.quickReplyText}>What can I cook today?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply('Give me a snack recipe')}>
          <Text style={styles.quickReplyText}>Give me a snack recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply('I need dessert ideas')}>
          <Text style={styles.quickReplyText}>I need dessert ideas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type anything..."
          onSubmitEditing={sendMessage}
          placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
          style={[styles.input, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8', color: theme === 'dark' ? '#ffffff' : '#333333' }]}
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
  pinnedMessagesContainer: {
    backgroundColor: '#444',
    padding: 10,
    marginBottom: 10,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  pinnedMessage: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: 'column',  // Keep the message content in a column
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    maxWidth: '100%',
    flexWrap: 'wrap',
    maxHeight: 120, // Adjust the maxHeight to prevent overflow
    overflow: 'hidden', // Hide overflow content
    position: 'relative',  // Important for positioning the pin icon
  },
  pinnedMessageContent: {
    maxHeight: 100,  // Fixed max height for pinned message content
    overflow: 'auto', // Allow scroll if the content exceeds maxHeight
    paddingRight: 10, // For a little spacing if the content scrolls
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
  pinButton: {
    position: 'absolute',
    top: 4, // Move the pin icon closer to the top
    right: 4, // Move the pin icon to the right
    padding: 3, // Smaller padding
  },

  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  quickReplyButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    margin: 5,
  },
  quickReplyText: {
    color: 'white',
    fontWeight: 'bold',
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
  moodControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
  },
  moodButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 20,
  },
  moodButtonText: {
    color: 'white',
    fontWeight: 'bold',
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