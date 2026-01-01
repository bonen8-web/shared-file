import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ייבוא תמונת הרקע
import TaskScreen from '../assets/images/Task screen.png';

// צבעים לנקודות - כל משימה תקבל צבע מהמערך
const bulletColors = [
  '#FF6B6B', // אדום קורל
  '#4ECDC4', // טורקיז
  '#FFE66D', // צהוב
  '#95E1D3', // מנטה
  '#F38181', // סלמון
  '#AA96DA', // סגול בהיר
  '#6C5CE7', // סגול כהה
  '#00B894', // ירוק
  '#FDCB6E', // כתום
  '#74B9FF', // כחול בהיר
];

interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  pet_id: number | null;
  created_by_id: number;
  created_by_name: string;
}

export default function ViewTasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserIdAndFetchTasks();
  }, []);

  const loadUserIdAndFetchTasks = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      const uid = parseInt(storedUserId, 10);
      setUserId(uid);
      fetchTasks(uid);
    }
  };

  const fetchTasks = async (uid: number) => {
    try {
      const { data } = await api.get(`/api/users/${uid}/tasks`);
      // מיון: קודם משימות שלא הושלמו, אחר כך משימות שהושלמו
      const sortedTasks = (data.tasks || []).sort((a: Task, b: Task) => {
        if (a.is_completed === b.is_completed) return 0;
        return a.is_completed ? 1 : -1;
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לסימון משימה כהושלמה/לא הושלמה
  const toggleTaskCompletion = async (taskId: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/tasks/${taskId}`, {
        is_completed: !currentStatus
      });
      // רענון הרשימה
      if (userId) {
        fetchTasks(userId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // פונקציה לקבלת צבע לפי אינדקס
  const getBulletColor = (index: number) => {
    return bulletColors[index % bulletColors.length];
  };

  // פונקציה לפורמט תאריך ושעה - ללא המרת timezone
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    // מפרש את התאריך כשעה מקומית (בלי המרת timezone)
    const parts = dateString.replace('T', ' ').replace('Z', '').split(/[- :]/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // חודשים מתחילים מ-0
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]) || 0;
    const minute = parseInt(parts[4]) || 0;
    
    return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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
        <Text style={styles.pageTitle}>My Tasks</Text>
        
        {/* תוכן העמוד */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet!</Text>
              <Text style={styles.emptySubtext}>Create your first task</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.tasksList}
              showsVerticalScrollIndicator={false}
            >
              {tasks.map((task, index) => (
                <View key={task.id} style={styles.taskItem}>
                  {/* צ'קבוקס לסימון השלמה */}
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => toggleTaskCompletion(task.id, task.is_completed)}
                  >
                    <View style={[
                      styles.checkboxInner,
                      task.is_completed && styles.checkboxChecked
                    ]}>
                      {task.is_completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  
                  {/* תוכן המשימה - לחיצה לעריכה */}
                  <TouchableOpacity 
                    style={styles.taskContent}
                    onPress={() => router.push(`/edit-task?taskId=${task.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text 
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.completedTask
                      ]}
                    >
                      {task.title}
                    </Text>
                    
                    {task.description && (
                      <Text style={[
                        styles.taskDescription,
                        task.is_completed && styles.completedText
                      ]}>
                        {task.description}
                      </Text>
                    )}
                    
                    {task.due_date && (
                      <Text style={[
                        styles.taskDueDate,
                        task.is_completed && styles.completedText
                      ]}>
                        📅 {formatDateTime(task.due_date)}
                      </Text>
                    )}
                    
                    {/* הצגת מי הקצה את המשימה (אם זה מישהו אחר) */}
                    {task.created_by_id !== userId && (
                      <Text style={styles.assignedBy}>
                        👤 Assigned by {task.created_by_name}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  {/* אייקון עריכה */}
                  <TouchableOpacity 
                    onPress={() => router.push(`/edit-task?taskId=${task.id}`)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* כפתור הוספת משימה חדשה */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-task')}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>
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
    color: '#333',
    fontSize: 14,
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
    padding: 20,
    paddingTop: 30,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#555',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.2)',
  },
  bullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskDueDate: {
    fontSize: 13,
    color: '#5AA0D6',
    marginTop: 8,
    fontWeight: '500',
  },
  assignedBy: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontStyle: 'italic',
  },
  completedIcon: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  editIcon: {
    fontSize: 18,
    color: '#5AA0D6',
  },
  editButton: {
    padding: 5,
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5AA0D6',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedText: {
    color: '#999',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5AA0D6',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
