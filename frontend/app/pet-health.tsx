// =====================================
// עמוד בריאות חיית המחמד - Pet Health Screen
// =====================================

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,    // רקע עם תמונה
  TouchableOpacity,   // כפתור שניתן ללחוץ עליו
  Image,
  ScrollView,         // אזור גלילה
  Alert,              // חלון התראה 
  Platform            // זיהוי הפלטפורמה (iOS/Android/Web)
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // מבטיח שהתוכן לא יוסתר ע"י הנוטש
import { RelativePathString, useRouter } from 'expo-router';  // ניווט בין עמודים
import api from '../api/config';          // חיבור לשרת
import AsyncStorage from '@react-native-async-storage/async-storage'; // אחסון מקומי

// ייבוא תמונות הרקע וחלקי הפאזל
import HealthPage from '../assets/images/health-page.png';
import PetHealth1 from '../assets/images/pethealth1.png';
import PetHealth2 from '../assets/images/pethealth2.png';
import PetHealth3 from '../assets/images/pethealth3.png';
import PetHealth4 from '../assets/images/pethealth4.png';

// טיפוס (Type) המגדיר את המבנה של חיית מחמד
interface Pet {
  id: number;        // מזהה ייחודי
  name: string;      // שם החיה
  species?: string;  // סוג החיה (אופציונלי - לכן יש ?)
}

