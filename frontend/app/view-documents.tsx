import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../api/config';

import ChooseDataToView from '../assets/images/Choose data to view.png';

interface Document {
  id: number;
  name: string;
  url: string;
  upload_date: string;
}

export default function ViewDocumentsScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [petId]);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get(`/pets/${petId}/documents`);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // פתיחת/הורדת מסמך
  const openDocument = async (doc: Document) => {
    try {
      const supported = await Linking.canOpenURL(doc.url);
      if (supported) {
        await Linking.openURL(doc.url);
      } else {
        if (Platform.OS === 'web') {
          window.open(doc.url, '_blank');
        } else {
          Alert.alert('Error', 'Cannot open this document');
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  // פורמט תאריך
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={ChooseDataToView}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>Documents</Text>

        {/* מספר מסמכים */}
        <Text style={styles.documentsCount}>
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </Text>

        {/* רשימת מסמכים */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6ED29A" />
              <Text style={styles.loadingText}>Loading documents...</Text>
            </View>
          ) : documents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No documents found</Text>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => router.push('/upload-document')}
              >
                <Text style={styles.uploadButtonText}>Upload First Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            documents.map((doc) => (
              <TouchableOpacity 
                key={doc.id} 
                style={styles.documentCard}
                onPress={() => openDocument(doc)}
              >
                <View style={styles.documentIcon}>
                  <Text style={styles.documentIconText}>📄</Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentDate}>
                    {formatDate(doc.upload_date)}
                  </Text>
                </View>
                <View style={styles.downloadButton}>
                  <Text style={styles.downloadButtonText}>⬇️</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* כפתור הוספת מסמך */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/upload-document')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

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
    fontSize: 28,
    fontWeight: '600',
    color: '#6ED29A',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  documentsCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 15,
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#6ED29A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  documentCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 13,
    color: '#888',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6ED29A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  downloadButtonText: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6ED29A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
  },
});

