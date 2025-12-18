// app/SetPricingPage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');

const FOREST_GREEN = '#228B22';
const GOLDEN_YELLOW = '#FFDF00';

const SetPricingPage = () => {
  const router = useRouter();
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
  const [dailyPrice, setDailyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    console.log({ roomNumber, dailyPrice, monthlyPrice });
    router.push('/FacilitiesDetails');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Top Section */}
      <View style={styles.topContainer}>
        {/* Back Button - only arrow */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Ionicons name="pricetag-outline" size={120} color="#fff" />
        </Animated.View>
        <Text style={styles.iconText}>Set Room Pricing</Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Room Pricing</Text>
        <Text style={styles.description}>
          Set the daily and monthly pricing for each room. Keep your pricing organized and easy to update
          for your hostel.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Room Number"
          value={roomNumber}
          onChangeText={setRoomNumber}
          keyboardType="number-pad"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Daily Price"
          value={dailyPrice}
          onChangeText={setDailyPrice}
          keyboardType="number-pad"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Monthly Price"
          value={monthlyPrice}
          onChangeText={setMonthlyPrice}
          keyboardType="number-pad"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FOREST_GREEN,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingVertical: 40,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 6,
    zIndex: 10,
  },

  iconText: {
    color: GOLDEN_YELLOW,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    fontFamily: 'Poppins_600SemiBold',
  },

  bottomContainer: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FOREST_GREEN,
    marginBottom: 12,
    fontFamily: 'Poppins_800ExtraBold',
  },

  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },

  input: {
    borderWidth: 1.5,
    borderColor: FOREST_GREEN,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
    fontFamily: 'Poppins_400Regular',
    color: '#121212',
  },

  nextButton: {
    backgroundColor: GOLDEN_YELLOW,
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: GOLDEN_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 100,
  },

  nextButtonText: {
    color: '#fcfcfcff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});

export default SetPricingPage;
