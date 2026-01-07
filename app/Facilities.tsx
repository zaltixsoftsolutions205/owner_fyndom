// app/Facilities.tsx
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
  setFacilities,
  getFacilities,
  clearError,
  clearSuccess,
  updateLocalFacilities,
  setActiveHostelFacilities
} from "../app/reduxStore/reduxSlices/facilitiesSlice";
import { AppDispatch, RootState } from "../app/reduxStore/store/store";
import { useAppSelector } from "@/hooks/hooks";

const { width, height } = Dimensions.get("window");
const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const SHARING_BLUE = "#3B82F6";
const FOOD_ORANGE = "#F59E0B";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

// Reverse mapping for displaying existing data
const REVERSE_FACILITY_MAPPING: Record<string, string> = {
  // Sharing Types
  "1 Sharing": "1-sharing",
  "2 Sharing": "2-sharing",
  "3 Sharing": "3-sharing",
  "4 Sharing": "4-sharing",
  "5 Sharing": "5-sharing",
  "6 Sharing": "6-sharing",
  "7 Sharing": "7-sharing",
  "8 Sharing": "8-sharing",
  "9 Sharing": "9-sharing",
  "10 Sharing": "10-sharing",

  // Bathroom Types
  "Attached Bathroom": "attached",
  "Common Bathroom": "common",

  // Essentials
  "Air Conditioning": "ac",
  "Free WiFi": "wifi",
  "Power Backup": "power-backup",
  "CCTV Security": "cctv",
  "RO Water": "ro-water",
  "Daily Cleaning": "cleaning",
  "Elevator/Lift": "lift",
  "Washing Machine": "washing-machine",
  "Parking Space": "parking",
  "Dining Hall": "dining",
  "Study Room/Library": "library",
  "Hot Water/Geyser/Inverter": "geyser",
  "Room Heater": "heater",

  // Food Options
  "Vegetarian Meals": "veg",
  "Non-vegetarian Meals": "non-veg",
  "Breakfast": "breakfast",
  "Lunch": "lunch",
  "Dinner": "dinner",
  "Tea/Coffee": "tea-coffee",
  "Chinese Meals": "chinese",
  "North Indian Meals": "north-indian",
};

// Forward mapping
const FACILITY_MAPPING = {
  // Sharing Types
  "1-sharing": "1 Sharing",
  "2-sharing": "2 Sharing",
  "3-sharing": "3 Sharing",
  "4-sharing": "4 Sharing",
  "5-sharing": "5 Sharing",
  "6-sharing": "6 Sharing",
  "7-sharing": "7 Sharing",
  "8-sharing": "8 Sharing",
  "9-sharing": "9 Sharing",
  "10-sharing": "10 Sharing",

  // Bathroom Types
  "attached": "Attached Bathroom",
  "common": "Common Bathroom",

  // Essentials
  "ac": "Air Conditioning",
  "wifi": "Free WiFi",
  "power-backup": "Power Backup",
  "cctv": "CCTV Security",
  "ro-water": "RO Water",
  "cleaning": "Daily Cleaning",
  "lift": "Elevator/Lift",
  "washing-machine": "Washing Machine",
  "parking": "Parking Space",
  "dining": "Dining Hall",
  "library": "Study Room/Library",
  "geyser": "Hot Water/Geyser/Inverter",
  "heater": "Room Heater",

  // Food Options
  "veg": "Vegetarian Meals",
  "non-veg": "Non-vegetarian Meals",
  "breakfast": "Breakfast",
  "lunch": "Lunch",
  "dinner": "Dinner",
  "tea-coffee": "Tea/Coffee",
  "chinese": "Chinese Meals",
  "north-indian": "North Indian Meals",
};

const FacilitiesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // Get hostelId from params or Redux
  const hostelId = params.hostelId as string || '';
  const hostelName = params.hostelName as string || '';

  // Get auth state for selected hostel
  const { selectedHostelId, hostels } = useAppSelector((state) => state.auth);
  const { loading, error, success, facilities } = useSelector((state: RootState) => state.facilities);

  // Determine the actual hostelId to use
  const actualHostelId = hostelId || selectedHostelId || '';
  const actualHostel = hostels.find(h => h.hostelId === actualHostelId);
  const actualHostelName = actualHostel?.hostelName || hostelName;

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedSharing, setSelectedSharing] = useState<string[]>([]);
  const [selectedFoodOptions, setSelectedFoodOptions] = useState<string[]>([]);
  const [foodMenu, setFoodMenu] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  const facilitiesList = [
    // Sharing Type - MULTIPLE SELECT
    { id: "1-sharing", name: "1 Sharing", category: "Sharing Type" },
    { id: "2-sharing", name: "2 Sharing", category: "Sharing Type" },
    { id: "3-sharing", name: "3 Sharing", category: "Sharing Type" },
    { id: "4-sharing", name: "4 Sharing", category: "Sharing Type" },
    { id: "5-sharing", name: "5 Sharing", category: "Sharing Type" },
    { id: "6-sharing", name: "6 Sharing", category: "Sharing Type" },
    { id: "7-sharing", name: "7 Sharing", category: "Sharing Type" },
    { id: "8-sharing", name: "8 Sharing", category: "Sharing Type" },
    { id: "9-sharing", name: "9 Sharing", category: "Sharing Type" },
    { id: "10-sharing", name: "10 Sharing", category: "Sharing Type" },

    { id: "attached", name: "Attached Bathroom", category: "Bathroom" },
    { id: "common", name: "Common Bathroom", category: "Bathroom" },

    { id: "ac", name: "Air Conditioning", category: "Essential" },
    { id: "wifi", name: "Free WiFi", category: "Essential" },
    { id: "power-backup", name: "Power Backup", category: "Essential" },
    { id: "cctv", name: "CCTV Security", category: "Essential" },
    { id: "ro-water", name: "RO Water", category: "Essential" },
    { id: "cleaning", name: "Daily Cleaning", category: "Essential" },
    { id: "lift", name: "Elevator/Lift", category: "Essential" },
    { id: "washing-machine", name: "Washing Machine", category: "Essential" },
    { id: "parking", name: "Parking Space", category: "Essential" },
    { id: "dining", name: "Dining Hall", category: "Essential" },
    { id: "library", name: "Study Room/Library", category: "Essential" },
    { id: "geyser", name: "Hot Water / Geyser", category: "Essential" },
    { id: "heater", name: "Room Heater", category: "Essential" },

    // Food Options
    { id: "veg", name: "Vegetarian Meals", category: "Food" },
    { id: "non-veg", name: "Non-Vegetarian Meals", category: "Food" },
    { id: "breakfast", name: "Breakfast", category: "Food" },
    { id: "lunch", name: "Lunch", category: "Food" },
    { id: "dinner", name: "Dinner", category: "Food" },
    { id: "tea-coffee", name: "Tea/Coffee", category: "Food" },
    { id: "chinese", name: "Chinese Meals", category: "Food" },
    { id: "north-indian", name: "North Indian Meals", category: "Food" },
  ];

  const categories = [...new Set(facilitiesList.map((f) => f.category))];

  // Check if we have a valid hostelId
  useEffect(() => {
    if (!actualHostelId) {
      Toast.show({
        type: "error",
        text1: "No Hostel Selected",
        text2: "Please select a hostel first from the home screen",
      });

      // Navigate back if no hostel selected
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [actualHostelId]);

  // Load existing facilities on component mount
  useEffect(() => {
    const loadExistingFacilities = async () => {
      if (!actualHostelId) {
        setIsLoaded(true);
        return;
      }

      try {
        console.log("🔄 Loading facilities for hostel:", actualHostelId);
        await dispatch(getFacilities(actualHostelId)).unwrap();
        setIsLoaded(true);
      } catch (error) {
        console.log("⚠️ No existing facilities or error:", error);
        setIsLoaded(true);
      }
    };

    loadExistingFacilities();
  }, [dispatch, actualHostelId]);

  // Add this function to handle loading custom food menu from existing data
  useEffect(() => {
    if (facilities && isLoaded && facilities.hostelId === actualHostelId) {
      console.log("📋 Populating form with existing facilities:", facilities);

      // Reset all selections first
      setSelectedSharing([]);
      setSelectedFacilities([]);
      setSelectedFoodOptions([]);
      setFoodMenu("");

      // Map sharing types
      if (facilities.sharingTypes && Array.isArray(facilities.sharingTypes)) {
        const sharingIds = facilities.sharingTypes
          .map(type => REVERSE_FACILITY_MAPPING[type])
          .filter(Boolean) as string[];
        setSelectedSharing(sharingIds);
      }

      // Map bathroom types
      if (facilities.bathroomTypes && Array.isArray(facilities.bathroomTypes)) {
        const bathroomIds = facilities.bathroomTypes
          .map(type => REVERSE_FACILITY_MAPPING[type])
          .filter(Boolean) as string[];
        setSelectedFacilities(prev => [...prev, ...bathroomIds]);
      }

      // Map essentials
      if (facilities.essentials && Array.isArray(facilities.essentials)) {
        const essentialIds = facilities.essentials
          .map(essential => REVERSE_FACILITY_MAPPING[essential])
          .filter(Boolean) as string[];
        setSelectedFacilities(prev => [...prev, ...essentialIds]);
      }

      // Map food services (only predefined values)
      if (facilities.foodServices && Array.isArray(facilities.foodServices)) {
        const foodServiceIds: string[] = [];
        facilities.foodServices.forEach(service => {
          const mappedId = REVERSE_FACILITY_MAPPING[service];
          if (mappedId) {
            foodServiceIds.push(mappedId);
          }
        });
        setSelectedFoodOptions(foodServiceIds);
      }

      // Set custom food menu separately
      if (facilities.customFoodMenu) {
        setFoodMenu(facilities.customFoodMenu);
      }
    }
  }, [facilities, isLoaded, actualHostelId]);

  // Handle errors and success messages
  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error ❌",
        text2: error,
      });
      dispatch(clearError());
    }

    if (success) {
      Toast.show({
        type: "success",
        text1: "Facilities Saved Successfully ✅",
        text2: `Facilities updated for ${actualHostelName}`,
      });
      dispatch(clearSuccess());
      // Navigate to summary page after successful update
      setTimeout(() => {
        router.push({
          pathname: "/Summary",
          params: {
            hostelId: actualHostelId,
            hostelName: actualHostelName
          }
        });
      }, 1500);
    }
  }, [error, success, dispatch, router, actualHostelId, actualHostelName]);

  const toggleFacility = (facilityId: string, category: string) => {
    if (category === "Sharing Type") {
      setSelectedSharing((prev) =>
        prev.includes(facilityId)
          ? prev.filter((id) => id !== facilityId)
          : [...prev, facilityId]
      );
    } else if (category === "Food") {
      setSelectedFoodOptions((prev) =>
        prev.includes(facilityId)
          ? prev.filter((id) => id !== facilityId)
          : [...prev, facilityId]
      );
    } else {
      setSelectedFacilities((prev) =>
        prev.includes(facilityId)
          ? prev.filter((id) => id !== facilityId)
          : [...prev, facilityId]
      );
    }
  };

  const handleRemoveSelected = (facilityId: string, category: string) => {
    if (category === "Sharing Type") {
      setSelectedSharing((prev) => prev.filter((id) => id !== facilityId));
    } else if (category === "Food") {
      setSelectedFoodOptions((prev) => prev.filter((id) => id !== facilityId));
    } else {
      setSelectedFacilities((prev) => prev.filter((id) => id !== facilityId));
    }
  };

  const formatDataForAPI = () => {
    // Convert selected sharing IDs to backend values
    const sharingTypes = selectedSharing.map(sharingId =>
      FACILITY_MAPPING[sharingId as keyof typeof FACILITY_MAPPING] as string
    );

    const bathroomTypes: string[] = [];
    const essentials: string[] = [];
    const foodServices: string[] = [];

    // Process selected food options (ONLY predefined values)
    selectedFoodOptions.forEach((facilityId) => {
      const mapping = FACILITY_MAPPING[facilityId as keyof typeof FACILITY_MAPPING];
      if (mapping) foodServices.push(mapping);
    });

    // Process other facilities
    selectedFacilities.forEach((facilityId) => {
      const mapping = FACILITY_MAPPING[facilityId as keyof typeof FACILITY_MAPPING];

      if (!mapping || typeof mapping !== 'string') return;

      if (facilityId === "attached" || facilityId === "common") {
        bathroomTypes.push(mapping);
      } else {
        essentials.push(mapping);
      }
    });

    const apiData = {
      hostelId: actualHostelId,
      sharingTypes,
      bathroomTypes,
      essentials,
      foodServices,
      customFoodMenu: foodMenu.trim() || undefined
    };

    console.log("📤 Formatted API Data:", apiData);
    return apiData;
  };

  // In your Facilities.tsx, update the handleSubmit function:
  const handleSubmit = async () => {
    if (!actualHostelId) {
      Toast.show({
        type: "error",
        text1: "No Hostel Selected",
        text2: "Please select a hostel first"
      });
      return;
    }

    if (selectedSharing.length === 0 && selectedFacilities.length === 0 && selectedFoodOptions.length === 0 && !foodMenu.trim()) {
      Toast.show({
        type: "error",
        text1: "No Selection ⚠️",
        text2: "Please select at least one sharing type or facility."
      });
      return;
    }

    try {
      const apiData = formatDataForAPI();
      console.log("🚀 Submitting facilities data:", {
        hostelId: actualHostelId,
        data: apiData,
        selectedSharingCount: selectedSharing.length,
        selectedFacilitiesCount: selectedFacilities.length,
        selectedFoodOptionsCount: selectedFoodOptions.length,
        foodMenuLength: foodMenu.length
      });

      // Debug: Log what's being sent
      console.log("📤 API Payload:", JSON.stringify(apiData, null, 2));

      const result = await dispatch(setFacilities(apiData)).unwrap();

      console.log("✅ Submission successful:", result);

      if (result.success) {
        // Update local state with new data
        dispatch(updateLocalFacilities({
          hostelId: actualHostelId,
          ...result.data
        }));

        Toast.show({
          type: "success",
          text1: "Success ✅",
          text2: "Facilities updated successfully!",
        });

        // Navigation to summary page
        setTimeout(() => {
          router.push({
            pathname: "/Summary",
            params: {
              hostelId: actualHostelId,
              hostelName: actualHostelName
            }
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error("❌ Submission error details:", {
        message: error.message,
        error: error,
        stack: error.stack
      });

      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.message || "Failed to save facilities. Please try again."
      });
    }
  };

  const getAllSelected = () => {
    return [...selectedSharing, ...selectedFacilities, ...selectedFoodOptions];
  };

  const getSelectedCount = () => {
    return selectedSharing.length + selectedFacilities.length + selectedFoodOptions.length;
  };

  // Loading state
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KELLY_GREEN} />
        <Text style={styles.loadingText}>Loading facilities...</Text>
      </View>
    );
  }

  if (!actualHostelId) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color={KELLY_GREEN} />
        <Text style={styles.errorTitle}>No Hostel Selected</Text>
        <Text style={styles.errorText}>
          Please select a hostel first from the home screen
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={KELLY_GREEN} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Facilities</Text>
          {actualHostelName && (
            <Text style={styles.hostelName} numberOfLines={1}>
              {actualHostelName}
            </Text>
          )}
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Information Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-outline" size={20} color="#fff" />
          <Text style={styles.infoText}>
            {facilities && facilities.hostelId === actualHostelId
              ? `Edit facilities for ${actualHostelName}`
              : `Set up facilities for ${actualHostelName}`}
          </Text>
        </View>

        {/* Hostel Info Card */}
        <View style={styles.hostelInfoCard}>
          <Icon name="home" size={24} color={KELLY_GREEN} />
          <View style={styles.hostelInfoContent}>
            <Text style={styles.hostelInfoTitle}>{actualHostelName}</Text>
            <Text style={styles.hostelInfoId}>ID: {actualHostelId}</Text>
          </View>
        </View>

        {/* Sharing Type Card */}
        <View style={styles.sharingCard}>
          <View style={styles.roomHeader}>
            <Text style={styles.sharingCardTitle}>
              Sharing Type (Select Multiple)
            </Text>
            {selectedSharing.length > 0 && (
              <Text style={styles.selectionCount}>
                {selectedSharing.length} selected
              </Text>
            )}
          </View>
          <View style={styles.optionsGrid}>
            {facilitiesList
              .filter((f) => f.category === "Sharing Type")
              .map((facility) => {
                const isSelected = selectedSharing.includes(facility.id);

                return (
                  <View key={facility.id} style={styles.optionWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.option,
                        isSelected && styles.sharingOptionSelected,
                      ]}
                      onPress={() => toggleFacility(facility.id, "Sharing Type")}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.sharingOptionTextSelected,
                        ]}
                      >
                        {facility.name}
                      </Text>
                      {isSelected && (
                        <Icon name="check-circle" size={18} color="#fff" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
          <Text style={styles.categoryHint}>
            Select all sharing options available in your hostel
          </Text>
        </View>

        {/* Other Facility Cards */}
        {categories
          .filter(category => category !== "Sharing Type")
          .map((category) => (
            <View
              key={category}
              style={[
                styles.card,
                category === "Food" && styles.foodCard
              ]}
            >
              <View style={styles.roomHeader}>
                <Text style={[
                  styles.roomTitle,
                  category === "Food" && styles.foodCardTitle
                ]}>
                  {category}
                </Text>
                {(category === "Food" ? selectedFoodOptions.length > 0 : false) && (
                  <Text style={styles.selectionCount}>
                    {category === "Food" ? selectedFoodOptions.length : 0} selected
                  </Text>
                )}
              </View>
              <View style={styles.optionsGrid}>
                {facilitiesList
                  .filter((f) => f.category === category)
                  .map((facility) => {
                    const isSelected = category === "Food"
                      ? selectedFoodOptions.includes(facility.id)
                      : selectedFacilities.includes(facility.id);

                    return (
                      <View key={facility.id} style={styles.optionWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.option,
                            isSelected && (category === "Food"
                              ? styles.foodOptionSelected
                              : styles.optionSelected),
                          ]}
                          onPress={() => toggleFacility(facility.id, category)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && (category === "Food"
                                ? styles.foodOptionTextSelected
                                : styles.optionTextSelected),
                            ]}
                          >
                            {facility.name}
                          </Text>
                          {isSelected && (
                            <Icon name="check" size={18} color="#fff" style={styles.checkIcon} />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
              </View>
            </View>
          ))}

        {/* Custom Food Menu Input */}
        <View style={styles.foodMenuCard}>
          <Text style={styles.label}>Custom Food Menu (Optional)</Text>
          <Text style={styles.foodMenuHint}>
            Add detailed menu description (e.g., "Chicken 2x/week, Egg daily, Breakfast included")
          </Text>
          <View style={styles.inputContainer}>
            <Icon
              name="food"
              size={18}
              color={FOOD_ORANGE}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { borderColor: FOOD_ORANGE }]}
              placeholder="Describe your food menu in detail..."
              placeholderTextColor="#999"
              value={foodMenu}
              onChangeText={setFoodMenu}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Selected Facilities Summary */}
        {getAllSelected().length > 0 && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>
                Selected Items ({getSelectedCount()})
              </Text>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  setSelectedSharing([]);
                  setSelectedFacilities([]);
                  setSelectedFoodOptions([]);
                  setFoodMenu("");
                }}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.selectedTags}>
              {/* Sharing Types */}
              {selectedSharing.length > 0 && (
                <>
                  <Text style={styles.selectedSubtitle}>Sharing Types:</Text>
                  <View style={styles.tagsRow}>
                    {facilitiesList
                      .filter((f) => selectedSharing.includes(f.id))
                      .map((f) => (
                        <View key={f.id} style={styles.sharingTag}>
                          <Icon
                            name="account-multiple"
                            size={12}
                            color={GOLDEN_YELLOW}
                            style={styles.tagIcon}
                          />
                          <Text style={styles.sharingTagText}>
                            {f.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveSelected(f.id, f.category)}
                          >
                            <Icon name="close" size={12} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                </>
              )}

              {/* Other Facilities */}
              {selectedFacilities.length > 0 && (
                <>
                  <Text style={styles.selectedSubtitle}>Facilities:</Text>
                  <View style={styles.tagsRow}>
                    {facilitiesList
                      .filter((f) => selectedFacilities.includes(f.id))
                      .map((f) => (
                        <View key={f.id} style={styles.tag}>
                          <Icon
                            name="check-circle"
                            size={12}
                            color={KELLY_GREEN}
                            style={styles.tagIcon}
                          />
                          <Text style={styles.tagText}>
                            {f.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveSelected(f.id, f.category)}
                          >
                            <Icon name="close" size={12} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                </>
              )}

              {/* Food Options */}
              {selectedFoodOptions.length > 0 && (
                <>
                  <Text style={styles.selectedSubtitle}>Food Options:</Text>
                  <View style={styles.tagsRow}>
                    {facilitiesList
                      .filter((f) => selectedFoodOptions.includes(f.id))
                      .map((f) => (
                        <View key={f.id} style={styles.foodTag}>
                          <Icon
                            name="food"
                            size={12}
                            color={FOOD_ORANGE}
                            style={styles.tagIcon}
                          />
                          <Text style={styles.foodTagText}>
                            {f.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveSelected(f.id, f.category)}
                          >
                            <Icon name="close" size={12} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Update & Next Button */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.saveButton, (getSelectedCount() === 0 && !foodMenu.trim()) && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || (getSelectedCount() === 0 && !foodMenu.trim()) || !actualHostelId}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {facilities && facilities.hostelId === actualHostelId ? "Update & Next" : "Save & Next"}
                </Text>
                <Icon name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Icon name="information-outline" size={16} color={KELLY_GREEN} />
          <Text style={styles.instructionsText}>
            • Select multiple sharing types if your hostel offers different room configurations
            • Choose all relevant facilities and food options
            • Add custom food menu details if needed
            • Your selections will be saved and displayed to students
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
};

export default FacilitiesScreen;

// Add these new styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: KELLY_GREEN,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: KELLY_GREEN,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: KELLY_GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: KELLY_GREEN,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: width * 0.032,
    fontWeight: '500',
    flex: 1,
  },
  hostelInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hostelInfoContent: {
    marginLeft: 15,
    flex: 1,
  },
  hostelInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hostelInfoId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fdf8"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: width * 0.042,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },
  hostelName: {
    fontSize: width * 0.032,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 28,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  sharingCard: {
    borderColor: '#FFF3CD',
    backgroundColor: '#FFF8E1',
    marginBottom: 20,
  },
  foodCard: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: width * 0.042,
    fontWeight: "800",
    color: "#2E7D32",
    paddingLeft: 12,
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  sharingCardTitle: {
    fontSize: width * 0.042,
    fontWeight: "800",
    color: GOLDEN_YELLOW,
    backgroundColor: '#FFF3CD',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  foodCardTitle: {
    color: FOOD_ORANGE,
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  selectionCount: {
    fontSize: width * 0.03,
    color: "#666",
    fontWeight: "500",
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 10,
  },
  option: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    position: "relative",
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: KELLY_GREEN,
    borderColor: KELLY_GREEN,
    shadowColor: KELLY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sharingOptionSelected: {
    backgroundColor: GOLDEN_YELLOW,
    borderColor: GOLDEN_YELLOW,
    shadowColor: GOLDEN_YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  foodOptionSelected: {
    backgroundColor: FOOD_ORANGE,
    borderColor: FOOD_ORANGE,
    shadowColor: FOOD_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  optionText: {
    fontSize: width * 0.03,
    color: "#3E3E3E",
    fontWeight: "500",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  sharingOptionTextSelected: {
    color: "#000",
    fontWeight: "700",
  },
  foodOptionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryHint: {
    fontSize: width * 0.028,
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  foodMenuCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  label: {
    fontSize: width * 0.032,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2E7D32",
    marginTop: 4,
  },
  foodMenuHint: {
    fontSize: width * 0.028,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  inputContainer: {
    marginBottom: 0,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Platform.OS === "ios" ? 15 : 12,
    paddingLeft: 45,
    fontSize: width * 0.032,
    backgroundColor: "#fff",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectedCard: {
    backgroundColor: "rgba(76,187,23,0.08)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(76,187,23,0.2)",
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedTitle: {
    fontSize: width * 0.042,
    fontWeight: "700",
    color: KELLY_GREEN,
  },
  selectedSubtitle: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
    marginBottom: 8,
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,0,0,0.1)",
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: width * 0.03,
    color: "#d32f2f",
    fontWeight: "500",
  },
  selectedTags: {
    marginTop: 5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(76,187,23,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sharingTag: {
    backgroundColor: "rgba(255,223,0,0.3)",
  },
  foodTag: {
    backgroundColor: "rgba(245,158,11,0.2)",
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: width * 0.03,
    color: KELLY_GREEN,
    fontWeight: "600",
  },
  sharingTagText: {
    color: GOLDEN_YELLOW,
    fontWeight: "700",
  },
  foodTagText: {
    color: FOOD_ORANGE,
    fontWeight: "700",
  },
  removeTagButton: {
    marginLeft: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    elevation: 3,
    shadowColor: DARK_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: width * 0.032,
    fontWeight: "700",
    color: "#fff",
  },
  instructions: {
    marginTop: 10,
    padding: 18,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: KELLY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: '100%',
  },
  instructionsText: {
    flex: 1,
    fontSize: width * 0.028,
    color: "#2E7D32",
    lineHeight: 18,
    fontWeight: '400',
  },
});