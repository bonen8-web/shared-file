import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  // 1. משתנים לשמירת המידע (במקום getElementById)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const router = useRouter();

  // 2. הפונקציה שמתבצעת בלחיצה על "התחבר"
  const handleLogin = async () => {
    try {
      // הערה חשובה: אם את בודקת בטלפון אמיתי, צריך להחליף את הכתובת ל-IP של המחשב שלך
      // לדוגמה: 'http://192.168.1.15:5000/api/login'
      // אם את בודקת בדפדפן במחשב, 127.0.0.1 זה בסדר.
      //http://127.0.0.1:5000/api/login
      const response = await fetch('http://192.168.192.223:5000/api/login' , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      // 4. הצגת התשובה למשתמש (בדיוק כמו ב-JS שלך)
      if (response.ok) {
        // הצלחה
        if (Platform.OS === 'web') {
          alert("Success " + data.message);
        } else {
          Alert.alert("Success", data.message);
        }
      } else {
        // שגיאה מהשרת (למשל סיסמה לא נכונה)
        if (Platform.OS === 'web') {
          alert("Error: " + data.message);
        } else {
          Alert.alert("Error", data.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (Platform.OS === 'web') {
        alert("Network Error While Trying To Connect To The Server.");
      } else {
        Alert.alert("Network Error", "Could not connect to the server");
      }
    }
  };

  return (
    <View style={styles.body}>
      {/* הקופסה הלבנה - login-container */}
      <View style={styles.loginContainer}>
        <Text style={styles.h2}>Login</Text>
        
        {/* קבוצת אימייל */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            placeholder="" 
            value={email}
            onChangeText={setEmail} // מעדכן את המשתנה email בכל הקלדה
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* קבוצת סיסמה */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input}
            placeholder=""
            value={password}
            onChangeText={setPassword} // מעדכן את המשתנה password
            secureTextEntry // מסתיר את הטקסט (כמו type="password")
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New here?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// --- כאן נמצא ה-CSS המתורגם ---
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    // תרגום של box-shadow:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5, // צל לאנדרואיד
    
    width: '90%', // בטלפון עדיף רוחב יחסי ולא קבוע (320px)
    maxWidth: 340,
  },
  h2: {
    fontSize: 24, // גודל ברירת מחדל של h2 בערך
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#000',
    textAlign: 'left', // חשוב לעברית
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1, // ב-RN זה borderWidth ולא border
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'left', // התאמה לעברית/אנגלית
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center', // מרכוז הטקסט בתוך הכפתור
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerContainer: {
    marginTop: 20,           // רווח מלמעלה (מהכפתור הכחול)
    flexDirection: 'row',    // מסדר את הטקסט והלינק באותה שורה
    justifyContent: 'center',// ממקם אותם באמצע
  },
  registerText: {
    color: '#666',           // צבע אפור לטקסט הרגיל
    fontSize: 14,
  },
  registerLink: {
    color: '#007bff',        // צבע כחול ללינק
    fontSize: 14,
    fontWeight: 'bold',      // טקסט מודגש
    marginLeft: 5,           // רווח קטן מהטקסט הרגיל
  }
});