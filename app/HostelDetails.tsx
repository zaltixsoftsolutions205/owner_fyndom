// import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { recordRoute } from "../utils/navigationHistory";
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Dimensions,
//   StatusBar,
//   Platform,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Image,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAppSelector, useAppDispatch } from "../hooks/hooks";
// import { getAllRooms, getFacilities, getHostelPhotos } from "./reduxStore/reduxSlices/roomSlice";
// import ApiClient from "./api/ApiClient";

// const { width } = Dimensions.get("window");

// const FOREST_GREEN = "#2E7D5F";
// const VEGA_YELLOW = "#FFD700";
// const BACKGROUND = "#F6FBF8";
// const CARD_BG = "#fff";
// const TEXT_DARK = "#212529";

// // Pricing Interface
// interface PricingData {
//   type: "Daily" | "Monthly";
//   sharing: string;
//   rate: number;
//   currency: string;
//   sharingType: string;
//   durationType: string;
// }

// interface PricingSummaryResponse {
//   success: boolean;
//   data: PricingData[];
// }

// // Bank Details Interface
// interface BankDetails {
//   bankName: string;
//   accountNumber: string;
//   ifscCode: string;
//   accountHolderName: string;
//   branchName?: string;
//   accountType?: string;
// }

// // User Profile Interface
// interface UserProfile {
//   name: string;
//   email?: string;
//   avatar?: string;
//   phone?: string;
// }

// const initialHostel = {
//   location: {
//     city: "Telangana",
//     area: "Hyderabad",
//     pincode: "500035",
//   },
//   media: [
//     "https://picsum.photos/400/250?random=1",
//     "https://picsum.photos/400/250?random=2",
//   ],
//   rooms: [
//     { number: "101", floor: 1, capacity: 3, vacant: 1 },
//     { number: "102", floor: 1, capacity: 2, vacant: 0 },
//   ],
//   pricing: {
//     type: "Monthly",
//     amount: 5000,
//     note: "Includes electricity and water",
//   },
//   facilities: ["WiFi", "24/7 Security", "Laundry Service", "Parking"],
//   bookings: [],
// };

// export default function HostelDetails() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const [hostel] = useState(initialHostel);
//   const [pricingData, setPricingData] = useState<PricingData[]>([]);
//   const [pricingLoading, setPricingLoading] = useState(false);
//   const [pricingError, setPricingError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
//   const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

//   const { user, fullName } = useAppSelector((state) => state.auth);

//   const {
//     allRooms,
//     allRoomsLoading,
//     allRoomsError,
//     summary,
//     sharingTypeAvailability
//   } = useAppSelector((state) => state.rooms);

//   // Initial data loading
//   useEffect(() => {
//     loadInitialData();
//   }, [dispatch]);

//   const { photos, photosLoading } = useAppSelector(state => state.rooms);
//   const { facilities, facilitiesLoading } = useAppSelector(state => state.rooms);

//   useEffect(() => {
//     dispatch(getHostelPhotos());
//     dispatch(getFacilities());
//     fetchUserProfile();
//   }, []);

//   // Load all initial data
//   const loadInitialData = () => {
//     dispatch(getAllRooms());
//     fetchPricingData();
//     fetchBankDetails();
//     fetchUserProfile();
//   };

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       // Try to fetch from API first
//       const response = await ApiClient.get<{ success: boolean; data: UserProfile }>(
//         "/hostel-owner/profile"
//       );

//       if (response.success && response.data) {
//         setUserProfile(response.data);
//       } else {
//         // Fallback to auth data
//         setUserProfile({
//           name: user?.fullName || "Hostel Owner",
//           email: user?.email,
//           phone: user?.phone,
//           avatar: user?.avatar // Will be null initially
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//       // Fallback to auth data
//       setUserProfile({
//         name: user?.fullName || "Hostel Owner",
//         email: user?.email,
//         phone: user?.phone,
//         avatar: user?.avatar
//       });
//     }
//   };

//   // Handle profile image update
//   const handleProfileImageUpdate = async (imageUri: string) => {
//     try {
//       // Upload image to server
//       const formData = new FormData();
//       formData.append('avatar', {
//         uri: imageUri,
//         type: 'image/jpeg',
//         name: 'profile.jpg'
//       } as any);

//       const response = await ApiClient.post("/user/upload-avatar", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.success) {
//         // Update local state
//         setUserProfile(prev => prev ? { ...prev, avatar: response.data.avatarUrl } : null);
//         // Show success message
//         alert("Profile picture updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error uploading profile image:", error);
//       alert("Failed to upload profile picture");
//     }
//   };

//   // Fetch pricing data from API
//   const fetchPricingData = async () => {
//     try {
//       setPricingLoading(true);
//       setPricingError(null);

//       const response = await ApiClient.get<PricingSummaryResponse>("/hostel-operations/price-summary");

//       if (response.success && response.data) {
//         setPricingData(response.data);
//       }
//     } catch (error: any) {
//       console.error("Failed to fetch pricing data:", error);
//       setPricingError(error.response?.data?.message || "Failed to load pricing data");
//     } finally {
//       setPricingLoading(false);
//     }
//   };

//   // Fetch bank details from API
//   const fetchBankDetails = async () => {
//     try {
//       setBankDetailsLoading(true);

//       // Replace with your actual API endpoint
//       const response = await ApiClient.get<{ success: boolean; data: BankDetails }>("/bank/details");

//       if (response.success && response.data) {
//         setBankDetails(response.data);
//       } else {
//         setBankDetails(null);
//       }
//     } catch (error: any) {
//       console.error("Failed to fetch bank details:", error);
//       setBankDetails(null);
//     } finally {
//       setBankDetailsLoading(false);
//     }
//   };

//   // Handle pull-to-refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);

//     try {
//       // Refresh all data in parallel
//       await Promise.all([
//         dispatch(getAllRooms()),
//         fetchPricingData(),
//         fetchBankDetails(),
//         dispatch(getHostelPhotos()),
//         dispatch(getFacilities()),
//         fetchUserProfile()
//       ]);
//     } catch (error) {
//       console.error("Refresh error:", error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [dispatch]);

//   // Group pricing data by sharing type
//   const groupPricingBySharingType = () => {
//     const grouped: Record<string, { daily: number | null; monthly: number | null }> = {};

//     // Initialize with all sharing types
//     const sharingTypes = ["single", "double", "triple", "four"];
//     sharingTypes.forEach(type => {
//       grouped[type] = { daily: null, monthly: null };
//     });

//     // Fill with actual data
//     pricingData.forEach(item => {
//       const type = item.sharingType;
//       if (!grouped[type]) {
//         grouped[type] = { daily: null, monthly: null };
//       }

//       if (item.durationType === "daily") {
//         grouped[type].daily = item.rate;
//       } else if (item.durationType === "monthly") {
//         grouped[type].monthly = item.rate;
//       }
//     });

//     return grouped;
//   };

//   const pricingGroups = groupPricingBySharingType();

//   const getSharingDisplayName = (type: string) => {
//     const names: Record<string, string> = {
//       "single": "Single Sharing",
//       "double": "Double Sharing",
//       "triple": "Triple Sharing",
//       "four": "Four Sharing"
//     };
//     return names[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Sharing`;
//   };

//   const noBookings = !hostel.bookings || hostel.bookings.length === 0;

//   // Refresh Control configuration
//   const refreshControl = (
//     <RefreshControl
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       colors={[FOREST_GREEN, VEGA_YELLOW]}
//       tintColor={FOREST_GREEN}
//       title="Pull to refresh"
//       titleColor={FOREST_GREEN}
//       progressBackgroundColor="#ffffff"
//     />
//   );

//   // Render pricing card
//   const renderPricingCard = () => (
//     <TouchableOpacity
//       style={styles.pricingCard}
//       onPress={() => {
//         try { recordRoute('/HostelDetails'); } catch (e) { }
//         router.push("/Pricing");
//       }}
//       activeOpacity={0.8}
//     >
//       <View style={styles.pricingCardHeader}>
//         <View style={styles.iconCircle}>
//           <Icon name="cash" size={26} color={FOREST_GREEN} />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.cardLabel}>Pricing</Text>
//           <Text style={styles.cardValue}>Daily & Monthly Rates</Text>
//         </View>
//         <View style={styles.refreshIndicatorContainer}>
//           {refreshing ? (
//             <ActivityIndicator size="small" color={FOREST_GREEN} />
//           ) : (
//             <Icon name="chevron-right" size={24} color="#BDBDBD" />
//           )}
//         </View>
//       </View>

//       {pricingLoading && !refreshing ? (
//         <View style={styles.pricingLoadingContainer}>
//           <ActivityIndicator size="small" color={FOREST_GREEN} />
//           <Text style={styles.pricingLoadingText}>Loading pricing...</Text>
//         </View>
//       ) : pricingError ? (
//         <View style={styles.pricingErrorContainer}>
//           <Icon name="alert-circle-outline" size={20} color="#FF6B6B" />
//           <Text style={styles.pricingErrorText}>{pricingError}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchPricingData}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : pricingData.length === 0 ? (
//         <View style={styles.pricingEmptyContainer}>
//           <Icon name="cash-remove" size={40} color="#CCCCCC" />
//           <Text style={styles.pricingEmptyText}>No pricing set yet</Text>
//           <TouchableOpacity
//             style={styles.addPricingButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/Pricing");
//             }}
//           >
//             <Text style={styles.addPricingButtonText}>Set Pricing</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.pricingTable}>
//           {/* Table Header */}
//           <View style={styles.pricingTableHeader}>
//             <Text style={[styles.pricingTableHeaderText, { flex: 2 }]}>Sharing Type</Text>
//             <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Daily</Text>
//             <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Monthly</Text>
//           </View>

