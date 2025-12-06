import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ייבוא תמונות
import HealthPage from '../assets/images/Health Page.png';
import PetHealth1 from '../assets/images/pethealth1.png';
import PetHealth2 from '../assets/images/pethealth2.png';
import PetHealth3 from '../assets/images/pethealth3.png';
import PetHealth4 from '../assets/images/pethealth4.png';

export default function PetHealthScreen() {
  const router = useRouter();

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
        
        {/* חלקי הפאזל */}
        <View style={styles.puzzleContainer}>
          {/* שורה עליונה */}
          <View style={styles.puzzleRow}>
            {/* פאזל 1 - צפייה במידע רפואי */}
            <TouchableOpacity 
              style={styles.puzzlePiece}
              onPress={() => router.push('/view-medical-info')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth1} 
                style={styles.puzzleImage} 
                resizeMode="contain"
              />
              <View style={styles.labelOverlay}>
                <Text style={styles.puzzleLabel}>View{'\n'}Medical Info</Text>
              </View>
            </TouchableOpacity>

            {/* פאזל 2 - צפייה במסמכים */}
            <TouchableOpacity 
              style={styles.puzzlePiece}
              onPress={() => router.push('/view-documents')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth2} 
                style={styles.puzzleImage} 
                resizeMode="contain"
              />
              <View style={styles.labelOverlay}>
                <Text style={styles.puzzleLabel}>View{'\n'}Documents</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* שורה תחתונה */}
          <View style={styles.puzzleRow}>
            {/* פאזל 3 - עדכון מידע רפואי */}
            <TouchableOpacity 
              style={styles.puzzlePiece}
              onPress={() => router.push('/update-medical-info')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth3} 
                style={styles.puzzleImage} 
                resizeMode="contain"
              />
              <View style={styles.labelOverlay}>
                <Text style={styles.puzzleLabel}>Update{'\n'}Medical Info</Text>
              </View>
            </TouchableOpacity>

            {/* פאזל 4 - העלאת מסמך */}
            <TouchableOpacity 
              style={styles.puzzlePiece}
              onPress={() => router.push('/upload-document')}
              activeOpacity={0.8}
            >
              <Image 
                source={PetHealth4} 
                style={styles.puzzleImage} 
                resizeMode="contain"
              />
              <View style={styles.labelOverlay}>
                <Text style={styles.puzzleLabel}>Upload{'\n'}Document</Text>
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
  puzzleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: -20,
  },
  puzzleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -5,
  },
  puzzlePiece: {
    width: 170,
    height: 170,
    marginHorizontal: -5,
    alignItems: 'center',
    justifyContent: 'center',
    // הצללה
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  puzzleImage: {
    width: 170,
    height: 170,
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
});
