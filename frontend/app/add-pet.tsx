import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HealthPage from '../assets/images/Health Page.png';

export default function AddPetScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  };

  const handleAddPet = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a pet name');
      } else {
        Alert.alert('Error', 'Please enter a pet name');
      }
      return;
    }

    try {
      const { data } = await api.post('/pets', {
        user_id: userId,
        name: name.trim(),
        species: species.trim() || null,
        breed: breed.trim() || null,
        gender: gender || null,
        birth_date: birthDate || null,
      });

      // הצגת קוד השיתוף למשתמש
      const shareCode = data.share_code;
      if (Platform.OS === 'web') {
        alert(`Pet added successfully!\n\nShare Code: ${shareCode}\n\nSave this code to share your pet with others!`);
      } else {
        Alert.alert(
          'Pet Added Successfully! 🎉', 
          `Your pet's share code is:\n\n${shareCode}\n\nShare this code with family members so they can also access your pet's profile.`,
          [
            {
              text: 'Copy & Continue',
              onPress: () => router.back(),
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error adding pet:', error);
      const message = error.response?.data?.message || 'Network error. Please try again.';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={HealthPage}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>Add New Pet</Text>

        {/* טופס הוספה */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter pet name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <TextInput
                style={styles.input}
                value={species}
                onChangeText={setSpecies}
                placeholder="e.g. Dog, Cat, Bird"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="e.g. Golden Retriever"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={[styles.genderButtonText, gender === 'Male' && styles.genderButtonTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={[styles.genderButtonText, gender === 'Female' && styles.genderButtonTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date</Text>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddPet}>
              <Text style={styles.submitButtonText}>Add Pet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D9E5EF',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6ED29A',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#6ED29A',
    borderColor: '#6ED29A',
  },
  genderButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6ED29A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