//           {/* Table Rows */}
//           {Object.entries(pricingGroups).map(([type, prices], index) => (
//             <View
//               key={type}
//               style={[
//                 styles.pricingTableRow,
//                 index % 2 === 0 && styles.pricingTableRowEven
//               ]}
//             >
//               <Text style={[styles.pricingTableCell, { flex: 2, fontWeight: '600' }]}>
//                 {getSharingDisplayName(type)}
//               </Text>
//               <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
//                 {prices.daily ? `₹${prices.daily}` : "-"}
//               </Text>
//               <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
//                 {prices.monthly ? `₹${prices.monthly}` : "-"}
//               </Text>
//             </View>
//           ))}

//           {/* Last Updated Time */}
//           <View style={styles.lastUpdatedContainer}>
//             <Icon name="refresh" size={12} color="#999" />
//             <Text style={styles.lastUpdatedText}>
//               {refreshing ? "Refreshing..." : `Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
//             </Text>
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   // Get initials from name for avatar placeholder
//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <SafeAreaView style={styles.wrapper}>
//       <StatusBar barStyle="light-content" backgroundColor={FOREST_GREEN} />
//       {/* Gradient Header - PERFECT FOREST GREEN STYLE */}
//       <LinearGradient
//         colors={[FOREST_GREEN, "#256B4A"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerBar}
//       >
//         <View style={styles.headerContent}>
//           <Text style={styles.welcomeText}>Welcome Back</Text>
//           <Text style={styles.ownerName}>{user?.fullName}</Text>
//         </View>

//         {/* Header Right Icons - Profile and Settings */}
//         <View style={styles.headerRightIcons}>
//           {/* Profile Icon - Large and Full Circle */}
//           <TouchableOpacity
//             style={styles.profileButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/Profile");
//             }}
//           >
//             <View style={styles.profileIconWrap}>
//               {userProfile?.avatar ? (
//                 <Image
//                   source={{ uri: userProfile.avatar }}
//                   style={styles.profileAvatar}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <View style={styles.profilePlaceholder}>
//                   <Text style={styles.profileInitials}>
//                     {userProfile?.name ? getInitials(userProfile.name) : "HO"}
//                   </Text>
//                 </View>
//               )}
//               {/* Online indicator */}
//               <View style={styles.onlineIndicator} />
//             </View>
//           </TouchableOpacity>

//           {/* Settings Icon - Smaller */}
//           <TouchableOpacity
//             style={styles.settingsButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/tabs/Settings");
//             }}
//           >
//             <View style={styles.settingsIconWrap}>
//               <Ionicons name="settings-sharp" size={18} color="#fff" />
//             </View>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* Perfect spacing */}
//       <View style={{ height: 20 }} />

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         refreshControl={refreshControl}
//         showsVerticalScrollIndicator={true}
//       >
//         {/* Stat Cards - Forest Green */}
//         <View style={styles.statsRow}>
//           <TouchableOpacity style={[styles.statCard, { borderColor: FOREST_GREEN }]} activeOpacity={0.9}>
//             <Icon name="bed-double-outline" size={32} color={FOREST_GREEN} />
//             <Text style={styles.statLabel}>Total Beds</Text>
//             <Text style={styles.statValue}>{summary?.totalBeds}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.statCard, { borderColor: VEGA_YELLOW }]} activeOpacity={0.9}>
//             <Icon name="cash" size={32} color={VEGA_YELLOW} />
//             <Text style={[styles.statLabel, { color: VEGA_YELLOW }]}>Vacant Beds</Text>
//             <Text style={[styles.statValue, { color: VEGA_YELLOW }]}>{summary?.vacantBeds}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Upcoming Bookings Card */}
//         <TouchableOpacity
//           style={styles.bookingsCard}
//           onPress={() => {
//             try { recordRoute('/HostelDetails'); } catch (e) { }
//             router.push("/tabs/Bookings");
//           }}
//           activeOpacity={0.8}
//         >
//           <View style={styles.bookingIconWrap}>
//             <Icon name="calendar-blank" size={32} color="#BDBDBD" />
//           </View>
//           <View style={{ flex: 1, marginLeft: 16 }}>
//             <Text style={styles.bookingsTitle}>Upcoming Bookings</Text>
//             {noBookings ? (
//               <>
//                 <Text style={styles.bookingsSubnote}>New bookings will appear here</Text>
//               </>
//             ) : (
//               <Text style={styles.bookingsSub}>You have bookings!</Text>
//             )}
//           </View>
//         </TouchableOpacity>

//         {/* Space between bookings/stat and rooms section */}
//         <View style={{ height: 32 }} />

//         {/* Rooms Breakdown */}
//         <View style={styles.sectionWrap}>
//           <Text style={styles.sectionTitle}>Rooms</Text>
//           <FlatList
//             data={allRooms}
//             keyExtractor={(_, idx) => idx.toString()}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={{ paddingVertical: 2 }}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.roomCard}
//                 onPress={() => {
//                   try { recordRoute('/HostelDetails'); } catch (e) { }
//                   router.push("/RoomDetails");
//                 }}
//                 activeOpacity={0.82}
//               >
//                 <View style={styles.roomHeaderRow}>
//                   <Icon name="bed" size={26} color={FOREST_GREEN} />
//                   <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
//                 </View>
//                 <Text style={styles.roomInfo}>Floor {item.floor}</Text>
//                 <Text style={styles.bedStats}>
//                   <Text style={{ color: FOREST_GREEN }}>{item.capacity - item.remaining}</Text> /{item.capacity} filled
//                 </Text>
//                 <Text style={styles.bedVacant}>
//                   <Icon name="alert-circle-outline" size={16} color={VEGA_YELLOW} />{" "}
//                   <Text style={{ color: VEGA_YELLOW }}>{item.remaining}</Text> vacant
//                 </Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* See All Rooms Button */}
//         <View style={styles.seeAllSection}>
//           <TouchableOpacity
//             style={styles.seeAllButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/tabs/allrooms");
//             }}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.seeAllText}>See All Rooms</Text>
//             <Icon name="chevron-right" size={20} color={FOREST_GREEN} />
//           </TouchableOpacity>
//         </View>

//         {/* Pricing Card - Replaces old pricing info card */}
//         {renderPricingCard()}