export default function PetHealthScreen() {
  const router = useRouter(); // הוק לניווט בין עמודים
  
  // ========== State - משתני מצב של הקומפוננטה ==========
  const [pets, setPets] = useState<Pet[]>([]);              // רשימת כל החיות של המשתמש
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);  // החיה שנבחרה כרגע
  const [showPetList, setShowPetList] = useState(false);    // האם להציג את רשימת החיות (dropdown)

  // useEffect - רץ פעם אחת כשהקומפוננטה נטענת ([] = רשימת תלויות ריקה)
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );
  // ========== פונקציה לטעינת חיות המחמד מהשרת ==========
  const loadPets = async () => {
    try {
      // שליפת מזהה המשתמש מהאחסון המקומי
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        // קריאה ל-API לקבלת רשימת החיות של המשתמש
        const { data } = await api.get(`/api/users/${userId}/pets`);
        
        // עדכון ה-state עם רשימת החיות (או מערך ריק אם אין)
        setPets(data.pets || []);
        
        // בחר אוטומטית את החיה הראשונה ברשימה
        if (data.pets && data.pets.length > 0) {
          setSelectedPet(data.pets[0]);
        }
      }
    } catch (error) {
      // טיפול בשגיאות - הדפסה לקונסול
      console.error('Error loading pets:', error);
    }
  };

  // ========== פונקציה לניווט עם העברת פרטי החיה ==========
  // מקבלת נתיב (path) ומנווטת אליו עם פרמטרים של החיה הנבחרת
  const navigateWithPet = (path: RelativePathString) => {
    // בדיקה שנבחרה חיה - אם לא, מציג התראה
    console.log('path', path);
    if (!selectedPet) {
      // Platform.OS מזהה את הפלטפורמה - web/ios/android
      if (Platform.OS === 'web') {
        alert('Please select a pet first');  // התראה לווב
      } else {
        Alert.alert('Select Pet', 'Please select a pet first');  // התראה למובייל
      }
      return; // עוצר את הפונקציה
    }
    
    // ניווט לעמוד עם query parameters (פרמטרים ב-URL) - בצורה תקינה עבור Next.js router.push
    // view-medical-info?petId=1&petName=Rex
    router.push({
      pathname: path,
      params: {
        petId: selectedPet.id,
        petName: selectedPet.name,
      },
    });
  };

  // ========== ה-JSX - מבנה הממשק הגרפי ==========
  return (
    // SafeAreaView - מבטיח שהתוכן לא יוסתר ע"י הנוטש/פינות מעוגלות
    // edges={['bottom']} - מגן רק על החלק התחתון
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      
      {/* ImageBackground - רקע עם תמונה */}
      <ImageBackground
        source={HealthPage}
        style={styles.background}
        resizeMode="stretch"  
      >
        {/* ========== כפתור חזרה ========== */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* ========== כותרת העמוד ========== */}
        <Text style={styles.pageTitle}>Pet Health</Text>

        {/* ========== בורר חיית מחמד (Dropdown) ========== */}
        <View style={styles.petSelectorContainer}>
          {/* כפתור הבורר - לחיצה פותחת/סוגרת את הרשימה */}
          <TouchableOpacity 
            style={styles.petSelector}
            onPress={() => setShowPetList(!showPetList)}  // הופך את הערך (true<->false)
          >
            <Text style={styles.petSelectorIcon}>🐾</Text>
            {/* תצוגה מותנית: אם יש חיה נבחרת - מציג את שמה, אחרת טקסט ברירת מחדל */}
            <Text style={styles.petSelectorText}>
              {selectedPet ? selectedPet.name : 'Select a pet...'}
            </Text>
            {/* חץ שמשתנה לפי מצב הרשימה (פתוחה/סגורה) */}
            <Text style={styles.petSelectorArrow}>{showPetList ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* רשימת החיות הנפתחת - מוצגת רק כש-showPetList === true */}
          {showPetList && (
            <View style={styles.petList}>
              <ScrollView 
                 style={styles.petListScroll}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}>  
                {/* תנאי: אם אין חיות - מציג הודעה, אחרת מציג את הרשימה */}
                {pets.length === 0 ? (
                  <Text style={styles.noPetsText}>No pets found</Text>
                ) : (
                  // map - עובר על כל חיה ומייצר עבורה רכיב
                  pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}  // key ייחודי - חובה ב-React לרשימות
                      style={[
                        styles.petListItem,
                        // מוסיף סגנון נוסף אם זו החיה הנבחרת
                        selectedPet?.id === pet.id && styles.petListItemSelected
                      ]}
                      onPress={() => {
                        setSelectedPet(pet);      // מעדכן את החיה הנבחרת
                        setShowPetList(false);    // סוגר את הרשימה
                      }}
                    >
                      <Text style={styles.petListItemText}>
                        {pet.name} {pet.species ? `(${pet.species})` : ''}
                      </Text>
                      {/* מציג סימן V רק ליד החיה הנבחרת */}
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
        
        {/* ========== אזור כפתורי הפאזל - 4 אפשרויות בריאות ========== */}
        {/* הממשק בנוי כמו פאזל עם 4 חלקים שמתחברים */}
        <View style={styles.puzzleContainer}>
          
          {/* ---------- שורה עליונה (2 כפתורים) ---------- */}
          <View style={styles.puzzleRow}>
            
            {/* פאזל 1 - צפייה במידע רפואי (שמאל למעלה) */}
            <TouchableOpacity 
              // שילוב סגנונות: בסיסי + מושבת (אם לא נבחרה חיה)
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/view-medical-info' as RelativePathString)}
              activeOpacity={0.8}  // שקיפות בלחיצה (0-1)
            >
              <Image 
                source={PetHealth1} 
                style={[styles.puzzleImage, !selectedPet && styles.puzzleImageDisabled]} 
                resizeMode="contain"  // שומר על יחס התמונה
              />
              {/* שכבת טקסט מעל התמונה */}
              <View style={[styles.labelOverlay, styles.labelOverlayTop, styles.labelOverlayLeft]}>
                <Text style={[styles.puzzleLabel, styles.puzzleLabelLeft]}>View{'\n'}Medical Info</Text>
              </View>
            </TouchableOpacity>

            {/* פאזל 2 - צפייה במסמכים (ימין למעלה) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/view-documents' as RelativePathString)}
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

          {/* ---------- שורה תחתונה (2 כפתורים) ---------- */}
          <View style={styles.puzzleRow}>
            
            {/* פאזל 3 - עדכון מידע רפואי (שמאל למטה) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/update-medical-info' as RelativePathString)}
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

            {/* פאזל 4 - העלאת מסמך (ימין למטה) */}
            <TouchableOpacity 
              style={[styles.puzzlePiece, !selectedPet && styles.puzzlePieceDisabled]}
              onPress={() => navigateWithPet('/upload-document' as RelativePathString)}
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

// =====================================
// StyleSheet - הגדרות עיצוב הקומפוננטה
// =====================================
const styles = StyleSheet.create({
  // ---------- סגנונות בסיס ----------
  safeArea: {
    flex: 1,                    // תופס את כל המקום הזמין
    backgroundColor: '#D9E5EF', // צבע רקע כחול-אפור בהיר
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // ---------- כפתור חזרה ----------
  backButton: {
    position: 'absolute',  // מיקום מוחלט (לא בזרימה הרגילה)
    top: 50,               // מרחק מלמעלה
    left: 20,              // מרחק משמאל
    zIndex: 10,            // שכבה גבוהה - יופיע מעל אלמנטים אחרים
    backgroundColor: 'rgba(255,255,255,0.9)',  // לבן עם שקיפות קלה
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,      // פינות מעוגלות
  },
  backButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',  // עובי בינוני
  },
  
  // ---------- כותרת העמוד ----------
  pageTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6ED29A',       // ירוק בהיר
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,       // ריווח בין אותיות
  },
  
  // ---------- בורר חיית מחמד ----------
  petSelectorContainer: {
    paddingHorizontal: 30,
    marginTop: 15,
    zIndex: 100,  // גבוה כדי שהרשימה תופיע מעל שאר האלמנטים
  },
  petSelector: {
    flexDirection: 'row',   // סידור אופקי של הילדים
    alignItems: 'center',   // יישור אנכי למרכז
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 12,
    // צללית (עובד ב-iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // צללית באנדרואיד
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
  
  // ---------- רשימת החיות הנפתחת (Dropdown) ----------
  petList: {
    position: 'absolute',  // צף מעל שאר התוכן
    top: 55,               // מתחת לבורר
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,  // שכבה גבוהה מאוד
    maxHeight: 250,
    overflow: 'hidden',
  },
  petListScroll: { 
    maxHeight: 200,
    flexGrow: 0,
  },
  petListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',  // קו הפרדה בהיר
  },
  petListItemSelected: {
    backgroundColor: '#E8F5E9',  // רקע ירוק בהיר לפריט הנבחר
  },
  petListItemText: {
    flex: 1,  // תופס את כל הרוחב הזמין
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
    color: '#999',  // אפור - טקסט משני
  },
  
  // ---------- אזור הפאזל ----------
  puzzleContainer: {
    flex: 1,
    justifyContent: 'flex-start',  // מיושר לתחילה (למעלה)
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  puzzleRow: {
    flexDirection: 'row',  // שני כפתורים בשורה
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -18,   // ערך שלילי - גורם לחלקים להיכנס אחד לשני
  },
  puzzlePiece: {
    width: 210,
    height: 210,
    marginHorizontal: -22,  // ערך שלילי - יוצר את אפקט הפאזל
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzlePieceDisabled: {
    opacity: 0.5,  // חצי שקוף כשלא נבחרה חיה
  },
  puzzleImage: {
    width: 210,
    height: 210,
  },
  puzzleImageDisabled: {
    opacity: 0.7,
  },
  // ---------- שכבת טקסט על הפאזל ----------
  // position: absolute עם top/left/right/bottom: 0 = ממלא את כל ההורה
  labelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // התאמות מיקום לפי מיקום הפאזל
  labelOverlayTop: {
    paddingBottom: 25,  // דוחף את הטקסט למעלה
  },
  labelOverlayBottom: {
    paddingTop: 25,     // דוחף את הטקסט למטה
  },
  labelOverlayLeft: {
    paddingRight: 45,   // דוחף את הטקסט שמאלה
  },
  labelOverlayRight: {
    paddingLeft: 45,    // דוחף את הטקסט ימינה
  },
  
  // ---------- טקסט התווית על הפאזל ----------
  puzzleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',  // לבן
    textAlign: 'center',
    // צללית לטקסט - משפרת קריאות על רקע צבעוני
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    lineHeight: 22,  // גובה שורה
  },
  puzzleLabelLeft: {
    textAlign: 'center',
  },
  puzzleLabelRight: {
    textAlign: 'center',
  },
});
// ===================================== סוף הקובץ =====================================
