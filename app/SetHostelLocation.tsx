// app/SetHostelLocation.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import ApiClient from "./api/ApiClient";

const { width, height } = Dimensions.get("window");

const FOREST_GREEN = "#2E7D5F";
const VEGA_YELLOW = "#FFD700";
const BACKGROUND = "#F6FBF8";

interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

interface ReverseGeocodeResponse {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function SetHostelLocation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const hostelId = params.hostelId as string;
  const hostelName = params.hostelName as string;
  const existingLocation = params.existingLocation ? JSON.parse(params.existingLocation as string) : null;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(existingLocation);
  const [address, setAddress] = useState<string>(existingLocation?.formattedAddress || "");
  const [city, setCity] = useState<string>(existingLocation?.city || "");
  const [state, setState] = useState<string>(existingLocation?.state || "");
  const [pincode, setPincode] = useState<string>(existingLocation?.pincode || "");
  const [landmark, setLandmark] = useState<string>(existingLocation?.landmark || "");
  
  const [region, setRegion] = useState<Region>({
    latitude: existingLocation?.latitude || 17.385044,
    longitude: existingLocation?.longitude || 78.486671,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Initial setup
  useEffect(() => {
    initializeLocation();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Location permission is required to set your hostel location.",
          [
            { text: "Cancel", onPress: () => router.back() },
            { text: "Try Again", onPress: initializeLocation }
          ]
        );
        return;
      }

      let initialLat = 17.385044; // Hyderabad default
      let initialLng = 78.486671;

      if (existingLocation) {
        // Use existing location
        initialLat = existingLocation.latitude;
        initialLng = existingLocation.longitude;
      } else {
        // Get current location
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          initialLat = location.coords.latitude;
          initialLng = location.coords.longitude;
        } catch (error) {
          console.log("Using default location");
        }
      }

      // Set region
      const newRegion = {
        latitude: initialLat,
        longitude: initialLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // If no existing location, reverse geocode current location
      if (!existingLocation) {
        await reverseGeocode(initialLat, initialLng);
      }
      
      // Animate to location
      setTimeout(() => {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }, 500);

    } catch (error) {
      console.error("Error initializing location:", error);
      Alert.alert("Error", "Failed to initialize location services");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<ReverseGeocodeResponse | null> => {
    try {
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        const formattedAddr = `${addr.street || ''}, ${addr.district || addr.subregion || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`;
        
        const locationData: ReverseGeocodeResponse = {
          address: formattedAddr,
          city: addr.city || addr.subregion || "",
          state: addr.region || "",
          pincode: addr.postalCode || "",
        };
        
        updateLocationDetails(lat, lng, locationData);
        return locationData;
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
    }
    return null;
  };

  const updateLocationDetails = (lat: number, lng: number, geoData: ReverseGeocodeResponse) => {
    const newLocation: LocationData = {
      latitude: lat,
      longitude: lng,
      formattedAddress: geoData.address,
      city: geoData.city,
      state: geoData.state,
      pincode: geoData.pincode,
      landmark: landmark,
    };
    
    setSelectedLocation(newLocation);
    setAddress(geoData.address);
    setCity(geoData.city);
    setState(geoData.state);
    setPincode(geoData.pincode);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Update marker position
    setRegion(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
    
    // Reverse geocode the new location
    setSearchLoading(true);
    const geoData = await reverseGeocode(latitude, longitude);
    
    // If reverse geocode failed, update with coordinates only
    if (!geoData) {
      const newLocation: LocationData = {
        latitude,
        longitude,
        formattedAddress: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      };
      setSelectedLocation(newLocation);
      setAddress(newLocation.formattedAddress);
    }
    
    setSearchLoading(false);
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      
      // Use Google Maps Geocoding API (you'll need to add your API key)
      // For now, we'll use Expo's geocoding
      const results = await Location.geocodeAsync(query);
      
      if (results.length > 0) {
        const formattedResults = results.map((result, index) => ({
          id: index.toString(),
          name: `${result.street || result.name || "Location"} ${result.city ? `, ${result.city}` : ''}`,
          latitude: result.latitude,
          longitude: result.longitude,
          address: `${result.street || ''}, ${result.city || ''}, ${result.region || ''}, ${result.country || ''}`,
        }));
        
        setSearchResults(formattedResults);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        Alert.alert("No Results", "No locations found for your search.");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search locations");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(text);
    }, 500);
  };

  const handleSelectSearchResult = async (result: any) => {
    const newRegion = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    setShowSearchResults(false);
    setSearchQuery("");
    
    mapRef.current?.animateToRegion(newRegion, 1000);
    
    // Reverse geocode for address details
    setSearchLoading(true);
    await reverseGeocode(result.latitude, result.longitude);
    setSearchLoading(false);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setSearchLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Current location error:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Please enter the address");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Error", "Please enter the city");
      return;
    }

    if (!state.trim()) {
      Alert.alert("Error", "Please enter the state");
      return;
    }

    try {
      setSaving(true);
      
      const locationData: Omit<LocationData, 'country'> = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        formattedAddress: address,
        city,
        state,
        pincode,
        landmark,
      };

      const response = await ApiClient.post<any>(
        "/hostel-operations/set-location",
        {
          ...locationData,
          hostelId,
        }
      );

      if (response.success) {
        Alert.alert(
          "Success",
          "Hostel location saved successfully!",
          [
            {
              text: "OK",
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(response.message || "Failed to save location");
      }
    } catch (error: any) {
      console.error("Error saving location:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save location. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleManualAddressUpdate = () => {
    if (selectedLocation) {
      const updatedLocation: LocationData = {
        ...selectedLocation,
        formattedAddress: address,
        city,
        state,
        pincode,
        landmark,
      };
      setSelectedLocation(updatedLocation);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[FOREST_GREEN, "#256B4A"]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Hostel Location</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FOREST_GREEN} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hostel Info */}
            <View style={styles.hostelInfo}>
              <Icon name="home" size={24} color={FOREST_GREEN} />
              <View style={styles.hostelText}>
                <Text style={styles.hostelName}>{hostelName}</Text>
                <Text style={styles.hostelId}>ID: {hostelId}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Icon name="magnify" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a location or address..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Icon name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleUseCurrentLocation}
              >
                <Icon name="crosshairs-gps" size={20} color={FOREST_GREEN} />
              </TouchableOpacity>
            </View>

            {/* Search Results Modal */}
            <Modal
              visible={showSearchResults && searchResults.length > 0}
              transparent
              animationType="slide"
              onRequestClose={() => setShowSearchResults(false)}
            >
              <View style={styles.searchResultsModal}>
                <View style={styles.searchResultsContainer}>
                  <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsTitle}>Search Results</Text>
                    <TouchableOpacity onPress={() => setShowSearchResults(false)}>
                      <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView>
                    {searchResults.map((result) => (
                      <TouchableOpacity
                        key={result.id}
                        style={styles.searchResultItem}
                        onPress={() => handleSelectSearchResult(result)}
                      >
                        <Icon name="map-marker" size={20} color={FOREST_GREEN} />
                        <View style={styles.searchResultText}>
                          <Text style={styles.searchResultName} numberOfLines={1}>
                            {result.name}
                          </Text>
                          <Text style={styles.searchResultAddress} numberOfLines={2}>
                            {result.address}
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Map Container */}
            <View style={styles.mapContainer}>
              <View style={styles.mapHeader}>
                <Text style={styles.mapTitle}>Drag the pin to set exact location</Text>
                {searchLoading && (
                  <ActivityIndicator size="small" color={FOREST_GREEN} />
                )}
              </View>
              
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                zoomEnabled={true}
                scrollEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                    draggable
                    onDragEnd={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      reverseGeocode(latitude, longitude);
                    }}
                  >
                    <View style={styles.customMarker}>
                      <Icon name="map-marker" size={40} color={FOREST_GREEN} />
                      <View style={styles.markerPulse} />
                    </View>
                  </Marker>
                )}
              </MapView>
              
              <View style={styles.mapInstructions}>
                <Icon name="hand-pointing-up" size={16} color="#666" />
                <Text style={styles.mapInstructionsText}>
                  Long press or drag the marker to adjust position
                </Text>
              </View>
            </View>

            {/* Coordinates Display */}
            {selectedLocation && (
              <View style={styles.coordinatesCard}>
                <View style={styles.coordinatesHeader}>
                  <Icon name="crosshairs-gps" size={20} color={FOREST_GREEN} />
                  <Text style={styles.coordinatesTitle}>Selected Coordinates</Text>
                </View>
                <View style={styles.coordinatesRow}>
                  <View style={styles.coordinateItem}>
                    <Text style={styles.coordinateLabel}>Latitude</Text>
                    <Text style={styles.coordinateValue}>
                      {selectedLocation.latitude.toFixed(6)}
                    </Text>
                  </View>
                  <View style={styles.coordinateItem}>
                    <Text style={styles.coordinateLabel}>Longitude</Text>
                    <Text style={styles.coordinateValue}>
                      {selectedLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Address Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Address Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Address *</Text>
                <View style={styles.inputContainer}>
                  <Icon name="map-marker" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter complete address"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    onBlur={handleManualAddressUpdate}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="city" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Enter city"
                      placeholderTextColor="#999"
                      onBlur={handleManualAddressUpdate}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="map" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="Enter state"
                      placeholderTextColor="#999"
                      onBlur={handleManualAddressUpdate}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Pincode *</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="pin" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={pincode}
                      onChangeText={setPincode}
                      placeholder="Enter pincode"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={6}
                      onBlur={handleManualAddressUpdate}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="flag" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={landmark}
                      onChangeText={setLandmark}
                      placeholder="Nearby landmark"
                      placeholderTextColor="#999"
                      onBlur={handleManualAddressUpdate}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Icon name="information" size={20} color={FOREST_GREEN} />
                <Text style={styles.instructionsTitle}>Instructions</Text>
              </View>
              <View style={styles.instructionItem}>
                <Icon name="checkbox-marked-circle" size={16} color={FOREST_GREEN} />
                <Text style={styles.instructionText}>
                  Drag and drop the red marker to your exact hostel location
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Icon name="checkbox-marked-circle" size={16} color={FOREST_GREEN} />
                <Text style={styles.instructionText}>
                  Use search to find location or use current location button
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Icon name="checkbox-marked-circle" size={16} color={FOREST_GREEN} />
                <Text style={styles.instructionText}>
                  Verify address details are accurate for students to find easily
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Icon name="checkbox-marked-circle" size={16} color={FOREST_GREEN} />
                <Text style={styles.instructionText}>
                  Ensure pin is placed at the main entrance or exact building location
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!selectedLocation || saving) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveLocation}
                disabled={!selectedLocation || saving}
              >
                <LinearGradient
                  colors={[FOREST_GREEN, "#256B4A"]}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>
                        {existingLocation ? "Update Location" : "Save Location"}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: FOREST_GREEN,
  },
  content: {
    flex: 1,
  },
  hostelInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hostelText: {
    marginLeft: 12,
    flex: 1,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: "700",
    color: FOREST_GREEN,
    marginBottom: 2,
  },
  hostelId: {
    fontSize: 12,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  currentLocationButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultsModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  searchResultsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FOREST_GREEN,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: "#666",
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: FOREST_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  map: {
    width: "100%",
    height: 300,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: FOREST_GREEN + "40",
    borderWidth: 2,
    borderColor: FOREST_GREEN + "80",
    zIndex: -1,
  },
  mapInstructions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  mapInstructionsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  coordinatesCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coordinatesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: FOREST_GREEN,
    marginLeft: 8,
  },
  coordinatesRow: {
    flexDirection: "row",
  },
  coordinateItem: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FOREST_GREEN,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  row: {
    flexDirection: "row",
  },
  instructionsCard: {
    backgroundColor: "#E8F5E8",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FOREST_GREEN + "40",
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: FOREST_GREEN,
    marginLeft: 8,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: "#2E7D5F",
    marginLeft: 8,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
});