import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../api/config';

import ViewPetData from '../assets/images/view-pet-data.png';

interface MedicalInfo {
  weight?: number;
  allergies?: string;
  medications?: string;
  conditions?: string;
  vet_name?: string;
  vet_phone?: string;
  last_checkup?: string;
  next_checkup?: string;
  notes?: string;
}

export default function ViewMedicalInfoScreen() {
  const router = useRouter();
  const { petId, petName } = useLocalSearchParams();
  
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      fetchMedicalInfo();
    } else {
      setLoading(false);
    }
  }, [petId]);

  const fetchMedicalInfo = async () => {
    try {
      const { data } = await api.get(`/api/pets/${petId}/medical-info`);
      setMedicalInfo(data.medical_info);
    } catch (error) {
      console.error('Error fetching medical info:', error);
    } finally {
      setLoading(false);
    }
  };

  const SectionCard = ({ title, content, color }: { title: string; content: string | undefined; color?: string }) => (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { color: color || '#6ED29A' }]}>{title}</Text>
      <Text style={styles.sectionContent}>{content || 'No information recorded'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={ViewPetData}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כפתור חזרה */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* כותרת */}
        <Text style={styles.pageTitle}>Medical Info</Text>
        {petName && <Text style={styles.petName}>{petName}</Text>}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6ED29A" />
            <Text style={styles.loadingText}>Loading medical info...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* כרטיסי מידע מהיר */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoCard}>
                <Text style={styles.quickInfoValue}>{medicalInfo?.weight || '—'} kg</Text>
                <Text style={styles.quickInfoLabel}>Weight</Text>
              </View>
              <View style={styles.quickInfoCard}>
                <Text style={styles.quickInfoValue}>{medicalInfo?.last_checkup || '—'}</Text>
                <Text style={styles.quickInfoLabel}>Last Checkup</Text>
              </View>
              <View style={styles.quickInfoCard}>
                <Text style={styles.quickInfoValue}>{medicalInfo?.next_checkup || '—'}</Text>
                <Text style={styles.quickInfoLabel}>Next Checkup</Text>
              </View>
            </View>

            {/* סקציות מידע מפורט */}
            <SectionCard 
              title="Allergies" 
              content={medicalInfo?.allergies}
              color="#FF5722"
            />

            <SectionCard 
              title="Current Medications" 
              content={medicalInfo?.medications}
              color="#9C27B0"
            />

            <SectionCard 
              title="Medical Conditions" 
              content={medicalInfo?.conditions}
              color="#2196F3"
            />

            {/* פרטי וטרינר */}
            <View style={styles.vetCard}>
              <Text style={styles.vetTitle}>Veterinarian</Text>
              <View style={styles.vetInfo}>
                <View style={styles.vetRow}>
                  <Text style={styles.vetLabel}>Name:</Text>
                  <Text style={styles.vetValue}>{medicalInfo?.vet_name || 'Not recorded'}</Text>
                </View>
                <View style={styles.vetRow}>
                  <Text style={styles.vetLabel}>Phone:</Text>
                  <TouchableOpacity>
                    <Text style={[styles.vetValue, medicalInfo?.vet_phone && styles.vetPhone]}>
                      {medicalInfo?.vet_phone || 'Not recorded'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* הערות */}
            {medicalInfo?.notes && (
              <SectionCard 
                title="Additional Notes" 
                content={medicalInfo.notes}
                color="#607D8B"
              />
            )}

            {/* כפתור עריכה */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(`/update-medical-info?petId=${petId}`)}
            >
              <Text style={styles.editButtonText}>Edit Medical Info</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
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
  petName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
    marginTop: 15,
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: '#999',
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  vetCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  vetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  vetInfo: {
    gap: 8,
  },
  vetRow: {
    flexDirection: 'row',
  },
  vetLabel: {
    fontSize: 14,
    color: '#999',
    width: 60,
  },
  vetValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  vetPhone: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  editButton: {
    backgroundColor: '#6ED29A',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
