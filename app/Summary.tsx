// // app/HostelSummary.tsx
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useState, useEffect } from "react";
// import {
//   Dimensions,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import { useDispatch, useSelector } from "react-redux";
// import { setHostelSummary, getHostelSummary, setSummaryLocal, clearError, clearSuccess } from "../app/reduxStore/reduxSlices/hostelSummarySlice";
// import { RootState } from "../app/reduxStore/store/store";

// const { width } = Dimensions.get("window"); 

// const FOREST_GREEN = "#228B22";
// const SAVE_BUTTON_COLOR = "#3ac403ff";

// export default function HostelSummary() {
//   const [summary, setSummary] = useState("");
//   const router = useRouter();
//   const dispatch = useDispatch();

//   // Get state from Redux
//   const { summary: storedSummary, loading, error, success } = useSelector(
//     (state: RootState) => state.hostelSummary
//   );

//   // Load existing summary on component mount
//   useEffect(() => {
//     dispatch(getHostelSummary() as any);
//   }, [dispatch]);

//   // Update local state when stored summary changes
//   useEffect(() => {
//     if (storedSummary) {
//       setSummary(storedSummary);
//     }
//   }, [storedSummary]);

//   // Handle errors
//   useEffect(() => {
//     if (error) {
//       showToast("error", error);
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);

//   // Handle success
//   useEffect(() => {
//     if (success) {
//       showToast("success", "Hostel summary saved successfully");
//       dispatch(clearSuccess());
//       // Optionally navigate back after success
//       // setTimeout(() => router.back(), 1500);
//     }
//   }, [success, dispatch]);

//   const showToast = (type: "success" | "error" | "info", text1: string, text2?: string) => {
//     Toast.show({ 
//       type, 
//       text1, 
//       text2,
//       position: "bottom", 
//       visibilityTime: 3000 
//     });
//   };

//   const handleSaveSummary = () => {
//     if (summary.trim().length < 10) {
//       showToast("error", "Summary too short", "Please provide a detailed description (at least 10 characters)");
//       return;
//     }

//     if (summary.trim().length > 500) {
//       showToast("error", "Summary too long", "Please keep summary under 500 characters");
//       return;
//     }

//     // Dispatch the action to save summary
//     dispatch(setHostelSummary(summary) as any);
//   };

//   const handleSummaryChange = (text: string) => {
//     setSummary(text);
//     // Optional: Update local state in Redux for immediate feedback
//     dispatch(setSummaryLocal(text));
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       {/* Back Button */}
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => router.back()}
//         activeOpacity={0.7}
//       >
//         <Icon name="arrow-left" size={30} color={FOREST_GREEN} />
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         {/* Header Section */}
//         <View style={styles.headerZone}>
//           <Icon
//             name="home-city"
//             size={52}
//             color={FOREST_GREEN}
//             style={{ marginBottom: 10 }}
//           />
//           <Text style={styles.header}>Write Hostel Summary</Text>
//           <Text style={styles.subHeader}>
//             Provide a concise and appealing description of your hostel to attract
//             potential residents.
//           </Text>
//           <Text style={styles.subPoints}>
//             - Highlight your hostel's unique features{"\n"}
//             - Mention location and amenities{"\n"}
//             - Keep it engaging and informative
//           </Text>

//           {/* Summary Input Box */}
//           <TextInput
//             multiline
//             placeholder="Write your hostel summary here... Example: Welcome to our premium hostel! We offer comfortable accommodation with all modern amenities including free WiFi, 24/7 security, delicious food, and a friendly environment. Located in the heart of the city with easy access to colleges and transportation."
//             style={styles.textInput}
//             value={summary}
//             onChangeText={handleSummaryChange}
//             textAlignVertical="top"
//             maxLength={500}
//             numberOfLines={6}
//             editable={!loading}
//           />
//           <Text style={styles.charCount}>{summary.length} / 500</Text>

//           {/* Loading Indicator */}
//           {loading && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color={FOREST_GREEN} />
//               <Text style={styles.loadingText}>Saving summary...</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* Save Button fixed at bottom */}
//       <TouchableOpacity
//         style={[
//           styles.saveButton, 
//           { 
//             backgroundColor: loading ? "#ccc" : SAVE_BUTTON_COLOR,
//             opacity: loading ? 0.7 : 1
//           }
//         ]}
//         onPress={handleSaveSummary}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>Save Summary</Text>
//         )}
//       </TouchableOpacity>

//       <Toast />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
//   backBtn: {
//     position: "absolute",
//     top: 38,
//     left: 18,
//     zIndex: 10,
//   },
//   contentContainer: {
//     paddingTop: 70,
//     paddingHorizontal: 24,
//     paddingBottom: 120, // Extra space so content not hidden behind button
//   },
//   headerZone: {
//     alignItems: "center",
//   },
//   header: {
//     fontSize: width * 0.058,
//     fontWeight: "900",
//     color: FOREST_GREEN,
//     textAlign: "center",
//   },
//   subHeader: {
//     fontSize: width * 0.042,
//     color: "#444",
//     textAlign: "center",
//     marginTop: 6,
//     paddingHorizontal: 6,
//     fontWeight: "500",
//     marginBottom: 4,
//     lineHeight: 22,
//   },
//   subPoints: {
//     fontSize: width * 0.036,
//     color: "#FFD700",
//     textAlign: "left",
//     marginTop: 8,
//     opacity: 0.95,
//     fontWeight: "700",
//     alignSelf: "flex-start",
//     marginBottom: 12,
//   },
//   textInput: {
//     fontSize: width * 0.042,
//     minHeight: 130,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 12,
//     backgroundColor: "#fafafa",
//     padding: 12,
//     color: "#333",
//     width: "100%",
//     marginBottom: 4,
//   },
//   charCount: {
//     alignSelf: "flex-end",
//     fontSize: 13,
//     color: "#999",
//     marginBottom: 20,
//   },
//   saveButton: {
//     position: "absolute",
//     bottom: 44,
//     alignSelf: "center",
//     width: width * 0.55,
//     borderRadius: 40,
//     elevation: 10,
//     shadowColor: "#69d609ff",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 15,
//   },
//   saveText: {
//     color: "#fff",
//     fontSize: width * 0.045,
//     fontWeight: "800",
//     letterSpacing: 1,
//   },
//   loadingContainer: {
//     alignItems: "center",
//     marginTop: 10,
//   },
//   loadingText: {
//     marginTop: 8,
//     color: FOREST_GREEN,
//     fontSize: 14,
//   },
// });

