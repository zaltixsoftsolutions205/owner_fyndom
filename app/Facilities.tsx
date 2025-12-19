// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useState, useEffect } from "react";
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import { useDispatch, useSelector } from "react-redux";
// import { setFacilities, clearError, clearSuccess } from "../app/reduxStore/reduxSlices/facilitiesSlice";
// import { AppDispatch, RootState } from "../app/reduxStore/store/store";

// const { width, height } = Dimensions.get("window");
// const KELLY_GREEN = "#4CBB17";
// const GOLDEN_YELLOW = "#FFDF00";

// // Mapping between frontend IDs and backend values
// const FACILITY_MAPPING = {
//   // Room Types
//   "single": { roomType: "Single Room", sharingType: null },
//   "double": { roomType: "Double Room", sharingType: null },
//   "triple": { roomType: "Triple Room", sharingType: null },

//   // Bathroom Types
//   "attached": "Attached Bathroom",
//   "common": "Common Bathroom",

//   // Essentials
//   "ac": "Air Conditioning",
//   "wifi": "Free WiFi",
//   "power-backup": "Power Backup",
//   "cctv": "CCTV Security",
//   "ro-water": "RO Water",
//   "cleaning": "Daily Cleaning",
//   "lift": "Elevator/Lift",
//   "laundry": "Laundry Service",
//   "parking": "Parking Space",
//   "dining": "Dining Hall",
//   "library": "Study Room/Library",
//   "geyser": "Hot Water/Geyser/Inverter",
//   "inverter": "Hot Water/Geyser/Inverter", // Map to same value as geyser
//   "heater": "Room Heater",

//   // Food Services
//   "veg": "Vegetarian Meals",
//   "non-veg": "Non-vegetarian Meals",
//   "breakfast": "Breakfast",
//   "lunch": "Lunch",
//   "dinner": "Dinner",
//   "tea-coffee": "Tea/Coffee",
//   "chinese": "Chinese Meals",
//   "north-indian": "North Indian Meals",
// };

// const FacilitiesScreen = () => {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const { loading, error, success } = useSelector((state: RootState) => state.facilities);

//   const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
//   const [selectedSharing, setSelectedSharing] = useState<Record<string, string | null>>({});

//   const facilities = [
//     { id: "single", name: "Single Room", category: "Room Type" },
//     { id: "double", name: "Double Room", category: "Room Type" },
//     { id: "triple", name: "Triple Room", category: "Room Type" },
//     { id: "attached", name: "Attached Bathroom", category: "Bathroom" },
//     { id: "common", name: "Common Bathroom", category: "Bathroom" },
//     { id: "ac", name: "Air Conditioning", category: "Essential" },
//     { id: "wifi", name: "Free WiFi", category: "Essential" },
//     { id: "power-backup", name: "Power Backup", category: "Essential" },
//     { id: "cctv", name: "CCTV Security", category: "Essential" },
//     { id: "ro-water", name: "RO Water", category: "Essential" },
//     { id: "cleaning", name: "Daily Cleaning", category: "Essential" },
//     { id: "lift", name: "Elevator/Lift", category: "Essential" },
//     { id: "laundry", name: "Laundry Service", category: "Essential" },
//     { id: "parking", name: "Parking Space", category: "Essential" },
//     { id: "dining", name: "Dining Hall", category: "Essential" },
//     { id: "library", name: "Study Room/Library", category: "Essential" },
//     { id: "geyser", name: "Hot Water / Geyser", category: "Essential" },
//     { id: "inverter", name: "Inverter", category: "Essential" },
//     { id: "heater", name: "Room Heater", category: "Essential" },
//     { id: "veg", name: "Vegetarian Meals", category: "Food" },
//     { id: "non-veg", name: "Non-Vegetarian Meals", category: "Food" },
//     { id: "breakfast", name: "Breakfast", category: "Food" },
//     { id: "lunch", name: "Lunch", category: "Food" },
//     { id: "dinner", name: "Dinner", category: "Food" },
//     { id: "tea-coffee", name: "Tea/Coffee", category: "Food" },
//     { id: "chinese", name: "Chinese Meals", category: "Food" },
//     { id: "north-indian", name: "North Indian Meals", category: "Food" },
//   ];

