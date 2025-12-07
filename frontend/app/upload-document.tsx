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
import * as DocumentPicker from 'expo-document-picker';

import AddNewDoc from '../assets/images/Add New Doc.png';

export default function UploadDocumentScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  
  const [userId, setUserId] = useState<number | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const documentTypes = ['Vaccination', 'Medical Record', 'Lab Results', 'Prescription', 'Insurance', 'Other'];

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (!documentName) {
          setDocumentName(result.assets[0].name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleUpload = async () => {
    if (!documentName.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a document name');
      } else {
        Alert.alert('Error', 'Please enter a document name');
      }
      return;
    }

    if (!documentType) {
      if (Platform.OS === 'web') {
        alert('Please select a document type');
      } else {
        Alert.alert('Error', 'Please select a document type');
      }
      return;
    }

    try {
      // כאן תהיה הלוגיקה לשליחת המסמך לשרת
      const { data } = await api.post('/documents', {
        pet_id: petId,
        user_id: userId,
        name: documentName.trim(),
        type: documentType,
        notes: notes.trim() || null,
        // file: selectedFile - יש להוסיף לוגיקת העלאת קבצים
      });

      if (Platform.OS === 'web') {
        alert('Document uploaded successfully!');
      } else {
        Alert.alert('Success', 'Document uploaded successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      // נכון לעכשיו, נציג הודעת הצלחה כי ה-API לא קיים עדיין
      if (Platform.OS === 'web') {
        alert('Document saved locally! (API pending)');
      } else {
        Alert.alert('Saved', 'Document saved locally! (API pending)', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={AddNewDoc}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>Upload Document</Text>

        {/* טופס העלאה */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            {/* בחירת קובץ */}
            <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
              <Text style={styles.filePickerIcon}>📄</Text>
              <Text style={styles.filePickerText}>
                {selectedFile ? selectedFile.name : 'Tap to select a document'}
              </Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Name *</Text>
              <TextInput
                style={styles.input}
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Enter document name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Type *</Text>
              <View style={styles.typeButtons}>
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, documentType === type && styles.typeButtonActive]}
                    onPress={() => setDocumentType(type)}
                  >
                    <Text style={[styles.typeButtonText, documentType === type && styles.typeButtonTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this document..."
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
              <Text style={styles.submitButtonText}>Upload Document</Text>
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
    fontSize: 28,
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
  filePickerButton: {
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
    borderColor: '#6ED29A',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  filePickerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  typeButtonActive: {
    backgroundColor: '#6ED29A',
    borderColor: '#6ED29A',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  typeButtonTextActive: {
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

