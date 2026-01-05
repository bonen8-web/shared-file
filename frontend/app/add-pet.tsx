import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import HealthPage from '../assets/images/health-page.png';

export default function AddPetScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  // States לבוחר תאריך
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // רשימת סוגי חיות
  const speciesOptions = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Guinea Pig', 'Turtle', 'Other'];

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  };

  // פתיחת בוחר התאריך
  const openDatePicker = () => {
    setTempDate(birthDate || new Date());
    setShowDatePicker(true);
  };

  // טיפול בשינוי תאריך
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setBirthDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  // אישור התאריך (iOS)
  const confirmDate = () => {
    setBirthDate(tempDate);
    setShowDatePicker(false);
  };

  // פורמט תאריך לתצוגה
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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

    // קביעת הסוג הסופי - אם בחרו "Other", משתמשים בטקסט שהוקלד
    const finalSpecies = species === 'Other' ? customSpecies.trim() : species;

    try {
      const { data } = await api.post('/api/pets', {
        user_id: userId,
        name: name.trim(),
        species: finalSpecies || null,
        breed: breed.trim() || null,
        gender: gender || null,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
      });

      if (Platform.OS === 'web') {
        alert('Pet added successfully!');
        router.back();
      } else {
        Alert.alert(
          'Pet Added Successfully!', 
          'Your pet has been added to your profile.',
          [
            {
              text: 'OK',
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
              <View style={styles.speciesContainer}>
                {speciesOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.speciesButton,
                      species === option && styles.speciesButtonActive
                    ]}
                    onPress={() => setSpecies(option)}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      species === option && styles.speciesButtonTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* שדה להקלדה חופשית אם בחרו "Other" */}
              {species === 'Other' && (
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  value={customSpecies}
                  onChangeText={setCustomSpecies}
                  placeholder="Enter species type"
                />
              )}
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
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 16,
                    width: '100%',
                  }}
                  value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : null)}
                />
              ) : (
                <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                  <Text style={styles.dateButtonText}>
                    {birthDate ? formatDate(birthDate) : 'Select birth date'}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* בוחר תאריך לאנדרואיד */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* מודל בוחר תאריך ל-iOS */}
            {Platform.OS === 'ios' && (
              <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={confirmDate}>
                        <Text style={styles.modalDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  </View>
                </View>
              </Modal>
            )}

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
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  speciesButtonActive: {
    backgroundColor: '#6ED29A',
    borderColor: '#6ED29A',
  },
  speciesButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  speciesButtonTextActive: {
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
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalDone: {
    fontSize: 16,
    color: '#6ED29A',
    fontWeight: '600',
  },
});


