import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

interface Note {
  id: string;
  text: string;
  isFavorite: boolean;
  createdAt: Date;
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
  };
  isRecipe: boolean;
  ingredients?: string[];
  instructions?: string[];
  image?: string;
}

const defaultStyle = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: 16,
};

const stylePresets = [
  { name: 'Default', style: defaultStyle },
  { name: 'Recipe', style: { backgroundColor: '#FFF5E6', textColor: '#333333', fontSize: 16 } },
  { name: 'Shopping', style: { backgroundColor: '#E6F7FF', textColor: '#333333', fontSize: 16 } },
  { name: 'Important', style: { backgroundColor: '#FFE6E6', textColor: '#333333', fontSize: 16 } },
];

export default function NotesScreen() {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isStyleModalVisible, setIsStyleModalVisible] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [isRecipe, setIsRecipe] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        isFavorite: false,
        createdAt: new Date(),
        style: selectedStyle,
        isRecipe,
        ingredients: isRecipe ? ingredients.filter(i => i.trim()) : undefined,
        instructions: isRecipe ? instructions.filter(i => i.trim()) : undefined,
      };
      setNotes(prevNotes => [note, ...prevNotes]);
      setNewNote('');
      setSelectedStyle(defaultStyle);
      setIsRecipe(false);
      setIngredients(['']);
      setInstructions(['']);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle the selected image
      // You'll need to implement image storage logic here
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const toggleFavorite = (id: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="medium" />
        <Text style={styles.headerText}>Kitchen Notes</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: selectedStyle.backgroundColor }]}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Add a new note..."
          placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
          multiline
        />
        <TouchableOpacity
          style={styles.styleButton}
          onPress={() => setIsStyleModalVisible(true)}
        >
          <MaterialCommunityIcons name="palette" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.styleButton, isRecipe && styles.activeButton]}
          onPress={() => setIsRecipe(!isRecipe)}
        >
          <MaterialCommunityIcons name="food" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isRecipe && (
        <View style={styles.recipeContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ingredient, index) => (
            <TextInput
              key={index}
              style={styles.recipeInput}
              value={ingredient}
              onChangeText={(value) => updateIngredient(index, value)}
              placeholder={`Ingredient ${index + 1}`}
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            />
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={addIngredient}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addItemText}>Add Ingredient</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Instructions</Text>
          {instructions.map((instruction, index) => (
            <TextInput
              key={index}
              style={styles.recipeInput}
              value={instruction}
              onChangeText={(value) => updateInstruction(index, value)}
              placeholder={`Step ${index + 1}`}
              placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
              multiline
            />
          ))}
          <TouchableOpacity style={styles.addItemButton} onPress={addInstruction}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addItemText}>Add Step</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <MaterialCommunityIcons name="image-plus" size={24} color="#fff" />
            <Text style={styles.imageButtonText}>Add Recipe Image</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isStyleModalVisible}
        onRequestClose={() => setIsStyleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Note Style</Text>
            {stylePresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.styleOption,
                  { backgroundColor: preset.style.backgroundColor },
                ]}
                onPress={() => {
                  setSelectedStyle(preset.style);
                  setIsStyleModalVisible(false);
                }}
              >
                <Text style={{ color: preset.style.textColor }}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsStyleModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.notesContainer}>
        {notes
          .sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) {
              return a.isFavorite ? -1 : 1;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
          })
          .map(note => (
            <View
              key={note.id}
              style={[
                styles.noteCard,
                { backgroundColor: note.style.backgroundColor },
              ]}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.dateText, { color: note.style.textColor }]}>
                  {formatDate(note.createdAt)}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(note.id)}
                  style={styles.favoriteButton}
                >
                  <MaterialCommunityIcons
                    name={note.isFavorite ? 'star' : 'star-outline'}
                    size={24}
                    color={note.isFavorite ? '#FFD700' : note.style.textColor}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.noteText, { color: note.style.textColor, fontSize: note.style.fontSize }]}>
                {note.text}
              </Text>
              {note.isRecipe && (
                <View style={styles.recipeDetails}>
                  <Text style={[styles.recipeTitle, { color: note.style.textColor }]}>
                    Ingredients:
                  </Text>
                  {note.ingredients?.map((ingredient, index) => (
                    <Text key={index} style={[styles.recipeItem, { color: note.style.textColor }]}>
                      • {ingredient}
                    </Text>
                  ))}
                  <Text style={[styles.recipeTitle, { color: note.style.textColor }]}>
                    Instructions:
                  </Text>
                  {note.instructions?.map((instruction, index) => (
                    <Text key={index} style={[styles.recipeItem, { color: note.style.textColor }]}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNote(note.id)}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={20}
                  color={note.style.textColor}
                />
              </TouchableOpacity>
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#333',
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    minHeight: 50,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContainer: {
    flex: 1,
  },
  noteCard: {
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
  favoriteNote: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: theme === 'dark' ? '#888' : '#666',
  },
  favoriteButton: {
    padding: 4,
  },
  noteText: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#333',
    marginBottom: 8,
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: 4,
  },
  styleButton: {
    backgroundColor: '#666',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF6B6B',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
    marginBottom: 16,
  },
  styleOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recipeContainer: {
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#333',
    marginBottom: 8,
  },
  recipeInput: {
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    color: theme === 'dark' ? '#fff' : '#333',
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  addItemText: {
    color: '#fff',
    marginLeft: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  imageButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  recipeDetails: {
    marginTop: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  recipeItem: {
    fontSize: 14,
    marginLeft: 8,
    marginTop: 4,
  },
}); 