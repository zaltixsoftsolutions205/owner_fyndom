// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import Slider from "@react-native-community/slider";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   Dimensions,
//   PixelRatio,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import ApiClient from "./api/ApiClient";
// import { useAppSelector } from "@/hooks/hooks";

// const { width, height } = Dimensions.get("window");
// const scale = (size: number) => PixelRatio.roundToNearestPixel(size * (width / 375));

// const sharingOptions = ["Single Sharing", "Double Sharing", "Triple Sharing", "Four Sharing"];
// const KELLY_GREEN = "#4CBB17";
// const GOLDEN_YELLOW = "#FFDF00";

// // Define types for better TypeScript support
// interface PricingPayload {
//   sharingType: string;
//   durationType: string;
//   price: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data?: any;
// }

// export default function PricingPage() {
//   const router = useRouter();
//   const { token, userId } = useAppSelector((state) => state.auth);
//   const [isLoading, setIsLoading] = useState(false);

//   const [pricingType, setPricingType] = useState<"Daily" | "Monthly">("Daily");
//   const [selectedSharing, setSelectedSharing] = useState(sharingOptions[0]);
//   const [prices, setPrices] = useState<{ [key: string]: number }>({
//     "Single Sharing": 700,
//     "Double Sharing": 500,
//     "Triple Sharing": 400,
//     "Four Sharing": 300,
//   });
//   const [description, setDescription] = useState("");

//   const price = prices[selectedSharing];

//   // const handleSave = async () => {
//   //   // Debug: Check if token exists
//   //   console.log("Current token:", token);
//   //   console.log("User ID:", userId);

//   //   if (!token) {
//   //     Toast.show({
//   //       type: "error",
//   //       text1: "No Authentication Token",
//   //       text2: "Please login again",
//   //     });
//   //     return;
//   //   }

//   //   setIsLoading(true);

//   //   try {
//   //     // Convert sharing label to backend key
//   //     const sharingTypeMap: { [key: string]: string } = {
//   //       "Single Sharing": "single",
//   //       "Double Sharing": "double",
//   //       "Triple Sharing": "triple",
//   //       "Four Sharing": "four",
//   //     };

//   //     const payload = {
//   //       sharingType: sharingTypeMap[selectedSharing],
//   //       durationType: pricingType.toLowerCase(),
//   //       price: prices[selectedSharing],
//   //     };

//   //     console.log("Sending payload:", payload);
//   //     console.log("Token being sent:", token ? "Token present" : "No token");

//   //     // Make API call with explicit headers to ensure token is sent
//   //     const response = await ApiClient.post(`/hostel-operations/set-pricing`, payload, {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     console.log("API Response:", response);
//   //     // Check if token exists in localStorage
//   //     console.log("Token in localStorage:", localStorage.getItem("token"));

//   //     // Check if your ApiClient can get the token
//   //     // (You might need to expose getToken temporarily for testing)

//   //     Toast.show({
//   //       type: "success",
//   //       text1: "Pricing Saved ✅",
//   //       text2: response.message || "Pricing updated successfully",
//   //     });

//   //   } catch (error: any) {
//   //     console.error("Full error object:", error);
//   //     console.error("Error response:", error.response?.data);

//   //     let errorMessage = "Something went wrong!";

//   //     if (error.response?.data?.message) {
//   //       errorMessage = error.response.data.message;
//   //     } else if (error.message) {
//   //       errorMessage = error.message;
//   //     }

//   //     Toast.show({
//   //       type: "error",
//   //       text1: "Save Failed",
//   //       text2: errorMessage,
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };


//   const handleSave = async () => {
//     console.log("Redux Token:", token);
//     console.log("Redux UserID:", userId);

//     if (!token) {
//       Toast.show({
//         type: "error",
//         text1: "Not Logged In",
//         text2: "Please login to set pricing",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const sharingTypeMap: { [key: string]: string } = {
//         "Single Sharing": "single",
//         "Double Sharing": "double",
//         "Triple Sharing": "triple",
//         "Four Sharing": "four",
//       };

//       const payload = {
//         sharingType: sharingTypeMap[selectedSharing],
//         durationType: pricingType.toLowerCase(),
//         price: prices[selectedSharing],
//       };

//       console.log("Sending payload:", payload);

//       // ✅ SOLUTION: Pass token directly in headers
//       const response = await ApiClient.post(`/hostel-operations/set-pricing`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       Toast.show({
//         type: "success",
//         text1: "Pricing Saved ✅",
//         text2: response.message || "Pricing updated successfully",
//       });

//     } catch (error: any) {
//       console.error("Error saving pricing:", error);

//       let errorMessage = "Something went wrong!";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       Toast.show({
//         type: "error",
//         text1: "Save Failed",
//         text2: errorMessage,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Alternative method if you want to use fetch instead of axios
//   // const handleSaveWithFetch = async () => {
//   //   if (!token) {
//   //     Toast.show({
//   //       type: "error",
//   //       text1: "Authentication Error",
//   //       text2: "Please login again",
//   //     });
//   //     return;
//   //   }