//         {/* Facilities Card */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/Facilities");
//         }}>
//           <View style={styles.iconCircleYellow}>
//             <Icon name="domain" size={26} color={VEGA_YELLOW} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Facilities</Text>
//             <Text style={styles.cardValue} numberOfLines={1}>
//               {facilities
//                 ? [
//                   ...(facilities.bathroomTypes || []),
//                   ...(facilities.essentials || []),
//                   ...(facilities.foodServices || []),
//                   ...(facilities.roomSharingTypes?.map(
//                     (type) => `${type.roomType} (${type.sharingType})`
//                   ) || []),
//                 ].join(", ")
//                 : "Loading..."
//               }
//             </Text>
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Media Card */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/UploadMedia");
//         }}>
//           <View style={styles.iconCircle}>
//             <Icon name="image-multiple" size={26} color={FOREST_GREEN} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Media</Text>
//             <Text style={styles.cardValue} numberOfLines={1}>
//               {photos.length} images/videos
//             </Text>
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Bank Details Card - ADDED ABOVE LOCATION */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/BankDetailsPage");
//         }}>
//           <View style={styles.iconCircleBank}>
//             <Icon name="bank" size={26} color="#2C3E50" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Bank Details</Text>
//             {bankDetailsLoading ? (
//               <ActivityIndicator size="small" color={FOREST_GREEN} />
//             ) : bankDetails ? (
//               <View>
//                 <Text style={styles.cardValue} numberOfLines={1}>
//                   {bankDetails.bankName} • {maskAccountNumber(bankDetails.accountNumber)}
//                 </Text>
//                 <Text style={styles.bankSubText}>
//                   {bankDetails.accountHolderName} • {bankDetails.ifscCode}
//                 </Text>
//               </View>
//             ) : (
//               <View>
//                 <Text style={styles.cardValue} numberOfLines={1}>
//                   No bank details added
//                 </Text>
//                 <Text style={styles.bankSubText}>
//                   Tap to add your bank account information
//                 </Text>
//               </View>
//             )}
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Location Card */}
//         <View style={styles.infoCardDisabled}>
//           <View style={styles.iconCircleGrey}>
//             <Icon name="map-marker-radius" size={26} color="#BDBDBD" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Location</Text>
//             <Text style={styles.cardValue} numberOfLines={2}>
//               {hostel.location.area}, {hostel.location.city} — {hostel.location.pincode}
//             </Text>
//           </View>
//           <Icon name="lock" size={22} color="#BDBDBD" />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Helper function to mask account number
// const maskAccountNumber = (accountNumber: string): string => {
//   if (!accountNumber || accountNumber.length <= 4) return accountNumber;
//   const lastFour = accountNumber.slice(-4);
//   return `••••${lastFour}`;
// };

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: BACKGROUND,
//   },
//   headerBar: {
//     padding: 24,
//     borderBottomLeftRadius: 28,
//     borderBottomRightRadius: 28,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 30 : 50,
//     paddingBottom: 32,
//     marginTop: 0,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   // Header Right Icons Container
//   headerRightIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//   },
//   profileButton: {
//     padding: 2,
//   },
//   settingsButton: {
//     padding: 2,
//   },
//   // Large Profile Icon - Covers entire circle
//   profileIconWrap: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 3,
//     borderColor: "rgba(255, 255, 255, 0.6)",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     position: "relative",
//     overflow: "hidden",
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//   },
//   // Smaller Settings Icon
//   settingsIconWrap: {
//     backgroundColor: "rgba(255, 255, 255, 0.15)",
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   profileAvatar: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 30,
//   },
//   profilePlaceholder: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 30,
//     backgroundColor: "rgba(255, 255, 255, 0.25)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   profileInitials: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   onlineIndicator: {
//     position: "absolute",
//     bottom: 4,
//     right: 4,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#4CAF50",
//     borderWidth: 2.5,
//     borderColor: FOREST_GREEN,
//     zIndex: 10,
//   },
//   welcomeText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     opacity: 0.95,
//     marginBottom: 4,
//     letterSpacing: 0.2,
//   },
//   ownerName: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "800",
//     letterSpacing: 0.3,
//   },
//   statsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: 14,
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   statCard: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 18,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     alignItems: "center",
//     elevation: 1,
//     borderWidth: 2.2,
//   },
//   statLabel: {
//     marginTop: 9,
//     fontSize: 16,
//     fontWeight: "600",
//     color: FOREST_GREEN,
//     opacity: 0.9,
//     marginBottom: 2,
//   },
//   statValue: {
//     fontSize: 21,
//     fontWeight: "800",
//     color: FOREST_GREEN,
//     marginTop: 4,
//   },
//   bookingsCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     marginHorizontal: 15,
//     marginTop: 12,
//     marginBottom: 3,
//     paddingVertical: 14,
//     paddingHorizontal: 18,
//     shadowColor: FOREST_GREEN,
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   bookingIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: 13,
//     backgroundColor: "#F1F3F6",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bookingsTitle: {
//     fontWeight: "700",
//     fontSize: 18,
//     color: "#222",
//     marginBottom: 2,
//   },
//   bookingsSub: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 3,
//     fontWeight: "500",
//   },
//   bookingsSubnote: {
//     fontSize: 13,
//     color: "#B5B5B8",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   sectionWrap: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//     marginBottom: 10,
//   },
//   roomCard: {
//     width: width * 0.48,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     marginRight: 14,
//     marginBottom: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 18,
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 6,
//     borderWidth: 1.2,
//     borderColor: "#e7fbe1",
//   },
//   roomHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 3,
//   },
//   roomNumber: {
//     fontWeight: "700",
//     marginLeft: 7,
//     color: TEXT_DARK,
//     fontSize: 15,
//   },
//   roomInfo: {
//     color: "#676770",
//     fontSize: 13,
//     marginBottom: 2,
//   },
//   bedStats: {
//     fontWeight: "700",
//     fontSize: 14,
//     color: TEXT_DARK,
//   },
//   bedVacant: {
//     fontWeight: "600",
//     fontSize: 13,
//     color: VEGA_YELLOW,
//   },
//   seeAllSection: {
//     marginHorizontal: 16,
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   seeAllButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#E8F5E8",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: FOREST_GREEN,
//   },
//   seeAllText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: FOREST_GREEN,
//     marginRight: 8,
//   },
//   infoCard: {
//     marginHorizontal: 16,
//     marginBottom: 13,
//     marginTop: 3,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: "#e7fbe1",
//   },
//   infoCardDisabled: {
//     marginHorizontal: 16,
//     marginBottom: 18,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#F9F9F9",
//     flexDirection: "row",
//     alignItems: "center",
//     borderColor: "#E0E0E0",
//     borderWidth: 1,
//     opacity: 0.8,
//   },
//   iconCircle: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#ECFCF7",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleYellow: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#fffae6",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleBank: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#F0F5FF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleGrey: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#EFEFEF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cardLabel: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//     marginBottom: 2,
//   },
//   cardValue: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: TEXT_DARK,
//   },
//   // Bank Details specific styles
//   bankSubText: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   infoNote: {
//     fontSize: 13,
//     color: "#609269",
//     opacity: 0.85,
//     marginTop: 2,
//   },
//   // New Pricing Card Styles
//   pricingCard: {
//     marginHorizontal: 16,
//     marginBottom: 13,
//     marginTop: 3,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#fff",
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: "#e7fbe1",
//   },
//   pricingCardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   refreshIndicatorContainer: {
//     width: 24,
//     alignItems: "center",
//   },
//   // Pricing Table Styles
//   pricingTable: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 10,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#e9ecef",
//   },
//   pricingTableHeader: {
//     flexDirection: "row",
//     backgroundColor: FOREST_GREEN + "20",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e9ecef",
//   },
//   pricingTableHeaderText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//   },
//   pricingTableRow: {
//     flexDirection: "row",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f3f5",
//   },
//   pricingTableRowEven: {
//     backgroundColor: "#fff",
//   },
//   pricingTableCell: {
//     fontSize: 13,
//     color: TEXT_DARK,
//   },
//   lastUpdatedContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     backgroundColor: "#f8f9fa",
//     borderTopWidth: 1,
//     borderTopColor: "#e9ecef",
//   },
//   lastUpdatedText: {
//     fontSize: 11,
//     color: "#999",
//     marginLeft: 6,
//     fontStyle: "italic",
//   },
//   // Loading and Error States
//   pricingLoadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//   },
//   pricingLoadingText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: "#666",
//   },
//   pricingErrorContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//     backgroundColor: "#fff5f5",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//   },
//   pricingErrorText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: "#FF6B6B",
//     textAlign: "center",
//     marginHorizontal: 16,
//   },
//   retryButton: {
//     marginTop: 12,
//     backgroundColor: FOREST_GREEN,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   pricingEmptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 30,
//   },
//   pricingEmptyText: {
//     fontSize: 14,
//     color: "#999",
//     fontStyle: "italic",
//     marginTop: 8,
//   },
//   addPricingButton: {
//     marginTop: 12,
//     backgroundColor: VEGA_YELLOW,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   addPricingButtonText: {
//     color: TEXT_DARK,
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   // Pull to Refresh Styles
//   pullToRefreshHint: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     backgroundColor: BACKGROUND,
//   },
//   pullToRefreshText: {
//     fontSize: 12,
//     color: FOREST_GREEN,
//     marginLeft: 6,
//     fontStyle: "italic",
//   },
// });
// =================================================================================================

// app/HostelDetails.tsx - Updated with Profile Image Integration
// import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { recordRoute } from "../utils/navigationHistory";
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Dimensions,
//   StatusBar,
//   Platform,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Image,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAppSelector, useAppDispatch } from "../hooks/hooks";
// import { getAllRooms, getFacilities, getHostelPhotos } from "./reduxStore/reduxSlices/roomSlice";
// import ApiClient from "./api/ApiClient";

// const { width } = Dimensions.get("window");

// const FOREST_GREEN = "#2E7D5F";
// const VEGA_YELLOW = "#FFD700";
// const BACKGROUND = "#F6FBF8";
// const CARD_BG = "#fff";
// const TEXT_DARK = "#212529";

// // Pricing Interface
// interface PricingData {
//   type: "Daily" | "Monthly";
//   sharing: string;
//   rate: number;
//   currency: string;
//   sharingType: string;
//   durationType: string;
// }

// interface PricingSummaryResponse {
//   success: boolean;
//   data: PricingData[];
// }

// // Bank Details Interface
// interface BankDetails {
//   bankName: string;
//   accountNumber: string;
//   ifscCode: string;
//   accountHolderName: string;
//   branchName?: string;
//   accountType?: string;
// }

// // User Profile Interface
// interface UserProfile {
//   name: string;
//   email?: string;
//   avatar?: string;
//   phone?: string;
// }

// // Profile Image Response Interface (from your API)
// interface ProfileImageResponse {
//   success: boolean;
//   data: {
//     user: {
//       _id: string;
//       fullName: string;
//       mobileNumber: string;
//       email: string;
//       isActive: boolean;
//       createdAt: string;
//       updatedAt: string;
//       __v: number;
//     };
//     profileImage: {
//       url: string;
//     };
//   };
// }

// const initialHostel = {
//   location: {
//     city: "Telangana",
//     area: "Hyderabad",
//     pincode: "500035",
//   },
//   media: [
//     "https://picsum.photos/400/250?random=1",
//     "https://picsum.photos/400/250?random=2",
//   ],
//   rooms: [
//     { number: "101", floor: 1, capacity: 3, vacant: 1 },
//     { number: "102", floor: 1, capacity: 2, vacant: 0 },
//   ],
//   pricing: {
//     type: "Monthly",
//     amount: 5000,
//     note: "Includes electricity and water",
//   },
//   facilities: ["WiFi", "24/7 Security", "Laundry Service", "Parking"],
//   bookings: [],
// };

