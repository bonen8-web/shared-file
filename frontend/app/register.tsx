import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleRegister = async () => {
    if (!firstName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields (First Name, Email, Password)");
      return;
    }

    try {
      const response = await fetch('http://192.168.192.223:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration complete! Log in to get started", [
          { text: "מעולה", onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert("Registration Error", data.message);
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not connect to the server");
    }
  };

  return (
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
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingVertical: 20,
  },
  registerContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    width: '90%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'left',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#28a745',
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