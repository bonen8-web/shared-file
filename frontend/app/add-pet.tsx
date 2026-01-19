// ==========================================
// עמוד הוספת חיית מחמד (Add Pet Screen)
// ==========================================
// עמוד זה מאפשר למשתמש להוסיף חיית מחמד חדשה לחשבון שלו.
// המשתמש יכול להזין: שם, סוג חיה, גזע, מין ותאריך לידה.

// ייבוא React והפונקציות לניהול מצב
import React, { useState, useEffect, useCallback } from 'react';

// ייבוא רכיבים מ-React Native:
// - View: קונטיינר בסיסי (כמו div ב-HTML)
// - Text: להצגת טקסט
// - StyleSheet: ליצירת סגנונות (כמו CSS)
// - ImageBackground: תמונת רקע
// - TouchableOpacity: כפתור לחיץ
// - TextInput: שדה קלט טקסט
// - ScrollView: אזור עם גלילה
// - Alert: חלון התראה (מובייל)
// - Platform: לזיהוי הפלטפורמה (web/android/ios)
// - Modal: חלון מודלי (פופ-אפ)
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal
} from 'react-native';

// SafeAreaView - מונע חפיפה עם סרגלי המערכת (notch, סרגל תחתון)
import { SafeAreaView } from 'react-native-safe-area-context';

// useRouter - הוק לניווט בין עמודים
import { useRouter } from 'expo-router';

// DateTimePicker - רכיב לבחירת תאריך (נייטיב לאנדרואיד/iOS)
import DateTimePicker from '@react-native-community/datetimepicker';

// api - מודול לשליחת בקשות HTTP לשרת
import api from '../api/config';

// AsyncStorage - אחסון מקומי (כמו localStorage בווב)
import AsyncStorage from '@react-native-async-storage/async-storage';

// useFocusEffect - הוק שרץ כשהעמוד מקבל פוקוס
import { useFocusEffect } from 'expo-router';

// ייבוא תמונת הרקע
import HealthPage from '../assets/images/health-page.png';