// export default function HostelDetails() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const [hostel] = useState(initialHostel);
//   const [pricingData, setPricingData] = useState<PricingData[]>([]);
//   const [pricingLoading, setPricingLoading] = useState(false);
//   const [pricingError, setPricingError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
//   const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
//   const [profileImageLoading, setProfileImageLoading] = useState(false);
//   const [profileImageError, setProfileImageError] = useState<string | null>(null);

//   const { user, fullName, token, isAuthenticated } = useAppSelector((state) => state.auth);

//   const {
//     allRooms,
//     allRoomsLoading,
//     allRoomsError,
//     summary,
//     sharingTypeAvailability
//   } = useAppSelector((state) => state.rooms);

//   // Initial data loading
//   useEffect(() => {
//     loadInitialData();
//   }, [dispatch, isAuthenticated]);

//   const { photos, photosLoading } = useAppSelector(state => state.rooms);
//   const { facilities, facilitiesLoading } = useAppSelector(state => state.rooms);

//   useEffect(() => {
//     dispatch(getHostelPhotos());
//     dispatch(getFacilities());
//     fetchUserProfile();
//     fetchProfileImage(); // Fetch profile image on component mount
//   }, []);

//   // Fetch profile image from API
//   const fetchProfileImage = async () => {
//     if (!isAuthenticated || !token) {
//       console.log("User not authenticated, skipping profile image fetch");
//       return;
//     }

//     setProfileImageLoading(true);
//     setProfileImageError(null);
    
//     try {
//       console.log("Fetching profile image...");
//       const response = await ApiClient.get<ProfileImageResponse>('/profile-image/user-profile');
      
//       if (response.success && response.data.profileImage) {
//         console.log("Profile image fetched successfully:", response.data.profileImage.url);
//         setProfileImageUrl(response.data.profileImage.url);
        
//         // Also update user profile if needed
//         if (response.data.user) {
//           setUserProfile({
//             name: response.data.user.fullName || user?.fullName || "Hostel Owner",
//             email: response.data.user.email,
//             phone: response.data.user.mobileNumber,
//             avatar: response.data.profileImage.url
//           });
//         }
//       } else {
//         console.log("No profile image found");
//         setProfileImageUrl(null);
//         // Set initials as fallback
//         setProfileImageError("No profile image set");
//       }
//     } catch (error: any) {
//       console.error("Error fetching profile image:", error);
//       setProfileImageError("Failed to load profile image");
//       setProfileImageUrl(null);
//     } finally {
//       setProfileImageLoading(false);
//     }
//   };

//   // Load all initial data
//   const loadInitialData = () => {
//     dispatch(getAllRooms());
//     fetchPricingData();
//     fetchBankDetails();
//     fetchUserProfile();
//     if (isAuthenticated) {
//       fetchProfileImage();
//     }
//   };

//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     try {
//       // Try to fetch from API first
//       const response = await ApiClient.get<{ success: boolean; data: UserProfile }>(
//         "/hostel-owner/profile"
//       );

//       if (response.success && response.data) {
//         setUserProfile(response.data);
//       } else {
//         // Fallback to auth data
//         setUserProfile({
//           name: user?.fullName || "Hostel Owner",
//           email: user?.email,
//           phone: user?.mobileNumber,
//           avatar: profileImageUrl || undefined
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//       // Fallback to auth data
//       setUserProfile({
//         name: user?.fullName || "Hostel Owner",
//         email: user?.email,
//         phone: user?.mobileNumber,
//         avatar: profileImageUrl || undefined
//       });
//     }
//   };

//   // Handle profile image update
//   const handleProfileImageUpdate = async (imageUri: string) => {
//     try {
//       // Upload image to server using FormData
//       const formData = new FormData();
//       const filename = imageUri.split('/').pop() || `profile_${Date.now()}.jpg`;
      
//       formData.append('profileImage', {
//         uri: imageUri,
//         type: 'image/jpeg',
//         name: filename,
//       } as any);

//       // Using the same endpoint as in Profile.tsx
//       const response = await ApiClient.postFormData("/profile-image/upload", formData);
      
//       if (response.success) {
//         // Update local state
//         setProfileImageUrl((response as any).data?.image?.url || imageUri);
        
//         // Update user profile
//         setUserProfile(prev => prev ? { 
//           ...prev, 
//           avatar: (response as any).data?.image?.url || imageUri 
//         } : null);
        
//         // Show success message
//         alert("Profile picture updated successfully!");
//       }
//     } catch (error) {
//       console.error("Error uploading profile image:", error);
//       alert("Failed to upload profile picture");
//     }
//   };

//   // Fetch pricing data from API
//   const fetchPricingData = async () => {
//     try {
//       setPricingLoading(true);
//       setPricingError(null);

//       const response = await ApiClient.get<PricingSummaryResponse>("/hostel-operations/price-summary");

//       if (response.success && response.data) {
//         setPricingData(response.data);
//       }
//     } catch (error: any) {
//       console.error("Failed to fetch pricing data:", error);
//       setPricingError(error.response?.data?.message || "Failed to load pricing data");
//     } finally {
//       setPricingLoading(false);
//     }
//   };

//   // Fetch bank details from API
//   const fetchBankDetails = async () => {
//     try {
//       setBankDetailsLoading(true);

//       // Replace with your actual API endpoint
//       const response = await ApiClient.get<{ success: boolean; data: BankDetails }>("/bank/details");

//       if (response.success && response.data) {
//         setBankDetails(response.data);
//       } else {
//         setBankDetails(null);
//       }
//     } catch (error: any) {
//       console.error("Failed to fetch bank details:", error);
//       setBankDetails(null);
//     } finally {
//       setBankDetailsLoading(false);
//     }
//   };

//   // Handle pull-to-refresh
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);

//     try {
//       // Refresh all data in parallel
//       await Promise.all([
//         dispatch(getAllRooms()),
//         fetchPricingData(),
//         fetchBankDetails(),
//         dispatch(getHostelPhotos()),
//         dispatch(getFacilities()),
//         fetchUserProfile(),
//         fetchProfileImage() // Refresh profile image too
//       ]);
//     } catch (error) {
//       console.error("Refresh error:", error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [dispatch, isAuthenticated]);

//   // Group pricing data by sharing type
//   const groupPricingBySharingType = () => {
//     const grouped: Record<string, { daily: number | null; monthly: number | null }> = {};

//     // Initialize with all sharing types
//     const sharingTypes = ["single", "double", "triple", "four"];
//     sharingTypes.forEach(type => {
//       grouped[type] = { daily: null, monthly: null };
//     });

//     // Fill with actual data
//     pricingData.forEach(item => {
//       const type = item.sharingType;
//       if (!grouped[type]) {
//         grouped[type] = { daily: null, monthly: null };
//       }

//       if (item.durationType === "daily") {
//         grouped[type].daily = item.rate;
//       } else if (item.durationType === "monthly") {
//         grouped[type].monthly = item.rate;
//       }
//     });

//     return grouped;
//   };

//   const pricingGroups = groupPricingBySharingType();

//   const getSharingDisplayName = (type: string) => {
//     const names: Record<string, string> = {
//       "single": "Single Sharing",
//       "double": "Double Sharing",
//       "triple": "Triple Sharing",
//       "four": "Four Sharing"
//     };
//     return names[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Sharing`;
//   };

//   // Get initials from name for avatar placeholder
//   const getInitials = (name: string) => {
//     if (!name) return "HO";
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const noBookings = !hostel.bookings || hostel.bookings.length === 0;

//   // Refresh Control configuration
//   const refreshControl = (
//     <RefreshControl
//       refreshing={refreshing}
//       onRefresh={onRefresh}
//       colors={[FOREST_GREEN, VEGA_YELLOW]}
//       tintColor={FOREST_GREEN}
//       title="Pull to refresh"
//       titleColor={FOREST_GREEN}
//       progressBackgroundColor="#ffffff"
//     />
//   );

//   // Render pricing card
//   const renderPricingCard = () => (
//     <TouchableOpacity
//       style={styles.pricingCard}
//       onPress={() => {
//         try { recordRoute('/HostelDetails'); } catch (e) { }
//         router.push("/Pricing");
//       }}
//       activeOpacity={0.8}
//     >
//       <View style={styles.pricingCardHeader}>
//         <View style={styles.iconCircle}>
//           <Icon name="cash" size={26} color={FOREST_GREEN} />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.cardLabel}>Pricing</Text>
//           <Text style={styles.cardValue}>Daily & Monthly Rates</Text>
//         </View>
//         <View style={styles.refreshIndicatorContainer}>
//           {refreshing ? (
//             <ActivityIndicator size="small" color={FOREST_GREEN} />
//           ) : (
//             <Icon name="chevron-right" size={24} color="#BDBDBD" />
//           )}
//         </View>
//       </View>

