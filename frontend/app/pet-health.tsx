import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ייבוא תמונות
import HealthPage from '../assets/images/Health Page.png';
import PetHealth1 from '../assets/images/pethealth1.png';
import PetHealth2 from '../assets/images/pethealth2.png';
import PetHealth3 from '../assets/images/pethealth3.png';
import PetHealth4 from '../assets/images/pethealth4.png';

interface Pet {
  id: number;
  name: string;
  species?: string;
}

export default function PetHealthScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetList, setShowPetList] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const { data } = await api.get(`/users/${userId}/pets`);
        setPets(data.pets || []);
        // בחר אוטומטית את החיה הראשונה
        if (data.pets && data.pets.length > 0) {
          setSelectedPet(data.pets[0]);
        }
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const navigateWithPet = (path: string) => {
    if (!selectedPet) {
      if (Platform.OS === 'web') {
        alert('Please select a pet first');
      } else {
        Alert.alert('Select Pet', 'Please select a pet first');
      }
      return;
    }
    router.push(`${path}?petId=${selectedPet.id}&petName=${selectedPet.name}`);
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

        {/* כותרת העמוד */}
        <Text style={styles.pageTitle}>Pet Health</Text>

        {/* בחירת חיה */}
        <View style={styles.petSelectorContainer}>
          <TouchableOpacity 
            style={styles.petSelector}
            onPress={() => setShowPetList(!showPetList)}
          >
            <Text style={styles.petSelectorIcon}>🐾</Text>
            <Text style={styles.petSelectorText}>
              {selectedPet ? selectedPet.name : 'Select a pet...'}
            </Text>
            <Text style={styles.petSelectorArrow}>{showPetList ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* רשימת חיות */}
          {showPetList && (
            <View style={styles.petList}>
              <ScrollView style={{ maxHeight: 150 }}>
                {pets.length === 0 ? (
                  <Text style={styles.noPetsText}>No pets found</Text>
                ) : (
                  pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petListItem,
                        selectedPet?.id === pet.id && styles.petListItemSelected
                      ]}
                      onPress={() => {
                        setSelectedPet(pet);
                        setShowPetList(false);
                      }}
                    >
                      <Text style={styles.petListItemText}>
                        {pet.name} {pet.species ? `(${pet.species})` : ''}
                      </Text>
                      {selectedPet?.id === pet.id && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* חלקי הפאזל */}
        <View style={styles.puzzleContainer}>
          {/* שורה עליונה */}
          <View style={styles.puzzleRow}>
            {/* פאזל 1 - צפייה במידע רפואי (שמאל) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/view-medical-info')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth1} 
                style={[styles.puzzleImage, !selectedPet && styles.puzzleImageDisabled]} 
                resizeMode="contain"
              />
              <View style={[styles.labelOverlay, styles.labelOverlayTop, styles.labelOverlayLeft]}>
                <Text style={[styles.puzzleLabel, styles.puzzleLabelLeft]}>View{'\n'}Medical Info</Text>
              </View>
            </TouchableOpacity>

            {/* פאזל 2 - צפייה במסמכים (ימין) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/view-documents')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth2} 
                style={[styles.puzzleImage, !selectedPet && styles.puzzleImageDisabled]} 
                resizeMode="contain"
              />
              <View style={[styles.labelOverlay, styles.labelOverlayTop, styles.labelOverlayRight]}>
                <Text style={[styles.puzzleLabel, styles.puzzleLabelRight]}>View{'\n'}Documents</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* שורה תחתונה */}
          <View style={styles.puzzleRow}>
            {/* פאזל 3 - עדכון מידע רפואי (שמאל) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/update-medical-info')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth3} 
                style={[styles.puzzleImage, !selectedPet && styles.puzzleImageDisabled]} 
                resizeMode="contain"
              />
              <View style={[styles.labelOverlay, styles.labelOverlayBottom, styles.labelOverlayLeft]}>
                <Text style={[styles.puzzleLabel, styles.puzzleLabelLeft]}>Update{'\n'}Medical Info</Text>
              </View>
            </TouchableOpacity>

            {/* פאזל 4 - העלאת מסמך (ימין) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/upload-document')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth4} 
                style={[styles.puzzleImage, !selectedPet && styles.puzzleImageDisabled]} 
                resizeMode="contain"
              />
              <View style={[styles.labelOverlay, styles.labelOverlayBottom, styles.labelOverlayRight]}>
                <Text style={[styles.puzzleLabel, styles.puzzleLabelRight]}>Upload{'\n'}Document</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
  petSelectorContainer: {
    paddingHorizontal: 30,
    marginTop: 15,
    zIndex: 100,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petSelectorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  petSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  petSelectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  petList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  petListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  petListItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  petListItemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  checkMark: {
    color: '#6ED29A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noPetsText: {
    padding: 15,
    textAlign: 'center',
    color: '#999',
  },
  puzzleContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  puzzleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -18,
  },
  puzzlePiece: {
    width: 210,
    height: 210,
    marginHorizontal: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzlePieceDisabled: {
    opacity: 0.5,
  },
  puzzleImage: {
    width: 210,
    height: 210,
  },
  puzzleImageDisabled: {
    opacity: 0.7,
  },
  labelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelOverlayTop: {
    paddingBottom: 25,
  },
  labelOverlayBottom: {
    paddingTop: 25,
  },
  labelOverlayLeft: {
    paddingRight: 45,
  },
  labelOverlayRight: {
    paddingLeft: 45,
  },
  puzzleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    lineHeight: 22,
  },
  puzzleLabelLeft: {
    textAlign: 'center',
  },
  puzzleLabelRight: {
    textAlign: 'center',
  },
});
