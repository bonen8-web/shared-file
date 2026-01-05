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
import TaskScreen from '../assets/images/task-screen.png';
import Task1 from '../assets/images/task1.png';
import Task2 from '../assets/images/task2.png';

export default function TasksScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={TaskScreen}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת העמוד */}
        <Text style={styles.pageTitle}>Tasks</Text>
        
        {/* חלקי הפאזל */}
        <View style={styles.puzzleContainer}>
          {/* פאזל יצירת משימה - שמאלי */}
          <TouchableOpacity 
            style={styles.puzzlePiece}
            onPress={() => router.push('/create-task')}
            activeOpacity={0.8}
          >
            <View style={styles.puzzleWrapperLeft}>
              <Image 
                source={Task1} 
                style={styles.puzzleImageLeft} 
                resizeMode="contain"
              />
              {/* הכיתוב על התמונה */}
              <View style={styles.labelOverlayLeft}>
                <Text style={styles.puzzleLabel}>Create{'\n'}Task</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* פאזל צפייה במשימות - ימני */}
          <TouchableOpacity 
            style={styles.puzzlePiece}
            onPress={() => router.push('/view-tasks')}
            activeOpacity={0.8}
          >
            <View style={styles.puzzleWrapperRight}>
              <Image 
                source={Task2} 
                style={styles.puzzleImageRight} 
                resizeMode="contain"
              />
              {/* הכיתוב על התמונה */}
              <View style={styles.labelOverlayRight}>
                <Text style={styles.puzzleLabel}>View{'\n'}Tasks</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    color: '#5AA0D6',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  puzzleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start', // יישור מלמעלה
    paddingHorizontal: 20,
    marginTop: 20, // מיקום הפאזלים
    gap: 5, // מצמיד את חלקי הפאזל
  },
  puzzlePiece: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // פאזל שמאלי - קצת יותר גדול ומעל הימני
  puzzleWrapperLeft: {
    width: 155,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // מעל הימני
    elevation: 12,
  },
  puzzleImageLeft: {
    width: 155,
    height: 155,
  },
  labelOverlayLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20, // מזיז את הטקסט שמאלה
  },
  // פאזל ימני - מתחת לשמאלי, קטן יותר
  puzzleWrapperRight: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 8,
    marginTop: 10, // מוריד את החלק הימני למטה
  },
  puzzleImageRight: {
    width: 120,
    height: 120,
  },
  labelOverlayRight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15, // מזיז את הטקסט ימינה
  },
  puzzleLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    lineHeight: 26,
  },
});