//   //   setIsLoading(true);

//   //   try {
//   //     const sharingTypeMap: { [key: string]: string } = {
//   //       "Single Sharing": "single",
//   //       "Double Sharing": "double",
//   //       "Triple Sharing": "triple",
//   //       "Four Sharing": "four",
//   //     };

//   //     const payload = {
//   //       sharingType: sharingTypeMap[selectedSharing],
//   //       durationType: pricingType.toLowerCase(),
//   //       price: prices[selectedSharing],
//   //     };

//   //     const response = await fetch("http://localhost:5000/api/hostel-operations/set-pricing", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         "Authorization": `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     const data = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(data.message || `HTTP error! status: ${response.status}`);
//   //     }

//   //     if (data.success) {
//   //       Toast.show({
//   //         type: "success",
//   //         text1: "Pricing Saved ✅",
//   //         text2: data.message || "Pricing updated successfully",
//   //       });
//   //     } else {
//   //       throw new Error(data.message || "Failed to save pricing");
//   //     }

//   //   } catch (error: any) {
//   //     console.error("Error saving pricing:", error);
//   //     Toast.show({
//   //       type: "error",
//   //       text1: "Save Failed",
//   //       text2: error.message || "Something went wrong!",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };


//   const handleSaveWithFetch = async () => {
//     if (!token) {
//       Toast.show({
//         type: "error",
//         text1: "Authentication Required",
//         text2: "Please login first",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const sharingTypeMap: { [key: string]: string } = {
//         "Single Sharing": "single",
//         "Double Sharing": "double",
//         "Triple Sharing": "triple",
//         "Four Sharing": "four",
//       };

//       const payload = {
//         sharingType: sharingTypeMap[selectedSharing],
//         durationType: pricingType.toLowerCase(),
//         price: prices[selectedSharing],
//       };

//       const response = await fetch("http://192.168.29.230:5000/api/hostel-operations/set-pricing", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       console.log("API Response:", data);

//       if (!response.ok) {
//         throw new Error(data.message || `HTTP error! status: ${response.status}`);
//       }

//       Toast.show({
//         type: "success",
//         text1: "Pricing Saved ✅",
//         text2: data.message || "Pricing updated successfully",
//       });

//     } catch (error: any) {
//       console.error("Fetch error:", error);
//       Toast.show({
//         type: "error",
//         text1: "Save Failed",
//         text2: error.message || "Something went wrong!",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Add this debug function
//   const debugToken = () => {
//     console.log("=== TOKEN DEBUG ===");
//     console.log("Token exists:", !!token);
//     console.log("Token length:", token?.length);
//     console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "No token");
//     console.log("User ID:", userId);
//     console.log("===================");
//   };

//   // Call it in your component or in handleSave
//   debugToken();


//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
//         {/* Back Button: Arrow only */}

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Icon name="currency-inr" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
//           <Text style={styles.header}>Set Hostel Pricing</Text>
//           <Text style={styles.subHeader}>
//             Choose daily or monthly pricing and set sharing-wise prices 💰
//           </Text>
//         </View>

//         {/* Card */}
//         <View style={styles.card}>
//           {/* Pricing Type */}
//           <View style={styles.typeContainer}>
//             <TouchableOpacity
//               style={[styles.typeButton, pricingType === "Daily" && styles.activeType]}
//               onPress={() => setPricingType("Daily")}
//             >
//               <Text style={[styles.typeText, pricingType === "Daily" && styles.activeText]}>
//                 Daily Rate
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.typeButton, pricingType === "Monthly" && styles.activeType]}
//               onPress={() => setPricingType("Monthly")}
//             >
//               <Text style={[styles.typeText, pricingType === "Monthly" && styles.activeText]}>
//                 Monthly Rate
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Sharing Options */}
//           <Text style={styles.sectionTitle}>Select Sharing</Text>
//           <View style={styles.sharingContainer}>
//             {sharingOptions.map((option) => (
//               <TouchableOpacity
//                 key={option}
//                 style={[styles.sharingButton, selectedSharing === option && styles.activeSharing]}
//                 onPress={() => setSelectedSharing(option)}
//               >
//                 <Text
//                   style={[
//                     styles.sharingText,
//                     selectedSharing === option && styles.activeSharingText,
//                   ]}
//                 >
//                   {option}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Price Slider */}
//           <Text style={styles.priceLabel}>{pricingType} Price</Text>
//           <Text style={styles.priceValue}>₹{price}</Text>
//           <Slider
//             style={{ width: "100%", height: 40 }}
//             minimumValue={pricingType === "Daily" ? 150 : 3000}
//             maximumValue={pricingType === "Daily" ? 1000 : 20000}
//             step={pricingType === "Daily" ? 50 : 500}
//             value={price}
//             minimumTrackTintColor={GOLDEN_YELLOW}
//             maximumTrackTintColor="#ccc"
//             thumbTintColor={KELLY_GREEN}
//             onValueChange={(val) =>
//               setPrices((prev) => ({ ...prev, [selectedSharing]: val }))
//             }
//             disabled={isLoading}
//           />