// app/HostelSummary.tsx
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { setHostelSummary, getHostelSummary, setSummaryLocal, clearError, clearSuccess } from "../app/reduxStore/reduxSlices/hostelSummarySlice";
import { RootState } from "../app/reduxStore/store/store";

const { width, height } = Dimensions.get("window");
const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

export default function HostelSummary() {
  const [summary, setSummary] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  // Get state from Redux
  const { summary: storedSummary, loading, error, success } = useSelector(
    (state: RootState) => state.hostelSummary
  );

  // Load existing summary on component mount
  useEffect(() => {
    dispatch(getHostelSummary() as any);
  }, [dispatch]);

  // Update local state when stored summary changes
  useEffect(() => {
    if (storedSummary) {
      setSummary(storedSummary);
    }
  }, [storedSummary]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast("error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle success - redirect to BankDetails
  useEffect(() => {
    if (success) {
      showToast("success", "Hostel summary saved successfully");
      dispatch(clearSuccess());
      router.push("/BankDetailsPage");
    }
  }, [success, dispatch, router]);

  const showToast = (type: "success" | "error" | "info", text1: string, text2?: string) => {
    Toast.show({ 
      type, 
      text1, 
      text2,
      position: "bottom", 
      visibilityTime: 3000 
    });
  };

  const handleSaveSummary = () => {
    if (summary.trim().length < 10) {
      showToast("error", "Summary too short", "Please provide a detailed description (at least 10 characters)");
      return;
    }

    if (summary.trim().length > 500) {
      showToast("error", "Summary too long", "Please keep summary under 500 characters");
      return;
    }

    // Dispatch the action to save summary
    dispatch(setHostelSummary(summary) as any);
  };

  const handleSummaryChange = (text: string) => {
    setSummary(text);
    // Optional: Update local state in Redux for immediate feedback
    dispatch(setSummaryLocal(text));
  };

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hostel Summary</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Concise Header */}
        <View style={styles.headerContainer}>
          <Icon name="card-text" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
          <Text style={styles.headerText}>Describe Your Hostel</Text>
          <Text style={styles.subHeader}>
            Create an appealing summary to attract residents
          </Text>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          {/* Tips Section */}
          <View style={styles.tipsCard}>
            <Icon name="lightbulb-on" size={22} color={GOLDEN_YELLOW} />
            <Text style={styles.tipsText}>
              Highlight unique features, location, amenities, and what makes your hostel special
            </Text>
          </View>

          {/* Summary Input */}
          <View style={styles.inputContainer}>
            <Icon 
              name="note-text" 
              size={20} 
              color={KELLY_GREEN} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { minHeight: 180, textAlignVertical: 'top' }]}
              placeholder="Example: Welcome to our premium hostel in city center. Features include: Free WiFi, 24/7 security, AC rooms, delicious meals, CCTV, power backup, laundry, and friendly staff. Close to colleges and transportation."
              placeholderTextColor="#999"
              value={summary}
              onChangeText={handleSummaryChange}
              multiline
              numberOfLines={10}
              maxLength={500}
              editable={!loading}
            />
          </View>

          {/* Character Count */}
          <View style={styles.charCountContainer}>
            <Text style={[
              styles.charCountText,
              summary.length >= 500 && { color: '#D32F2F' }
            ]}>
              {summary.length} / 500 characters
            </Text>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={KELLY_GREEN} />
              <Text style={styles.loadingText}>Saving...</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.nextButton, loading && { opacity: 0.5 }]}
            onPress={handleSaveSummary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>Save & Next</Text>
                <Icon name="arrow-right" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Icon name="check-circle" size={20} color={KELLY_GREEN} />
          <Text style={styles.helpText}>
            A good summary helps attract more residents. Be descriptive about facilities, location, and special features.
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: width * 0.05,
    fontWeight: "700",
    color: DARK_GREEN,
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8
  },
  headerText: {
    fontSize: width * 0.055,
    fontWeight: "800",
    color: KELLY_GREEN,
    textAlign: "center",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: width * 0.038,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
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
    borderColor: LIGHT_GREEN,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: GOLDEN_YELLOW,
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: width * 0.035,
    color: '#8B6914',
    lineHeight: 20,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 15,
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
    fontSize: width * 0.038,
    backgroundColor: "#fff",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderColor: KELLY_GREEN,
    color: DARK_GREEN,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCountText: {
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  loadingText: {
    fontSize: width * 0.035,
    color: KELLY_GREEN,
    fontWeight: '500',
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: width * 0.037,
    fontWeight: "700",
    color: "#fff",
  },
  helpCard: {
    marginTop: 10,
    padding: 16,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: KELLY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  helpText: {
    flex: 1,
    fontSize: width * 0.034,
    color: DARK_GREEN,
    lineHeight: 20,
    fontWeight: '400',
  },
});