import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Modal,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// רקע
import HealthPage from '../assets/images/health-page.png';

export default function PetProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // שדות עריכה
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  
  // שיתוף חיה
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserIdAndFetchPet();
  }, [id]);

  const loadUserIdAndFetchPet = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      const uid = parseInt(storedUserId, 10);
      setUserId(uid);
      fetchPetDetails(uid);
    }
  };

  const fetchPetDetails = async (uid: number) => {
    try {
      const { data } = await api.get(`/api/users/${uid}/pets`);
      if (data.pets) {
        const foundPet = data.pets.find((p: any) => p.id === Number(id));
        setPet(foundPet);
        // מילוי שדות העריכה
        if (foundPet) {
          setEditName(foundPet.name || '');
          setEditSpecies(foundPet.species || '');
          setEditBreed(foundPet.breed || '');
          setEditGender(foundPet.gender || '');
          setEditBirthDate(foundPet.birth_date || '');
        }
      }
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/pets/${id}`, {
        name: editName,
        species: editSpecies,
        breed: editBreed,
        gender: editGender,
        birth_date: editBirthDate || null,
      });

      setPet({
        ...pet,
        name: editName,
        species: editSpecies,
        breed: editBreed,
        gender: editGender,
        birth_date: editBirthDate,
      });
      setIsEditing(false);
      if (Platform.OS === 'web') {
        alert('Pet updated successfully!');
      } else {
        Alert.alert('Success', 'Pet updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating pet:', error);
      const message = error.response?.data?.message || 'Network error. Please try again.';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  const cancelEdit = () => {
    // החזרת הערכים המקוריים
    setEditName(pet?.name || '');
    setEditSpecies(pet?.species || '');
    setEditBreed(pet?.breed || '');
    setEditGender(pet?.gender || '');
    setEditBirthDate(pet?.birth_date || '');
    setIsEditing(false);
  };

  // יצירת קוד שיתוף
  const handleGenerateShareCode = async () => {
    setShareLoading(true);
    try {
      const { data } = await api.post('/api/pets/generate_code', {
        user_id: userId,
        pet_id: Number(id),
      });
      
      setShareCode(data.share_code);
      setShowShareModal(true);
    } catch (error: any) {
      console.error('Error generating share code:', error);
      const message = error.response?.data?.message || 'Failed to generate share code';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setShareLoading(false);
    }
  };

  // העתקת קוד ללוח
  const copyToClipboard = () => {
    Clipboard.setString(shareCode);
    if (Platform.OS === 'web') {
      alert('Code copied to clipboard!');
    } else {
      Alert.alert('Copied!', 'Share code copied to clipboard');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED29A" />
        </View>
      </SafeAreaView>
    );
  }

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

        {/* כפתור עריכה */}
        {!isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}

        {/* כותרת - שם החיה */}
        <Text style={styles.pageTitle}>{pet?.name || 'Pet Profile'}</Text>

        {/* פרטי החיה */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            {isEditing ? (
              // מצב עריכה
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Species:</Text>
                  <TextInput
                    style={styles.input}
                    value={editSpecies}
                    onChangeText={setEditSpecies}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Breed:</Text>
                  <TextInput
                    style={styles.input}
                    value={editBreed}
                    onChangeText={setEditBreed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Gender:</Text>
                  <View style={styles.genderButtons}>
                    <TouchableOpacity 
                      style={[styles.genderButton, editGender === 'Male' && styles.genderButtonActive]}
                      onPress={() => setEditGender('Male')}
                    >
                      <Text style={[styles.genderButtonText, editGender === 'Male' && styles.genderButtonTextActive]}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.genderButton, editGender === 'Female' && styles.genderButtonActive]}
                      onPress={() => setEditGender('Female')}
                    >
                      <Text style={[styles.genderButtonText, editGender === 'Female' && styles.genderButtonTextActive]}>Female</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Birth Date:</Text>
                  <TextInput
                    style={styles.input}
                    value={editBirthDate}
                    onChangeText={setEditBirthDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                {/* כפתורי שמירה וביטול */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // מצב צפייה
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Species:</Text>
                  <Text style={styles.value}>{pet?.species || '-'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Breed:</Text>
                  <Text style={styles.value}>{pet?.breed || '-'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Gender:</Text>
                  <Text style={styles.value}>{pet?.gender || '-'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Birth Date:</Text>
                  <Text style={styles.value}>{pet?.birth_date || '-'}</Text>
                </View>

                {/* כפתור שיתוף */}
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={handleGenerateShareCode}
                  disabled={shareLoading}
                >
                  <Text style={styles.shareButtonIcon}>🔗</Text>
                  <Text style={styles.shareButtonText}>
                    {shareLoading ? 'Generating...' : 'Share This Pet'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Modal לקוד שיתוף */}
        <Modal
          visible={showShareModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Share Code</Text>
              <Text style={styles.modalSubtitle}>
                Share this code with family or friends so they can access {pet?.name}'s profile
              </Text>
              
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{shareCode}</Text>
              </View>
              
              <Text style={styles.expiryText}>⏱ Code expires in 48 hours</Text>
              
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Text style={styles.copyButtonText}>📋 Copy Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: '#6ED29A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: 'transparent',  // שקוף לגמרי
    borderRadius: 15,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  // סגנונות עריכה
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    backgroundColor: 'transparent',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#6ED29A',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // סגנונות שיתוף
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5AA0D6',
    borderRadius: 12,
    padding: 15,
    marginTop: 25,
  },
  shareButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // סגנונות Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5AA0D6',
    letterSpacing: 5,
  },
  expiryText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  copyButton: {
    backgroundColor: '#6ED29A',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    padding: 10,
  },
  closeModalText: {
    color: '#999',
    fontSize: 14,
  },
});