//           {/* Description */}
//           <TextInput
//             style={styles.input}
//             placeholder="Add any additional pricing details or terms..."
//             placeholderTextColor="#999"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             editable={!isLoading}
//           />

//           {/* Summary */}
//           <View style={styles.summaryBox}>
//             <Text style={styles.summaryTitle}>Pricing Summary</Text>
//             <Text style={styles.summaryText}>Type: {pricingType}</Text>
//             <Text style={styles.summaryText}>Sharing: {selectedSharing}</Text>
//             <Text style={styles.summaryText}>Rate: ₹{price}</Text>
//             {isLoading && <Text style={styles.loadingText}>Saving...</Text>}
//           </View>

//           {/* Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[styles.cancelBtn, isLoading && styles.disabledButton]}
//               onPress={() => router.back()}
//               disabled={isLoading}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.saveBtn, isLoading && styles.disabledButton]}
//               onPress={handleSave}
//               disabled={isLoading}
//             >
//               <Text style={styles.saveText}>
//                 {isLoading ? "Saving..." : "Save Pricing"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <Toast />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   scrollContainer: { paddingHorizontal: 15, paddingBottom: 40, alignItems: "center" },

//   // Back Button Style (arrow only)
//   backBtn: {
//     marginTop: height * 0.05,
//     alignSelf: "flex-start",
//     paddingHorizontal: 10,
//   },

//   // Header
//   headerContainer: { alignItems: "center", marginBottom: 16, marginTop: 12 },
//   header: { fontSize: width * 0.06, fontWeight: "900", color: KELLY_GREEN, textAlign: "center" },
//   subHeader: {
//     fontSize: width * 0.04,
//     color: "#161515",
//     textAlign: "center",
//     marginTop: 4,
//     paddingHorizontal: 20,
//   },

//   // Card
//   card: {
//     width: "100%",
//     backgroundColor: "#ffffffee",
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 4,
//   },

//   typeContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
//   typeButton: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 12,
//     marginHorizontal: 5,
//     alignItems: "center",
//   },
//   activeType: { borderColor: GOLDEN_YELLOW, backgroundColor: "#fffbe6" },
//   typeText: { fontSize: scale(14), fontWeight: "600", color: "#3E3E3E" },
//   activeText: { color: GOLDEN_YELLOW },

//   sectionTitle: { fontSize: scale(15), fontWeight: "600", marginBottom: 8, color: "#3E3E3E" },
//   sharingContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
//   sharingButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     margin: 4,
//   },
//   activeSharing: { borderColor: GOLDEN_YELLOW, backgroundColor: "#fffbe6" },
//   sharingText: { fontSize: scale(13), color: "#3E3E3E" },
//   activeSharingText: { color: GOLDEN_YELLOW, fontWeight: "700" },

//   priceLabel: { fontSize: scale(14), fontWeight: "600", marginTop: 10, color: GOLDEN_YELLOW },
//   priceValue: { fontSize: scale(20), fontWeight: "700", color: KELLY_GREEN, marginBottom: 8 },

//   input: {
//     width: "100%",
//     minHeight: 70,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     padding: 10,
//     marginTop: 12,
//     backgroundColor: "#f9f9f9",
//     color: "#3E3E3E",
//     textAlignVertical: "top",
//   },

//   summaryBox: {
//     width: "100%",
//     backgroundColor: "#f0f9f6",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 15,
//   },
//   summaryTitle: { fontSize: scale(14), fontWeight: "700", marginBottom: 4 },
//   summaryText: { fontSize: scale(13), color: "#3E3E3E" },
//   loadingText: { fontSize: scale(12), color: GOLDEN_YELLOW, fontStyle: "italic", marginTop: 4 },

//   buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
//   cancelBtn: {
//     flex: 1,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   cancelText: { fontSize: scale(14), fontWeight: "600", color: "#333" },
//   saveBtn: {
//     flex: 1,
//     marginLeft: 8,
//     backgroundColor: KELLY_GREEN,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     elevation: 3,
//   },
//   saveText: { fontSize: scale(14), fontWeight: "600", color: "#fff" },
//   disabledButton: { opacity: 0.6 },
// });

// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   Dimensions,
//   PixelRatio,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Platform,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import ApiClient from "./api/ApiClient";
// import { useAppSelector } from "@/hooks/hooks";

// const { width, height } = Dimensions.get("window");
// const scale = (size: number) => PixelRatio.roundToNearestPixel(size * (width / 375));

