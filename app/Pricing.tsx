import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAppSelector } from "@/hooks/hooks";
import ApiClient from "./api/ApiClient";

const { width } = Dimensions.get("window");

const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

// All sharing options matching backend API
const SHARING_OPTIONS = [
  { label: "Single Sharing", value: "single" },
  { label: "Double Sharing", value: "double" },
  { label: "Triple Sharing", value: "triple" },
  { label: "Four Sharing", value: "four" },
  { label: "Five Sharing", value: "five" },
  { label: "Six Sharing", value: "six" },
  { label: "Seven Sharing", value: "seven" },
  { label: "Eight Sharing", value: "eight" },
  { label: "Nine Sharing", value: "nine" },
  { label: "Ten Sharing", value: "ten" },
];

// Updated interfaces based on new API response
interface PricingItem {
  sharingType: string;
  daily: number | null;
  monthly: number | null;
}

interface PricingResponse {
  success: boolean;
  data: PricingItem[];
  metadata: {
    hostelId: string;
    hostelName: string;
  };
}

interface SetPricingPayload {
  hostelId: string;
  sharingType: string;
  durationType: string;
  price: number;
}

interface SetPricingResponse {
  success: boolean;
  message: string;
  data: any;
}

export default function PricingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get hostel info from params or Redux
  const hostelId = params.hostelId as string;
  const hostelName = params.hostelName as string;

  const { selectedHostelId, hostels } = useAppSelector((state) => state.auth);

  // Use params hostelId or fallback to selectedHostelId
  const activeHostelId = hostelId || selectedHostelId;
  const activeHostel = hostels.find((h) => h.hostelId === activeHostelId);

  // Local state
  const [pricingType, setPricingType] = useState<"Daily" | "Monthly">("Daily");
  const [selectedSharing, setSelectedSharing] = useState(SHARING_OPTIONS[0]);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState<PricingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing data
  const fetchPricingData = async () => {
    if (!activeHostelId) {
      Alert.alert("No Hostel Selected", "Please select a hostel first", [
        { text: "OK" },
      ]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📥 Fetching pricing for hostel:", activeHostelId);

      const response = await ApiClient.get<PricingResponse>(
        `/hostel-operations/pricing?hostelId=${activeHostelId}`
      );

      if (response.success && response.data) {
        console.log("✅ Pricing data received:", response.data);
        setPricingData(response.data);

        // Find the selected sharing type in the data
        const selectedItem = response.data.find(
          (item) => item.sharingType === selectedSharing.value
        );

        if (selectedItem) {
          // Set the price input based on selected pricing type
          const price =
            pricingType === "Daily"
              ? selectedItem.daily
              : selectedItem.monthly;
          
          if (price !== null && price > 0) {
            setPriceInput(String(price));
          } else {
            setPriceInput("");
          }
        } else {
          setPriceInput("");
        }
      } else {
        setPricingData([]);
        setPriceInput("");
      }
    } catch (error: any) {
      console.error("Failed to fetch pricing:", error);
      setError(error.response?.data?.message || "Failed to load pricing");
      setPricingData([]);
      setPriceInput("");

      // If 404, that's okay - no pricing set yet
      if (error.response?.status !== 404) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to load pricing",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch pricing when hostel changes
  useEffect(() => {
    if (activeHostelId) {
      fetchPricingData();
    }
  }, [activeHostelId]);

  // Update price input when pricing type or sharing selection changes
  useEffect(() => {
    if (pricingData.length > 0) {
      const selectedItem = pricingData.find(
        (item) => item.sharingType === selectedSharing.value
      );

      if (selectedItem) {
        const price =
          pricingType === "Daily" ? selectedItem.daily : selectedItem.monthly;
        
        if (price !== null && price > 0) {
          setPriceInput(String(price));
        } else {
          setPriceInput("");
        }
      } else {
        setPriceInput("");
      }
    }
  }, [pricingType, selectedSharing, pricingData]);

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setPriceInput(numericValue);
  };

  const handleSharingSelect = (sharing: typeof SHARING_OPTIONS[0]) => {
    setSelectedSharing(sharing);
    setShowSharingModal(false);

    // Update price input based on selection
    if (pricingData.length > 0) {
      const selectedItem = pricingData.find(
        (item) => item.sharingType === sharing.value
      );

      if (selectedItem) {
        const price =
          pricingType === "Daily" ? selectedItem.daily : selectedItem.monthly;
        
        if (price !== null && price > 0) {
          setPriceInput(String(price));
        } else {
          setPriceInput("");
        }
      } else {
        setPriceInput("");
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!activeHostelId) {
      Toast.show({
        type: "error",
        text1: "No Hostel Selected",
        text2: "Please select a hostel first",
      });
      return;
    }

    const currentPrice = Number(priceInput);
    const minPrice = pricingType === "Daily" ? 150 : 3000;
    const maxPrice = pricingType === "Daily" ? 10000 : 50000;

    if (!priceInput || currentPrice === 0) {
      Toast.show({
        type: "error",
        text1: "Price Required",
        text2: "Please enter a valid price",
      });
      return;
    }

    if (currentPrice < minPrice || currentPrice > maxPrice) {
      Toast.show({
        type: "error",
        text1: "Invalid Price",
        text2: `Price must be between ₹${minPrice} and ₹${maxPrice} for ${pricingType} pricing`,
      });
      return;
    }

    setSaving(true);

    try {
      const payload: SetPricingPayload = {
        hostelId: activeHostelId,
        sharingType: selectedSharing.value,
        durationType: pricingType.toLowerCase(),
        price: currentPrice,
      };

      console.log("📤 Saving pricing:", payload);

      const response = await ApiClient.post<SetPricingResponse>(
        "/hostel-operations/set-pricing",
        payload
      );

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Pricing Saved ✅",
          text2: `${pricingType} price for ${selectedSharing.label} saved successfully`,
        });

        // Update local state immediately
        const updatedData = [...pricingData];
        const existingIndex = updatedData.findIndex(
          (item) => item.sharingType === selectedSharing.value
        );

        if (existingIndex !== -1) {
          // Update existing item
          if (pricingType === "Daily") {
            updatedData[existingIndex].daily = currentPrice;
          } else {
            updatedData[existingIndex].monthly = currentPrice;
          }
        } else {
          // Add new item
          updatedData.push({
            sharingType: selectedSharing.value,
            daily: pricingType === "Daily" ? currentPrice : null,
            monthly: pricingType === "Monthly" ? currentPrice : null,
          });
        }

        setPricingData(updatedData);
      } else {
        throw new Error(response.message || "Failed to save pricing");
      }
    } catch (error: any) {
      console.error("Save pricing error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Failed to save pricing",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    router.push({
      pathname: "/RoomDetails",
      params: {
        hostelId: activeHostelId,
        hostelName: hostelName || activeHostel?.hostelName,
      },
    });
  };

  const getPriceRangeText = () => {
    if (pricingType === "Daily") {
      return "Range: ₹150 - 10000";
    }
    return "Range: ₹3000 - 50000";
  };

  const getPricePreviewText = () => {
    if (priceInput) {
      return `₹${priceInput}`;
    }
    return "Not set";
  };

  // Helper function to check if price is set
  const isPriceSetForSharing = (sharingValue: string, duration: "daily" | "monthly") => {
    const item = pricingData.find((item) => item.sharingType === sharingValue);
    if (!item) return false;
    
    const price = duration === "daily" ? item.daily : item.monthly;
    return price !== null && price > 0;
  };

  // Helper function to get price
  const getPriceForSharing = (sharingValue: string, duration: "daily" | "monthly") => {
    const item = pricingData.find((item) => item.sharingType === sharingValue);
    if (!item) return 0;
    
    const price = duration === "daily" ? item.daily : item.monthly;
    return price !== null ? price : 0;
  };

  // Check if current selection has price set
  const getIsPriceSetForCurrent = () => {
    return isPriceSetForSharing(
      selectedSharing.value,
      pricingType.toLowerCase() as "daily" | "monthly"
    );
  };

  const renderSharingModal = () => {
    if (!showSharingModal) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSharingModal}
        onRequestClose={() => setShowSharingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sharing Type</Text>
              <TouchableOpacity
                onPress={() => setShowSharingModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={SHARING_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isDailySet = isPriceSetForSharing(item.value, "daily");
                const isMonthlySet = isPriceSetForSharing(item.value, "monthly");
                const hasPrice = isDailySet || isMonthlySet;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedSharing.value === item.value &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => handleSharingSelect(item)}
                  >
                    <View style={styles.modalItemContent}>
                      <Icon
                        name="account-multiple"
                        size={18}
                        color={KELLY_GREEN}
                      />
                      <Text
                        style={[
                          styles.modalItemText,
                          selectedSharing.value === item.value &&
                            styles.modalItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {hasPrice && (
                      <View style={styles.priceIndicator}>
                        <Icon name="check-circle" size={16} color={KELLY_GREEN} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={styles.modalSeparator} />
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (!activeHostelId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noHostelContainer}>
          <Icon name="home-alert" size={60} color={KELLY_GREEN} />
          <Text style={styles.noHostelText}>No Hostel Selected</Text>
          <Text style={styles.noHostelSubText}>
            Please select a hostel first from the home screen.
          </Text>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => router.push("/tabs/HostelOwnerHome")}
          >
            <Text style={styles.goHomeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pricing</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Hostel Info Banner */}
        {activeHostel && (
          <View style={styles.hostelBanner}>
            <Icon name="home" size={20} color="#fff" />
            <View style={styles.hostelInfo}>
              <Text style={styles.hostelName} numberOfLines={1}>
                {activeHostel.hostelName}
              </Text>
              <Text style={styles.hostelType}>
                {activeHostel.hostelType} • {activeHostel.status}
              </Text>
            </View>
            <TouchableOpacity
              onPress={fetchPricingData}
              disabled={loading}
            >
              <Icon
                name="refresh"
                size={20}
                color="#fff"
                style={loading && { opacity: 0.5 }}
              />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={KELLY_GREEN} />
              <Text style={styles.loadingText}>Loading pricing data...</Text>
            </View>
          )}

          {/* Main Content */}
          {!loading && (
            <View style={styles.card}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>Pricing Details</Text>
                {getIsPriceSetForCurrent() && (
                  <View style={styles.setBadge}>
                    <Icon name="check-circle" size={14} color="#fff" />
                    <Text style={styles.setBadgeText}>Price Set</Text>
                  </View>
                )}
              </View>

              {/* Pricing Type */}
              <Text style={styles.label}>Pricing Type *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    pricingType === "Daily" && styles.activeType,
                  ]}
                  onPress={() => {
                    setPricingType("Daily");
                    // Update price input when type changes
                    const selectedItem = pricingData.find(
                      (item) => item.sharingType === selectedSharing.value
                    );
                    if (selectedItem && selectedItem.daily !== null) {
                      setPriceInput(String(selectedItem.daily));
                    } else {
                      setPriceInput("");
                    }
                  }}
                  disabled={saving}
                >
                  <Icon
                    name="calendar-today"
                    size={20}
                    color={pricingType === "Daily" ? "#fff" : GOLDEN_YELLOW}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      pricingType === "Daily" && styles.activeTypeText,
                    ]}
                  >
                    Daily Rate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    pricingType === "Monthly" && styles.activeType,
                  ]}
                  onPress={() => {
                    setPricingType("Monthly");
                    // Update price input when type changes
                    const selectedItem = pricingData.find(
                      (item) => item.sharingType === selectedSharing.value
                    );
                    if (selectedItem && selectedItem.monthly !== null) {
                      setPriceInput(String(selectedItem.monthly));
                    } else {
                      setPriceInput("");
                    }
                  }}
                  disabled={saving}
                >
                  <Icon
                    name="calendar-month"
                    size={20}
                    color={pricingType === "Monthly" ? "#fff" : KELLY_GREEN}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      pricingType === "Monthly" && styles.activeTypeText,
                    ]}
                  >
                    Monthly Rate
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sharing Selection Button */}
              <Text style={styles.label}>Select Sharing *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownContainer,
                  saving && { opacity: 0.5 },
                ]}
                onPress={() => setShowSharingModal(true)}
                activeOpacity={0.7}
                disabled={saving}
              >
                <View style={styles.selectedSharingContainer}>
                  <Icon name="account-multiple" size={20} color={KELLY_GREEN} />
                  <Text style={styles.selectedSharingText}>
                    {selectedSharing.label}
                  </Text>
                  <Icon name="chevron-down" size={24} color={KELLY_GREEN} />
                </View>
              </TouchableOpacity>

              {/* Price Input */}
              <Text style={styles.label}>{pricingType} Price *</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="currency-inr"
                  size={20}
                  color={KELLY_GREEN}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: priceInput ? KELLY_GREEN : "#ddd" },
                  ]}
                  placeholder={`Enter ${pricingType.toLowerCase()} price`}
                  placeholderTextColor="#999"
                  value={priceInput}
                  onChangeText={handlePriceChange}
                  keyboardType="numeric"
                  editable={!saving}
                />
                <View style={styles.priceRange}>
                  <Text style={styles.rangeText}>{getPriceRangeText()}</Text>
                </View>
              </View>

              {/* Price Preview */}
              <View style={styles.pricePreview}>
                <Icon name="cash" size={24} color={GOLDEN_YELLOW} />
                <View style={styles.priceInfo}>
                  <Text style={styles.priceLabel}>Current {pricingType} Price</Text>
                  <Text style={styles.priceValue}>{getPricePreviewText()}</Text>
                </View>
                {getIsPriceSetForCurrent() && (
                  <View style={styles.priceSetIndicator}>
                    <Icon name="check-circle" size={16} color={KELLY_GREEN} />
                    <Text style={styles.priceSetText}>Saved</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text style={styles.label}>Additional Details (Optional)</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="note-text"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { minHeight: 80, textAlignVertical: "top" },
                  ]}
                  placeholder="Add any additional pricing details or terms..."
                  placeholderTextColor="#999"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  editable={!saving}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, saving && { opacity: 0.5 }]}
                  onPress={() => router.back()}
                  disabled={saving}
                >
                  <Icon name="close-circle" size={20} color="#666" />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    saving && { opacity: 0.6 },
                    !priceInput && { backgroundColor: "#ccc" },
                  ]}
                  onPress={handleSave}
                  disabled={saving || !priceInput}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Icon name="check-circle" size={20} color="#fff" />
                  )}
                  <Text style={styles.saveText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Next Button */}
              <View style={styles.bottomButtonsRow}>
                <TouchableOpacity
                  style={[styles.nextButton, saving && { opacity: 0.5 }]}
                  onPress={handleNext}
                  disabled={saving}
                >
                  <Text style={styles.nextButtonText}>Next: Room Details</Text>
                  <Icon name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructions}>
            <Icon name="information-outline" size={20} color={KELLY_GREEN} />
            <Text style={styles.instructionsText}>
              Set different prices for each sharing type. All fields marked with
              * are required. Save each sharing type individually before
              proceeding.
            </Text>
          </View>

          {/* Price Summary Table */}
          {pricingData.length > 0 && !loading && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Price Summary</Text>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryHeaderText}>Sharing Type</Text>
                <Text style={styles.summaryHeaderText}>Daily</Text>
                <Text style={styles.summaryHeaderText}>Monthly</Text>
              </View>
              {SHARING_OPTIONS.map((sharing) => {
                const dailyPrice = getPriceForSharing(sharing.value, "daily");
                const monthlyPrice = getPriceForSharing(sharing.value, "monthly");

                return (
                  <View key={sharing.value} style={styles.summaryRow}>
                    <Text style={styles.summaryCell}>{sharing.label}</Text>
                    <Text
                      style={[
                        styles.summaryCell,
                        dailyPrice > 0 ? styles.priceSet : styles.priceNotSet,
                      ]}
                    >
                      {dailyPrice > 0 ? `₹${dailyPrice}` : "-"}
                    </Text>
                    <Text
                      style={[
                        styles.summaryCell,
                        monthlyPrice > 0
                          ? styles.priceSet
                          : styles.priceNotSet,
                      ]}
                    >
                      {monthlyPrice > 0 ? `₹${monthlyPrice}` : "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {renderSharingModal()}
          <Toast />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fdf8",
  },
  noHostelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  noHostelText: {
    fontSize: 24,
    fontWeight: "700",
    color: KELLY_GREEN,
    marginTop: 20,
    marginBottom: 10,
  },
  noHostelSubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  goHomeButton: {
    backgroundColor: KELLY_GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 25 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000,
  },
  backBtn: {
    padding: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  hostelBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KELLY_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hostelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hostelName: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#fff",
  },
  hostelType: {
    fontSize: width * 0.032,
    color: "#fff",
    opacity: 0.9,
  },
  scrollContainer: {
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.036,
    color: DARK_GREEN,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: LIGHT_GREEN,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: width * 0.045,
    fontWeight: "800",
    color: DARK_GREEN,
    paddingLeft: 12,
    backgroundColor: LIGHT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  setBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: KELLY_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  setBadgeText: {
    fontSize: width * 0.028,
    fontWeight: "600",
    color: "#fff",
  },
  label: {
    fontSize: width * 0.036,
    fontWeight: "600",
    marginBottom: 8,
    color: DARK_GREEN,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    gap: 8,
  },
  activeType: {
    backgroundColor: KELLY_GREEN,
    borderColor: KELLY_GREEN,
  },
  typeText: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#666",
  },
  activeTypeText: {
    color: "#fff",
    fontWeight: "700",
  },
  dropdownContainer: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedSharingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    gap: 12,
  },
  selectedSharingText: {
    flex: 1,
    fontSize: width * 0.036,
    color: DARK_GREEN,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: Platform.OS === "ios" ? 15 : 12,
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Platform.OS === "ios" ? 14 : 12,
    paddingLeft: 45,
    fontSize: width * 0.036,
    backgroundColor: "#fff",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  priceRange: {
    marginTop: 6,
    paddingLeft: 45,
  },
  rangeText: {
    fontSize: width * 0.031,
    color: "#666",
    fontStyle: "italic",
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_GREEN,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: KELLY_GREEN,
    gap: 12,
  },
  priceInfo: {
    flex: 1,
    gap: 2,
  },
  priceLabel: {
    fontSize: width * 0.032,
    color: "#666",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: DARK_GREEN,
  },
  priceSetIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceSetText: {
    fontSize: width * 0.028,
    fontWeight: "600",
    color: KELLY_GREEN,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cancelText: {
    fontSize: width * 0.036,
    fontWeight: "600",
    color: "#666",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: KELLY_GREEN,
    shadowColor: KELLY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    gap: 8,
  },
  saveText: {
    fontSize: width * 0.036,
    fontWeight: "700",
    color: "#fff",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
    marginBottom: 5,
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
    fontSize: width * 0.036,
    fontWeight: "700",
    color: "#fff",
  },
  instructions: {
    marginTop: 10,
    padding: 16,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: KELLY_GREEN,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  instructionsText: {
    flex: 1,
    fontSize: width * 0.032,
    color: DARK_GREEN,
    lineHeight: 20,
    fontWeight: "400",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: LIGHT_GREEN,
  },
  summaryTitle: {
    fontSize: width * 0.04,
    fontWeight: "700",
    color: DARK_GREEN,
    marginBottom: 15,
    textAlign: "center",
  },
  summaryHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: KELLY_GREEN,
    paddingBottom: 10,
    marginBottom: 10,
  },
  summaryHeaderText: {
    flex: 1,
    fontSize: width * 0.035,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryCell: {
    flex: 1,
    fontSize: width * 0.034,
    textAlign: "center",
    color: "#333",
  },
  priceSet: {
    color: KELLY_GREEN,
    fontWeight: "600",
  },
  priceNotSet: {
    color: "#999",
    fontStyle: "italic",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: width * 0.04,
    fontWeight: "700",
    color: DARK_GREEN,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  modalItemSelected: {
    backgroundColor: LIGHT_GREEN,
  },
  modalItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalItemText: {
    fontSize: width * 0.035,
    color: DARK_GREEN,
    fontWeight: "500",
  },
  modalItemTextSelected: {
    color: KELLY_GREEN,
    fontWeight: "600",
  },
  priceIndicator: {
    paddingLeft: 8,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
  },
});