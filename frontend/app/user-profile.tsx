import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ייבוא תמונת הרקע
import ViewPetData from '../assets/images/view-pet-data.png';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  share_code: string;
  is_owner: boolean;
  owner_name?: string;
}

export default function UserProfileScreen() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joining, setJoining] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserIdAndFetchData();
  }, []);

  const loadUserIdAndFetchData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        const id = parseInt(storedUserId, 10);
        setUserId(id);
        fetchUserData(id);
        fetchPets(id);
      } else {
        // אם אין user_id שמור, חזור למסך הלוגין
        router.replace('/');
      }
    } catch (error) {
      console.error('Error loading userId:', error);
      router.replace('/');
    }
  };

  const fetchUserData = async (id: number) => {
    try {
      const { data } = await api.get(`/api/users/${id}`);
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchPets = async (id: number) => {
    try {
      const { data } = await api.get(`/api/users/${id}/pets`);
      setPets(data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // הצטרפות לחיה באמצעות קוד
  const handleJoinPet = async () => {
    if (!joinCode.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a share code');
      } else {
        Alert.alert('Error', 'Please enter a share code');
      }
      return;
    }

    setJoining(true);

    try {
      const { data } = await api.post('/api/pets/join_by_code', {
        user_id: userId,
        share_code: joinCode.trim().toUpperCase(),
      });

      if (Platform.OS === 'web') {
        alert(data.message);
      } else {
        Alert.alert('Success', data.message);
      }
      setJoinCode('');
      setShowJoinInput(false);
      if (userId) fetchPets(userId); // רענון רשימת החיות
    } catch (error: any) {
      console.error('Error joining pet:', error);
      const message = error.response?.data?.message || 'Failed to connect to server';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setJoining(false);
    }
  };

  // התנתקות
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  // מעבר לעמוד פרופיל חיה
  const goToPetProfile = (petId: number) => {
    router.push(`/pet-profile?id=${petId}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={ViewPetData}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>My Profile</Text>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* כרטיס פרטי משתמש */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name || ''}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* כותרת חיות */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Pets</Text>
          </View>

          {/* רשימת חיות */}
          {loading ? (
            <ActivityIndicator size="large" color="#6ED29A" style={{ marginTop: 20 }} />
          ) : (
            <>
              {pets.map((pet) => (
                <TouchableOpacity 
                  key={pet.id} 
                  style={styles.petCard}
                  onPress={() => goToPetProfile(pet.id)}
                >
                  <View style={styles.petIconContainer}>
                    <Text style={styles.petIcon}>
                      {pet.species?.toLowerCase() === 'dog' ? '🐕' : 
                       pet.species?.toLowerCase() === 'cat' ? '🐱' : '🐾'}
                    </Text>
                  </View>
                  
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petSpecies}>
                      {pet.species || 'Pet'}
                      {!pet.is_owner && ` • Shared by ${pet.owner_name}`}
                    </Text>
                  </View>
                  
                  <View style={styles.petBadge}>
                    <Text style={[
                      styles.petBadgeText,
                      pet.is_owner ? styles.ownerBadge : styles.sharedBadge
                    ]}>
                      {pet.is_owner ? 'Owner' : 'Shared'}
                    </Text>
                  </View>
                  
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              ))}

              {/* אזור הוספת חיה */}
              <View style={styles.addPetSection}>
                {/* כפתור הוספת חיה חדשה */}
                <TouchableOpacity 
                  style={styles.addPetButton}
                  onPress={() => router.push('/add-pet')}
                >
                  <Text style={styles.addPetIcon}>+</Text>
                  <Text style={styles.addPetText}>Add New Pet</Text>
                </TouchableOpacity>

                {/* כפתור הצטרפות עם קוד */}
                <TouchableOpacity 
                  style={styles.joinPetButton}
                  onPress={() => setShowJoinInput(!showJoinInput)}
                >
                  <Text style={styles.joinPetIcon}>🔗</Text>
                  <Text style={styles.joinPetText}>Join Pet with Code</Text>
                </TouchableOpacity>

                {/* שדה הזנת קוד */}
                {showJoinInput && (
                  <View style={styles.joinInputContainer}>
                    <TextInput
                      style={styles.joinInput}
                      placeholder="Enter share code (e.g. ABC123)"
                      placeholderTextColor="#999"
                      value={joinCode}
                      onChangeText={setJoinCode}
                      autoCapitalize="characters"
                      maxLength={6}
                    />
                    <TouchableOpacity 
                      style={[styles.joinSubmitButton, joining && styles.joinSubmitButtonDisabled]}
                      onPress={handleJoinPet}
                      disabled={joining}
                    >
                      <Text style={styles.joinSubmitText}>
                        {joining ? '...' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

          {/* כפתור התנתקות */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6ED29A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  petIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petIcon: {
    fontSize: 24,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  petSpecies: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  petBadge: {
    marginRight: 10,
  },
  petBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  ownerBadge: {
    backgroundColor: '#e8f5e9',
    color: '#4CAF50',
  },
  sharedBadge: {
    backgroundColor: '#e3f2fd',
    color: '#2196F3',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#ccc',
  },
  addPetSection: {
    marginTop: 15,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6ED29A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  addPetIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addPetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  joinPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#5AA0D6',
    borderStyle: 'dashed',
  },
  joinPetIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  joinPetText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5AA0D6',
  },
  joinInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    letterSpacing: 3,
    fontWeight: '600',
  },
  joinSubmitButton: {
    backgroundColor: '#5AA0D6',
    paddingHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinSubmitButtonDisabled: {
    backgroundColor: '#a0c4e4',
  },
  joinSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
});

