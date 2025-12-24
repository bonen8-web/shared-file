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
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לקבלת צבע לפי אינדקס
  const getBulletColor = (index: number) => {
    return bulletColors[index % bulletColors.length];
  };

  // פונקציה לפורמט תאריך ושעה
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={TaskScreen}
        style={styles.background}
        resizeMode="stretch"
      >
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
                  {/* נקודה צבעונית */}
                  <View 
                    style={[
                      styles.bullet, 
                      { backgroundColor: getBulletColor(index) }
                    ]} 
                  />
                  
                  {/* תוכן המשימה */}
                  <View style={styles.taskContent}>
                    <Text 
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.completedTask
                      ]}
                    >
                      {task.title}
                    </Text>
                    
                    {task.description && (
                      <Text style={styles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                    
                    {task.due_date && (
                      <Text style={styles.taskDueDate}>
                        📅 {formatDateTime(task.due_date)}
                      </Text>
                    )}
                    
                    {/* הצגת מי הקצה את המשימה (אם זה מישהו אחר) */}
                    {task.created_by_id !== userId && (
                      <Text style={styles.assignedBy}>
                        👤 Assigned by {task.created_by_name}
                      </Text>
                    )}
                  </View>
                  
                  {/* סימן וי אם המשימה הושלמה */}
                  {task.is_completed && (
                    <Text style={styles.completedIcon}>✓</Text>
                  )}
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
