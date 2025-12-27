// ==========================================
// עמוד הרשמה (Registration Screen)
// ==========================================

// ייבוא React והפונקציה useState לניהול מצב (state)
import React, { useState } from 'react';

// ייבוא רכיבים מ-React Native:
// - View: קונטיינר בסיסי (כמו div ב-HTML)
// - Text: להצגת טקסט
// - StyleSheet: ליצירת סגנונות (כמו CSS)
// - TextInput: שדה קלט טקסט
// - TouchableOpacity: כפתור שניתן ללחוץ עליו
// - Alert: חלון התראה (למובייל)
// - ImageBackground: תמונת רקע
// - ScrollView: מאפשר גלילה כשיש הרבה תוכן
// - Platform: לזיהוי הפלטפורמה (web/android/ios)
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ImageBackground, ScrollView, Platform } from 'react-native';

// ייבוא הניווט מ-expo-router - מאפשר מעבר בין מסכים
import { useRouter } from 'expo-router';

// ייבוא הקונפיגורציה לשליחת בקשות לשרת
import api from '../api/config';

// ייבוא SafeAreaView - מונע חפיפה עם סרגלי המערכת (notch, סרגל תחתון וכו')
import { SafeAreaView } from 'react-native-safe-area-context';

// ==========================================
// ייבוא תמונות
// ==========================================
// תמונת הרקע של עמוד ההרשמה
import RegisterBg from '../assets/images/Register.png';

// ==========================================
// הקומפוננטה הראשית - מסך ההרשמה
// ==========================================
export default function RegisterScreen() {
  // הוק לניווט - מאפשר לעבור לעמודים אחרים
  const router = useRouter();

  // ---- ניהול מצב (State) ----
  // משתנים שמחזיקים את מה שהמשתמש מקליד
  const [firstName, setFirstName] = useState('');   // שם פרטי (חובה)
  const [lastName, setLastName] = useState('');     // שם משפחה (אופציונלי)
  const [email, setEmail] = useState('');           // אימייל (חובה)
  const [password, setPassword] = useState('');     // סיסמה (חובה)

  // ==========================================
  // פונקציית הרשמה - מתבצעת בלחיצה על "Sign Up"
  // ==========================================
  const handleRegister = async () => {
    console.log('SIGN UP PRESSED');
    
    // ---- שלב 1: וידוא שדות חובה ----
    // בודק שהמשתמש מילא את כל השדות הנדרשים
    if (!firstName || !email || !password) {
      // הצגת הודעת שגיאה (שונה בין web למובייל)
      if (Platform.OS === 'web') {
        alert("Please fill in all required fields (First Name, Email, Password)");
      } else {
        Alert.alert("Error", "Please fill in all required fields (First Name, Email, Password)");
      }
      return; // עוצר את הפונקציה
    }

    // ---- שלב 2: שליחה לשרת ----
    try {
      // שליחת בקשת POST לשרת עם פרטי ההרשמה
      const { data } = await api.post('/api/register', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      });

      console.log('REGISTER response:', data);

      // ---- שלב 3: הצלחה! ----
      // מציג הודעת הצלחה ומחזיר לעמוד ההתחברות
      if (Platform.OS === 'web') {
        alert('Registration complete! Log in to get started');
        router.replace('/');  // חזרה לעמוד login
      } else {
        Alert.alert("Success", "Registration complete! Log in to get started", [
          { text: "OK", onPress: () => router.replace('/') }
        ]);
      }

    } catch (error: any) {
      // ---- טיפול בשגיאות ----
      console.error(error);
      // מנסה לקחת הודעת שגיאה מהשרת, אם אין - הודעה כללית
      const message = error.response?.data?.message || 'Could not connect to the server';
      if (Platform.OS === 'web') {
        alert("Registration Error: " + message);
      } else {
        Alert.alert("Registration Error", message);
      }
    }
  };

  // ==========================================
  // תצוגת המסך (JSX)
  // ==========================================
  return (
    // SafeAreaView - עוטף הכל ומונע חפיפה עם סרגלי המערכת
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      
      {/* תמונת הרקע */}
      <ImageBackground
        source={RegisterBg}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* ScrollView - מאפשר גלילה כי יש הרבה שדות */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* קונטיינר הטופס */}
          <View style={styles.registerContainer}>
            <Text style={styles.h2}>Sign Up</Text>

            {/* ---- שדה שם פרטי (חובה) ---- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}  // כל פעם שמקלידים, מעדכן את המשתנה
              />
            </View>

            {/* ---- שדה שם משפחה (אופציונלי) ---- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* ---- שדה אימייל (חובה) ---- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"  // מקלדת עם @
                autoCapitalize="none"         // לא הופך אותיות לגדולות
              />
            </View>

            {/* ---- שדה סיסמה (חובה) ---- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry  // מסתיר את הטקסט (נקודות במקום אותיות)
              />
            </View>

            {/* ---- כפתור הרשמה ---- */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* ---- לינק חזרה להתחברות ---- */}
            <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
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
    flex: 1,                      // תופס את כל המקום הזמין
    backgroundColor: '#D9E5EF',   // צבע תואם לתחתית התמונה
  },
  
  // תמונת הרקע
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // קונטיינר ה-ScrollView - ממרכז את התוכן
  scrollContainer: {
    flexGrow: 1,              // מאפשר ל-ScrollView להתרחב
    justifyContent: 'center', // ממרכז אנכית
    alignItems: 'center',     // ממרכז אופקית
    paddingVertical: 20,      // ריווח מלמעלה ומלמטה
  },
  
  // קונטיינר הטופס - שקוף לגמרי
  registerContainer: {
    backgroundColor: 'transparent',
    padding: 32,
    width: '90%',
    maxWidth: 340,
  },
  
  // כותרת "Sign Up"
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  
  // קבוצת שדה קלט (תווית + שדה)
  inputGroup: {
    marginBottom: 15,
  },
  
  // תווית השדה (* First Name וכו')
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
  },
  
  // שדה הקלט עצמו
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  
  // כפתור "Sign Up"
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#156082',   // כחול
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  
  // טקסט בתוך הכפתור
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // כפתור הלינק (חזרה להתחברות)
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  
  // טקסט הלינק
  linkText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
