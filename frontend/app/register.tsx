import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ImageBackground, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../api/config';
import { SafeAreaView } from 'react-native-safe-area-context';

// תמונת רקע
import RegisterBg from '../assets/images/Register.png';

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleRegister = async () => {
    console.log('SIGN UP PRESSED');
    if (!firstName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields (First Name, Email, Password)");
      return;
    }

    try {
      const { data } = await api.post('/register', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
      });

      console.log('REGISTER response:', data);

      if (Platform.OS === 'web') {
        alert('Registration complete! Log in to get started');
        router.replace('/');
      } else {
        Alert.alert("Success", "Registration complete! Log in to get started", [
          { text: "OK", onPress: () => router.replace('/') }
        ]);
      }

    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Could not connect to the server';
      Alert.alert("Registration Error", message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={RegisterBg}
        style={styles.background}
        resizeMode="stretch"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.registerContainer}>
            <Text style={styles.h2}>Sign Up</Text>

            {/* First_Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last_Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>* Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Back To Login Button */}
            <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D9E5EF', // צבע תואם לתחתית התמונה
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  registerContainer: {
    backgroundColor: 'transparent',  // שקוף לגמרי
    padding: 32,
    width: '90%',
    maxWidth: 340,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: 'transparent',  // שקוף לגמרי
    textAlign: 'left',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#156082',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
  }
});