// ==========================================
// הקומפוננטה הראשית - מסך הוספת חיה
// ==========================================
export default function AddPetScreen() {
  // הוק לניווט - מאפשר לעבור לעמודים אחרים
  const router = useRouter();
  
  // ========== State - משתני מצב של הקומפוננטה ==========
  const [name, setName] = useState('');                          // שם החיה (חובה)
  const [species, setSpecies] = useState('');                    // סוג החיה (כלב/חתול/אחר)
  const [customSpecies, setCustomSpecies] = useState('');        // סוג מותאם אישית (אם בחרו "Other")
  const [breed, setBreed] = useState('');                        // גזע
  const [gender, setGender] = useState('');                      // מין (Male/Female)
  const [birthDate, setBirthDate] = useState<Date | null>(null); // תאריך לידה
  const [userId, setUserId] = useState<number | null>(null);     // מזהה המשתמש
  
  // States לבוחר תאריך (נייטיב)
  const [showDatePicker, setShowDatePicker] = useState(false);   // האם להציג את בוחר התאריך
  const [tempDate, setTempDate] = useState(new Date());          // תאריך זמני (לפני אישור)

  // רשימת סוגי החיות האפשריים לבחירה
  const speciesOptions = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Guinea Pig', 'Turtle', 'Other'];

  // useEffect - רץ פעם אחת כשהקומפוננטה נטענת
  useEffect(() => {
    loadUserId();  // טוען את מזהה המשתמש מהאחסון המקומי
  }, []);

  // ========== פונקציה לטעינת מזהה המשתמש ==========
  // שולפת את ה-userId מהאחסון המקומי (נשמר בזמן ההתחברות)
  const loadUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      // המרה ממחרוזת למספר (parseInt בבסיס 10)
      setUserId(parseInt(storedUserId, 10));
    }
  };

  // ========== פונקציה לפתיחת בוחר התאריך ==========
  const openDatePicker = () => {
    // אם יש תאריך קיים - משתמשים בו, אחרת היום
    setTempDate(birthDate || new Date());
    setShowDatePicker(true);
  };

  // ========== טיפול בשינוי תאריך ==========
  // הפונקציה מטפלת שונה בין אנדרואיד ל-iOS
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // באנדרואיד - הבוחר נסגר אוטומטית אחרי בחירה
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setBirthDate(selectedDate);  // שומר ישירות
      }
    } else {
      // ב-iOS - הבוחר נשאר פתוח, שומר בזמני
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  // ========== אישור התאריך (iOS בלבד) ==========
  // ב-iOS צריך לחיצה על "Done" כדי לאשר את הבחירה
  const confirmDate = () => {
    setBirthDate(tempDate);
    setShowDatePicker(false);
  };

  // ========== פורמט תאריך לתצוגה ==========
  // ממיר Date לפורמט DD/MM/YYYY
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // ==========================================
  // פונקציית הוספת חיה - מתבצעת בלחיצה על "Add Pet"
  // ==========================================
  const handleAddPet = async () => {
    // ---- שלב 1: ולידציה ----
    // בודק שהמשתמש הזין שם (שדה חובה)
    if (!name.trim()) {
      // הצגת הודעת שגיאה - שונה בין web למובייל
      if (Platform.OS === 'web') {
        alert('Please enter a pet name');
      } else {
        Alert.alert('Error', 'Please enter a pet name');
      }
      return;  // עוצר את הפונקציה
    }

    // ---- שלב 2: הכנת הנתונים ----
    // קביעת הסוג הסופי - אם בחרו "Other", משתמשים בטקסט שהוקלד
    const finalSpecies = species === 'Other' ? customSpecies.trim() : species;

    // ---- שלב 3: שליחה לשרת ----
    try {
      // שליחת בקשת POST ל-API עם פרטי החיה
      const { data } = await api.post('/api/pets', {
        user_id: userId,
        name: name.trim(),
        species: finalSpecies || null,
        breed: breed.trim() || null,
        gender: gender || null,
        // המרת תאריך לפורמט YYYY-MM-DD (פורמט שהשרת מצפה לו)
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
      });

      // ---- שלב 4: הצלחה! ----
      if (Platform.OS === 'web') {
        alert('Pet added successfully!');
        router.back();  // חזרה לעמוד הקודם
      } else {
        Alert.alert(
          'Pet Added Successfully!', 
          'Your pet has been added to your profile.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            }
          ]
        );
      }
    } catch (error: any) {
      // ---- טיפול בשגיאות ----
      console.error('Error adding pet:', error);
      // מנסה לקחת הודעת שגיאה מהשרת, אם אין - הודעה כללית
      const message = error.response?.data?.message || 'Network error. Please try again.';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    }
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

        {/* כותרת */}
        <Text style={styles.pageTitle}>Add New Pet</Text>

        {/* טופס הוספה */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter pet name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <View style={styles.speciesContainer}>
                {speciesOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.speciesButton,
                      species === option && styles.speciesButtonActive
                    ]}
                    onPress={() => setSpecies(option)}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      species === option && styles.speciesButtonTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* שדה להקלדה חופשית אם בחרו "Other" */}
              {species === 'Other' && (
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  value={customSpecies}
                  onChangeText={setCustomSpecies}
                  placeholder="Enter species type"
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="e.g. Golden Retriever"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={[styles.genderButtonText, gender === 'Male' && styles.genderButtonTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={[styles.genderButtonText, gender === 'Female' && styles.genderButtonTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 16,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : null)}
                />
              ) : (
                <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                  <Text style={styles.dateButtonText}>
                    {birthDate ? formatDate(birthDate) : 'Select birth date'}
                  </Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* בוחר תאריך לאנדרואיד */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* מודל בוחר תאריך ל-iOS */}
            {Platform.OS === 'ios' && (
              <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={confirmDate}>
                        <Text style={styles.modalDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  </View>
                </View>
              </Modal>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleAddPet}>
              <Text style={styles.submitButtonText}>Add Pet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </ImageBackground>
    </SafeAreaView>
  );
}

// ==========================================
// StyleSheet - הגדרות עיצוב הקומפוננטה
// ==========================================
const styles = StyleSheet.create({
  // ---------- סגנונות בסיס ----------
  safeArea: {
    flex: 1,                      // תופס את כל המקום הזמין
    backgroundColor: '#D9E5EF',   // צבע רקע תואם לתמונה
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
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
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  speciesButtonActive: {
    backgroundColor: '#6ED29A',
    borderColor: '#6ED29A',
  },
  speciesButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  speciesButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6ED29A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalDone: {
    fontSize: 16,
    color: '#6ED29A',
    fontWeight: '600',
  },
});


