import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const RoomsPage = () => {
  const router = useRouter();

  // Animation for icon bounce
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -20, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [occupied, setOccupied] = useState('');
  const [vacant, setVacant] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleNext = () => {
    router.push('/SetPricing'); // Navigate to next page
  };

  const handleBack = () => {
    router.back(); // Go back to previous page
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.topContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Ionicons name="bed-outline" size={120} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.iconText}>Manage Rooms</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.title}>Update Room Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Room Number"
            value={roomNumber}
            onChangeText={setRoomNumber}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Room Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Occupied"
            value={occupied}
            onChangeText={setOccupied}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Vacant"
            value={vacant}
            onChangeText={setVacant}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FA' },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#159a00ff',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    paddingVertical: 30,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  bottomContainer: {
    flex: 2,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'space-between',
    backgroundColor: '#F5F9FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#121212',
    marginBottom: 20,
    fontFamily: 'Poppins_800ExtraBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#01a904ff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#121212',
  },
  nextButton: {
    backgroundColor: '#FFDF00',
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: '#FFDF00',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});

export default RoomsPage;