//   const categories = [...new Set(facilities.map((f) => f.category))];

//   // Handle errors and success messages
//   useEffect(() => {
//     if (error) {
//       Toast.show({
//         type: "error",
//         text1: "Error ❌",
//         text2: error,
//       });
//       dispatch(clearError());
//     }

//     if (success) {
//       Toast.show({
//         type: "success",
//         text1: "Facilities Saved Successfully ✅",
//         text2: "Your hostel facilities have been updated.",
//       });
//       dispatch(clearSuccess());
//       // ✅ Redirect to Summary page after successful save
//       router.push("/Summary");
//     }
//   }, [error, success, dispatch, router]);

//   const toggleFacility = (facilityId: string) => {
//     setSelectedFacilities((prev) =>
//       prev.includes(facilityId) ? prev.filter((id) => id !== facilityId) : [...prev, facilityId]
//     );
//   };

//   const handleRemoveSelected = (facilityId: string) => {
//     setSelectedFacilities((prev) => prev.filter((id) => id !== facilityId));
//     setSelectedSharing((prev) => {
//       const newSharing = { ...prev };
//       delete newSharing[facilityId];
//       return newSharing;
//     });
//   };

//   const formatDataForAPI = () => {
//     const roomSharingTypes: Array<{ roomType: "Single Room" | "Double Room" | "Triple Room"; sharingType: "2 Sharing" | "3 Sharing" | "4 Sharing" }> = [];
//     const bathroomTypes: string[] = [];
//     const essentials: string[] = [];
//     const foodServices: string[] = [];

//     selectedFacilities.forEach(facilityId => {
//       const mapping = FACILITY_MAPPING[facilityId as keyof typeof FACILITY_MAPPING];

//       if (!mapping) return;

//       if (typeof mapping === 'object' && 'roomType' in mapping) {
//         // This is a room type
//         const sharingType = selectedSharing[facilityId];
//         if (sharingType) {
//           roomSharingTypes.push({
//             roomType: mapping.roomType as "Single Room" | "Double Room" | "Triple Room",
//             sharingType: sharingType as "2 Sharing" | "3 Sharing" | "4 Sharing"
//           });
//         }
//       } else if (typeof mapping === 'string') {
//         // This is other facility type
//         if (facilityId === "attached" || facilityId === "common") {
//           bathroomTypes.push(mapping);
//         } else if ([
//           "ac", "wifi", "power-backup", "cctv", "ro-water", "cleaning", 
//           "lift", "laundry", "parking", "dining", "library", "geyser", 
//           "inverter", "heater"
//         ].includes(facilityId)) {
//           essentials.push(mapping);
//         } else if ([
//           "veg", "non-veg", "breakfast", "lunch", "dinner", 
//           "tea-coffee", "chinese", "north-indian"
//         ].includes(facilityId)) {
//           foodServices.push(mapping);
//         }
//       }
//     });

//     return {
//       roomSharingTypes,
//       bathroomTypes,
//       essentials,
//       foodServices
//     };
//   };

//   const handleSubmit = () => {
//     if (selectedFacilities.length === 0) {
//       Toast.show({ 
//         type: "error", 
//         text1: "No Facilities Selected ⚠️", 
//         text2: "Please select at least one facility." 
//       });
//       return;
//     }

//     // Validate room types have sharing selected
//     const roomTypeIds = ["single", "double", "triple"];
//     const selectedRoomTypes = selectedFacilities.filter(id => roomTypeIds.includes(id));
//     const missingSharing = selectedRoomTypes.filter(roomId => !selectedSharing[roomId]);

//     if (missingSharing.length > 0) {
//       Toast.show({
//         type: "error",
//         text1: "Missing Sharing Type ⚠️",
//         text2: "Please select sharing type for all room types.",
//       });
//       return;
//     }

//     const apiData = formatDataForAPI();
//     console.log("Submitting facilities data:", apiData);

//     dispatch(setFacilities(apiData));
//   };

//   return (
//     <View style={styles.safeArea}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Back Button - arrow only */}
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}> 
//           <Icon name="arrow-left" size={width * 0.06} color={KELLY_GREEN} />
//         </TouchableOpacity>

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Icon name="cog" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
//           <Text style={styles.header}>Facilities & Amenities</Text>
//           <Text style={styles.subHeader}>Select facilities available in your hostel</Text>
//         </View>

