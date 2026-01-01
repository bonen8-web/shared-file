// =====================================
// עמוד העלאת מסמך - Upload Document Screen
// עמוד זה מאפשר למשתמש להעלות מסמכים רפואיים עבור חיית המחמד שלו
// (כמו תעודות חיסון, תוצאות בדיקות, מרשמים וכו')
// =====================================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,     // רקע עם תמונה
  TouchableOpacity,    // כפתור לחיץ
  TextInput,           // שדה קלט טקסט
  ScrollView,          // אזור גלילה
  Alert,               // התראות (מובייל)
  Platform             // זיהוי פלטפורמה (iOS/Android/Web)
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // אזור בטוח מהנוטש
import { useRouter, useLocalSearchParams } from 'expo-router'; // ניווט + קבלת פרמטרים מה-URL
import api from '../api/config';                               // חיבור לשרת
import AsyncStorage from '@react-native-async-storage/async-storage'; // אחסון מקומי
import * as DocumentPicker from 'expo-document-picker';        // בחירת קבצים מהמכשיר

// תמונת רקע
import AddNewDoc from '../assets/images/add-new-doc.png';

export default function UploadDocumentScreen() {
  const router = useRouter();  // הוק לניווט בין עמודים
  
  // שליפת petId מה-URL (הפרמטר שהועבר מהעמוד הקודם)
  // לדוגמה: /upload-document?petId=5 → petId = "5"
  const { petId } = useLocalSearchParams();
  
  // ========== State - משתני מצב של הקומפוננטה ==========
  const [userId, setUserId] = useState<number | null>(null);    // מזהה המשתמש
  const [documentName, setDocumentName] = useState('');          // שם המסמך
  const [documentType, setDocumentType] = useState('');          // סוג המסמך (חיסון/בדיקה וכו')
  const [notes, setNotes] = useState('');                        // הערות (אופציונלי)
  const [selectedFile, setSelectedFile] = useState<any>(null);   // הקובץ שנבחר

  // רשימת סוגי המסמכים האפשריים
  const documentTypes = ['Vaccination', 'Medical Record', 'Lab Results', 'Prescription', 'Insurance', 'Other'];

  // useEffect - רץ פעם אחת כשהקומפוננטה נטענת
  useEffect(() => {
    loadUserId();  // טוען את מזהה המשתמש
  }, []);

  // ========== פונקציה לטעינת מזהה המשתמש ==========
  const loadUserId = async () => {
    // שליפה מהאחסון המקומי
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      // המרה ממחרוזת למספר (parseInt בבסיס 10)
      setUserId(parseInt(storedUserId, 10));
    }
  };

  // ========== פונקציה לבחירת קובץ מהמכשיר ==========
  const pickDocument = async () => {
    try {
      // פתיחת חלון בחירת קבצים
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],  // מאפשר רק PDF או תמונות
        copyToCacheDirectory: true,             // מעתיק לתיקיית cache של האפליקציה
      });

      // בדיקה שהמשתמש בחר קובץ (ולא ביטל)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // שמירת הקובץ הנבחר ב-state
        setSelectedFile(result.assets[0]);
        
        // אם עדיין לא הוזן שם - משתמש בשם הקובץ (ללא הסיומת)
        // הרג'קס מסיר את הסיומת: "report.pdf" → "report"
        if (!documentName) {
          setDocumentName(result.assets[0].name.replace(/\.[^/.]+$/, ''));
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  // הגדרות cPanel להעלאה ישירה
  const CPANEL_UPLOAD_URL = 'http://orelbo2.mtacloud.co.il/upload.php';
  const CPANEL_UPLOAD_KEY = 'MyPetTime2024Secret';

  // ========== פונקציה לשליחת המסמך לשרת ==========
  const handleUpload = async () => {
    // ---------- ולידציה (בדיקות תקינות) ----------
    
    // בדיקה 1: האם נבחר קובץ?
    if (!selectedFile) {
      if (Platform.OS === 'web') {
        alert('Please select a file first');
      } else {
        Alert.alert('Error', 'Please select a file first');
      }
      return;
    }

    // בדיקה 2: האם הוזן שם מסמך?
    // trim() מסיר רווחים מיותרים מההתחלה והסוף
    if (!documentName.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a document name');
      } else {
        Alert.alert('Error', 'Please enter a document name');
      }
      return;  // עוצר את הפונקציה
    }

    // בדיקה 3: האם נבחר סוג מסמך?
    if (!documentType) {
      if (Platform.OS === 'web') {
        alert('Please select a document type');
      } else {
        Alert.alert('Error', 'Please select a document type');
      }
      return;
    }

    // ---------- שלב 1: העלאה ישירה ל-cPanel ----------
    try {
      console.log('Starting upload to:', CPANEL_UPLOAD_URL);
      console.log('Selected file:', selectedFile);
      
      // יצירת FormData להעלאה ל-cPanel
      const cpanelFormData = new FormData();
      
      // הוספת הקובץ ל-FormData - שונה בין Web ל-Mobile
      if (Platform.OS === 'web') {
        // ב-Web: צריך להמיר את הקובץ ל-Blob
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        cpanelFormData.append('file', blob, selectedFile.name);
      } else {
        // ב-Mobile: משתמשים באובייקט עם uri
        const fileUri = Platform.OS === 'android' 
          ? selectedFile.uri 
          : selectedFile.uri.replace('file://', '');
        
        cpanelFormData.append('file', {
          uri: fileUri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        } as any);
      }
      
      // הוספת מפתח אבטחה
      cpanelFormData.append('key', CPANEL_UPLOAD_KEY);

      console.log('Sending request...');
      
      // שליחה ישירה ל-cPanel
      const cpanelResponse = await fetch(CPANEL_UPLOAD_URL, {
        method: 'POST',
        body: cpanelFormData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', cpanelResponse.status);
      const responseText = await cpanelResponse.text();
      console.log('Response text:', responseText);
      
      let cpanelData;
      try {
        cpanelData = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
      }
      
      if (cpanelData.status !== 'success') {
        throw new Error(cpanelData.message || 'Upload to cPanel failed');
      }

      // ---------- שלב 2: שמירת המידע ב-DB דרך Render ----------
      const { data } = await api.post('/api/save_document', {
        pet_id: petId,
        document_name: selectedFile.name,
        file_url: cpanelData.file_url,
      });

      // הצלחה - מציג הודעה וחוזר לעמוד הקודם
      if (Platform.OS === 'web') {
        alert('Document uploaded successfully!');
        router.back();
      } else {
        Alert.alert('Success', 'Document uploaded successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      // הצגת הודעת שגיאה
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  // ========== ה-JSX - מבנה הממשק הגרפי ==========
  return (
    // SafeAreaView - מבטיח שהתוכן לא יוסתר ע"י הנוטש
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      
      {/* רקע עם תמונה */}
      <ImageBackground
        source={AddNewDoc}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* ========== כפתור חזרה ========== */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* ========== כותרת העמוד ========== */}
        <Text style={styles.pageTitle}>Upload Document</Text>

        {/* ========== טופס העלאת מסמך ========== */}
        {/* ScrollView מאפשר גלילה אם התוכן ארוך */}
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            
            {/* ---------- אזור בחירת קובץ ---------- */}
            {/* לחיצה פותחת את בורר הקבצים */}
            <TouchableOpacity style={styles.filePickerButton} onPress={pickDocument}>
              <Text style={styles.filePickerIcon}>📄</Text>
              {/* מציג את שם הקובץ שנבחר, או הוראה אם לא נבחר */}
              <Text style={styles.filePickerText}>
                {selectedFile ? selectedFile.name : 'Tap to select a document'}
              </Text>
            </TouchableOpacity>

            {/* ---------- שדה שם המסמך ---------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Name *</Text>
              <TextInput
                style={styles.input}
                value={documentName}              // הערך הנוכחי מה-state
                onChangeText={setDocumentName}   // עדכון ה-state בכל שינוי
                placeholder="Enter document name"
              />
            </View>

            {/* ---------- בחירת סוג מסמך ---------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Type *</Text>
              <View style={styles.typeButtons}>
                {/* map - יוצר כפתור לכל סוג מסמך */}
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type}  // key ייחודי (חובה ברשימות)
                    // שילוב סגנונות: רגיל + פעיל (אם נבחר)
                    style={[styles.typeButton, documentType === type && styles.typeButtonActive]}
                    onPress={() => setDocumentType(type)}
                  >
                    <Text style={[styles.typeButtonText, documentType === type && styles.typeButtonTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ---------- שדה הערות (אופציונלי) ---------- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this document..."
                multiline            // מאפשר כמה שורות
                numberOfLines={4}    // גובה התחלתי
              />
            </View>

            {/* ---------- כפתור שליחה ---------- */}
            <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
              <Text style={styles.submitButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

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
    flex: 1,
    backgroundColor: '#D9E5EF',  // צבע רקע כחול-אפור
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // ---------- כפתור חזרה ----------
  backButton: {
    position: 'absolute',  // מיקום קבוע על המסך
    top: 50,
    left: 20,
    zIndex: 10,            // מעל אלמנטים אחרים
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
  
  // ---------- כותרת ----------
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6ED29A',      // ירוק
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  
  // ---------- אזור התוכן ----------
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  
  // ---------- כרטיס הטופס ----------
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    // צללית (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,  // צללית (Android)
  },
  
  // ---------- כפתור בחירת קובץ ----------
  filePickerButton: {
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
    borderColor: '#6ED29A',
    borderStyle: 'dashed',   // קו מקווקו
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  filePickerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // ---------- שדות קלט ----------
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',  // טקסט מתחיל מלמעלה
  },
  
  // ---------- כפתורי סוג מסמך ----------
  typeButtons: {
    flexDirection: 'row',   // סידור אופקי
    flexWrap: 'wrap',       // שבירת שורה אוטומטית
    gap: 8,                 // רווח בין הכפתורים
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,       // פינות מעוגלות (כפתור "גלולה")
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  typeButtonActive: {
    backgroundColor: '#6ED29A',  // רקע ירוק כשנבחר
    borderColor: '#6ED29A',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',  // טקסט לבן כשנבחר
  },
  
  // ---------- כפתור שליחה ----------
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
});
// ===================================== סוף הקובץ =====================================

