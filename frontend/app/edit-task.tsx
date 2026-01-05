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
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TaskScreen from '../assets/images/task-screen.png';

export default function EditTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  
  // States לטופס
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // States לבוחר תאריך ושעה
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // טעינת פרטי המשימה
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}`);
      if (data.task) {
        setTitle(data.task.title || '');
        setDescription(data.task.description || '');
        setIsCompleted(data.task.is_completed || false);
        if (data.task.due_date) {
          setDueDate(new Date(data.task.due_date));
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      if (Platform.OS === 'web') {
        alert('Error loading task details');
      } else {
        Alert.alert('Error', 'Could not load task details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // פתיחת בוחר התאריך
  const openDatePicker = () => {
    setTempDate(dueDate || new Date());
    setShowDatePicker(true);
  };

  // טיפול בשינוי תאריך
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDueDate(selectedDate);
        setShowTimePicker(true);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  // טיפול בשינוי שעה
  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && selectedTime && dueDate) {
        const newDate = new Date(dueDate);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        setDueDate(newDate);
      }
    } else {
      if (selectedTime) {
        setTempDate(selectedTime);
      }
    }
  };

  // אישור התאריך (iOS)
  const confirmDate = () => {
    setDueDate(tempDate);
    setShowDatePicker(false);
  };

  // פורמט תאריך ושעה לתצוגה
  const formatDateTime = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // עדכון משימה
  const handleUpdate = async () => {
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
      await api.put(`/api/tasks/${taskId}`, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
        is_completed: isCompleted,
      });

      if (Platform.OS === 'web') {
        alert('Task updated successfully!');
        router.back();
      } else {
        Alert.alert('Success', 'Task updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      const message = error.response?.data?.message || 'Failed to update task';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // מחיקת משימה
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this task?')) {
        deleteTask();
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: deleteTask }
        ]
      );
    }
  };

  const deleteTask = async () => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      if (Platform.OS === 'web') {
        alert('Task deleted successfully!');
        router.back();
      } else {
        Alert.alert('Success', 'Task deleted successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete task');
      } else {
        Alert.alert('Error', 'Failed to delete task');
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ImageBackground source={TaskScreen} style={styles.background} resizeMode="stretch">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5AA0D6" />
            <Text style={styles.loadingText}>Loading task...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

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

        {/* כותרת */}
        <Text style={styles.pageTitle}>Edit Task</Text>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* כותרת המשימה */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
              />
            </View>

            {/* תיאור */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* תאריך ושעה */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date & Time</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 16,
                    width: '100%',
                  }}
                  value={dueDate ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}T${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}` : ''}
                  onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                />
              ) : (
                <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                  <Text style={styles.dateButtonText}>
                    {dueDate ? formatDateTime(dueDate) : 'Select date and time'}
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
              />
            )}

            {/* בוחר שעה לאנדרואיד */}
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="time"
                display="default"
                onChange={onTimeChange}
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
                      <Text style={styles.modalTitle}>Select Date & Time</Text>
                      <TouchableOpacity onPress={confirmDate}>
                        <Text style={styles.modalDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="datetime"
                      display="spinner"
                      onChange={onDateChange}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* סטטוס - הושלם/לא הושלם */}
            <View style={styles.switchContainer}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Mark as Completed</Text>
                <Text style={styles.switchSubLabel}>
                  {isCompleted ? 'Task is completed ✓' : 'Task is pending'}
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isCompleted ? "#4CAF50" : "#f4f3f4"}
                onValueChange={setIsCompleted}
                value={isCompleted}
              />
            </View>

            {/* כפתור עדכון */}
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleUpdate}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Updating...' : 'Update Task'}
              </Text>
            </TouchableOpacity>

            {/* כפתור מחיקה */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️ Delete Task</Text>
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
    backgroundColor: '#D9E5EF',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
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
    color: '#5AA0D6',
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
    marginBottom: 30,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#5AA0D6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0c4e8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#5AA0D6',
    fontWeight: '600',
  },
});