//         {/* Facility Cards */}
//         {categories.map((category) => (
//           <View key={category} style={styles.card}>
//             <Text style={styles.cardTitle}>{category}</Text>
//             <View style={styles.optionsGrid}>
//               {facilities
//                 .filter((f) => f.category === category)
//                 .map((facility) => (
//                   <View key={facility.id} style={styles.optionWrapper}>
//                     <TouchableOpacity
//                       style={[
//                         styles.option,
//                         selectedFacilities.includes(facility.id) && styles.optionSelected,
//                       ]}
//                       onPress={() => toggleFacility(facility.id)}
//                     >
//                       <Text
//                         style={[
//                           styles.optionText,
//                           selectedFacilities.includes(facility.id) && styles.optionTextSelected,
//                         ]}
//                       >
//                         {facility.name}
//                       </Text>
//                     </TouchableOpacity>

//                     {selectedFacilities.includes(facility.id) && category === "Room Type" && (
//                       <View style={styles.sharingDropdown}>
//                         {["2 Sharing", "3 Sharing", "4 Sharing"].map((opt) => (
//                           <TouchableOpacity
//                             key={opt}
//                             style={[
//                               styles.sharingOption,
//                               selectedSharing[facility.id] === opt && styles.sharingOptionSelected,
//                             ]}
//                             onPress={() => setSelectedSharing((prev) => ({ ...prev, [facility.id]: opt }))}
//                           >
//                             <Text
//                               style={[
//                                 styles.sharingText,
//                                 selectedSharing[facility.id] === opt && styles.sharingTextSelected,
//                               ]}
//                             >
//                               {opt}
//                             </Text>
//                           </TouchableOpacity>
//                         ))}
//                       </View>
//                     )}
//                   </View>
//                 ))}
//             </View>
//           </View>
//         ))}

//         {/* Selected Facilities */}
//         {selectedFacilities.length > 0 && (
//           <View style={styles.selectedCard}>
//             <Text style={styles.selectedTitle}>Selected Facilities ({selectedFacilities.length})</Text>
//             <View style={styles.selectedTags}>
//               {facilities
//                 .filter((f) => selectedFacilities.includes(f.id))
//                 .map((f) => (
//                   <View key={f.id} style={styles.tag}>
//                     <Text style={styles.tagText}>
//                       {f.name}
//                       {selectedSharing[f.id] ? ` (${selectedSharing[f.id]})` : ""}
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.removeTagButton}
//                       onPress={() => handleRemoveSelected(f.id)}
//                     >
//                       <Text style={styles.removeTagText}>×</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//             </View>
//           </View>
//         )}

//         {/* Save & Next Button */}
//         <TouchableOpacity 
//           style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#222" />
//           ) : (
//             <>
//               <Text style={styles.saveText}>Save & Next</Text>
//               <Icon name="arrow-right" size={18} color="#222" style={styles.arrowIcon} />
//             </>
//           )}
//         </TouchableOpacity>
//       </ScrollView>

//       <Toast />
//     </View>
//   );
// };

// export default FacilitiesScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
//   scrollContent: { padding: 16, paddingBottom: 40, alignItems: "center" },

//   backBtn: { marginTop: height * 0.02, alignSelf: "flex-start", paddingHorizontal: 10 },

//   headerContainer: { alignItems: "center", marginBottom: 16, marginTop: 6 },
//   header: { fontSize: width * 0.06, fontWeight: "900", color: KELLY_GREEN, textAlign: "center" },
//   subHeader: { fontSize: width * 0.04, color: "#161515", textAlign: "center", marginTop: 4, paddingHorizontal: 20 },

//   card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 14, elevation: 3 },
//   cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10, color: "#111" },
//   optionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
//   optionWrapper: { width: "48%", marginBottom: 8 },
//   option: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#fff" },
//   optionSelected: { backgroundColor: KELLY_GREEN, borderColor: KELLY_GREEN },
//   optionText: { fontSize: 13, color: "#3E3E3E" },
//   optionTextSelected: { color: "#fff" },

