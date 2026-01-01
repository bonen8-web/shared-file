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
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UpdateDataScreen from '../assets/images/Update data screen.png';

export default function UpdateMedicalInfoScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  
  const [userId, setUserId] = useState<number | null>(null);
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [lastCheckup, setLastCheckup] = useState('');
  const [nextCheckup, setNextCheckup] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadUserId();
    if (petId) {
      fetchExistingData();
    }
  }, [petId]);

  const loadUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  };

  const fetchExistingData = async () => {
    try {
      const { data } = await api.get(`/api/pets/${petId}/medical-info`);
      if (data.medical_info) {
        const info = data.medical_info;
        setWeight(info.weight ? String(info.weight) : '');
        setAllergies(info.allergies || '');
        setMedications(info.medications || '');
        setConditions(info.conditions || '');
        setVetName(info.vet_name || '');
        setVetPhone(info.vet_phone || '');
        setLastCheckup(info.last_checkup || '');
        setNextCheckup(info.next_checkup || '');
        setNotes(info.notes || '');
      }
    } catch (error) {
      console.error('Error fetching medical info:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put(`/api/pets/${petId}/medical-info`, {
        weight: weight ? parseFloat(weight) : null,
        allergies: allergies.trim() || null,
        medications: medications.trim() || null,
        conditions: conditions.trim() || null,
        vet_name: vetName.trim() || null,
        vet_phone: vetPhone.trim() || null,
        last_checkup: lastCheckup || null,
        next_checkup: nextCheckup || null,
        notes: notes.trim() || null,
      });

      if (Platform.OS === 'web') {
        alert('Medical information updated successfully!');
      } else {
        Alert.alert('Success', 'Medical information updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error updating medical info:', error);
      const message = error.response?.data?.message || 'Failed to save medical info';
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
        source={UpdateDataScreen}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>Update Medical Info</Text>

        {/* טופס */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            {/* משקל */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight"
                keyboardType="decimal-pad"
              />
            </View>

            {/* אלרגיות */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergies</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="List any known allergies..."
                multiline
                numberOfLines={2}
              />
            </View>

            {/* תרופות */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Medications</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medications}
                onChangeText={setMedications}
                placeholder="List current medications..."
                multiline
                numberOfLines={2}
              />
            </View>

            {/* מצבים רפואיים */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Conditions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={conditions}
                onChangeText={setConditions}
                placeholder="List any medical conditions..."
                multiline
                numberOfLines={2}
              />
            </View>

            {/* סקציית וטרינר */}
            <Text style={styles.sectionTitle}>Veterinarian Info</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vet Name</Text>
              <TextInput
                style={styles.input}
                value={vetName}
                onChangeText={setVetName}
                placeholder="Dr. ..."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vet Phone</Text>
              <TextInput
                style={styles.input}
                value={vetPhone}
                onChangeText={(text) => setVetPhone(text.replace(/[^0-9-+() ]/g, ''))}
                placeholder="Phone number"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* תאריכי בדיקות */}
            <Text style={styles.sectionTitle}>Checkup Dates</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Last Checkup</Text>
                <TextInput
                  style={styles.input}
                  value={lastCheckup}
                  onChangeText={setLastCheckup}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Next Checkup</Text>
                <TextInput
                  style={styles.input}
                  value={nextCheckup}
                  onChangeText={setNextCheckup}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            {/* הערות */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
              <Text style={styles.submitButtonText}>Save Medical Info</Text>
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
    fontSize: 26,
    fontWeight: '600',
    color: '#6ED29A',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 15,
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
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6ED29A',
    marginTop: 15,
    marginBottom: 12,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#6ED29A',
    padding: 16,
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

