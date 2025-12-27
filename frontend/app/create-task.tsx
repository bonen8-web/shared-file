import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ייבוא תמונת הרקע
import TaskScreen from '../assets/images/Task screen.png';

interface Pet {
  id: number;
  name: string;
  species: string;
}

interface PetOwner {
  user_id: number;
  first_name: string;
  email: string;
}

export default function CreateTaskScreen() {
  const router = useRouter();
  
  // States לטופס
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(false);
  
  // States לבוחר תאריך ושעה
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const [userId, setUserId] = useState<number | null>(null);
  
  // States להקצאת משימה
  const [petOwners, setPetOwners] = useState<PetOwner[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null);

  // טעינת ה-user_id ורשימת החיות
  useEffect(() => {
    loadUserIdAndFetchPets();
  }, []);

  // כשבוחרים חיה - טען את רשימת הבעלים שלה
  useEffect(() => {
    if (selectedPet) {
      fetchPetOwners(selectedPet);
    } else {
      setPetOwners([]);
      setAssignedUserId(null);
    }
  }, [selectedPet]);

  const loadUserIdAndFetchPets = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      const uid = parseInt(storedUserId, 10);
      setUserId(uid);
      setAssignedUserId(uid); // ברירת מחדל - המשימה מוקצית ליוצר
      fetchPets(uid);
    }
  };

  const fetchPets = async (uid: number) => {
    try {
      const { data } = await api.get(`/api/users/${uid}/pets`);
      setPets(data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchPetOwners = async (petId: number) => {
    try {
      const { data } = await api.get(`/api/pets/${petId}/owners`);
      setPetOwners(data.owners || []);
    } catch (error) {
      console.error('Error fetching pet owners:', error);
    }
  };

  // פורמט תאריך להצגה
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'Select date & time';
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // פורמט תאריך לשליחה לשרת
  const formatServerDate = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // טיפול בבחירת תאריך
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
        setShowTimePicker(true);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  // טיפול בבחירת שעה
  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedTime) {
        const finalDate = new Date(tempDate);
        finalDate.setHours(selectedTime.getHours());
        finalDate.setMinutes(selectedTime.getMinutes());
        setDueDate(finalDate);
      }
    } else {
      if (selectedTime) {
        setTempDate(selectedTime);
      }
    }
  };

  // אישור בחירת תאריך ושעה (iOS)
  const confirmDateTime = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
  };

  // פתיחת בוחר תאריך
  const openDatePicker = () => {
    setTempDate(dueDate || new Date());
    setShowDatePicker(true);
  };


  //While using the switch button to sync with Google Calendar
  const toggleSync = async (value: boolean) => {
  
    //If switch is on:
    if (value) {
      try {
        
        const { data } = await api.get('/api/auth/google');

      if (data.auth_url) {
  const confirmed = window.confirm("Connect to Google Calendar?");
  if (confirmed) {
    setSyncToCalendar(true);
    window.open(data.auth_url, '_blank');
  } else {
    setSyncToCalendar(false);
  }
}
      } catch (error) {
        console.error('Error fetching auth url:', error);
        if (Platform.OS === 'web') {
          alert('Error: Could not connect to Google service');
        } else {
          Alert.alert('Error', 'Could not connect to Google service');
        }
        setSyncToCalendar(false);
      }
    } 
    else 
    {  
      setSyncToCalendar(false);
    }
  };


  // Send task
  const handleSubmit = async () => {
    // Validations
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a task title');
      } else {
        Alert.alert('Error', 'Please enter a task title');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/api/tasks', {
        user_id: userId,
        assigned_user_id: assignedUserId,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? dueDate.toISOString() : null,
        pet_id: selectedPet,
        sync_to_calendar: syncToCalendar,
      });

      if (Platform.OS === 'web') {
        alert('Task created successfully!');
        router.push('/view-tasks');
      } else {
        Alert.alert('Success', 'Task created successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/view-tasks'),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      const message = error.response?.data?.message || 'Failed to connect to server';
      if (Platform.OS === 'web') {
        alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={TaskScreen}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת העמוד */}
        <Text style={styles.pageTitle}>Create Task</Text>
        
        {/* טופס יצירת משימה */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* שדה כותרת */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* שדה תיאור */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* שדה תאריך ושעה */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date & Time</Text>
            
            {/* Web - שימוש ב-input רגיל */}
            {Platform.OS === 'web' ? (
              <input
                type="datetime-local"
                value={dueDate ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}T${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}` : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDueDate(new Date(e.target.value));
                  } else {
                    setDueDate(null);
                  }
                }}
                min={(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; })()}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  borderRadius: 15,
                  padding: 15,
                  fontSize: 16,
                  color: '#333',
                  border: '1px solid rgba(100, 100, 100, 0.3)',
                  width: '100%',
                  boxSizing: 'border-box' as any,
                }}
              />
            ) : (
              /* Mobile - כפתור שפותח DateTimePicker */
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={openDatePicker}
              >
                <Text style={styles.dateButtonIcon}>📅</Text>
                <Text style={[
                  styles.dateButtonText,
                  !dueDate && styles.dateButtonPlaceholder
                ]}>
                  {formatDisplayDate(dueDate)}
                </Text>
              </TouchableOpacity>
            )}
            
            {dueDate && (
              <TouchableOpacity 
                style={styles.clearDateButton}
                onPress={() => setDueDate(null)}
              >
                <Text style={styles.clearDateText}>Clear date</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* בחירת חיה (אופציונלי) */}
          {pets.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Related Pet (Optional)</Text>
              <View style={styles.petsContainer}>
                <TouchableOpacity
                  style={[
                    styles.petChip,
                    selectedPet === null && styles.petChipSelected
                  ]}
                  onPress={() => setSelectedPet(null)}
                >
                  <Text 
                    style={[
                      styles.petChipText,
                      selectedPet === null && styles.petChipTextSelected
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petChip,
                      selectedPet === pet.id && styles.petChipSelected
                    ]}
                    onPress={() => setSelectedPet(pet.id)}
                  >
                    <Text 
                      style={[
                        styles.petChipText,
                        selectedPet === pet.id && styles.petChipTextSelected
                      ]}
                    >
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* הקצאת משימה - מוצג רק אם נבחרה חיה ויש יותר מבעלים אחד */}
          {selectedPet && petOwners.length > 1 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assign To</Text>
              <View style={styles.petsContainer}>
                {petOwners.map((owner) => (
                  <TouchableOpacity
                    key={owner.user_id}
                    style={[
                      styles.petChip,
                      assignedUserId === owner.user_id && styles.assigneeChipSelected
                    ]}
                    onPress={() => setAssignedUserId(owner.user_id)}
                  >
                    <Text 
                      style={[
                        styles.petChipText,
                        assignedUserId === owner.user_id && styles.petChipTextSelected
                      ]}
                    >
                      {owner.first_name} {owner.user_id === userId ? '(Me)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}


          {/* אפשרות סנכרון ליומן גוגל */}
            <View style={styles.syncContainer}>
              <View style={styles.syncTextContainer}>
              <Text style={styles.syncLabel}>Sync to Google Calendar</Text>
              <Text style={styles.syncSubLabel}>Task will be added to your personal calendar</Text>
              </View>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={syncToCalendar ? "#5AA0D6" : "#f4f3f4"}
              onValueChange={toggleSync}
              value={syncToCalendar}
            />
            </View>

          {/* כפתור שמירה */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Text>
          </TouchableOpacity>

          {/* כפתור ביטול */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </ScrollView>

        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="calendar"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker for Android */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            display="clock"
            onChange={onTimeChange}
            is24Hour={true}
          />
        )}

        {/* Date & Time Picker Modal for iOS */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDateTime}>
                    <Text style={styles.pickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="datetime"
                  display="spinner"
                  onChange={(event, date) => date && setTempDate(date)}
                  minimumDate={new Date()}
                  style={{ height: 200 }}
                />
              </View>
            </View>
          </Modal>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D9E5EF',
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
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#5AA0D6',
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#5AA0D6',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  dateButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateButtonPlaceholder: {
    color: '#999',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  petsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  petChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  petChipSelected: {
    backgroundColor: '#5AA0D6',
    borderColor: '#5AA0D6',
  },
  assigneeChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  petChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  petChipTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#5AA0D6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0c4e4',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  // Modal styles for iOS
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#999',
  },
  pickerDoneText: {
    fontSize: 16,
    color: '#5AA0D6',
    fontWeight: '600',
  },

  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.35)', // שקיפות דומה לשאר השדות שלך
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  syncTextContainer: {
    flex: 1,
    marginRight: 10,
    textAlign: 'left', // ודאי שזה מתאים לכיוון הטקסט שלך
  },
  syncLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  syncSubLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  }
});