//       {pricingLoading && !refreshing ? (
//         <View style={styles.pricingLoadingContainer}>
//           <ActivityIndicator size="small" color={FOREST_GREEN} />
//           <Text style={styles.pricingLoadingText}>Loading pricing...</Text>
//         </View>
//       ) : pricingError ? (
//         <View style={styles.pricingErrorContainer}>
//           <Icon name="alert-circle-outline" size={20} color="#FF6B6B" />
//           <Text style={styles.pricingErrorText}>{pricingError}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchPricingData}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : pricingData.length === 0 ? (
//         <View style={styles.pricingEmptyContainer}>
//           <Icon name="cash-remove" size={40} color="#CCCCCC" />
//           <Text style={styles.pricingEmptyText}>No pricing set yet</Text>
//           <TouchableOpacity
//             style={styles.addPricingButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/Pricing");
//             }}
//           >
//             <Text style={styles.addPricingButtonText}>Set Pricing</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.pricingTable}>
//           {/* Table Header */}
//           <View style={styles.pricingTableHeader}>
//             <Text style={[styles.pricingTableHeaderText, { flex: 2 }]}>Sharing Type</Text>
//             <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Daily</Text>
//             <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Monthly</Text>
//           </View>

//           {/* Table Rows */}
//           {Object.entries(pricingGroups).map(([type, prices], index) => (
//             <View
//               key={type}
//               style={[
//                 styles.pricingTableRow,
//                 index % 2 === 0 && styles.pricingTableRowEven
//               ]}
//             >
//               <Text style={[styles.pricingTableCell, { flex: 2, fontWeight: '600' }]}>
//                 {getSharingDisplayName(type)}
//               </Text>
//               <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
//                 {prices.daily ? `₹${prices.daily}` : "-"}
//               </Text>
//               <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
//                 {prices.monthly ? `₹${prices.monthly}` : "-"}
//               </Text>
//             </View>
//           ))}

//           {/* Last Updated Time */}
//           <View style={styles.lastUpdatedContainer}>
//             <Icon name="refresh" size={12} color="#999" />
//             <Text style={styles.lastUpdatedText}>
//               {refreshing ? "Refreshing..." : `Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
//             </Text>
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   // Render profile avatar with loading/error states
//   const renderProfileAvatar = () => {
//     if (profileImageLoading) {
//       return (
//         <View style={styles.profileIconWrap}>
//           <ActivityIndicator size="small" color="#fff" />
//         </View>
//       );
//     }

//     if (profileImageUrl) {
//       return (
//         <View style={styles.profileIconWrap}>
//           <Image
//             source={{ uri: profileImageUrl }}
//             style={styles.profileAvatar}
//             resizeMode="cover"
//           />
//           <View style={styles.onlineIndicator} />
//         </View>
//       );
//     }

//     // Fallback to initials
//     return (
//       <View style={styles.profileIconWrap}>
//         <View style={styles.profilePlaceholder}>
//           <Text style={styles.profileInitials}>
//             {getInitials(user?.fullName || userProfile?.name || "HO")}
//           </Text>
//         </View>
//         <View style={styles.onlineIndicator} />
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.wrapper}>
//       <StatusBar barStyle="light-content" backgroundColor={FOREST_GREEN} />
//       {/* Gradient Header - PERFECT FOREST GREEN STYLE */}
//       <LinearGradient
//         colors={[FOREST_GREEN, "#256B4A"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerBar}
//       >
//         <View style={styles.headerContent}>
//           <Text style={styles.welcomeText}>Welcome Back</Text>
//           <Text style={styles.ownerName}>{user?.fullName || "Hostel Owner"}</Text>
//         </View>

//         {/* Header Right Icons - Profile and Settings */}
//         <View style={styles.headerRightIcons}>
//           {/* Profile Icon - Large and Full Circle */}
//           <TouchableOpacity
//             style={styles.profileButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/Profile");
//             }}
//             activeOpacity={0.8}
//           >
//             {renderProfileAvatar()}
//           </TouchableOpacity>

//           {/* Settings Icon - Smaller */}
//           <TouchableOpacity
//             style={styles.settingsButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/tabs/Settings");
//             }}
//             activeOpacity={0.8}
//           >
//             <View style={styles.settingsIconWrap}>
//               <Ionicons name="settings-sharp" size={18} color="#fff" />
//             </View>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* Perfect spacing */}
//       <View style={{ height: 20 }} />

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         refreshControl={refreshControl}
//         showsVerticalScrollIndicator={true}
//       >
//         {/* Stat Cards - Forest Green */}
//         <View style={styles.statsRow}>
//           <TouchableOpacity style={[styles.statCard, { borderColor: FOREST_GREEN }]} activeOpacity={0.9}>
//             <Icon name="bed-double-outline" size={32} color={FOREST_GREEN} />
//             <Text style={styles.statLabel}>Total Beds</Text>
//             <Text style={styles.statValue}>{summary?.totalBeds || 0}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.statCard, { borderColor: VEGA_YELLOW }]} activeOpacity={0.9}>
//             <Icon name="cash" size={32} color={VEGA_YELLOW} />
//             <Text style={[styles.statLabel, { color: VEGA_YELLOW }]}>Vacant Beds</Text>
//             <Text style={[styles.statValue, { color: VEGA_YELLOW }]}>{summary?.vacantBeds || 0}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Upcoming Bookings Card */}
//         <TouchableOpacity
//           style={styles.bookingsCard}
//           onPress={() => {
//             try { recordRoute('/HostelDetails'); } catch (e) { }
//             router.push("/tabs/Bookings");
//           }}
//           activeOpacity={0.8}
//         >
//           <View style={styles.bookingIconWrap}>
//             <Icon name="calendar-blank" size={32} color="#BDBDBD" />
//           </View>
//           <View style={{ flex: 1, marginLeft: 16 }}>
//             <Text style={styles.bookingsTitle}>Upcoming Bookings</Text>
//             {noBookings ? (
//               <>
//                 <Text style={styles.bookingsSubnote}>New bookings will appear here</Text>
//               </>
//             ) : (
//               <Text style={styles.bookingsSub}>You have bookings!</Text>
//             )}
//           </View>
//         </TouchableOpacity>

//         {/* Space between bookings/stat and rooms section */}
//         <View style={{ height: 32 }} />

//         {/* Rooms Breakdown */}
//         <View style={styles.sectionWrap}>
//           <Text style={styles.sectionTitle}>Rooms</Text>
//           <FlatList
//             data={allRooms}
//             keyExtractor={(_, idx) => idx.toString()}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={{ paddingVertical: 2 }}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.roomCard}
//                 onPress={() => {
//                   try { recordRoute('/HostelDetails'); } catch (e) { }
//                   router.push("/RoomDetails");
//                 }}
//                 activeOpacity={0.82}
//               >
//                 <View style={styles.roomHeaderRow}>
//                   <Icon name="bed" size={26} color={FOREST_GREEN} />
//                   <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
//                 </View>
//                 <Text style={styles.roomInfo}>Floor {item.floor}</Text>
//                 <Text style={styles.bedStats}>
//                   <Text style={{ color: FOREST_GREEN }}>{item.capacity - item.remaining}</Text> /{item.capacity} filled
//                 </Text>
//                 <Text style={styles.bedVacant}>
//                   <Icon name="alert-circle-outline" size={16} color={VEGA_YELLOW} />{" "}
//                   <Text style={{ color: VEGA_YELLOW }}>{item.remaining}</Text> vacant
//                 </Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* See All Rooms Button */}
//         <View style={styles.seeAllSection}>
//           <TouchableOpacity
//             style={styles.seeAllButton}
//             onPress={() => {
//               try { recordRoute('/HostelDetails'); } catch (e) { }
//               router.push("/tabs/allrooms");
//             }}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.seeAllText}>See All Rooms</Text>
//             <Icon name="chevron-right" size={20} color={FOREST_GREEN} />
//           </TouchableOpacity>
//         </View>

//         {/* Pricing Card - Replaces old pricing info card */}
//         {renderPricingCard()}

//         {/* Facilities Card */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/Facilities");
//         }}>
//           <View style={styles.iconCircleYellow}>
//             <Icon name="domain" size={26} color={VEGA_YELLOW} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Facilities</Text>
//             <Text style={styles.cardValue} numberOfLines={1}>
//               {facilities
//                 ? [
//                   ...(facilities.bathroomTypes || []),
//                   ...(facilities.essentials || []),
//                   ...(facilities.foodServices || []),
//                   ...(facilities.roomSharingTypes?.map(
//                     (type) => `${type.roomType} (${type.sharingType})`
//                   ) || []),
//                 ].join(", ")
//                 : "Loading..."
//               }
//             </Text>
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Media Card */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/UploadMedia");
//         }}>
//           <View style={styles.iconCircle}>
//             <Icon name="image-multiple" size={26} color={FOREST_GREEN} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Media</Text>
//             <Text style={styles.cardValue} numberOfLines={1}>
//               {photos.length} images/videos
//             </Text>
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Bank Details Card - ADDED ABOVE LOCATION */}
//         <TouchableOpacity style={styles.infoCard} onPress={() => {
//           try { recordRoute('/HostelDetails'); } catch (e) { }
//           router.push("/BankDetailsPage");
//         }}>
//           <View style={styles.iconCircleBank}>
//             <Icon name="bank" size={26} color="#2C3E50" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Bank Details</Text>
//             {bankDetailsLoading ? (
//               <ActivityIndicator size="small" color={FOREST_GREEN} />
//             ) : bankDetails ? (
//               <View>
//                 <Text style={styles.cardValue} numberOfLines={1}>
//                   {bankDetails.bankName} • {maskAccountNumber(bankDetails.accountNumber)}
//                 </Text>
//                 <Text style={styles.bankSubText}>
//                   {bankDetails.accountHolderName} • {bankDetails.ifscCode}
//                 </Text>
//               </View>
//             ) : (
//               <View>
//                 <Text style={styles.cardValue} numberOfLines={1}>
//                   No bank details added
//                 </Text>
//                 <Text style={styles.bankSubText}>
//                   Tap to add your bank account information
//                 </Text>
//               </View>
//             )}
//           </View>
//           <Icon name="chevron-right" size={24} color="#BDBDBD" />
//         </TouchableOpacity>