//   sharingDropdown: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
//   sharingOption: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, marginRight: 6, marginTop: 4, backgroundColor: "#fafafa" },
//   sharingOptionSelected: { backgroundColor: KELLY_GREEN, borderColor: KELLY_GREEN },
//   sharingText: { fontSize: 11, color: "#333" },
//   sharingTextSelected: { color: "#fff" },

//   selectedCard: { backgroundColor: "rgba(76,187,23,0.1)", borderRadius: 12, padding: 12, marginTop: 10 },
//   selectedTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
//   selectedTags: { flexDirection: "row", flexWrap: "wrap" },
//   tag: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(76,187,23,0.15)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 14, margin: 4 },
//   tagText: { fontSize: 11, color: KELLY_GREEN },

//   removeTagButton: {
//     marginLeft: 6,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     width: 18,
//     height: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 1,
//   },

//   removeTagText: {
//     color: KELLY_GREEN,
//     fontWeight: "700",
//     fontSize: 14,
//     lineHeight: 14,
//   },

//   // Save & Next Button - Updated styling
//   saveButton: {
//     flexDirection: "row",
//     alignSelf: "center",
//     alignItems: "center",
//     width: width * 0.65,  // Slightly wider for icon + text
//     backgroundColor: KELLY_GREEN,
//     paddingVertical: 12,
//     borderRadius: 25,
//     justifyContent: "center",
//     elevation: 5,
//     marginTop: 20,
//     marginBottom: 40,
//   },
//   saveButtonDisabled: {
//     opacity: 0.6,
//   },
//   saveText: {
//     color: "#fff",
//     fontSize: width * 0.04,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//     marginRight: 6,
//   },
//   arrowIcon: {
//     marginLeft: 2,
//   },
// });


import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { setFacilities, getFacilities, clearError, clearSuccess, updateLocalFacilities } from "../app/reduxStore/reduxSlices/facilitiesSlice";
import { AppDispatch, RootState } from "../app/reduxStore/store/store";

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

// Forward mapping (same as before)
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
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success, facilities } = useSelector((state: RootState) => state.facilities);

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedSharing, setSelectedSharing] = useState<string[]>([]);
  const [foodMenu, setFoodMenu] = useState<string>("");
  const [selectedFoodOptions, setSelectedFoodOptions] = useState<string[]>([]);
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

  // Load existing facilities on component mount
  useEffect(() => {
    const loadExistingFacilities = async () => {
      try {
        console.log("🔄 Loading existing facilities...");
        await dispatch(getFacilities()).unwrap();
        setIsLoaded(true);
      } catch (error) {
        console.log("⚠️ No existing facilities or error:", error);
        setIsLoaded(true);
      }
    };

    loadExistingFacilities();
  }, [dispatch]);

  // Add this function to handle loading custom food menu from existing data
  useEffect(() => {
    if (facilities && isLoaded) {
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
  }, [facilities, isLoaded]);

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
        text2: "Your hostel facilities have been updated.",
      });
      dispatch(clearSuccess());
      // Navigate to summary page after successful update
      setTimeout(() => {
        router.push("/Summary");
      }, 1500);
    }
  }, [error, success, dispatch, router]);

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
      sharingTypes,
      bathroomTypes,
      essentials,
      foodServices,
      customFoodMenu: foodMenu.trim() || undefined // Custom food menu goes here
    };

    console.log("📤 Formatted API Data:", apiData);
    return apiData;
  };

  const handleSubmit = async () => {
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
      console.log("Submitting facilities data:", apiData);

      const result = await dispatch(setFacilities(apiData)).unwrap();

      if (result.success) {
        // Update local state with new data
        dispatch(updateLocalFacilities(apiData));

        Toast.show({
          type: "success",
          text1: "Success ✅",
          text2: "Facilities updated successfully!",
        });
        
        // Navigation to summary page will be handled by the success useEffect
      }
    } catch (error: any) {
      console.error("Submission error:", error);
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

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={KELLY_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facilities</Text>
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
            {facilities ? "Edit your existing facilities" : "Set up your hostel facilities"}
          </Text>
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
            disabled={loading || (getSelectedCount() === 0 && !foodMenu.trim())}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  Update & Next
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
  headerTitle: {
    fontSize: width * 0.042,
    fontWeight: "700",
    color: "#2E7D32",
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