import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { recordRoute } from "../utils/navigationHistory";
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector, useAppDispatch } from "../hooks/hooks";
import { getAllRooms, getFacilities, getHostelPhotos } from "./reduxStore/reduxSlices/roomSlice";
import { selectHostel } from "./reduxStore/reduxSlices/authSlice";
import ApiClient from "./api/ApiClient";

const { width, height } = Dimensions.get("window");

const FOREST_GREEN = "#2E7D5F";
const VEGA_YELLOW = "#FFD700";
const BACKGROUND = "#F6FBF8";
const CARD_BG = "#fff";
const TEXT_DARK = "#212529";
const ERROR_COLOR = "#FF5252";
const WARNING_COLOR = "#FF9800";
const SUCCESS_COLOR = "#4CAF50";

// Location Interface
interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  country?: string;
}

interface LocationResponse {
  success: boolean;
  data?: {
    hostelId: string;
    hostelName: string;
    location: {
      geo: {
        type: "Point";
        coordinates: [number, number];
      };
      coordinates: {
        latitude: number;
        longitude: number;
      };
      formattedAddress: string;
      city: string;
      state: string;
      pincode: string;
      landmark: string;
      country: string;
    };
  };
}

// Room Summary Interface
interface RoomSummary {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

// Room API Response Interface
interface RoomApiResponse {
  success: boolean;
  data: {
    hostelInfo: {
      hostelId: string;
      hostelName: string;
    };
    rooms: Array<{
      _id: string;
      hostelOwner: string;
      hostelId: string;
      floor: string;
      roomNumber: string;
      sharingType: string;
      capacity: number;
      occupied: number;
      remaining: number;
      isAvailable: boolean;
      bookingHistory: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
    }>;
    summary: RoomSummary;
  };
}

// Pricing Interface
interface PricingData {
  sharingType: string;
  daily: number | null;
  monthly: number | null;
}

interface PricingResponse {
  success: boolean;
  data: PricingData[];
  metadata?: {
    hostelId: string;
    hostelName: string;
  };
}

// Bank Details Interface
interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branchName?: string;
  accountType?: string;
}

// User Profile Interface
interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

// Profile Image Response Interface
interface ProfileImageResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      fullName: string;
      mobileNumber: string;
      email: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    profileImage: {
      url: string;
    };
  };
}

// Hostel Interface
interface Hostel {
  hostelId: string;
  _id: string;
  hostelName: string;
  hostelType: string;
  govtRegistrationId: string;
  fullAddress: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  rejectionReason?: string;
}

const initialHostel = {
  location: {
    city: "Telangana",
    area: "Hyderabad",
    pincode: "500035",
  },
  media: [
    "https://picsum.photos/400/250?random=1",
    "https://picsum.photos/400/250?random=2",
  ],
  rooms: [],
  pricing: {
    type: "Monthly",
    amount: 5000,
    note: "Includes electricity and water",
  },
  facilities: ["WiFi", "24/7 Security", "Laundry Service", "Parking"],
  bookings: [],
};