//         {/* Location Card */}
//         <View style={styles.infoCardDisabled}>
//           <View style={styles.iconCircleGrey}>
//             <Icon name="map-marker-radius" size={26} color="#BDBDBD" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardLabel}>Location</Text>
//             <Text style={styles.cardValue} numberOfLines={2}>
//               {hostel.location.area}, {hostel.location.city} — {hostel.location.pincode}
//             </Text>
//           </View>
//           <Icon name="lock" size={22} color="#BDBDBD" />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Helper function to mask account number
// const maskAccountNumber = (accountNumber: string): string => {
//   if (!accountNumber || accountNumber.length <= 4) return accountNumber;
//   const lastFour = accountNumber.slice(-4);
//   return `••••${lastFour}`;
// };

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: BACKGROUND,
//   },
//   headerBar: {
//     padding: 24,
//     borderBottomLeftRadius: 28,
//     borderBottomRightRadius: 28,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 30 : 50,
//     paddingBottom: 32,
//     marginTop: 0,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   // Header Right Icons Container
//   headerRightIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//   },
//   profileButton: {
//     padding: 2,
//   },
//   settingsButton: {
//     padding: 2,
//   },
//   // Large Profile Icon - Covers entire circle
//   profileIconWrap: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 3,
//     borderColor: "rgba(255, 255, 255, 0.6)",
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     position: "relative",
//     overflow: "hidden",
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//   },
//   // Smaller Settings Icon
//   settingsIconWrap: {
//     backgroundColor: "rgba(255, 255, 255, 0.15)",
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   profileAvatar: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 30,
//   },
//   profilePlaceholder: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 30,
//     backgroundColor: "rgba(255, 255, 255, 0.25)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   profileInitials: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "bold",
//     letterSpacing: 1,
//   },
//   onlineIndicator: {
//     position: "absolute",
//     bottom: 4,
//     right: 4,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#4CAF50",
//     borderWidth: 2.5,
//     borderColor: FOREST_GREEN,
//     zIndex: 10,
//   },
//   welcomeText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     opacity: 0.95,
//     marginBottom: 4,
//     letterSpacing: 0.2,
//   },
//   ownerName: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "800",
//     letterSpacing: 0.3,
//   },
//   statsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: 14,
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   statCard: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 18,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     alignItems: "center",
//     elevation: 1,
//     borderWidth: 2.2,
//   },
//   statLabel: {
//     marginTop: 9,
//     fontSize: 16,
//     fontWeight: "600",
//     color: FOREST_GREEN,
//     opacity: 0.9,
//     marginBottom: 2,
//   },
//   statValue: {
//     fontSize: 21,
//     fontWeight: "800",
//     color: FOREST_GREEN,
//     marginTop: 4,
//   },
//   bookingsCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     marginHorizontal: 15,
//     marginTop: 12,
//     marginBottom: 3,
//     paddingVertical: 14,
//     paddingHorizontal: 18,
//     shadowColor: FOREST_GREEN,
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   bookingIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: 13,
//     backgroundColor: "#F1F3F6",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   bookingsTitle: {
//     fontWeight: "700",
//     fontSize: 18,
//     color: "#222",
//     marginBottom: 2,
//   },
//   bookingsSub: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 3,
//     fontWeight: "500",
//   },
//   bookingsSubnote: {
//     fontSize: 13,
//     color: "#B5B5B8",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   sectionWrap: {
//     marginHorizontal: 16,
//     marginTop: 18,
//     marginBottom: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//     marginBottom: 10,
//   },
//   roomCard: {
//     width: width * 0.48,
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     marginRight: 14,
//     marginBottom: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 18,
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 6,
//     borderWidth: 1.2,
//     borderColor: "#e7fbe1",
//   },
//   roomHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 3,
//   },
//   roomNumber: {
//     fontWeight: "700",
//     marginLeft: 7,
//     color: TEXT_DARK,
//     fontSize: 15,
//   },
//   roomInfo: {
//     color: "#676770",
//     fontSize: 13,
//     marginBottom: 2,
//   },
//   bedStats: {
//     fontWeight: "700",
//     fontSize: 14,
//     color: TEXT_DARK,
//   },
//   bedVacant: {
//     fontWeight: "600",
//     fontSize: 13,
//     color: VEGA_YELLOW,
//   },
//   seeAllSection: {
//     marginHorizontal: 16,
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   seeAllButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#E8F5E8",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: FOREST_GREEN,
//   },
//   seeAllText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: FOREST_GREEN,
//     marginRight: 8,
//   },
//   infoCard: {
//     marginHorizontal: 16,
//     marginBottom: 13,
//     marginTop: 3,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: "#e7fbe1",
//   },
//   infoCardDisabled: {
//     marginHorizontal: 16,
//     marginBottom: 18,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#F9F9F9",
//     flexDirection: "row",
//     alignItems: "center",
//     borderColor: "#E0E0E0",
//     borderWidth: 1,
//     opacity: 0.8,
//   },
//   iconCircle: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#ECFCF7",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleYellow: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#fffae6",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleBank: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#F0F5FF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconCircleGrey: {
//     height: 38,
//     width: 38,
//     borderRadius: 19,
//     marginRight: 13,
//     backgroundColor: "#EFEFEF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cardLabel: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//     marginBottom: 2,
//   },
//   cardValue: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: TEXT_DARK,
//   },
//   // Bank Details specific styles
//   bankSubText: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//     fontWeight: "500",
//   },
//   infoNote: {
//     fontSize: 13,
//     color: "#609269",
//     opacity: 0.85,
//     marginTop: 2,
//   },
//   // New Pricing Card Styles
//   pricingCard: {
//     marginHorizontal: 16,
//     marginBottom: 13,
//     marginTop: 3,
//     padding: 16,
//     borderRadius: 16,
//     backgroundColor: "#fff",
//     shadowColor: "#DFF8F3",
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: "#e7fbe1",
//   },
//   pricingCardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   refreshIndicatorContainer: {
//     width: 24,
//     alignItems: "center",
//   },
//   // Pricing Table Styles
//   pricingTable: {
//     backgroundColor: "#f8f9fa",
//     borderRadius: 10,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#e9ecef",
//   },
//   pricingTableHeader: {
//     flexDirection: "row",
//     backgroundColor: FOREST_GREEN + "20",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e9ecef",
//   },
//   pricingTableHeaderText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: FOREST_GREEN,
//   },
//   pricingTableRow: {
//     flexDirection: "row",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f3f5",
//   },
//   pricingTableRowEven: {
//     backgroundColor: "#fff",
//   },
//   pricingTableCell: {
//     fontSize: 13,
//     color: TEXT_DARK,
//   },
//   lastUpdatedContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     backgroundColor: "#f8f9fa",
//     borderTopWidth: 1,
//     borderTopColor: "#e9ecef",
//   },
//   lastUpdatedText: {
//     fontSize: 11,
//     color: "#999",
//     marginLeft: 6,
//     fontStyle: "italic",
//   },
//   // Loading and Error States
//   pricingLoadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//   },
//   pricingLoadingText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: "#666",
//   },
//   pricingErrorContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 20,
//     backgroundColor: "#fff5f5",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//   },
//   pricingErrorText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: "#FF6B6B",
//     textAlign: "center",
//     marginHorizontal: 16,
//   },
//   retryButton: {
//     marginTop: 12,
//     backgroundColor: FOREST_GREEN,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   pricingEmptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 30,
//   },
//   pricingEmptyText: {
//     fontSize: 14,
//     color: "#999",
//     fontStyle: "italic",
//     marginTop: 8,
//   },
//   addPricingButton: {
//     marginTop: 12,
//     backgroundColor: VEGA_YELLOW,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   addPricingButtonText: {
//     color: TEXT_DARK,
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });

import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector, useAppDispatch } from "../hooks/hooks";
import { getAllRooms, getFacilities, getHostelPhotos } from "./reduxStore/reduxSlices/roomSlice";
import ApiClient from "./api/ApiClient";

const { width } = Dimensions.get("window");

const FOREST_GREEN = "#2E7D5F";
const VEGA_YELLOW = "#FFD700";
const BACKGROUND = "#F6FBF8";
const CARD_BG = "#fff";
const TEXT_DARK = "#212529";

// Pricing Interface
interface PricingData {
  type: "Daily" | "Monthly";
  sharing: string;
  rate: number;
  currency: string;
  sharingType: string;
  durationType: string;
}

interface PricingSummaryResponse {
  success: boolean;
  data: PricingData[];
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

// Profile Image Response Interface (from your API)
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
  id: string;
  name: string;
  location: {
    city: string;
    area: string;
    pincode: string;
  };
  media: string[];
  rooms: Room[];
  pricing: {
    type: string;
    amount: number;
    note: string;
  };
  facilities: string[];
  bookings: any[];
  status?: string;
  totalBeds?: number;
  vacantBeds?: number;
}

