// ==========================================
// עמוד התחברות (Login Screen)
// ==========================================

// ייבוא React והפונקציה useState לניהול מצב (state)
import React, { useState } from 'react';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ייבוא רכיבים מ-React Native:
// - StyleSheet: ליצירת סגנונות (כמו CSS)
// - Text: להצגת טקסט
// - View: קונטיינר בסיסי (כמו div ב-HTML)
// - TextInput: שדה קלט טקסט
// - TouchableOpacity: כפתור שניתן ללחוץ עליו
// - Alert: חלון התראה
// - Platform: לזיהוי הפלטפורמה (web/android/ios)
// - ImageBackground: תמונת רקע
// - Image: תמונה רגילה
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform, ImageBackground, Image } from 'react-native';

// ייבוא הניווט מ-expo-router - מאפשר מעבר בין מסכים
import { useRouter } from 'expo-router';

// ייבוא SafeAreaView - מונע חפיפה עם סרגלי המערכת (notch, סרגל תחתון וכו')
import { SafeAreaView } from 'react-native-safe-area-context';

// ==========================================
// ייבוא תמונות
// ==========================================
// תמונת הרקע עם העננים הצבעוניים
import LoginBg from '../assets/images/login.png';
// הלוגו של האפליקציה (כלב-שעון)
import Logo from '../assets/images/Logo.png';

// ==========================================
// הקומפוננטה הראשית - מסך ההתחברות
// ==========================================
export default function LoginScreen() {
  
  // ---- ניהול מצב (State) ----
  // משתנים שמחזיקים את מה שהמשתמש מקליד
  const [email, setEmail] = useState('');      // שדה האימייל
  const [password, setPassword] = useState(''); // שדה הסיסמה
  
  // הוק לניווט - מאפשר לעבור לעמודים אחרים
  const router = useRouter();

  // ==========================================
  // פונקציית התחברות - מתבצעת בלחיצה על "Log In"
  // ==========================================
  const handleLogin = async () => {
    try {
      // שליחת בקשת POST לשרת עם פרטי ההתחברות
      const { data } = await api.post('/login', { email, password });

      // שמירת פרטי המשתמש ב-AsyncStorage
      await AsyncStorage.setItem('userId', String(data.user_id));
      await AsyncStorage.setItem('userFirstName', data.first_name || '');
      await AsyncStorage.setItem('userLastName', data.last_name || '');
      await AsyncStorage.setItem('userEmail', data.email || '');

      // הצלחה! מעבר לעמוד הבית
      router.replace('/home');
    } catch (error: any) {
      // טיפול בשגיאות
      const message = error.response?.data?.message || 'Could not connect to the server';
      console.error('Error:', error);
      if (Platform.OS === 'web') {
        alert("Error: " + message);
      } else {
        Alert.alert("Error", message);
      }
    }
  };

  // ==========================================
  // תצוגת המסך (JSX)
  // ==========================================
  return (
    // SafeAreaView - עוטף הכל ומונע חפיפה עם סרגל אנדרואיד התחתון
    // edges={['bottom']} - רק למטה (לא למעלה, כדי שהתמונה תגיע עד למעלה)
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      
      {/* תמונת הרקע עם העננים */}
      {/* resizeMode="stretch" - מותח את התמונה למלא את כל המסך */}
      <ImageBackground
        source={LoginBg}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* קונטיינר ראשי שמכיל את כל התוכן */}
        <View style={styles.body}>
          
          {/* ---- חלק הלוגו והכותרת ---- */}
          <View style={styles.logoContainer}>
            {/* הלוגו - כלב-שעון */}
            {/* resizeMode="contain" - שומר על הפרופורציות של התמונה */}
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            {/* שם האפליקציה */}
            <Text style={styles.appTitle}>MYPET TIME</Text>
          </View>

          {/* ---- טופס ההתחברות ---- */}
          {/* שקוף לגמרי - בלי רקע ובלי מסגרת */}
          <View style={styles.loginContainer}>
            <Text style={styles.h2}>Login</Text>
            
            {/* שדה אימייל */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input}
                placeholder="" 
                value={email}
                onChangeText={setEmail}  // כל פעם שמקלידים, מעדכן את המשתנה
                keyboardType="email-address"  // מקלדת עם @
                autoCapitalize="none"  // לא הופך אותיות לגדולות
              />
            </View>

            {/* שדה סיסמה */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder=""
                value={password}
                onChangeText={setPassword}
                secureTextEntry  // מסתיר את הטקסט (נקודות במקום אותיות)
              />
            </View>

            {/* כפתור התחברות */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            {/* לינק להרשמה */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>New here?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

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
  
  // עוטף את כל המסך - מונע חפיפה עם סרגלי המערכת
  safeArea: {
    flex: 1,  // תופס את כל המקום הזמין
    backgroundColor: '#D9E5EF',  // צבע רקע תואם לתחתית התמונה (למקרה שיש רווח)
  },
  
  // תמונת הרקע
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // קונטיינר ראשי - מכיל את הלוגו והטופס
  body: {
    flex: 1,
    justifyContent: 'center',  // ממרכז אנכית
    alignItems: 'center',       // ממרכז אופקית
    paddingVertical: 40,        // ריווח מלמעלה ומלמטה
  },
  
  // קונטיינר הלוגו
  logoContainer: {
    alignItems: 'center',  // ממרכז את התוכן
    marginBottom: 30,      // רווח מהטופס למטה
  },
  
  // הלוגו עצמו
  logo: {
    width: 160,   // רוחב
    height: 160,  // גובה
  },
  
  // כותרת "MYPET TIME"
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,      // רווח מהלוגו
    letterSpacing: 2,   // ריווח בין אותיות
  },
  
  // קונטיינר הטופס - שקוף לגמרי (בלי רקע ובלי מסגרת)
  loginContainer: {
    padding: 32,       // ריווח פנימי
    width: '90%',      // רוחב יחסי
    maxWidth: 340,     // רוחב מקסימלי
  },
  
  // כותרת "Login"
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  
  // קבוצת שדה קלט (תווית + שדה)
  inputGroup: {
    marginBottom: 18,  // רווח בין השדות
  },
  
  // תווית (Email / Password)
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#000',
    textAlign: 'left',
  },
  
  // שדה הקלט עצמו
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: 'transparent',  // שקוף לגמרי
    textAlign: 'left',
  },
  
  // כפתור "Log In"
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#156082',  // כחול
    borderRadius: 8,
    alignItems: 'center',        // ממרכז את הטקסט
    marginTop: 10,
  },
  
  // טקסט בתוך הכפתור
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // קונטיינר לינק ההרשמה
  registerContainer: {
    marginTop: 20,
    flexDirection: 'row',     // מסדר באותה שורה
    justifyContent: 'center', // ממרכז
  },
  
  // טקסט "New here?"
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  
  // לינק "Create Account"
  registerLink: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});