export default function HostelDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const [hostel] = useState(initialHostel);
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);

  // Location state
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Room summary state
  const [roomSummary, setRoomSummary] = useState<RoomSummary | null>(null);
  const [roomSummaryLoading, setRoomSummaryLoading] = useState(false);
  const [roomSummaryError, setRoomSummaryError] = useState<string | null>(null);

  // Get params from navigation
  const hostelIdFromParams = params.hostelId as string;
  const hostelNameFromParams = params.hostelName as string;
  const viewOnly = params.viewOnly === "true";

  const { user, fullName, token, isAuthenticated, hostels, selectedHostelId } = useAppSelector((state) => state.auth);

  // Use the selectedHostelId from Redux OR the hostelId from params
  const effectiveHostelId = selectedHostelId || hostelIdFromParams;

  // Filter approved hostels only
  const approvedHostels = hostels.filter(h => h.status === "approved" && h.isActive);

  // Get selected hostel details
  const selectedHostel = hostels.find(h => h.hostelId === effectiveHostelId);

  // Check if selected hostel is approved
  const isSelectedHostelApproved = selectedHostel?.status === "approved";

  // Check if we're in view-only mode (for non-approved hostels)
  const isViewOnlyMode = viewOnly || !isSelectedHostelApproved;

  const {
    allRooms,
    allRoomsLoading,
    allRoomsError,
    summary,
    sharingTypeAvailability
  } = useAppSelector((state) => state.rooms);

  // Fetch location data from API
  const fetchLocationData = async () => {
    if (!effectiveHostelId || !token) {
      console.log("Skipping location fetch - no hostel selected or no token");
      setLocationError("Please select a hostel");
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError(null);

      console.log(`Fetching location for hostel: ${effectiveHostelId}`);

      // Make API call with hostelId query parameter
      const response = await ApiClient.get<LocationResponse>(
        `/hostel-operations/location?hostelId=${effectiveHostelId}`
      );

      console.log("Location API Response:", response);

      if (response.success && response.data && response.data.location) {
        const loc = response.data.location;
        setLocationData({
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          formattedAddress: loc.formattedAddress,
          city: loc.city,
          state: loc.state,
          pincode: loc.pincode,
          landmark: loc.landmark,
          country: loc.country
        });
        console.log(`Location data loaded for hostel: ${response.data.hostelName}`);
      } else {
        setLocationError("No location data available");
        setLocationData(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch location data:", error);

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.statusText;
        setLocationError(`Server error: ${errorMessage}`);
      } else if (error.request) {
        setLocationError("Network error: Please check your connection");
      } else {
        setLocationError(error.message || "Failed to load location data");
      }

      setLocationData(null);
    } finally {
      setLocationLoading(false);
    }
  };

  // Set location via API
  const setLocation = async (location: Omit<LocationData, 'country'>) => {
    if (!effectiveHostelId || !token) {
      Alert.alert("Error", "Please select a hostel first");
      return false;
    }

    try {
      setLocationLoading(true);

      const payload = {
        hostelId: effectiveHostelId,
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.formattedAddress,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
        landmark: location.landmark
      };

      console.log("Setting location with payload:", payload);

      const response = await ApiClient.post<LocationResponse>(
        "/hostel-operations/set-location",
        payload
      );

      console.log("Set location response:", response);

      if (response.success && response.data) {
        const loc = response.data.location;
        setLocationData({
          latitude: loc.coordinates.latitude,
          longitude: loc.coordinates.longitude,
          formattedAddress: loc.formattedAddress,
          city: loc.city,
          state: loc.state,
          pincode: loc.pincode,
          landmark: loc.landmark,
          country: loc.country
        });

        Alert.alert("Success", "Location saved successfully!");
        return true;
      } else {
        Alert.alert("Error", response.message || "Failed to save location");
        return false;
      }
    } catch (error: any) {
      console.error("Failed to set location:", error);

      let errorMessage = "Failed to save location";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
      return false;
    } finally {
      setLocationLoading(false);
    }
  };

  // NEW: Fetch room summary from API
  const fetchRoomSummary = async () => {
    if (!effectiveHostelId || !token) {
      console.log("Skipping room summary fetch - no hostel selected or no token");
      setRoomSummaryError("Please select a hostel");
      return;
    }

    try {
      setRoomSummaryLoading(true);
      setRoomSummaryError(null);

      console.log(`Fetching room summary for hostel: ${effectiveHostelId}`);

      // Make API call with hostelId query parameter
      const response = await ApiClient.get<RoomApiResponse>(
        `/hostel-operations/rooms?hostelId=${effectiveHostelId}`
      );

      console.log("Room Summary API Response:", response);

      if (response.success && response.data && response.data.summary) {
        setRoomSummary(response.data.summary);
        console.log(`Room summary loaded:`, response.data.summary);
      } else {
        setRoomSummaryError("No room data available");
        setRoomSummary(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch room summary:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.statusText;
        setRoomSummaryError(`Server error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response
        setRoomSummaryError("Network error: Please check your connection");
      } else {
        // Something else happened
        setRoomSummaryError(error.message || "Failed to load room data");
      }

      setRoomSummary(null);
    } finally {
      setRoomSummaryLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (effectiveHostelId) {
      loadInitialData();
    }
  }, [dispatch, isAuthenticated, effectiveHostelId]);

  const { photos, photosLoading } = useAppSelector(state => state.rooms);
  const { facilities, facilitiesLoading } = useAppSelector(state => state.rooms);

  useEffect(() => {
    if (effectiveHostelId) {
      dispatch(getHostelPhotos());
      dispatch(getFacilities());
      fetchUserProfile();
      fetchProfileImage();
      fetchLocationData(); // NEW: Fetch location data
      fetchRoomSummary();
    }
  }, [effectiveHostelId]);

  // Fetch profile image from API
  const fetchProfileImage = async () => {
    if (!isAuthenticated || !token || !effectiveHostelId) {
      console.log("Skipping profile image fetch - no hostel selected or not authenticated");
      return;
    }

    setProfileImageLoading(true);
    setProfileImageError(null);

    try {
      console.log("Fetching profile image...");
      const response = await ApiClient.get<ProfileImageResponse>('/profile-image/user-profile');

      if (response.success && response.data.profileImage) {
        console.log("Profile image fetched successfully:", response.data.profileImage.url);
        setProfileImageUrl(response.data.profileImage.url);

        // Also update user profile if needed
        if (response.data.user) {
          setUserProfile({
            name: response.data.user.fullName || user?.fullName || "Hostel Owner",
            email: response.data.user.email,
            phone: response.data.user.mobileNumber,
            avatar: response.data.profileImage.url
          });
        }
      } else {
        console.log("No profile image found");
        setProfileImageUrl(null);
        setProfileImageError("No profile image set");
      }
    } catch (error: any) {
      console.error("Error fetching profile image:", error);
      setProfileImageError("Failed to load profile image");
      setProfileImageUrl(null);
    } finally {
      setProfileImageLoading(false);
    }
  };

  // Load all initial data
  const loadInitialData = () => {
    if (!effectiveHostelId) {
      console.log("Skipping data load - no hostel selected");
      return;
    }

    dispatch(getAllRooms());
    fetchPricingData();
    fetchBankDetails();
    fetchUserProfile();
    fetchLocationData(); // NEW: Fetch location
    fetchRoomSummary();
    if (isAuthenticated) {
      fetchProfileImage();
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!effectiveHostelId) {
      return;
    }

    try {
      // Try to fetch from API first
      const response = await ApiClient.get<{ success: boolean; data: UserProfile }>(
        "/hostel-owner/profile"
      );

      if (response.success && response.data) {
        setUserProfile(response.data);
      } else {
        // Fallback to auth data
        setUserProfile({
          name: user?.fullName || "Hostel Owner",
          email: user?.email,
          phone: user?.mobileNumber,
          avatar: profileImageUrl || undefined
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to auth data
      setUserProfile({
        name: user?.fullName || "Hostel Owner",
        email: user?.email,
        phone: user?.mobileNumber,
        avatar: profileImageUrl || undefined
      });
    }
  };

  // Fetch pricing data from API based on selected hostel ID
  const fetchPricingData = async () => {
    if (!effectiveHostelId || !token) {
      console.log("Skipping pricing fetch - no hostel selected or no token");
      setPricingError("Please select a hostel");
      return;
    }

    try {
      setPricingLoading(true);
      setPricingError(null);

      console.log(`Fetching pricing for hostel: ${effectiveHostelId}`);

      // Make API call with hostelId query parameter
      const response = await ApiClient.get<PricingResponse>(
        `/hostel-operations/pricing?hostelId=${effectiveHostelId}`
      );

      console.log("Pricing API Response:", response);

      if (response.success && response.data) {
        setPricingData(response.data);
        console.log(`Pricing data loaded: ${response.data.length} sharing types`);
      } else {
        setPricingError("No pricing data available");
        setPricingData([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch pricing data:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.statusText;
        setPricingError(`Server error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response
        setPricingError("Network error: Please check your connection");
      } else {
        // Something else happened
        setPricingError(error.message || "Failed to load pricing data");
      }

      setPricingData([]);
    } finally {
      setPricingLoading(false);
    }
  };

  // Fetch bank details from API
  const fetchBankDetails = async () => {
    if (!effectiveHostelId) {
      console.log("Skipping bank details fetch - no hostel selected");
      return;
    }

    try {
      setBankDetailsLoading(true);

      const response = await ApiClient.get<{ success: boolean; data: BankDetails }>("/bank/details");

      if (response.success && response.data) {
        setBankDetails(response.data);
      } else {
        setBankDetails(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch bank details:", error);
      setBankDetails(null);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  // Handle hostel selection
  const handleSelectHostel = (hostelId: string) => {
    const hostel = hostels.find(h => h.hostelId === hostelId);
    if (hostel) {
      dispatch(selectHostel(hostelId));
      setShowHostelDropdown(false);
      // Refresh data for new hostel
      loadInitialData();
    } else {
      Alert.alert(
        "Hostel Not Found",
        "The selected hostel could not be found.",
        [{ text: "OK", style: "cancel" }]
      );
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (!effectiveHostelId) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);

    try {
      // Refresh all data in parallel
      await Promise.all([
        dispatch(getAllRooms()),
        fetchPricingData(),
        fetchBankDetails(),
        dispatch(getHostelPhotos()),
        dispatch(getFacilities()),
        fetchUserProfile(),
        fetchProfileImage(),
        fetchLocationData(), // NEW: Refresh location
        fetchRoomSummary()
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, isAuthenticated, effectiveHostelId]);

  // Group pricing data by sharing type
  const groupPricingBySharingType = () => {
    const grouped: Record<string, { daily: number | null; monthly: number | null }> = {};

    // Initialize with all sharing types from the API response
    const sharingTypes = ["single", "double", "triple", "four", "five", "six", "seven", "eight", "nine", "ten"];

    sharingTypes.forEach(type => {
      grouped[type] = { daily: null, monthly: null };
    });

    // Fill with actual data from API response
    pricingData.forEach(item => {
      const type = item.sharingType;
      if (!grouped[type]) {
        grouped[type] = { daily: null, monthly: null };
      }

      grouped[type].daily = item.daily;
      grouped[type].monthly = item.monthly;
    });

    return grouped;
  };

  const pricingGroups = groupPricingBySharingType();

  const getSharingDisplayName = (type: string) => {
    const names: Record<string, string> = {
      "single": "Single",
      "double": "Double",
      "triple": "Triple",
      "four": "Four",
      "five": "Five",
      "six": "Six",
      "seven": "Seven",
      "eight": "Eight",
      "nine": "Nine",
      "ten": "Ten"
    };
    return names[type] || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  // Get hostel type icon
  const getHostelTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'boys': return 'human-male';
      case 'girls': return 'human-female';
      case 'co-ed': return 'human-male-female';
      default: return 'home';
    }
  };

  const getHostelTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'boys': return '#4A90E2';
      case 'girls': return '#E91E63';
      case 'co-ed': return '#9C27B0';
      default: return FOREST_GREEN;
    }
  };

  const getHostelStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return FOREST_GREEN;
      case 'pending': return WARNING_COLOR;
      case 'rejected': return ERROR_COLOR;
      default: return "#666";
    }
  };

  const getHostelStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'check-circle';
      case 'pending': return 'clock-outline';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Get initials from name for avatar placeholder
  const getInitials = (name: string) => {
    if (!name) return "HO";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const noBookings = !hostel.bookings || hostel.bookings.length === 0;

  // Refresh Control configuration
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[FOREST_GREEN, VEGA_YELLOW]}
      tintColor={FOREST_GREEN}
      title="Pull to refresh"
      titleColor={FOREST_GREEN}
      progressBackgroundColor="#ffffff"
    />
  );

  // Handle location card press
  // In HostelDetails.tsx, update the handleLocationPress function:
  const handleLocationPress = () => {
    if (!effectiveHostelId) {
      Alert.alert(
        "Select Hostel",
        "Please select a hostel first",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    if (!isSelectedHostelApproved && !isViewOnlyMode) {
      Alert.alert(
        "Not Available",
        "Location management is only available for approved hostels.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // Navigate to Google Map screen
    try { recordRoute('/HostelDetails'); } catch (e) { }
    router.push({
      pathname: "/SetHostelLocation",
      params: {
        hostelId: effectiveHostelId,
        hostelName: selectedHostel?.hostelName,
        existingLocation: locationData ? JSON.stringify(locationData) : null
      }
    });
  };

  // Render location card
  const renderLocationCard = () => {
    return (
      <TouchableOpacity
        style={[styles.locationCard, !effectiveHostelId && styles.cardDisabled]}
        onPress={handleLocationPress}
        activeOpacity={!effectiveHostelId ? 1 : 0.8}
      >
        <View style={[
          styles.iconCircleLocation,
          !effectiveHostelId && { backgroundColor: "#f0f0f0" }
        ]}>
          <Icon name="map-marker-radius" size={26} color={effectiveHostelId ? FOREST_GREEN : "#ccc"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardLabel, !effectiveHostelId && { color: "#999" }]}>
            Location
          </Text>

          {!effectiveHostelId ? (
            <Text style={[styles.cardValue, { color: "#999" }]}>
              Select a hostel
            </Text>
          ) : locationLoading ? (
            <ActivityIndicator size="small" color={FOREST_GREEN} style={{ marginTop: 4 }} />
          ) : locationError ? (
            <View>
              <Text style={[styles.cardValue, { color: ERROR_COLOR }]} numberOfLines={1}>
                {locationError}
              </Text>
              <Text style={styles.locationSubText}>
                Tap to set location on Google Maps
              </Text>
            </View>
          ) : locationData ? (
            <View>
              <Text style={styles.cardValue} numberOfLines={2}>
                {locationData.formattedAddress}
              </Text>
              <Text style={styles.locationSubText}>
                {locationData.city}, {locationData.state} • {locationData.pincode}
                {locationData.landmark ? ` • Near ${locationData.landmark}` : ''}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.cardValue} numberOfLines={1}>
                No location set
              </Text>
              <Text style={styles.locationSubText}>
                Tap to set location on Google Maps
              </Text>
            </View>
          )}
        </View>
        <Icon
          name={effectiveHostelId ? "chevron-right" : "lock"}
          size={24}
          color={effectiveHostelId ? "#BDBDBD" : "#ccc"}
        />
      </TouchableOpacity>
    );
  };

  // Render pricing card
  const renderPricingCard = () => {
    if (!effectiveHostelId) {
      return (
        <View style={[styles.pricingCard, styles.cardDisabled]}>
          <View style={styles.pricingCardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#f0f0f0" }]}>
              <Icon name="cash" size={26} color="#ccc" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: "#999" }]}>Pricing</Text>
              <Text style={[styles.cardValue, { color: "#999" }]}>Select a hostel to view pricing</Text>
            </View>
            <Icon name="lock" size={22} color="#ccc" />
          </View>
        </View>
      );
    }

    if (!isSelectedHostelApproved && !isViewOnlyMode) {
      return (
        <View style={[styles.pricingCard, styles.cardDisabled]}>
          <View style={styles.pricingCardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#f0f0f0" }]}>
              <Icon name="cash" size={26} color="#ccc" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: "#999" }]}>Pricing</Text>
              <Text style={[styles.cardValue, { color: "#999" }]}>
                {selectedHostel?.status === "pending"
                  ? "Pricing will be available after approval"
                  : "Pricing not available for rejected hostels"}
              </Text>
            </View>
            <Icon name="lock" size={22} color="#ccc" />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.pricingCard}
        onPress={() => {
          if (!isSelectedHostelApproved && !isViewOnlyMode) {
            Alert.alert(
              "Not Available",
              "Pricing management is only available for approved hostels.",
              [{ text: "OK", style: "cancel" }]
            );
            return;
          }
          try { recordRoute('/HostelDetails'); } catch (e) { }
          router.push({
            pathname: "/Pricing",
            params: {
              hostelId: effectiveHostelId,
              hostelName: selectedHostel?.hostelName
            }
          });
        }}
        activeOpacity={(!isSelectedHostelApproved && !isViewOnlyMode) ? 1 : 0.8}
      >
        <View style={styles.pricingCardHeader}>
          <View style={styles.iconCircle}>
            <Icon name="cash" size={26} color={FOREST_GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Pricing</Text>
            <Text style={styles.cardValue}>
              {selectedHostel?.hostelName || "Hostel"} • Daily & Monthly Rates
            </Text>
          </View>
          <View style={styles.refreshIndicatorContainer}>
            {pricingLoading || refreshing ? (
              <ActivityIndicator size="small" color={FOREST_GREEN} />
            ) : (
              <Icon name="chevron-right" size={24} color="#BDBDBD" />
            )}
          </View>
        </View>

        {pricingLoading && !refreshing ? (
          <View style={styles.pricingLoadingContainer}>
            <ActivityIndicator size="small" color={FOREST_GREEN} />
            <Text style={styles.pricingLoadingText}>Loading pricing...</Text>
          </View>
        ) : pricingError ? (
          <View style={styles.pricingErrorContainer}>
            <Icon name="alert-circle-outline" size={20} color="#FF6B6B" />
            <Text style={styles.pricingErrorText}>{pricingError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchPricingData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : pricingData.length === 0 ? (
          <View style={styles.pricingEmptyContainer}>
            <Icon name="cash-remove" size={40} color="#CCCCCC" />
            <Text style={styles.pricingEmptyText}>No pricing set for this hostel</Text>
            {isSelectedHostelApproved && (
              <TouchableOpacity
                style={styles.addPricingButton}
                onPress={() => {
                  try { recordRoute('/HostelDetails'); } catch (e) { }
                  router.push({
                    pathname: "/Pricing",
                    params: {
                      hostelId: effectiveHostelId,
                      hostelName: selectedHostel?.hostelName
                    }
                  });
                }}
              >
                <Text style={styles.addPricingButtonText}>Set Pricing Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.pricingTable}>
            {/* Table Header */}
            <View style={styles.pricingTableHeader}>
              <Text style={[styles.pricingTableHeaderText, { flex: 2 }]}>Sharing Type</Text>
              <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Daily (₹)</Text>
              <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Monthly (₹)</Text>
            </View>

            {/* Table Rows - Only show types that have at least one price set */}
            {Object.entries(pricingGroups)
              .filter(([type, prices]) => prices.daily !== null || prices.monthly !== null)
              .slice(0, 6) // Show only first 6 types for better UX
              .map(([type, prices], index) => (
                <View
                  key={type}
                  style={[
                    styles.pricingTableRow,
                    index % 2 === 0 && styles.pricingTableRowEven
                  ]}
                >
                  <Text style={[styles.pricingTableCell, { flex: 2, fontWeight: '600' }]}>
                    {getSharingDisplayName(type)} Sharing
                  </Text>
                  <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
                    {prices.daily !== null ? `₹${prices.daily}` : "-"}
                  </Text>
                  <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
                    {prices.monthly !== null ? `₹${prices.monthly}` : "-"}
                  </Text>
                </View>
              ))}

            {/* Show more indicator if there are more than 6 sharing types */}
            {Object.entries(pricingGroups).filter(([_, prices]) => prices.daily !== null || prices.monthly !== null).length > 6 && (
              <View style={styles.moreItemsIndicator}>
                <Text style={styles.moreItemsText}>
                  +{Object.entries(pricingGroups).filter(([_, prices]) => prices.daily !== null || prices.monthly !== null).length - 6} more sharing types
                </Text>
              </View>
            )}

            {/* Last Updated Time */}
            <View style={styles.lastUpdatedContainer}>
              <Icon name="refresh" size={12} color="#999" />
              <Text style={styles.lastUpdatedText}>
                {refreshing ? "Refreshing..." : `Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render profile avatar with loading/error states
  const renderProfileAvatar = () => {
    if (profileImageLoading) {
      return (
        <View style={styles.profileIconWrap}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    if (profileImageUrl) {
      return (
        <View style={styles.profileIconWrap}>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileAvatar}
            resizeMode="cover"
          />
          <View style={styles.onlineIndicator} />
        </View>
      );
    }

    // Fallback to initials
    return (
      <View style={styles.profileIconWrap}>
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profileInitials}>
            {getInitials(user?.fullName || userProfile?.name || "HO")}
          </Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>
    );
  };

  // Render hostel selector
  const renderHostelSelector = () => {
    if (!selectedHostel && !effectiveHostelId) {
      return (
        <View style={styles.hostelSelectorContainer}>
          <TouchableOpacity
            style={styles.hostelSelectorButton}
            onPress={() => setShowHostelDropdown(true)}
            activeOpacity={0.7}
          >
            <View style={styles.hostelSelectorButtonContent}>
              <Icon
                name="home"
                size={16}
                color="#fff"
                style={styles.selectorIcon}
              />
              <View style={styles.selectorTextContainer}>
                <Text style={styles.selectorTitle} numberOfLines={1}>
                  Select a Hostel
                </Text>
                <View style={styles.selectorStatusRow}>
                  <Text style={styles.selectorStatus}>
                    Tap to select from your hostels
                  </Text>
                </View>
              </View>
              <Icon
                name="chevron-down"
                size={16}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.hostelSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.hostelSelectorButton,
            !isSelectedHostelApproved && styles.hostelSelectorButtonDisabled
          ]}
          onPress={() => setShowHostelDropdown(true)}
          activeOpacity={0.7}
        >
          <View style={styles.hostelSelectorButtonContent}>
            {selectedHostel && (
              <Icon
                name={getHostelTypeIcon(selectedHostel.hostelType)}
                size={16}
                color={isSelectedHostelApproved ? getHostelTypeColor(selectedHostel.hostelType) : "#ccc"}
                style={styles.selectorIcon}
              />
            )}
            <View style={styles.selectorTextContainer}>
              <Text
                style={[
                  styles.selectorTitle,
                  !isSelectedHostelApproved && { color: "#ccc" }
                ]}
                numberOfLines={1}
              >
                {selectedHostel ? selectedHostel.hostelName : "Select Hostel"}
              </Text>
              {selectedHostel && (
                <View style={styles.selectorStatusRow}>
                  <Icon
                    name={getHostelStatusIcon(selectedHostel.status)}
                    size={10}
                    color={getHostelStatusColor(selectedHostel.status)}
                  />
                  <Text style={[
                    styles.selectorStatus,
                    { color: getHostelStatusColor(selectedHostel.status) }
                  ]}>
                    {selectedHostel.status.toUpperCase()}
                  </Text>
                  <Text style={styles.selectorPricingInfo}>
                    {isSelectedHostelApproved && pricingData.length > 0
                      ? ` • ${pricingData.filter(p => p.daily || p.monthly).length} pricing sets`
                      : ""
                    }
                  </Text>
                </View>
              )}
            </View>
            <Icon
              name="chevron-down"
              size={16}
              color={isSelectedHostelApproved ? "#fff" : "#ccc"}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render dropdown modal
  const renderDropdownModal = () => (
    <Modal
      visible={showHostelDropdown}
      transparent
      animationType="fade"
      onRequestClose={() => setShowHostelDropdown(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowHostelDropdown(false)}
      >
        <View style={[styles.modalContent, { marginTop: 100 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Hostel</Text>
            <TouchableOpacity onPress={() => setShowHostelDropdown(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.dropdownScrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Approved Hostels */}
            {approvedHostels.length > 0 && (
              <>
                <View style={styles.dropdownSectionHeader}>
                  <Text style={styles.dropdownSectionTitle}>Approved Hostels</Text>
                  <Text style={styles.dropdownSectionCount}>{approvedHostels.length}</Text>
                </View>
                {approvedHostels.map((hostel) => (
                  <TouchableOpacity
                    key={hostel.hostelId}
                    style={[
                      styles.dropdownItem,
                      effectiveHostelId === hostel.hostelId && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleSelectHostel(hostel.hostelId)}
                  >
                    <Icon
                      name={getHostelTypeIcon(hostel.hostelType)}
                      size={20}
                      color={effectiveHostelId === hostel.hostelId ? "#fff" : getHostelTypeColor(hostel.hostelType)}
                      style={styles.dropdownItemIcon}
                    />
                    <View style={styles.dropdownItemInfo}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          effectiveHostelId === hostel.hostelId && styles.dropdownItemTextSelected
                        ]}
                        numberOfLines={1}
                      >
                        {hostel.hostelName}
                      </Text>
                      <Text
                        style={[
                          styles.dropdownItemSubtext,
                          effectiveHostelId === hostel.hostelId && styles.dropdownItemSubtextSelected
                        ]}
                      >
                        {hostel.hostelType} • {hostel.status}
                      </Text>
                    </View>
                    {effectiveHostelId === hostel.hostelId && (
                      <Icon name="check" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Other Hostels */}
            {hostels.filter(h => h.status !== "approved").length > 0 && (
              <>
                <View style={styles.dropdownDivider} />
                <View style={styles.dropdownSectionHeader}>
                  <Text style={styles.dropdownSectionTitle}>Other Hostels</Text>
                </View>
                {hostels
                  .filter(h => h.status !== "approved")
                  .map((hostel) => (
                    <TouchableOpacity
                      key={hostel.hostelId}
                      style={[styles.dropdownItem, styles.dropdownItemDisabled]}
                      onPress={() => {
                        handleSelectHostel(hostel.hostelId);
                        setShowHostelDropdown(false);
                      }}
                    >
                      <Icon
                        name={getHostelTypeIcon(hostel.hostelType)}
                        size={20}
                        color="#999"
                        style={styles.dropdownItemIcon}
                      />
                      <View style={styles.dropdownItemInfo}>
                        <Text style={styles.dropdownItemTextDisabled} numberOfLines={1}>
                          {hostel.hostelName}
                        </Text>
                        <Text style={[
                          styles.dropdownItemSubtext,
                          { color: getHostelStatusColor(hostel.status) }
                        ]}>
                          {hostel.hostelType} • {hostel.status}
                        </Text>
                        {hostel.rejectionReason && hostel.status === "rejected" && (
                          <Text style={styles.rejectionReason} numberOfLines={1}>
                            {hostel.rejectionReason}
                          </Text>
                        )}
                      </View>
                      <Icon
                        name={getHostelStatusIcon(hostel.status)}
                        size={18}
                        color={getHostelStatusColor(hostel.status)}
                      />
                    </TouchableOpacity>
                  ))}
              </>
            )}

            {/* No hostels message */}
            {hostels.length === 0 && (
              <View style={styles.noHostelsContainer}>
                <Icon name="home-off" size={40} color="#ccc" />
                <Text style={styles.noHostelsText}>No hostels available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render rooms section - always show even when count is 0
  const renderRoomsSection = () => {
    if (!effectiveHostelId) {
      return (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <View style={styles.noDataContainer}>
            <Icon name="home-off" size={40} color="#ccc" />
            <Text style={styles.noDataText}>Select a hostel to view rooms</Text>
          </View>
        </View>
      );
    }

    const hasRooms = allRooms && allRooms.length > 0;
    const displayRooms = hasRooms ? allRooms.slice(0, 3) : [];

    return (
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>
          Rooms {hasRooms ? `(${allRooms.length})` : "(0)"}
        </Text>

        {allRoomsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={FOREST_GREEN} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : hasRooms ? (
          <>
            <FlatList
              data={displayRooms}
              keyExtractor={(item, idx) => `${item.roomNumber}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingVertical: 2 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roomCard}
                  onPress={() => {
                    if (!isSelectedHostelApproved && !isViewOnlyMode) {
                      Alert.alert(
                        "Not Available",
                        "Room management is only available for approved hostels.",
                        [{ text: "OK", style: "cancel" }]
                      );
                      return;
                    }
                    try { recordRoute('/HostelDetails'); } catch (e) { }
                    router.push({
                      pathname: "/RoomDetails",
                      params: {
                        hostelId: effectiveHostelId,
                        hostelName: selectedHostel?.hostelName
                      }
                    });
                  }}
                  activeOpacity={(!isSelectedHostelApproved && !isViewOnlyMode) ? 1 : 0.82}
                >
                  <View style={styles.roomHeaderRow}>
                    <Icon name="bed" size={26} color={FOREST_GREEN} />
                    <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
                  </View>
                  <Text style={styles.roomInfo}>Floor {item.floor}</Text>
                  <Text style={styles.bedStats}>
                    <Text style={{ color: FOREST_GREEN }}>{item.capacity - item.remaining}</Text> /{item.capacity} filled
                  </Text>
                  <Text style={styles.bedVacant}>
                    <Icon name="alert-circle-outline" size={16} color={VEGA_YELLOW} />{" "}
                    <Text style={{ color: VEGA_YELLOW }}>{item.remaining}</Text> vacant
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* See All Rooms Button */}
            {allRooms.length > 3 && (
              <View style={styles.seeAllSection}>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => {
                    if (!isSelectedHostelApproved && !isViewOnlyMode) {
                      Alert.alert(
                        "Not Available",
                        "Room management is only available for approved hostels.",
                        [{ text: "OK", style: "cancel" }]
                      );
                      return;
                    }
                    try { recordRoute('/HostelDetails'); } catch (e) { }
                    router.push({
                      pathname: "/tabs/allrooms",
                      params: {
                        hostelId: effectiveHostelId,
                        hostelName: selectedHostel?.hostelName
                      }
                    });
                  }}
                  activeOpacity={(!isSelectedHostelApproved && !isViewOnlyMode) ? 1 : 0.8}
                >
                  <Text style={styles.seeAllText}>See All {allRooms.length} Rooms</Text>
                  <Icon name="chevron-right" size={20} color={FOREST_GREEN} />
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noRoomsContainer}>
            <Icon name="bed-empty" size={40} color="#ccc" />
            <Text style={styles.noRoomsText}>No rooms added yet</Text>
            {isSelectedHostelApproved && (
              <TouchableOpacity
                style={styles.addRoomsButton}
                onPress={() => {
                  try { recordRoute('/HostelDetails'); } catch (e) { }
                  router.push({
                    pathname: "/RoomDetails",
                    params: {
                      hostelId: effectiveHostelId,
                      hostelName: selectedHostel?.hostelName
                    }
                  });
                }}
              >
                <Text style={styles.addRoomsButtonText}>Add Rooms Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Handle card press with appropriate permissions
  const handleCardPress = (screen: string, screenName: string) => {
    if (!effectiveHostelId) {
      Alert.alert(
        "Select Hostel",
        "Please select a hostel first",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    if (!isSelectedHostelApproved && !isViewOnlyMode) {
      Alert.alert(
        "Not Available",
        `${screenName} management is only available for approved hostels.`,
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    try { recordRoute('/HostelDetails'); } catch (e) { }
    router.push({
      pathname: screen,
      params: {
        hostelId: effectiveHostelId,
        hostelName: selectedHostel?.hostelName
      }
    });
  };

  // Render the stat cards with actual data
  const renderStatCards = () => {
    const totalBeds = roomSummary?.totalBeds || 0;
    const vacantBeds = roomSummary?.availableBeds || 0;
    const occupiedBeds = roomSummary?.occupiedBeds || 0;

    return (
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, { borderColor: FOREST_GREEN }, !effectiveHostelId && styles.cardDisabled]}
          activeOpacity={!effectiveHostelId ? 1 : 0.9}
        >
          <Icon name="bed-double-outline" size={32} color={effectiveHostelId ? FOREST_GREEN : "#ccc"} />
          <Text style={[styles.statLabel, !effectiveHostelId && { color: "#999" }]}>Total Beds</Text>
          {roomSummaryLoading && effectiveHostelId ? (
            <ActivityIndicator size="small" color={FOREST_GREEN} style={{ marginTop: 4 }} />
          ) : (
            <Text style={[styles.statValue, !effectiveHostelId && { color: "#999" }]}>
              {effectiveHostelId ? totalBeds : "N/A"}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, { borderColor: VEGA_YELLOW }, !effectiveHostelId && styles.cardDisabled]}
          activeOpacity={!effectiveHostelId ? 1 : 0.9}
        >
          <Icon name="cash" size={32} color={effectiveHostelId ? VEGA_YELLOW : "#ccc"} />
          <Text style={[styles.statLabel, !effectiveHostelId && { color: "#999" }, effectiveHostelId && { color: VEGA_YELLOW }]}>
            Vacant Beds
          </Text>
          {roomSummaryLoading && effectiveHostelId ? (
            <ActivityIndicator size="small" color={VEGA_YELLOW} style={{ marginTop: 4 }} />
          ) : (
            <Text style={[
              styles.statValue,
              !effectiveHostelId && { color: "#999" },
              effectiveHostelId && { color: VEGA_YELLOW }
            ]}>
              {effectiveHostelId ? vacantBeds : "N/A"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={FOREST_GREEN} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[FOREST_GREEN, "#256B4A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.ownerName}>{user?.fullName || "Hostel Owner"}</Text>
          </View>

          {/* Header Right Icons */}
          <View style={styles.headerRightIcons}>
            {/* Profile Icon */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => {
                try { recordRoute('/HostelDetails'); } catch (e) { }
                router.push("/Profile");
              }}
              activeOpacity={0.8}
            >
              {renderProfileAvatar()}
            </TouchableOpacity>

            {/* Settings Icon */}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                try { recordRoute('/HostelDetails'); } catch (e) { }
                router.push("/tabs/Settings");
              }}
              activeOpacity={0.8}
            >
              <View style={styles.settingsIconWrap}>
                <Ionicons name="settings-sharp" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hostel Selector */}
        {renderHostelSelector()}

        {/* Warning message for unapproved hostels */}
        {selectedHostel && !isSelectedHostelApproved && (
          <View style={styles.warningBanner}>
            <Icon name="alert-circle-outline" size={16} color="#fff" />
            <Text style={styles.warningText}>
              This hostel is {selectedHostel.status}.
              {selectedHostel.status === "pending"
                ? " You can view details but cannot perform operations."
                : " You cannot manage this hostel."}
            </Text>
          </View>
        )}

        {/* Warning for no hostel selected */}
        {!effectiveHostelId && (
          <View style={styles.warningBanner}>
            <Icon name="alert-circle-outline" size={16} color="#fff" />
            <Text style={styles.warningText}>
              Please select a hostel to view details
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Dropdown Modal */}
      {renderDropdownModal()}

      {/* Perfect spacing */}
      <View style={{ height: 20 }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={true}
      >
        {/* Stat Cards - Updated with real data */}
        {renderStatCards()}

        {/* Upcoming Bookings Card */}
        <TouchableOpacity
          style={[styles.bookingsCard, !effectiveHostelId && styles.cardDisabled]}
          onPress={() => {
            if (!effectiveHostelId) {
              Alert.alert(
                "Select Hostel",
                "Please select a hostel first",
                [{ text: "OK", style: "cancel" }]
              );
              return;
            }
            if (!isSelectedHostelApproved && !isViewOnlyMode) {
              Alert.alert(
                "Not Available",
                "Bookings are only available for approved hostels.",
                [{ text: "OK", style: "cancel" }]
              );
              return;
            }
            try { recordRoute('/HostelDetails'); } catch (e) { }
            router.push({
              pathname: "/tabs/Bookings",
              params: {
                hostelId: effectiveHostelId,
                hostelName: selectedHostel?.hostelName
              }
            });
          }}
          activeOpacity={!effectiveHostelId ? 1 : 0.8}
        >
          <View style={[styles.bookingIconWrap, !effectiveHostelId && { backgroundColor: "#f0f0f0" }]}>
            <Icon name="calendar-blank" size={32} color={effectiveHostelId ? "#BDBDBD" : "#ccc"} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.bookingsTitle, !effectiveHostelId && { color: "#999" }]}>
              Upcoming Bookings
            </Text>
            {!effectiveHostelId ? (
              <Text style={styles.bookingsSubnote}>
                Select a hostel to view bookings
              </Text>
            ) : !isSelectedHostelApproved && !isViewOnlyMode ? (
              <Text style={styles.bookingsSubnote}>
                Available for approved hostels only
              </Text>
            ) : noBookings ? (
              <Text style={styles.bookingsSubnote}>New bookings will appear here</Text>
            ) : (
              <Text style={styles.bookingsSub}>You have bookings!</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Space between bookings/stat and rooms section */}
        <View style={{ height: 32 }} />

        {/* Rooms Breakdown */}
        {renderRoomsSection()}

        {/* Location Card */}
        {renderLocationCard()}

        {/* Pricing Card */}
        {renderPricingCard()}

        {/* Facilities Card */}
        <TouchableOpacity
          style={[styles.infoCard, !effectiveHostelId && styles.cardDisabled]}
          onPress={() => handleCardPress("/Facilities", "Facilities")}
          activeOpacity={!effectiveHostelId ? 1 : 0.8}
        >
          <View style={[
            styles.iconCircleYellow,
            !effectiveHostelId && { backgroundColor: "#f0f0f0" }
          ]}>
            <Icon name="domain" size={26} color={effectiveHostelId ? VEGA_YELLOW : "#ccc"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardLabel, !effectiveHostelId && { color: "#999" }]}>
              Facilities
            </Text>
            <Text style={[styles.cardValue, !effectiveHostelId && { color: "#999" }]} numberOfLines={1}>
              {effectiveHostelId
                ? (facilities ? `${Object.keys(facilities).length} categories configured` : "No facilities added")
                : "Select a hostel"
              }
            </Text>
          </View>
          <Icon
            name={effectiveHostelId ? "chevron-right" : "lock"}
            size={24}
            color={effectiveHostelId ? "#BDBDBD" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Media Card */}
        <TouchableOpacity
          style={[styles.infoCard, !effectiveHostelId && styles.cardDisabled]}
          onPress={() => handleCardPress("/UploadMedia", "Media")}
          activeOpacity={!effectiveHostelId ? 1 : 0.8}
        >
          <View style={[
            styles.iconCircle,
            !effectiveHostelId && { backgroundColor: "#f0f0f0" }
          ]}>
            <Icon name="image-multiple" size={26} color={effectiveHostelId ? FOREST_GREEN : "#ccc"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardLabel, !effectiveHostelId && { color: "#999" }]}>
              Media
            </Text>
            <Text style={[styles.cardValue, !effectiveHostelId && { color: "#999" }]} numberOfLines={1}>
              {effectiveHostelId ? `${photos.length || 0} images/videos` : "Select a hostel"}
            </Text>
          </View>
          <Icon
            name={effectiveHostelId ? "chevron-right" : "lock"}
            size={24}
            color={effectiveHostelId ? "#BDBDBD" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Bank Details Card */}
        <TouchableOpacity
          style={[styles.infoCard, !effectiveHostelId && styles.cardDisabled]}
          onPress={() => handleCardPress("/BankDetailsPage", "Bank Details")}
          activeOpacity={!effectiveHostelId ? 1 : 0.8}
        >
          <View style={[
            styles.iconCircleBank,
            !effectiveHostelId && { backgroundColor: "#f0f0f0" }
          ]}>
            <Icon name="bank" size={26} color={effectiveHostelId ? "#2C3E50" : "#ccc"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardLabel, !effectiveHostelId && { color: "#999" }]}>
              Bank Details
            </Text>
            {!effectiveHostelId ? (
              <Text style={[styles.cardValue, { color: "#999" }]}>
                Select a hostel
              </Text>
            ) : bankDetailsLoading ? (
              <ActivityIndicator size="small" color={FOREST_GREEN} />
            ) : bankDetails ? (
              <View>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {bankDetails.bankName} • {maskAccountNumber(bankDetails.accountNumber)}
                </Text>
                <Text style={styles.bankSubText}>
                  {bankDetails.accountHolderName} • {bankDetails.ifscCode}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.cardValue} numberOfLines={1}>
                  No bank details added
                </Text>
                <Text style={styles.bankSubText}>
                  Tap to add your bank account information
                </Text>
              </View>
            )}
          </View>
          <Icon
            name={effectiveHostelId ? "chevron-right" : "lock"}
            size={24}
            color={effectiveHostelId ? "#BDBDBD" : "#ccc"}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return `••••${lastFour}`;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  // Header Right Icons Container
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileButton: {
    padding: 2,
  },
  settingsButton: {
    padding: 2,
  },
  // Large Profile Icon
  profileIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  // Smaller Settings Icon
  settingsIconWrap: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: FOREST_GREEN,
    zIndex: 10,
  },
  hostelSelectorContainer: {
    marginTop: 4,
  },
  hostelSelectorButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hostelSelectorButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  hostelSelectorButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorIcon: {
    marginRight: 8,
  },
  selectorTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  selectorTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  selectorStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorStatus: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  selectorPricingInfo: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.8,
    marginLeft: 4,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  warningText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FOREST_GREEN,
  },
  dropdownScrollView: {
    maxHeight: height * 0.6,
  },
  dropdownSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
  },
  dropdownSectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: FOREST_GREEN,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemSelected: {
    backgroundColor: FOREST_GREEN + "15",
  },
  dropdownItemDisabled: {
    opacity: 0.7,
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  dropdownItemTextSelected: {
    color: FOREST_GREEN,
    fontWeight: "600",
  },
  dropdownItemTextDisabled: {
    fontSize: 15,
    fontWeight: "500",
    color: "#999",
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: "#666",
  },
  dropdownItemSubtextSelected: {
    color: FOREST_GREEN + "CC",
  },
  rejectionReason: {
    fontSize: 11,
    color: ERROR_COLOR,
    fontStyle: "italic",
    marginTop: 2,
  },
  noHostelsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noHostelsText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    opacity: 0.95,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  ownerName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    elevation: 1,
    borderWidth: 2.2,
  },
  cardDisabled: {
    backgroundColor: "#f9f9f9",
    borderColor: "#e0e0e0",
    opacity: 0.8,
  },
  statLabel: {
    marginTop: 9,
    fontSize: 16,
    fontWeight: "600",
    color: FOREST_GREEN,
    opacity: 0.9,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 21,
    fontWeight: "800",
    color: FOREST_GREEN,
    marginTop: 4,
  },
  bookingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 3,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: FOREST_GREEN,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bookingIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },
  bookingsTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#222",
    marginBottom: 2,
  },
  bookingsSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
    fontWeight: "500",
  },
  bookingsSubnote: {
    fontSize: 13,
    color: "#B5B5B8",
    marginTop: 2,
    fontWeight: "500",
  },
  sectionWrap: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FOREST_GREEN,
    marginBottom: 10,
  },
  roomCard: {
    width: width * 0.48,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginRight: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 18,
    shadowColor: "#DFF8F3",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    borderWidth: 1.2,
    borderColor: "#e7fbe1",
  },
  roomHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  roomNumber: {
    fontWeight: "700",
    marginLeft: 7,
    color: TEXT_DARK,
    fontSize: 15,
  },
  roomInfo: {
    color: "#676770",
    fontSize: 13,
    marginBottom: 2,
  },
  bedStats: {
    fontWeight: "700",
    fontSize: 14,
    color: TEXT_DARK,
  },
  bedVacant: {
    fontWeight: "600",
    fontSize: 13,
    color: VEGA_YELLOW,
  },
  seeAllSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FOREST_GREEN,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: FOREST_GREEN,
    marginRight: 8,
  },
  // Location Card Styles
  locationCard: {
    marginHorizontal: 16,
    marginBottom: 13,
    marginTop: 3,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#DFF8F3",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e7fbe1",
  },
  iconCircleLocation: {
    height: 38,
    width: 38,
    borderRadius: 19,
    marginRight: 13,
    backgroundColor: "#E8F5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  locationSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  // No Rooms Container
  noRoomsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 16,
  },
  noRoomsText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  addRoomsButton: {
    marginTop: 12,
    backgroundColor: VEGA_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addRoomsButtonText: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: "600",
  },
  // No Data Container
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  // Loading Container
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 13,
    marginTop: 3,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#DFF8F3",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e7fbe1",
  },
  infoCardDisabled: {
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F9F9F9",
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    opacity: 0.8,
  },
  iconCircle: {
    height: 38,
    width: 38,
    borderRadius: 19,
    marginRight: 13,
    backgroundColor: "#ECFCF7",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleYellow: {
    height: 38,
    width: 38,
    borderRadius: 19,
    marginRight: 13,
    backgroundColor: "#fffae6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleBank: {
    height: 38,
    width: 38,
    borderRadius: 19,
    marginRight: 13,
    backgroundColor: "#F0F5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleGrey: {
    height: 38,
    width: 38,
    borderRadius: 19,
    marginRight: 13,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: FOREST_GREEN,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  // Bank Details specific styles
  bankSubText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  infoNote: {
    fontSize: 13,
    color: "#609269",
    opacity: 0.85,
    marginTop: 2,
  },
  // New Pricing Card Styles
  pricingCard: {
    marginHorizontal: 16,
    marginBottom: 13,
    marginTop: 3,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#DFF8F3",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e7fbe1",
  },
  pricingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  refreshIndicatorContainer: {
    width: 24,
    alignItems: "center",
  },
  // Pricing Table Styles
  pricingTable: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  pricingTableHeader: {
    flexDirection: "row",
    backgroundColor: FOREST_GREEN + "20",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  pricingTableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: FOREST_GREEN,
  },
  pricingTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  pricingTableRowEven: {
    backgroundColor: "#fff",
  },
  pricingTableCell: {
    fontSize: 13,
    color: TEXT_DARK,
  },
  moreItemsIndicator: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  moreItemsText: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
  lastUpdatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  lastUpdatedText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 6,
    fontStyle: "italic",
  },
  // Loading and Error States
  pricingLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  pricingLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  pricingErrorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  pricingErrorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
    marginHorizontal: 16,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: FOREST_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pricingEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  pricingEmptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  addPricingButton: {
    marginTop: 12,
    backgroundColor: VEGA_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addPricingButtonText: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: "600",
  },
});