interface Room {
  number: string;
  floor: number;
  capacity: number;
  remaining: number;
}

const initialHostels: Hostel[] = [
  {
    id: "1",
    name: "Green Valley Hostel",
    location: {
      city: "Telangana",
      area: "Hyderabad",
      pincode: "500035",
    },
    media: [
      "https://picsum.photos/400/250?random=1",
      "https://picsum.photos/400/250?random=2",
    ],
    rooms: [
      { number: "101", floor: 1, capacity: 3, remaining: 1 },
      { number: "102", floor: 1, capacity: 2, remaining: 0 },
      { number: "103", floor: 1, capacity: 4, remaining: 2 },
    ],
    pricing: {
      type: "Monthly",
      amount: 5000,
      note: "Includes electricity and water",
    },
    facilities: ["WiFi", "24/7 Security", "Laundry Service", "Parking"],
    bookings: [],
    totalBeds: 9,
    vacantBeds: 3,
  },
  {
    id: "2",
    name: "Royal Boys Hostel",
    location: {
      city: "Telangana",
      area: "Secunderabad",
      pincode: "500003",
    },
    media: [
      "https://picsum.photos/400/250?random=3",
      "https://picsum.photos/400/250?random=4",
    ],
    rooms: [
      { number: "201", floor: 2, capacity: 2, remaining: 1 },
      { number: "202", floor: 2, capacity: 3, remaining: 2 },
    ],
    pricing: {
      type: "Monthly",
      amount: 6000,
      note: "AC rooms available",
    },
    facilities: ["WiFi", "Gym", "Cafeteria", "24/7 Security"],
    bookings: [],
    totalBeds: 5,
    vacantBeds: 3,
  },
  {
    id: "3",
    name: "Sunrise Girls Hostel",
    location: {
      city: "Telangana",
      area: "Gachibowli",
      pincode: "500032",
    },
    media: [
      "https://picsum.photos/400/250?random=5",
      "https://picsum.photos/400/250?random=6",
    ],
    rooms: [
      { number: "301", floor: 3, capacity: 4, remaining: 1 },
      { number: "302", floor: 3, capacity: 3, remaining: 0 },
      { number: "303", floor: 3, capacity: 2, remaining: 2 },
    ],
    pricing: {
      type: "Monthly",
      amount: 7000,
      note: "Premium facilities",
    },
    facilities: ["WiFi", "Study Room", "Laundry", "Security", "Parking"],
    bookings: [],
    totalBeds: 9,
    vacantBeds: 3,
  },
];

