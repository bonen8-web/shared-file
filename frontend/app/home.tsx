// מייבאים רכיבים מ-React כדי שנוכל לבנות את המסך
import React from 'react';

import Homepage from '../assets/images/Homepage.png';

// מייבאים רכיבים מ-React Native לבניית ממשק: View, Text, כפתורים, וכו'
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

// מייבאים SafeAreaView כדי לא לחפוף עם סרגלי המערכת
import { SafeAreaView } from 'react-native-safe-area-context';

// מייבאים את הניווט של expo-router כדי לעבור בין מסכים
import { useRouter } from 'expo-router';

// פונקציית הקומפוננטה – זה המסך עצמו
export default function HomeScreen() {

  // router מאפשר לנו לעבור למסכים אחרים
  const router = useRouter();

  return (
    // SafeAreaView עוטף הכל כדי לא לחפוף עם סרגלי המערכת
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={Homepage}
        style={styles.background}
        resizeMode="stretch"
      >
        <View style={styles.circleContainer}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.circle, { backgroundColor: '#5AA0D6' }]}
              onPress={() => router.push('/tasks')}
            >
              <Text style={styles.circleText}>My Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.circle, { backgroundColor: '#36C1C8' }]}
              onPress={() => router.push('/dog-parks')}
            >
              <Text style={styles.circleText}>Dog Parks</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowCenter}>
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

// כאן נמצא ה"CSS" של React Native
const styles = StyleSheet.create({

safeArea: {
  flex: 1,
  backgroundColor: 'rgb(217, 229, 239)', // צבע רקע תואם לסרגל התחתון
},

background: {
  flex: 1,
  width: '100%',
  height: '100%',
},

  // הקונטיינר של כל העיגולים
circleContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginTop: -50, // מזיז קצת למעלה מהמרכז המדויק
},

row: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 40,
  width: "100%",
  marginBottom: 30,
},

rowCenter: {
  flexDirection: "row",
  justifyContent: "center",
  width: "100%",
  marginTop: 5,
},

circle: {
  width: 120,
  height: 120,
  backgroundColor: "#6EC3FF",
  borderRadius: 60,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},

circleText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'center',
},
});
