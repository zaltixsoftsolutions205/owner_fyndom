import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  ScrollView, 
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './reduxStore/store/store';
import { setFacilities, getFacilities, clearError, clearSuccess } from './reduxStore/reduxSlices/facilitiesSlice';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

// Mapping for your simple UI to backend values
const FACILITY_MAPPING = {
  wifi: 'Free WiFi',
  ac: 'Air Conditioning',
  mess: 'Vegetarian Meals',
  laundry: 'Washing Machine',
  gym: 'Gym Facility', // You might need to add this to backend
};

const FacilitiesPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { facilities, loading, error, success } = useSelector((state: RootState) => state.facilities);

  // Bounce animation for icon
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [mode, setMode] = useState<'view' | 'edit'>('view'); // 'view' or 'edit'
  const [isLoaded, setIsLoaded] = useState(false);

  // Facility states
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [mess, setMess] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [gym, setGym] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -20, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Load existing facilities on component mount
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        console.log('🔄 Loading existing facilities...');
        await dispatch(getFacilities()).unwrap();
        setIsLoaded(true);
      } catch (error) {
        console.log('⚠️ No existing facilities or error:', error);
        setIsLoaded(true);
      }
    };

    loadFacilities();
  }, [dispatch]);

  // Populate form with existing data
  useEffect(() => {
    if (facilities && isLoaded) {
      console.log('📋 Setting existing facilities to UI');
      
      // Reset all toggles first
      setWifi(false);
      setAc(false);
      setMess(false);
      setLaundry(false);
      setGym(false);

      // Check essentials from backend
      if (facilities.essentials && Array.isArray(facilities.essentials)) {
        setWifi(facilities.essentials.includes('Free WiFi'));
        setAc(facilities.essentials.includes('Air Conditioning'));
        setLaundry(facilities.essentials.includes('Washing Machine'));
      }

      // Check food services
      if (facilities.foodServices && Array.isArray(facilities.foodServices)) {
        setMess(facilities.foodServices.includes('Vegetarian Meals'));
      }

      // Set to view mode if facilities exist
      if (facilities.essentials?.length > 0 || facilities.foodServices?.length > 0) {
        setMode('view');
      }
    }
  }, [facilities, isLoaded]);

  // Handle errors and success
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error ❌',
        text2: error,
      });
      dispatch(clearError());
    }

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Success ✅',
        text2: 'Facilities updated successfully!',
      });
      dispatch(clearSuccess());
      setMode('view'); // Switch back to view mode after successful update
    }
  }, [error, success, dispatch]);

  const handleSave = async () => {
    // Prepare data for backend
    const essentials: string[] = [];
    const foodServices: string[] = [];

    if (wifi) essentials.push('Free WiFi');
    if (ac) essentials.push('Air Conditioning');
    if (laundry) essentials.push('Washing Machine');
    if (gym) essentials.push('Gym Facility');
    if (mess) foodServices.push('Vegetarian Meals');

    const apiData = {
      sharingTypes: [], // Empty for now since you don't have sharing in UI
      bathroomTypes: [], // Empty for now
      essentials,
      foodServices,
      customFoodMenu: '', // Empty for now
    };

    console.log('📤 Saving facilities:', apiData);

    try {
      await dispatch(setFacilities(apiData)).unwrap();
    } catch (error) {
      console.error('Failed to save facilities:', error);
    }
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    // Reload original data
    if (facilities) {
      // Reset to original values
      if (facilities.essentials && Array.isArray(facilities.essentials)) {
        setWifi(facilities.essentials.includes('Free WiFi'));
        setAc(facilities.essentials.includes('Air Conditioning'));
        setLaundry(facilities.essentials.includes('Washing Machine'));
      }
      if (facilities.foodServices && Array.isArray(facilities.foodServices)) {
        setMess(facilities.foodServices.includes('Vegetarian Meals'));
      }
    }
    setMode('view');
  };

  const handleNext = () => {
    console.log('Current facilities:', { wifi, ac, mess, laundry, gym });
    router.push('/OwnerRegister');
  };

  const handleBack = () => {
    router.back();
  };

  if (!fontsLoaded || !isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#299000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Check if facilities are already set
  const hasFacilities = facilities && (
    (facilities.essentials && facilities.essentials.length > 0) ||
    (facilities.foodServices && facilities.foodServices.length > 0) ||
    (facilities.sharingTypes && facilities.sharingTypes.length > 0) ||
    (facilities.bathroomTypes && facilities.bathroomTypes.length > 0)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Top half - animated icon */}
      <View style={styles.topContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Ionicons 
            name={mode === 'edit' ? "construct-outline" : "eye-outline"} 
            size={120} 
            color="#FFFFFF" 
          />
        </Animated.View>
        <Text style={styles.iconText}>
          {mode === 'edit' ? 'Edit Facilities' : 'Hostel Facilities'}
        </Text>
        
        {/* Mode indicator */}
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>
            {mode === 'view' ? 'Viewing Mode' : 'Editing Mode'}
          </Text>
        </View>
      </View>

      {/* Bottom half - facility toggles and buttons */}
      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.title}>
            {mode === 'edit' ? 'Update Facilities' : 'Current Facilities'}
          </Text>
          <Text style={styles.description}>
            {mode === 'edit' 
              ? 'Toggle facilities available in your hostel. Students will see this information.'
              : 'Here are the facilities currently set for your hostel.'}
          </Text>

          {/* Show message if no facilities set yet */}
          {!hasFacilities && mode === 'view' && (
            <View style={styles.emptyState}>
              <Ionicons name="warning-outline" size={40} color="#FFA000" />
              <Text style={styles.emptyText}>No facilities set yet</Text>
              <Text style={styles.emptySubtext}>Click "Edit Facilities" to set up your hostel facilities</Text>
            </View>
          )}

          {/* Facility toggles */}
          <View style={styles.facilityItem}>
            <View style={styles.facilityLeft}>
              <Ionicons name="wifi-outline" size={24} color="#299000ff" />
              <Text style={styles.facilityText}>Wi-Fi</Text>
              {mode === 'view' && wifi && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
              )}
            </View>
            {mode === 'edit' ? (
              <Switch value={wifi} onValueChange={setWifi} thumbColor="#00BFA6" />
            ) : (
              <Text style={[styles.statusText, wifi ? styles.activeText : styles.inactiveText]}>
                {wifi ? 'Available' : 'Not Available'}
              </Text>
            )}
          </View>

          <View style={styles.facilityItem}>
            <View style={styles.facilityLeft}>
              <Ionicons name="snow-outline" size={24} color="#299000ff" />
              <Text style={styles.facilityText}>AC</Text>
              {mode === 'view' && ac && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
              )}
            </View>
            {mode === 'edit' ? (
              <Switch value={ac} onValueChange={setAc} thumbColor="#00BFA6" />
            ) : (
              <Text style={[styles.statusText, ac ? styles.activeText : styles.inactiveText]}>
                {ac ? 'Available' : 'Not Available'}
              </Text>
            )}
          </View>

          <View style={styles.facilityItem}>
            <View style={styles.facilityLeft}>
              <Ionicons name="restaurant-outline" size={24} color="#299000ff" />
              <Text style={styles.facilityText}>Mess (Vegetarian)</Text>
              {mode === 'view' && mess && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
              )}
            </View>
            {mode === 'edit' ? (
              <Switch value={mess} onValueChange={setMess} thumbColor="#00BFA6" />
            ) : (
              <Text style={[styles.statusText, mess ? styles.activeText : styles.inactiveText]}>
                {mess ? 'Available' : 'Not Available'}
              </Text>
            )}
          </View>

          <View style={styles.facilityItem}>
            <View style={styles.facilityLeft}>
              <Ionicons name="shirt-outline" size={24} color="#299000ff" />
              <Text style={styles.facilityText}>Laundry</Text>
              {mode === 'view' && laundry && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
              )}
            </View>
            {mode === 'edit' ? (
              <Switch value={laundry} onValueChange={setLaundry} thumbColor="#00BFA6" />
            ) : (
              <Text style={[styles.statusText, laundry ? styles.activeText : styles.inactiveText]}>
                {laundry ? 'Available' : 'Not Available'}
              </Text>
            )}
          </View>

          <View style={styles.facilityItem}>
            <View style={styles.facilityLeft}>
              <Ionicons name="barbell-outline" size={24} color="#299000ff" />
              <Text style={styles.facilityText}>Gym</Text>
              {mode === 'view' && gym && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.checkIcon} />
              )}
            </View>
            {mode === 'edit' ? (
              <Switch value={gym} onValueChange={setGym} thumbColor="#00BFA6" />
            ) : (
              <Text style={[styles.statusText, gym ? styles.activeText : styles.inactiveText]}>
                {gym ? 'Available' : 'Not Available'}
              </Text>
            )}
          </View>

          {/* Show additional info if in view mode and facilities exist */}
          {mode === 'view' && hasFacilities && facilities && (
            <View style={styles.additionalInfo}>
              <Text style={styles.infoTitle}>Additional Information:</Text>
              
              {facilities.sharingTypes && facilities.sharingTypes.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="bed-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Sharing Types: {facilities.sharingTypes.join(', ')}
                  </Text>
                </View>
              )}
              
              {facilities.bathroomTypes && facilities.bathroomTypes.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="water-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Bathroom: {facilities.bathroomTypes.join(', ')}
                  </Text>
                </View>
              )}
              
              {facilities.customFoodMenu && (
                <View style={styles.infoRow}>
                  <Ionicons name="menu-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Food Menu: {facilities.customFoodMenu}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {mode === 'view' ? (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit Facilities</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Continue →</Text>
              </TouchableOpacity>
              
              <Text style={styles.registerDescription}>
                Proceed to complete your hostel registration
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Facilities</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#299000ff',
    fontFamily: 'Poppins_400Regular',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#299000ff',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    paddingVertical: 30,
    paddingTop: 40,
    position: 'relative',
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
  modeIndicator: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  bottomContainer: {
    flex: 2,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'flex-start',
    backgroundColor: '#F5F9FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#121212',
    marginBottom: 12,
    fontFamily: 'Poppins_800ExtraBold',
  },
  description: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8F00',
    marginTop: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  facilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  facilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#121212',
    marginLeft: 10,
  },
  checkIcon: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  additionalInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#299000ff',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 35,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#299000ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Poppins_700Bold',
  },
  nextButton: {
    backgroundColor: '#FFDF00',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 35,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#299000ff',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 35,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#299000ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Poppins_700Bold',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#299000ff',
    width: '100%',
  },
  cancelButtonText: {
    color: '#299000ff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  registerDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#555555',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
});

export default FacilitiesPage;