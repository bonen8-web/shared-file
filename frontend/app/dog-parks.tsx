import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/config';

// ייבוא תמונת הרקע
import DogsPlayground from '../assets/images/Dogs Playground.png';

interface DogPark {
  id: number;
  city: string;
  name: string;
  address: string;
  rating: number;
  notes: string | null;
}

export default function DogParksScreen() {
  const [parks, setParks] = useState<DogPark[]>([]);
  const [filteredParks, setFilteredParks] = useState<DogPark[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [showCityList, setShowCityList] = useState(false);

  useEffect(() => {
    fetchParks();
  }, []);

  const fetchParks = async () => {
    try {
      const { data } = await api.get('/dog_parks');
      setParks(data.parks || []);
      setFilteredParks(data.parks || []);
      
      // חילוץ רשימת ערים ייחודיות
      const uniqueCities = [...new Set(data.parks.map((p: DogPark) => p.city))];
      setCities(uniqueCities as string[]);
    } catch (error) {
      console.error('Error fetching parks:', error);
    } finally {
      setLoading(false);
    }
  };

  // פילטור לפי עיר
  const filterByCity = (city: string) => {
    setCityFilter(city);
    setShowCityList(false);
    
    if (city.trim() === '') {
      setFilteredParks(parks);
    } else {
      const filtered = parks.filter(park => 
        park.city.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredParks(filtered);
    }
  };

  // ניקוי הפילטר
  const clearFilter = () => {
    setCityFilter('');
    setFilteredParks(parks);
    setShowCityList(false);
  };

  // הצגת כוכבי דירוג
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ImageBackground
        source={DogsPlayground}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* כותרת העמוד */}
        <Text style={styles.pageTitle}>Dog Parks</Text>
        
        {/* תוכן העמוד */}
        <View style={styles.content}>
          {/* שדה חיפוש לפי עיר */}
          <View style={styles.filterContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by city..."
                placeholderTextColor="#999"
                value={cityFilter}
                onChangeText={(text) => {
                  setCityFilter(text);
                  setShowCityList(true);
                  filterByCity(text);
                }}
                onFocus={() => setShowCityList(true)}
              />
              {cityFilter !== '' && (
                <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* רשימת ערים להשלמה אוטומטית */}
            {showCityList && cityFilter !== '' && (
              <View style={styles.cityListContainer}>
                {cities
                  .filter(city => city.toLowerCase().includes(cityFilter.toLowerCase()))
                  .slice(0, 5)
                  .map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.cityItem}
                      onPress={() => filterByCity(city)}
                    >
                      <Text style={styles.cityItemText}>{city}</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            )}
          </View>

          {/* מספר תוצאות */}
          <Text style={styles.resultsCount}>
            {filteredParks.length} parks found
            {cityFilter !== '' && ` in "${cityFilter}"`}
          </Text>

          {/* רשימת הגינות */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#36C1C8" />
              <Text style={styles.loadingText}>Loading parks...</Text>
            </View>
          ) : filteredParks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No parks found</Text>
              <Text style={styles.emptySubtext}>Try a different city</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.parksList}
              showsVerticalScrollIndicator={false}
            >
              {filteredParks.map((park) => (
                <View key={park.id} style={styles.parkCard}>
                  {/* שם הגינה */}
                  <Text style={styles.parkName}>{park.name}</Text>
                  
                  {/* עיר */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.parkCity}>{park.city}</Text>
                  </View>
                  
                  {/* כתובת */}
                  {park.address && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoIcon}>🏠</Text>
                      <Text style={styles.parkAddress}>{park.address}</Text>
                    </View>
                  )}
                  
                  {/* דירוג */}
                  {park.rating > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.ratingStars}>{renderStars(park.rating)}</Text>
                      <Text style={styles.ratingNumber}>({park.rating})</Text>
                    </View>
                  )}
                  
                  {/* הערות */}
                  {park.notes && (
                    <Text style={styles.parkNotes}>{park.notes}</Text>
                  )}
                </View>
              ))}
              
              <View style={{ height: 30 }} />
            </ScrollView>
          )}
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
    color: '#36C1C8',
    textAlign: 'center',
    marginTop: 90,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 25,
  },
  filterContainer: {
    marginBottom: 15,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  cityListContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityItemText: {
    fontSize: 16,
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  parksList: {
    flex: 1,
  },
  parkCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36C1C8',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  parkCity: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  parkAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  ratingStars: {
    fontSize: 14,
    letterSpacing: 2,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  parkNotes: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
