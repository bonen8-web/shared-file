// ==========================================
// עמוד הבית (Home Screen)
// ==========================================
// זהו המסך הראשי של האפליקציה אחרי התחברות.
// מכיל 3 כפתורים עגולים שמובילים לפיצ'רים השונים.

// ייבוא React
import React from 'react';

// ==========================================
// ייבוא תמונות
// ==========================================
import Homepage from '../assets/images/Homepage.png';    // תמונת הרקע
import UserIcon from '../assets/images/user-icon.png';  // אייקון משתמש (פינה שמאלית)
import Logo from '../assets/images/Logo.png';            // הלוגו של האפליקציה
import plus from '../assets/images/plus.png';            // סימן פלוס של האפליקציה
// ייבוא רכיבים מ-React Native
import { 
  View,               // קונטיינר בסיסי
  Text,               // טקסט
  StyleSheet,         // סגנונות
  TouchableOpacity,   // כפתור לחיץ
  ImageBackground,    // תמונת רקע
  Image               // תמונה רגילה
} from 'react-native';

// ייבוא SafeAreaView - מונע חפיפה עם סרגלי המערכת
import { SafeAreaView } from 'react-native-safe-area-context';

// ייבוא הניווט מ-expo-router
import { useRouter } from 'expo-router';

// ==========================================
// הקומפוננטה הראשית - מסך הבית
// ==========================================
export default function HomeScreen() {

  // הוק לניווט - מאפשר לעבור לעמודים אחרים
  const router = useRouter();

  // ==========================================
  // תצוגת המסך (JSX)
  // ==========================================
  return (
    // SafeAreaView - עוטף הכל ומונע חפיפה עם סרגלי המערכת
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      
      {/* תמונת הרקע */}
      <ImageBackground
        source={Homepage}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* ---- אייקון משתמש (פינה שמאלית עליונה) ---- */}
        {/* לחיצה מעבירה לעמוד פרופיל המשתמש */}
        <TouchableOpacity 
          style={styles.userIconButton} 
          onPress={() => router.push('/user-profile')}
        >
          <Image source={UserIcon} style={styles.userIcon} resizeMode="contain" />
        </TouchableOpacity>

        {/* ---- אייקון הוספת חיה (פינה ימנית עליונה) ---- */}
        {/* לחיצה מעבירה לעמוד הוספת חיה */}
        <TouchableOpacity 
          style={styles.plusiconButton} 
          onPress={() => router.push('/add-pet')}
        >
          <Image source={plus} style={styles.plusicon} resizeMode="contain" />
        </TouchableOpacity>


        {/* ---- לוגו וכותרת ---- */}
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.pageTitle}>Home</Text>
        </View>
        
        {/* ---- הכפתורים העגולים ---- */}
        <View style={styles.circleContainer}>
          
          {/* שורה ראשונה: My Tasks + Dog Parks */}
          <View style={styles.row}>
            
            {/* כפתור My Tasks - כחול */}
            <TouchableOpacity 
              style={[styles.circle, { backgroundColor: '#5AA0D6' }]}
              onPress={() => router.push('/tasks')}
            >
              <Text style={styles.circleText}>My Tasks</Text>
            </TouchableOpacity>

            {/* כפתור Dog Parks - טורקיז */}
            <TouchableOpacity 
              style={[styles.circle, { backgroundColor: '#36C1C8' }]}
              onPress={() => router.push('/dog-parks')}
            >
              <Text style={styles.circleText}>Dog Parks</Text>
            </TouchableOpacity>
          </View>

          {/* שורה שנייה: Pet Health (ממורכז) */}
          <View style={styles.rowCenter}>
            
            {/* כפתור Pet Health - ירוק */}
            <TouchableOpacity 
              style={[styles.circle, { backgroundColor: '#6ED29A' }]}
              onPress={() => router.push('/pet-health')}
            >
              <Text style={styles.circleText}>Pet Health</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ImageBackground>
    </SafeAreaView>
  );
}

// ==========================================
// סגנונות (Styles) - כמו CSS
// ==========================================
const styles = StyleSheet.create({

  // עוטף את כל המסך
  safeArea: {
    flex: 1,
    backgroundColor: 'rgb(217, 229, 239)',  // צבע רקע תואם לתמונה
  },

  // תמונת הרקע
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // ---- אייקון משתמש ----
  userIconButton: {
    position: 'absolute',  // מיקום קבוע
    top: 50,               // מרחק מלמעלה
    left: 20,              // מרחק משמאל
    zIndex: 10,            // מעל אלמנטים אחרים
  },

  userIcon: {
    width: 65,
    height: 65,
  },

    // ---- אייקון פלוס ----
    plusiconButton: {
      position: 'absolute',  // מיקום קבוע
      top: 50,               // מרחק מלמעלה
      right: 20,              // מרחק משמאל
      zIndex: 10,            // מעל אלמנטים אחרים
    },
  
    plusicon: {
      width: 65,
      height: 65,
    },

  // ---- לוגו ממורכז ----
  logoContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',  // ממרכז אופקית
    zIndex: 5,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: -15,  // קירוב לכותרת
  },

  // ---- כותרת העמוד ----
  pageTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },

  // ---- קונטיינר הכפתורים העגולים ----
  circleContainer: {
    flex: 1,
    justifyContent: 'center',  // ממרכז אנכית
    alignItems: 'center',       // ממרכז אופקית
    paddingHorizontal: 20,
    marginTop: -50,             // מעלה את העיגולים קצת למעלה
  },

  // שורה של 2 עיגולים
  row: {
    flexDirection: "row",       // מסדר אופקית
    justifyContent: "center",
    gap: 20,                    // רווח בין העיגולים
    width: "100%",
    marginBottom: 15,
  },

  // שורה ממורכזת (עיגול בודד)
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 0,
  },

  // ---- העיגול עצמו ----
  circle: {
    width: 120,
    height: 120,
    backgroundColor: "#6EC3FF",
    borderRadius: 60,            // חצי מהרוחב = עיגול מושלם
    justifyContent: "center",
    alignItems: "center",
    // צל (shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,                // צל באנדרואיד
  },

  // טקסט בתוך העיגול
  circleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
