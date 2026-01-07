// app/Summary.tsx - Complete updated version
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { 
  setHostelSummary, 
  getHostelSummary, 
  setSummaryLocal, 
  clearError, 
  clearSuccess,
  clearSummary 
} from "../app/reduxStore/reduxSlices/hostelSummarySlice";
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
  const params = useLocalSearchParams();
  
  // Get hostelId from params or use selected hostel
  const hostelId = params.hostelId as string;
  const hostelName = params.hostelName as string;
  
  // Get state from Redux
  const { 
    summary: storedSummary, 
    loading, 
    error, 
    success,
    currentHostelId 
  } = useSelector((state: RootState) => state.hostelSummary);
  
  // Get auth state for selected hostel
  const { selectedHostelId, hostels } = useSelector((state: RootState) => state.auth);
  
  // Determine the hostel to use
  const effectiveHostelId = hostelId || selectedHostelId;
  const effectiveHostelName = hostelName || 
    hostels.find(h => h.hostelId === effectiveHostelId)?.hostelName || 
    "Selected Hostel";

  // Load existing summary on component mount
  useEffect(() => {
    if (effectiveHostelId) {
      console.log("📥 Loading summary for hostel:", effectiveHostelId);
      dispatch(getHostelSummary(effectiveHostelId) as any);
    } else {
      Alert.alert(
        "No Hostel Selected",
        "Please select a hostel first",
        [{ 
          text: "OK", 
          onPress: () => router.back() 
        }]
      );
    }
    
    // Clear state when component unmounts
    return () => {
      dispatch(clearSummary());
    };
  }, [dispatch, effectiveHostelId]);

  // Update local state when stored summary changes
  useEffect(() => {
    if (storedSummary && currentHostelId === effectiveHostelId) {
      setSummary(storedSummary);
    } else if (!storedSummary && effectiveHostelId) {
      setSummary("");
    }
  }, [storedSummary, currentHostelId, effectiveHostelId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle success
  useEffect(() => {
    if (success) {
      showToast("success", "Success", "Hostel summary saved successfully!");
      
      // Auto-navigate to Bank Details after 1.5 seconds
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        router.push({
          pathname: "/BankDetailsPage",
          params: {
            hostelId: effectiveHostelId,
            hostelName: effectiveHostelName
          }
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, router, effectiveHostelId, effectiveHostelName]);

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
    if (!effectiveHostelId) {
      showToast("error", "Error", "No hostel selected");
      return;
    }

    if (summary.trim().length < 10) {
      showToast("error", "Summary too short", "Please provide a detailed description (at least 10 characters)");
      return;
    }

    if (summary.trim().length > 500) {
      showToast("error", "Summary too long", "Please keep summary under 500 characters");
      return;
    }

    // Dispatch the action to save summary
    dispatch(setHostelSummary({ 
      hostelId: effectiveHostelId, 
      summary: summary.trim() 
    }) as any);
  };

  const handleSummaryChange = (text: string) => {
    setSummary(text);
    // Update local state in Redux for immediate feedback
    dispatch(setSummaryLocal(text));
  };

  const handleBack = () => {
    if (summary && !success) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Hostel Summary</Text>
          {effectiveHostelName && (
            <Text style={styles.hostelNameText} numberOfLines={1}>
              {effectiveHostelName}
            </Text>
          )}
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Concise Header */}
        <View style={styles.headerContainer}>
          <Icon name="card-text" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
          <Text style={styles.headerText}>Describe Your Hostel</Text>
          <Text style={styles.subHeader}>
            Create an appealing summary to attract residents
          </Text>
        </View>

        {/* Hostel Info Card */}
        {effectiveHostelId && (
          <View style={styles.hostelInfoCard}>
            <Icon name="home" size={20} color={DARK_GREEN} />
            <View style={styles.hostelInfoText}>
              <Text style={styles.hostelInfoTitle}>Hostel Information</Text>
              <Text style={styles.hostelInfoDetail}>ID: {effectiveHostelId}</Text>
              {effectiveHostelName && (
                <Text style={styles.hostelInfoDetail}>Name: {effectiveHostelName}</Text>
              )}
            </View>
          </View>
        )}

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
              <Text style={styles.loadingText}>
                {summary ? "Saving..." : "Loading..."}
              </Text>
            </View>
          )}
        </View>

        {/* Example Summaries */}
        <View style={styles.examplesCard}>
          <Text style={styles.examplesTitle}>Example Summaries:</Text>
          <Text style={styles.exampleText}>
            1. "Modern boys hostel near university campus with AC rooms, high-speed WiFi, 24/7 security, healthy meals, and laundry service."
          </Text>
          <Text style={styles.exampleText}>
            2. "Girls hostel with homely atmosphere, study room, gym, indoor games, CCTV surveillance, and regular cultural activities."
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.nextButton, (loading || !effectiveHostelId) && { opacity: 0.5 }]}
            onPress={handleSaveSummary}
            disabled={loading || !effectiveHostelId}
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
            A good summary helps attract more residents. Be descriptive about facilities, location, and special features. Include nearby landmarks and transportation options.
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  hostelNameText: {
    fontSize: width * 0.035,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
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
    marginBottom: 20,
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
  hostelInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: KELLY_GREEN,
  },
  hostelInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  hostelInfoTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  hostelInfoDetail: {
    fontSize: width * 0.033,
    color: "#555",
    lineHeight: 18,
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
  examplesCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0E8FF',
  },
  examplesTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: width * 0.033,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
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