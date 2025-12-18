import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');

const UploadMediaDetails = () => {
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

  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View />; // or a loading spinner
  }

  const handleNext = () => {
    router.push('/Rooms'); // Replace with your next page route
  };

  const handleBack = () => {
    router.back(); // Go back to previous page
  };

  return (
    <View style={styles.container}>
      {/* Top half - animated icon */}
      <View style={styles.topContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Ionicons name="cloud-upload-outline" size={120} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.iconText}>Upload Your Media</Text>
      </View>

      {/* Bottom half - description and next button */}
      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.title}>Showcase Your Media</Text>
          <Text style={styles.description}>
            Upload images, videos, or documents easily. Keep your hostel media organized and accessible for everyone.
          </Text>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FA',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00931bff',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
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
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'space-between',
    backgroundColor: '#F5F9FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#077701ff',
    marginBottom: 12,
    fontFamily: 'Poppins_800ExtraBold',
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
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

export default UploadMediaDetails;