export default function HostelDetails() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // State for multiple hostels
  const [hostels, setHostels] = useState<Hostel[]>(initialHostels);
  const [selectedHostel, setSelectedHostel] = useState<Hostel>(initialHostels[0]);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);
  
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

  const { user, fullName, token, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    allRooms,
    allRoomsLoading,
    allRoomsError,
    summary,
    sharingTypeAvailability
  } = useAppSelector((state) => state.rooms);

  // Initial data loading
  useEffect(() => {
    loadInitialData();
    // Fetch hostels from API if available
    fetchHostels();
  }, [dispatch, isAuthenticated]);

  const { photos, photosLoading } = useAppSelector(state => state.rooms);
  const { facilities, facilitiesLoading } = useAppSelector(state => state.rooms);

  useEffect(() => {
    dispatch(getHostelPhotos());
    dispatch(getFacilities());
    fetchUserProfile();
    fetchProfileImage(); // Fetch profile image on component mount
  }, []);

  // Fetch hostels from API
  const fetchHostels = async () => {
    try {
      // Replace with your actual API endpoint for fetching hostels
      // const response = await ApiClient.get("/hostel-owner/hostels");
      // if (response.success && response.data) {
      //   setHostels(response.data);
      //   if (response.data.length > 0) {
      //     setSelectedHostel(response.data[0]);
      //   }
      // }
      
      // For now, using mock data
      setHostels(initialHostels);
      setSelectedHostel(initialHostels[0]);
    } catch (error) {
      console.error("Error fetching hostels:", error);
    }
  };

  // Fetch profile image from API
  const fetchProfileImage = async () => {
    if (!isAuthenticated || !token) {
      console.log("User not authenticated, skipping profile image fetch");
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
        // Set initials as fallback
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
    dispatch(getAllRooms());
    fetchPricingData();
    fetchBankDetails();
    fetchUserProfile();
    if (isAuthenticated) {
      fetchProfileImage();
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
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

  // Handle profile image update
  const handleProfileImageUpdate = async (imageUri: string) => {
    try {
      // Upload image to server using FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `profile_${Date.now()}.jpg`;
      
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      // Using the same endpoint as in Profile.tsx
      const response = await ApiClient.postFormData("/profile-image/upload", formData);
      
      if (response.success) {
        // Update local state
        setProfileImageUrl((response as any).data?.image?.url || imageUri);
        
        // Update user profile
        setUserProfile(prev => prev ? { 
          ...prev, 
          avatar: (response as any).data?.image?.url || imageUri 
        } : null);
        
        // Show success message
        alert("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("Failed to upload profile picture");
    }
  };

  // Fetch pricing data from API
  const fetchPricingData = async () => {
    try {
      setPricingLoading(true);
      setPricingError(null);

      const response = await ApiClient.get<PricingSummaryResponse>("/hostel-operations/price-summary");

      if (response.success && response.data) {
        setPricingData(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch pricing data:", error);
      setPricingError(error.response?.data?.message || "Failed to load pricing data");
    } finally {
      setPricingLoading(false);
    }
  };

  // Fetch bank details from API
  const fetchBankDetails = async () => {
    try {
      setBankDetailsLoading(true);

      // Replace with your actual API endpoint
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

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
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
        fetchProfileImage(), // Refresh profile image too
        fetchHostels(), // Refresh hostel list
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, isAuthenticated]);

  // Group pricing data by sharing type
  const groupPricingBySharingType = () => {
    const grouped: Record<string, { daily: number | null; monthly: number | null }> = {};

    // Initialize with all sharing types
    const sharingTypes = ["single", "double", "triple", "four"];
    sharingTypes.forEach(type => {
      grouped[type] = { daily: null, monthly: null };
    });

    // Fill with actual data
    pricingData.forEach(item => {
      const type = item.sharingType;
      if (!grouped[type]) {
        grouped[type] = { daily: null, monthly: null };
      }

      if (item.durationType === "daily") {
        grouped[type].daily = item.rate;
      } else if (item.durationType === "monthly") {
        grouped[type].monthly = item.rate;
      }
    });

    return grouped;
  };

  const pricingGroups = groupPricingBySharingType();

  const getSharingDisplayName = (type: string) => {
    const names: Record<string, string> = {
      "single": "Single Sharing",
      "double": "Double Sharing",
      "triple": "Triple Sharing",
      "four": "Four Sharing"
    };
    return names[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Sharing`;
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

  const noBookings = !selectedHostel.bookings || selectedHostel.bookings.length === 0;

  // Handle hostel selection
  const handleHostelSelect = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setShowHostelDropdown(false);
    // Here you could also fetch hostel-specific data
  };

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

  // Render pricing card
  const renderPricingCard = () => (
    <TouchableOpacity
      style={styles.pricingCard}
      onPress={() => {
        try { recordRoute('/HostelDetails'); } catch (e) { }
        router.push("/Pricing");
      }}
      activeOpacity={0.8}
    >
      <View style={styles.pricingCardHeader}>
        <View style={styles.iconCircle}>
          <Icon name="cash" size={26} color={FOREST_GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>Pricing</Text>
          <Text style={styles.cardValue}>Daily & Monthly Rates</Text>
        </View>
        <View style={styles.refreshIndicatorContainer}>
          {refreshing ? (
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
          <Text style={styles.pricingEmptyText}>No pricing set yet</Text>
          <TouchableOpacity
            style={styles.addPricingButton}
            onPress={() => {
              try { recordRoute('/HostelDetails'); } catch (e) { }
              router.push("/Pricing");
            }}
          >
            <Text style={styles.addPricingButtonText}>Set Pricing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pricingTable}>
          {/* Table Header */}
          <View style={styles.pricingTableHeader}>
            <Text style={[styles.pricingTableHeaderText, { flex: 2 }]}>Sharing Type</Text>
            <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Daily</Text>
            <Text style={[styles.pricingTableHeaderText, { flex: 1, textAlign: 'right' }]}>Monthly</Text>
          </View>

          {/* Table Rows */}
          {Object.entries(pricingGroups).map(([type, prices], index) => (
            <View
              key={type}
              style={[
                styles.pricingTableRow,
                index % 2 === 0 && styles.pricingTableRowEven
              ]}
            >
              <Text style={[styles.pricingTableCell, { flex: 2, fontWeight: '600' }]}>
                {getSharingDisplayName(type)}
              </Text>
              <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
                {prices.daily ? `₹${prices.daily}` : "-"}
              </Text>
              <Text style={[styles.pricingTableCell, { flex: 1, textAlign: 'right' }]}>
                {prices.monthly ? `₹${prices.monthly}` : "-"}
              </Text>
            </View>
          ))}

          {/* Last Updated Time */}
          <View style={styles.lastUpdatedContainer}>
            <Icon name="refresh" size={12} color="#999" />
            <Text style={styles.lastUpdatedText}>
              {refreshing ? "Refreshing..." : `Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

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

  // Hostel dropdown modal
  const renderHostelDropdown = () => (
    <Modal
      visible={showHostelDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowHostelDropdown(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowHostelDropdown(false)}
      >
        <View style={styles.hostelDropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select Hostel</Text>
            <Text style={styles.dropdownSubtitle}>You have {hostels.length} hostels</Text>
          </View>
          
          <FlatList
            data={hostels}
            keyExtractor={(item) => item.id}
            style={styles.hostelList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.hostelOption,
                  selectedHostel.id === item.id && styles.hostelOptionSelected
                ]}
                onPress={() => handleHostelSelect(item)}
              >
                <View style={styles.hostelOptionIcon}>
                  <Icon 
                    name="home" 
                    size={24} 
                    color={selectedHostel.id === item.id ? "#fff" : FOREST_GREEN} 
                  />
                </View>
                <View style={styles.hostelOptionDetails}>
                  <Text style={[
                    styles.hostelOptionName,
                    selectedHostel.id === item.id && styles.hostelOptionNameSelected
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={[
                    styles.hostelOptionLocation,
                    selectedHostel.id === item.id && styles.hostelOptionLocationSelected
                  ]}>
                    {item.location.area}, {item.location.city}
                  </Text>
                  <View style={styles.hostelStats}>
                    <View style={styles.statPill}>
                      <Icon name="bed" size={12} color="#666" />
                      <Text style={styles.statPillText}>
                        {item.totalBeds || 0} beds
                      </Text>
                    </View>
                    <View style={styles.statPill}>
                      <Icon name="door-open" size={12} color="#666" />
                      <Text style={styles.statPillText}>
                        {item.vacantBeds || 0} vacant
                      </Text>
                    </View>
                  </View>
                </View>
                {selectedHostel.id === item.id && (
                  <View style={styles.selectedIndicator}>
                    <Icon name="check-circle" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          
          <TouchableOpacity
            style={styles.addHostelButton}
            onPress={() => {
              setShowHostelDropdown(false);
              // Navigate to HostelOwnerHome page
              try { recordRoute('/HostelDetails'); } catch (e) { }
              router.push("/tabs/HostelOwnerHome");
            }}
          >
            <Icon name="plus-circle" size={20} color={FOREST_GREEN} />
            <Text style={styles.addHostelButtonText}>Add New Hostel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={FOREST_GREEN} />
      
      {/* Hostel Dropdown Modal */}
      {renderHostelDropdown()}

      {/* Gradient Header */}
      <LinearGradient
        colors={[FOREST_GREEN, "#256B4A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          
          {/* Hostel Selector Button */}
          <TouchableOpacity
            style={styles.hostelSelector}
            onPress={() => setShowHostelDropdown(true)}
            activeOpacity={0.7}
          >
            <View style={styles.hostelSelectorContent}>
              <View style={styles.hostelIconWrap}>
                <Icon name="home" size={20} color="#fff" />
              </View>
              <View style={styles.hostelInfo}>
                <Text style={styles.selectedHostelName} numberOfLines={1}>
                  {selectedHostel.name}
                </Text>
                <View style={styles.hostelLocationRow}>
                  <Icon name="map-marker" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.selectedHostelLocation} numberOfLines={1}>
                    {selectedHostel.location.area}, {selectedHostel.location.city}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.hostelCountBadge}>
              <Text style={styles.hostelCountText}>{hostels.length}</Text>
            </View>
          </TouchableOpacity>
          
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
      </LinearGradient>

      {/* Perfect spacing */}
      <View style={{ height: 20 }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={true}
      >
        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, { borderColor: FOREST_GREEN }]} activeOpacity={0.9}>
            <Icon name="bed-double-outline" size={32} color={FOREST_GREEN} />
            <Text style={styles.statLabel}>Total Beds</Text>
            <Text style={styles.statValue}>{selectedHostel.totalBeds || summary?.totalBeds || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { borderColor: VEGA_YELLOW }]} activeOpacity={0.9}>
            <Icon name="cash" size={32} color={VEGA_YELLOW} />
            <Text style={[styles.statLabel, { color: VEGA_YELLOW }]}>Vacant Beds</Text>
            <Text style={[styles.statValue, { color: VEGA_YELLOW }]}>{selectedHostel.vacantBeds || summary?.vacantBeds || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Bookings Card */}
        <TouchableOpacity
          style={styles.bookingsCard}
          onPress={() => {
            try { recordRoute('/HostelDetails'); } catch (e) { }
            router.push("/tabs/Bookings");
          }}
          activeOpacity={0.8}
        >
          <View style={styles.bookingIconWrap}>
            <Icon name="calendar-blank" size={32} color="#BDBDBD" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.bookingsTitle}>Upcoming Bookings</Text>
            {noBookings ? (
              <>
                <Text style={styles.bookingsSubnote}>New bookings will appear here</Text>
              </>
            ) : (
              <Text style={styles.bookingsSub}>You have bookings!</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Space between bookings/stat and rooms section */}
        <View style={{ height: 32 }} />

        {/* Rooms Breakdown */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rooms</Text>
            <Text style={styles.sectionSubtitle}>
              Showing rooms for {selectedHostel.name}
            </Text>
          </View>
          <FlatList
            data={selectedHostel.rooms}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingVertical: 2 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.roomCard}
                onPress={() => {
                  try { recordRoute('/HostelDetails'); } catch (e) { }
                  router.push("/RoomDetails");
                }}
                activeOpacity={0.82}
              >
                <View style={styles.roomHeaderRow}>
                  <Icon name="bed" size={26} color={FOREST_GREEN} />
                  <Text style={styles.roomNumber}>Room {item.number}</Text>
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
        </View>

        {/* See All Rooms Button */}
        <View style={styles.seeAllSection}>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => {
              try { recordRoute('/HostelDetails'); } catch (e) { }
              router.push("/tabs/allrooms");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.seeAllText}>See All Rooms</Text>
            <Icon name="chevron-right" size={20} color={FOREST_GREEN} />
          </TouchableOpacity>
        </View>

        {/* Pricing Card */}
        {renderPricingCard()}

        {/* Facilities Card */}
        <TouchableOpacity style={styles.infoCard} onPress={() => {
          try { recordRoute('/HostelDetails'); } catch (e) { }
          router.push("/Facilities");
        }}>
          <View style={styles.iconCircleYellow}>
            <Icon name="domain" size={26} color={VEGA_YELLOW} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Facilities</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              {selectedHostel.facilities.join(", ")}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        {/* Media Card */}
        <TouchableOpacity style={styles.infoCard} onPress={() => {
          try { recordRoute('/HostelDetails'); } catch (e) { }
          router.push("/UploadMedia");
        }}>
          <View style={styles.iconCircle}>
            <Icon name="image-multiple" size={26} color={FOREST_GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Media</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              {selectedHostel.media.length} images/videos
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        {/* Bank Details Card */}
        <TouchableOpacity style={styles.infoCard} onPress={() => {
          try { recordRoute('/HostelDetails'); } catch (e) { }
          router.push("/BankDetailsPage");
        }}>
          <View style={styles.iconCircleBank}>
            <Icon name="bank" size={26} color="#2C3E50" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Bank Details</Text>
            {bankDetailsLoading ? (
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
          <Icon name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        {/* Location Card */}
        <View style={styles.infoCardDisabled}>
          <View style={styles.iconCircleGrey}>
            <Icon name="map-marker-radius" size={26} color="#BDBDBD" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Location</Text>
            <Text style={styles.cardValue} numberOfLines={2}>
              {selectedHostel.location.area}, {selectedHostel.location.city} — {selectedHostel.location.pincode}
            </Text>
          </View>
          <Icon name="lock" size={22} color="#BDBDBD" />
        </View>
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
    padding: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 30 : 50,
    paddingBottom: 32,
    marginTop: 0,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  // Hostel Selector Styles
  hostelSelector: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    position: "relative",
  },
  hostelSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostelIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hostelInfo: {
    flex: 1,
  },
  selectedHostelName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  hostelLocationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedHostelLocation: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  hostelCountBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: VEGA_YELLOW,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: FOREST_GREEN,
  },
  hostelCountText: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: "bold",
  },
  // Header Right Icons Container
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileButton: {
    padding: 2,
  },
  settingsButton: {
    padding: 2,
  },
  // Large Profile Icon
  profileIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.6)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2.5,
    borderColor: FOREST_GREEN,
    zIndex: 10,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    opacity: 0.95,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  ownerName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FOREST_GREEN,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
  // Pricing Card Styles
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
  // Hostel Dropdown Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 60 : 100,
  },
  hostelDropdownContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: FOREST_GREEN,
  },
  dropdownTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  dropdownSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  hostelList: {
    maxHeight: 400,
  },
  hostelOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  hostelOptionSelected: {
    backgroundColor: FOREST_GREEN + "20",
  },
  hostelOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFCF7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hostelOptionDetails: {
    flex: 1,
  },
  hostelOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  hostelOptionNameSelected: {
    color: FOREST_GREEN,
  },
  hostelOptionLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  hostelOptionLocationSelected: {
    color: "#609269",
  },
  hostelStats: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statPillText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  addHostelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#F8F9FA",
    gap: 8,
  },
  addHostelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: FOREST_GREEN,
  },
});