// const KELLY_GREEN = "#4CBB17";
// const GOLDEN_YELLOW = "#FFDF00";
// const LIGHT_GREEN = "#E8F5E9";
// const DARK_GREEN = "#2E7D32";

// // Updated sharing options up to 10
// const sharingOptions = [
//   "Single Sharing",
//   "Double Sharing", 
//   "Triple Sharing",
//   "Four Sharing",
//   "Five Sharing",
//   "Six Sharing",
//   "Seven Sharing",
//   "Eight Sharing",
//   "Nine Sharing",
//   "Ten Sharing"
// ];

// // Define types for better TypeScript support
// interface PricingPayload {
//   sharingType: string;
//   durationType: string;
//   price: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data?: any;
// }

// export default function PricingPage() {
//   const router = useRouter();
//   const { token, userId } = useAppSelector((state) => state.auth);
//   const [isLoading, setIsLoading] = useState(false);

//   const [pricingType, setPricingType] = useState<"Daily" | "Monthly">("Daily");
//   const [selectedSharing, setSelectedSharing] = useState(sharingOptions[0]);
//   const [showSharingDropdown, setShowSharingDropdown] = useState(false);
  
//   // Initialize prices for all sharing options
//   const [prices, setPrices] = useState<{ [key: string]: number }>({
//     "Single Sharing": 700,
//     "Double Sharing": 500,
//     "Triple Sharing": 400,
//     "Four Sharing": 300,
//     "Five Sharing": 250,
//     "Six Sharing": 200,
//     "Seven Sharing": 180,
//     "Eight Sharing": 160,
//     "Nine Sharing": 140,
//     "Ten Sharing": 120
//   });

//   const [priceInput, setPriceInput] = useState(prices[selectedSharing].toString());
//   const [description, setDescription] = useState("");

//   const handlePriceChange = (text: string) => {
//     // Allow only numbers
//     const numericValue = text.replace(/[^0-9]/g, '');
//     setPriceInput(numericValue);
    
//     // Update the price in state
//     const numericPrice = numericValue ? parseInt(numericValue, 10) : 0;
//     setPrices(prev => ({
//       ...prev,
//       [selectedSharing]: numericPrice
//     }));
//   };

//   const handleSharingSelect = (sharing: string) => {
//     setSelectedSharing(sharing);
//     setPriceInput(prices[sharing].toString());
//     setShowSharingDropdown(false);
//   };

//   const handleSave = async () => {
//     console.log("Redux Token:", token);
//     console.log("Redux UserID:", userId);

//     if (!token) {
//       Toast.show({
//         type: "error",
//         text1: "Not Logged In",
//         text2: "Please login to set pricing",
//       });
//       return;
//     }

//     // Validate price
//     const currentPrice = prices[selectedSharing];
//     const minPrice = pricingType === "Daily" ? 150 : 3000;
//     const maxPrice = pricingType === "Daily" ? 10000 : 50000;

//     if (currentPrice < minPrice || currentPrice > maxPrice) {
//       Toast.show({
//         type: "error",
//         text1: "Invalid Price",
//         text2: `Price must be between ₹${minPrice} and ₹${maxPrice} for ${pricingType} pricing`,
//       });
//       return;
//     }

//     if (currentPrice === 0) {
//       Toast.show({
//         type: "error",
//         text1: "Price Required",
//         text2: "Please enter a valid price",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const sharingTypeMap: { [key: string]: string } = {
//         "Single Sharing": "single",
//         "Double Sharing": "double", 
//         "Triple Sharing": "triple",
//         "Four Sharing": "four",
//         "Five Sharing": "five",
//         "Six Sharing": "six",
//         "Seven Sharing": "seven",
//         "Eight Sharing": "eight",
//         "Nine Sharing": "nine",
//         "Ten Sharing": "ten"
//       };

//       const payload = {
//         sharingType: sharingTypeMap[selectedSharing],
//         durationType: pricingType.toLowerCase(),
//         price: currentPrice,
//       };

//       console.log("Sending payload:", payload);

//       const response = await ApiClient.post(`/hostel-operations/set-pricing`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       Toast.show({
//         type: "success",
//         text1: "Pricing Saved ✅",
//         text2: response.message || "Pricing updated successfully",
//       });

//     } catch (error: any) {
//       console.error("Error saving pricing:", error);

//       let errorMessage = "Something went wrong!";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       Toast.show({
//         type: "error",
//         text1: "Save Failed",
//         text2: errorMessage,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleNext = () => {
//     router.push('/RoomDetails');
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
//         {/* Simple Header */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//             <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Pricing</Text>
//           <View style={styles.headerRightPlaceholder} />
//         </View>

//         {/* Pricing Card */}
//         <View style={styles.card}>
//           <View style={styles.roomHeader}>
//             <Text style={styles.roomTitle}>Pricing Details</Text>
//           </View>

//           {/* Pricing Type */}
//           <Text style={styles.label}>Pricing Type *</Text>
//           <View style={styles.typeContainer}>
//             <TouchableOpacity
//               style={[styles.typeButton, pricingType === "Daily" && styles.activeType]}
//               onPress={() => setPricingType("Daily")}
//             >
//               <Icon 
//                 name="calendar-today" 
//                 size={20} 
//                 color={pricingType === "Daily" ? "#fff" : GOLDEN_YELLOW} 
//               />
//               <Text style={[styles.typeText, pricingType === "Daily" && styles.activeTypeText]}>
//                 Daily Rate
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.typeButton, pricingType === "Monthly" && styles.activeType]}
//               onPress={() => setPricingType("Monthly")}
//             >
//               <Icon 
//                 name="calendar-month" 
//                 size={20} 
//                 color={pricingType === "Monthly" ? "#fff" : KELLY_GREEN} 
//               />
//               <Text style={[styles.typeText, pricingType === "Monthly" && styles.activeTypeText]}>
//                 Monthly Rate
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Sharing Dropdown */}
//           <Text style={styles.label}>Select Sharing *</Text>
//           <TouchableOpacity
//             style={[styles.dropdownContainer, showSharingDropdown && styles.dropdownActive]}
//             onPress={() => setShowSharingDropdown(!showSharingDropdown)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.selectedSharingContainer}>
//               <Icon name="account-multiple" size={20} color={KELLY_GREEN} />
//               <Text style={styles.selectedSharingText}>{selectedSharing}</Text>
//               <Icon 
//                 name={showSharingDropdown ? "chevron-up" : "chevron-down"} 
//                 size={24} 
//                 color={KELLY_GREEN} 
//               />
//             </View>
//           </TouchableOpacity>

//           {showSharingDropdown && (
//             <ScrollView 
//               style={styles.dropdownScroll}
//               nestedScrollEnabled={true}
//             >
//               {sharingOptions.map((option) => (
//                 <TouchableOpacity
//                   key={option}
//                   style={styles.dropdownItem}
//                   onPress={() => handleSharingSelect(option)}
//                 >
//                   <Icon name="account-multiple" size={18} color={KELLY_GREEN} />
//                   <Text style={styles.dropdownItemText}>{option}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           )}

//           {/* Price Input */}
//           <Text style={styles.label}>{pricingType} Price *</Text>
//           <View style={styles.inputContainer}>
//             <Icon 
//               name="currency-inr" 
//               size={20} 
//               color={KELLY_GREEN} 
//               style={styles.inputIcon}
//             />
//             <TextInput
//               style={[styles.input, { borderColor: KELLY_GREEN }]}
//               placeholder={`Enter ${pricingType.toLowerCase()} price`}
//               placeholderTextColor="#999"
//               value={priceInput}
//               onChangeText={handlePriceChange}
//               keyboardType="numeric"
//               editable={!isLoading}
//             />
//             <View style={styles.priceRange}>
//               <Text style={styles.rangeText}>
//                 Range: ₹{pricingType === "Daily" ? "150 - 10000" : "3000 - 50000"}
//               </Text>
//             </View>
//           </View>

//           {/* Price Preview */}
//           <View style={styles.pricePreview}>
//             <Icon name="cash" size={24} color={GOLDEN_YELLOW} />
//             <View style={styles.priceInfo}>
//               <Text style={styles.priceLabel}>Current {pricingType} Price</Text>
//               <Text style={styles.priceValue}>₹{priceInput || "0"}</Text>
//             </View>
//           </View>

//           {/* Description */}
//           <Text style={styles.label}>Additional Details</Text>
//           <View style={styles.inputContainer}>
//             <Icon 
//               name="note-text" 
//               size={20} 
//               color="#666" 
//               style={styles.inputIcon}
//             />
//             <TextInput
//               style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
//               placeholder="Add any additional pricing details or terms..."
//               placeholderTextColor="#999"
//               value={description}
//               onChangeText={setDescription}
//               multiline
//               numberOfLines={3}
//               editable={!isLoading}
//             />
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={styles.cancelBtn}
//               onPress={() => router.back()}
//               disabled={isLoading}
//             >
//               <Icon name="close-circle" size={20} color="#666" />
//               <Text style={[styles.cancelText, isLoading && { opacity: 0.5 }]}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.saveBtn, isLoading && { opacity: 0.6 }]}
//               onPress={handleSave}
//               disabled={isLoading}
//             >
//               <Icon name="check-circle" size={20} color="#fff" />
//               <Text style={styles.saveText}>
//                 {isLoading ? "Saving..." : "Save"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Next Button */}
//           <View style={styles.bottomButtonsRow}>
//             <TouchableOpacity
//               style={[styles.nextButton, isLoading && { opacity: 0.5 }]}
//               onPress={handleNext}
//               disabled={isLoading}
//             >
//               <Text style={styles.nextButtonText}>Next: Room Details</Text>
//               <Icon name="arrow-right" size={16} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Instructions */}
//         <View style={styles.instructions}>
//           <Icon name="information-outline" size={20} color={KELLY_GREEN} />
//           <Text style={styles.instructionsText}>
//             Set different prices for each sharing type. All fields marked with * are required.
//             Save each sharing type individually before proceeding.
//           </Text>
//         </View>

//         <Toast />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fdf8"
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 15,
//     paddingHorizontal: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backBtn: {
//     padding: 5,
//   },
//   headerTitle: {
//     fontSize: width * 0.05,
//     fontWeight: "700",
//     color: DARK_GREEN,
//     textAlign: "center",
//   },
//   headerRightPlaceholder: {
//     width: 28,
//   },
//   scrollContainer: {
//     paddingTop: 20,
//     paddingBottom: 100,
//     paddingHorizontal: 20,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.1,
//     shadowRadius: 15,
//     elevation: 8,
//     borderWidth: 1,
//     borderColor: LIGHT_GREEN,
//   },
//   roomHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   roomTitle: {
//     fontSize: width * 0.05,
//     fontWeight: "800",
//     color: DARK_GREEN,
//     paddingLeft: 12,
//     backgroundColor: LIGHT_GREEN,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 12,
//   },
//   label: {
//     fontSize: width * 0.037,
//     fontWeight: "600",
//     marginBottom: 8,
//     color: DARK_GREEN,
//     marginTop: 4,
//   },
//   typeContainer: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 20,
//   },
//   typeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#ddd',
//     backgroundColor: '#fff',
//     gap: 8,
//   },
//   activeType: {
//     backgroundColor: KELLY_GREEN,
//     borderColor: KELLY_GREEN,
//   },
//   typeText: {
//     fontSize: width * 0.035,
//     fontWeight: "600",
//     color: "#666",
//   },
//   activeTypeText: {
//     color: '#fff',
//     fontWeight: "700",
//   },
//   // Dropdown Styles
//   dropdownContainer: {
//     borderWidth: 1.5,
//     borderColor: '#ddd',
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   dropdownActive: {
//     borderColor: KELLY_GREEN,
//     shadowOpacity: 0.15,
//     elevation: 4,
//   },
//   selectedSharingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: Platform.OS === 'ios' ? 15 : 12,
//     paddingLeft: 45,
//     minHeight: 50,
//     gap: 12,
//   },
//   selectedSharingText: {
//     flex: 1,
//     fontSize: width * 0.037,
//     color: DARK_GREEN,
//     fontWeight: '600',
//   },
//   // Scrollable Dropdown
//   dropdownScroll: {
//     maxHeight: 250,
//     backgroundColor: '#fff',
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   dropdownItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     paddingLeft: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f8f9fa',
//     gap: 12,
//   },
//   dropdownItemText: {
//     flex: 1,
//     fontSize: width * 0.036,
//     color: DARK_GREEN,
//     fontWeight: '500',
//   },
//   inputContainer: {
//     marginBottom: 20,
//     position: 'relative',
//   },
//   inputIcon: {
//     position: 'absolute',
//     left: 15,
//     top: Platform.OS === "ios" ? 15 : 12,
//     zIndex: 1,
//   },
//   input: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     padding: Platform.OS === "ios" ? 15 : 12,
//     paddingLeft: 45,
//     fontSize: width * 0.037,
//     backgroundColor: "#fff",
//     fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   priceRange: {
//     marginTop: 8,
//     paddingLeft: 45,
//   },
//   rangeText: {
//     fontSize: width * 0.032,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   pricePreview: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: LIGHT_GREEN,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1.5,
//     borderColor: KELLY_GREEN,
//     gap: 12,
//   },
//   priceInfo: {
//     gap: 2,
//   },
//   priceLabel: {
//     fontSize: width * 0.032,
//     color: "#666",
//     fontWeight: '500',
//   },
//   priceValue: {
//     fontSize: width * 0.05,
//     fontWeight: '700',
//     color: DARK_GREEN,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     gap: 10,
//   },
//   cancelBtn: {
//     flex: 1,
//     borderWidth: 1.5,
//     borderColor: "#e0e0e0",
//     padding: height * 0.017,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: 'center',
//     flexDirection: 'row',
//     backgroundColor: "#fff",
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     gap: 8,
//   },
//   cancelText: {
//     fontSize: width * 0.037,
//     fontWeight: "600",
//     color: "#666"
//   },
//   saveBtn: {
//     flex: 1,
//     padding: height * 0.017,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: 'center',
//     flexDirection: 'row',
//     backgroundColor: KELLY_GREEN,
//     shadowColor: KELLY_GREEN,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//     gap: 8,
//   },
//   saveText: {
//     fontSize: width * 0.037,
//     fontWeight: "700",
//     color: "#fff"
//   },
//   bottomButtonsRow: {
//     flexDirection: "row",
//     width: '100%',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   nextButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     backgroundColor: DARK_GREEN,
//     elevation: 3,
//     shadowColor: DARK_GREEN,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     gap: 8,
//   },
//   nextButtonText: {
//     fontSize: width * 0.037,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   instructions: {
//     marginTop: 10,
//     padding: 18,
//     backgroundColor: LIGHT_GREEN,
//     borderRadius: 12,
//     borderLeftWidth: 5,
//     borderLeftColor: KELLY_GREEN,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//     width: '100%',
//   },
//   instructionsText: {
//     flex: 1,
//     fontSize: width * 0.033,
//     color: DARK_GREEN,
//     lineHeight: 20,
//     fontWeight: '400',
//   },
// });

import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";
import ApiClient from "./api/ApiClient";
import { useAppSelector } from "@/hooks/hooks";

const { width, height } = Dimensions.get("window");
const scale = (size: number) => PixelRatio.roundToNearestPixel(size * (width / 375));

const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

// Updated sharing options up to 10
const sharingOptions = [
  "Single Sharing",
  "Double Sharing", 
  "Triple Sharing",
  "Four Sharing",
  "Five Sharing",
  "Six Sharing",
  "Seven Sharing",
  "Eight Sharing",
  "Nine Sharing",
  "Ten Sharing"
];

// Define types for better TypeScript support
interface PricingPayload {
  sharingType: string;
  durationType: string;
  price: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export default function PricingPage() {
  const router = useRouter();
  const { token, userId } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const [pricingType, setPricingType] = useState<"Daily" | "Monthly">("Daily");
  const [selectedSharing, setSelectedSharing] = useState(sharingOptions[0]);
  const [showSharingDropdown, setShowSharingDropdown] = useState(false);
  
  // Initialize prices for all sharing options
  const [prices, setPrices] = useState<{ [key: string]: number }>({
    "Single Sharing": 700,
    "Double Sharing": 500,
    "Triple Sharing": 400,
    "Four Sharing": 300,
    "Five Sharing": 250,
    "Six Sharing": 200,
    "Seven Sharing": 180,
    "Eight Sharing": 160,
    "Nine Sharing": 140,
    "Ten Sharing": 120
  });

  const [priceInput, setPriceInput] = useState(prices[selectedSharing].toString());
  const [description, setDescription] = useState("");

  const handlePriceChange = (text: string) => {
    // Allow only numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setPriceInput(numericValue);
    
    // Update the price in state
    const numericPrice = numericValue ? parseInt(numericValue, 10) : 0;
    setPrices(prev => ({
      ...prev,
      [selectedSharing]: numericPrice
    }));
  };

  const handleSharingSelect = (sharing: string) => {
    setSelectedSharing(sharing);
    setPriceInput(prices[sharing].toString());
    setShowSharingDropdown(false);
  };

  const handleSave = async () => {
    console.log("Redux Token:", token);
    console.log("Redux UserID:", userId);

    if (!token) {
      Toast.show({
        type: "error",
        text1: "Not Logged In",
        text2: "Please login to set pricing",
      });
      return;
    }

    // Validate price
    const currentPrice = prices[selectedSharing];
    const minPrice = pricingType === "Daily" ? 150 : 3000;
    const maxPrice = pricingType === "Daily" ? 10000 : 50000;

    if (currentPrice < minPrice || currentPrice > maxPrice) {
      Toast.show({
        type: "error",
        text1: "Invalid Price",
        text2: `Price must be between ₹${minPrice} and ₹${maxPrice} for ${pricingType} pricing`,
      });
      return;
    }

    if (currentPrice === 0) {
      Toast.show({
        type: "error",
        text1: "Price Required",
        text2: "Please enter a valid price",
      });
      return;
    }

    setIsLoading(true);

    try {
      const sharingTypeMap: { [key: string]: string } = {
        "Single Sharing": "single",
        "Double Sharing": "double", 
        "Triple Sharing": "triple",
        "Four Sharing": "four",
        "Five Sharing": "five",
        "Six Sharing": "six",
        "Seven Sharing": "seven",
        "Eight Sharing": "eight",
        "Nine Sharing": "nine",
        "Ten Sharing": "ten"
      };

      const payload = {
        sharingType: sharingTypeMap[selectedSharing],
        durationType: pricingType.toLowerCase(),
        price: currentPrice,
      };

      console.log("Sending payload:", payload);

      const response = await ApiClient.post(`/hostel-operations/set-pricing`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Pricing Saved ✅",
        text2: response.message || "Pricing updated successfully",
      });

    } catch (error: any) {
      console.error("Error saving pricing:", error);

      let errorMessage = "Something went wrong!";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    router.push('/RoomDetails');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header with increased top padding */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pricing</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Pricing Card */}
          <View style={styles.card}>
            <View style={styles.roomHeader}>
              <Text style={styles.roomTitle}>Pricing Details</Text>
            </View>

            {/* Pricing Type */}
            <Text style={styles.label}>Pricing Type *</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, pricingType === "Daily" && styles.activeType]}
                onPress={() => setPricingType("Daily")}
              >
                <Icon 
                  name="calendar-today" 
                  size={20} 
                  color={pricingType === "Daily" ? "#fff" : GOLDEN_YELLOW} 
                />
                <Text style={[styles.typeText, pricingType === "Daily" && styles.activeTypeText]}>
                  Daily Rate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, pricingType === "Monthly" && styles.activeType]}
                onPress={() => setPricingType("Monthly")}
              >
                <Icon 
                  name="calendar-month" 
                  size={20} 
                  color={pricingType === "Monthly" ? "#fff" : KELLY_GREEN} 
                />
                <Text style={[styles.typeText, pricingType === "Monthly" && styles.activeTypeText]}>
                  Monthly Rate
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sharing Dropdown */}
            <Text style={styles.label}>Select Sharing *</Text>
            <TouchableOpacity
              style={[styles.dropdownContainer, showSharingDropdown && styles.dropdownActive]}
              onPress={() => setShowSharingDropdown(!showSharingDropdown)}
              activeOpacity={0.7}
            >
              <View style={styles.selectedSharingContainer}>
                <Icon name="account-multiple" size={20} color={KELLY_GREEN} />
                <Text style={styles.selectedSharingText}>{selectedSharing}</Text>
                <Icon 
                  name={showSharingDropdown ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={KELLY_GREEN} 
                />
              </View>
            </TouchableOpacity>

            {showSharingDropdown && (
              <ScrollView 
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {sharingOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => handleSharingSelect(option)}
                  >
                    <Icon name="account-multiple" size={18} color={KELLY_GREEN} />
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

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
                style={[styles.input, { borderColor: KELLY_GREEN }]}
                placeholder={`Enter ${pricingType.toLowerCase()} price`}
                placeholderTextColor="#999"
                value={priceInput}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                editable={!isLoading}
              />
              <View style={styles.priceRange}>
                <Text style={styles.rangeText}>
                  Range: ₹{pricingType === "Daily" ? "150 - 10000" : "3000 - 50000"}
                </Text>
              </View>
            </View>

            {/* Price Preview */}
            <View style={styles.pricePreview}>
              <Icon name="cash" size={24} color={GOLDEN_YELLOW} />
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Current {pricingType} Price</Text>
                <Text style={styles.priceValue}>₹{priceInput || "0"}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.label}>Additional Details</Text>
            <View style={styles.inputContainer}>
              <Icon 
                name="note-text" 
                size={20} 
                color="#666" 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Add any additional pricing details or terms..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Icon name="close-circle" size={20} color="#666" />
                <Text style={[styles.cancelText, isLoading && { opacity: 0.5 }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveBtn, isLoading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.saveText}>
                  {isLoading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Next Button */}
            <View style={styles.bottomButtonsRow}>
              <TouchableOpacity
                style={[styles.nextButton, isLoading && { opacity: 0.5 }]}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.nextButtonText}>Next: Room Details</Text>
                <Icon name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Icon name="information-outline" size={20} color={KELLY_GREEN} />
            <Text style={styles.instructionsText}>
              Set different prices for each sharing type. All fields marked with * are required.
              Save each sharing type individually before proceeding.
            </Text>
          </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 25 : 30, // Increased from 5/10 to 25/30
    paddingBottom: 16, // Increased from 12
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
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
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  scrollContainer: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: LIGHT_GREEN,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  label: {
    fontSize: width * 0.036,
    fontWeight: "600",
    marginBottom: 8,
    color: DARK_GREEN,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
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
    color: '#fff',
    fontWeight: "700",
  },
  // Dropdown Styles
  dropdownContainer: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownActive: {
    borderColor: KELLY_GREEN,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  selectedSharingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    gap: 12,
  },
  selectedSharingText: {
    flex: 1,
    fontSize: width * 0.036,
    color: DARK_GREEN,
    fontWeight: '600',
  },
  // Scrollable Dropdown
  dropdownScroll: {
    maxHeight: 220,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: -10,
    paddingTop: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    gap: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: width * 0.035,
    color: DARK_GREEN,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    shadowColor: '#000',
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
    color: '#666',
    fontStyle: 'italic',
  },
  pricePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: KELLY_GREEN,
    gap: 12,
  },
  priceInfo: {
    gap: 2,
  },
  priceLabel: {
    fontSize: width * 0.032,
    color: "#666",
    fontWeight: '500',
  },
  priceValue: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: DARK_GREEN,
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
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: "#fff",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cancelText: {
    fontSize: width * 0.036,
    fontWeight: "600",
    color: "#666"
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row',
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
    color: "#fff"
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  instructionsText: {
    flex: 1,
    fontSize: width * 0.032,
    color: DARK_GREEN,
    lineHeight: 20,
    fontWeight: '400',
  },
});