// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Dimensions,
//   StatusBar,
//   ActivityIndicator,
//   FlatList,
//   Platform,
//   Modal,
//   Animated,
//   Easing,
//   Alert,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import * as Location from "expo-location";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import SideNav from "../../components/SideNav";
// import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
// import { selectHostel } from "@/app/reduxStore/reduxSlices/authSlice";

// const { width } = Dimensions.get("window");

// const COLORS = {
//   primary: "#00C72F", // Green
//   accent: "#FFD700", // Yellow
//   text: "#222",
//   background: "#FFFFFF",
//   cardShadow: "#00000010",
//   heading: "#000000",
//   subtitle: "#555555",
//   error: "#FF5252",
//   warning: "#FF9800",
//   success: "#4CAF50",
// };

// interface Hostel {
//   hostelId: string;
//   _id: string;
//   hostelName: string;
//   hostelType: string;
//   govtRegistrationId: string;
//   fullAddress: string;
//   status: "pending" | "approved" | "rejected";
//   isActive: boolean;
//   rejectionReason?: string;
// }

// export default function HostelHome() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const [locationName, setLocationName] = useState<string | null>(null);
//   const [locationStatus, setLocationStatus] = useState("pending");
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<any>(null);
//   const [showHostelDropdown, setShowHostelDropdown] = useState(false);

//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const {
//     loading,
//     error,
//     token,
//     userId,
//     hostels,
//     selectedHostelId,
//     user
//   } = useAppSelector((state) => state.auth);

//   // Filter approved hostels only for operations
//   const approvedHostels = hostels.filter(h => h.status === "approved" && h.isActive);
  
//   // Get selected hostel details (only if approved)
//   const selectedHostel = approvedHostels.find(h => h.hostelId === selectedHostelId) || 
//                         hostels.find(h => h.hostelId === selectedHostelId);

//   // Get hostel status count
//   const getHostelStatusCount = () => {
//     return {
//       approved: hostels.filter(h => h.status === "approved").length,
//       pending: hostels.filter(h => h.status === "pending").length,
//       rejected: hostels.filter(h => h.status === "rejected").length,
//     };
//   };

//   const statusCount = getHostelStatusCount();

//   const banners = [
//     require("../../assets/banners/banner1.jpg"),
//     require("../../assets/banners/banner2.jpg"),
//     require("../../assets/banners/banner3.jpg"),
//     require("../../assets/banners/banner4.jpg"),
//   ];

//   // Banner state and refs
//   const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
//   const bannerScrollRef = useRef<FlatList>(null);

//   // Auto-scroll banners
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const nextIndex = (currentBannerIndex + 1) % banners.length;
//       setCurrentBannerIndex(nextIndex);
//       bannerScrollRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [currentBannerIndex]);

//   const loadLocation = useCallback(async () => {
//     setLocationStatus("pending");
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setLocationStatus("denied");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const address = await Location.reverseGeocodeAsync({
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       });
//       if (address.length > 0) {
//         const place = address[0];
//         setLocationName(
//           `${place.city || place.subregion || ""}, ${place.region || ""}`
//         );
//       }
//       setLocationStatus("granted");
//     } catch {
//       setLocationStatus("error");
//     }
//   }, []);

//   useEffect(() => {
//     loadLocation();
//   }, [loadLocation]);

//   const quickActions = [
//     {
//       label: "Upload",
//       icon: require("../../assets/icons/upload.png"),
//       route: "/UploadMedia",
//       description: "Upload hostel details like images,\nrooms and facilities",
//     },
//     {
//       label: "Price",
//       icon: require("../../assets/icons/price.png"),
//       route: "/Pricing",
//       description: "Set or update pricing of rooms easily",
//     },
//     {
//       label: "Rooms",
//       icon: require("../../assets/icons/rooms.png"),
//       route: "/RoomDetails",
//       description: "View and manage your rooms",
//     },
//     {
//       label: "Facilities",
//       icon: require("../../assets/icons/facilities.png"),
//       route: "/Facilities",
//       description: "Update hostel amenities and services",
//     },
//     {
//       label: "Summary",
//       icon: require("../../assets/icons/summary.png"),
//       route: "/Summary",
//       description: "Post an overview summary and key details about your hostel to attract guests.",
//     },
//     {
//       label: "Bank Details",
//       icon: require("../../assets/icons/bank.png"),
//       route: "/BankDetailsPage",
//       description: "Add or update your bank account details for easy payouts.",
//     },
//   ];

//   const forYou = [
//     {
//       label: "Offers",
//       icon: require("../../assets/icons/offers.png"),
//       description:
//         "Access exclusive hostel offers tailored for you, including seasonal discounts and special bundle deals. Don't miss out on saving while booking comfortable stays.",
//     },
//     {
//       label: "Rewards",
//       icon: require("../../assets/icons/rewards.png"),
//       description:
//         "Earn points on every booking and referral. Redeem rewards for free stays, upgrades, and special services in partner hostels.",
//     },
//     {
//       label: "Discount",
//       icon: require("../../assets/icons/discount.png"),
//       description:
//         "Get special festival and weekend discounts available only for registered users. Keep an eye on flash sales and limited-time offers.",
//     },
//     {
//       label: "Coupons",
//       icon: require("../../assets/icons/coupons.png"),
//       description:
//         "Apply promo codes to instantly reduce your booking amount. Check regularly for new coupons and maximize your savings.",
//     },
//   ];

//   const openModal = (item: any) => {
//     setSelectedOffer(item);
//     setModalVisible(true);
//     Animated.timing(scaleAnim, {
//       toValue: 1,
//       duration: 300,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeModal = () => {
//     Animated.timing(scaleAnim, {
//       toValue: 0,
//       duration: 200,
//       easing: Easing.in(Easing.ease),
//       useNativeDriver: true,
//     }).start(() => {
//       setModalVisible(false);
//       setSelectedOffer(null);
//     });
//   };

//   const handleOverlayPress = () => {
//     closeModal();
//   };

//   const handleSelectHostel = (hostelId: string) => {
//     const hostel = hostels.find(h => h.hostelId === hostelId);
//     if (hostel) {
//       dispatch(selectHostel(hostelId));
//       setShowHostelDropdown(false);
      
//       // Show status-specific alerts
//       if (hostel.status !== "approved") {
//         Alert.alert(
//           `Hostel ${hostel.status === "pending" ? "Under Review" : "Not Approved"}`,
//           hostel.status === "pending"
//             ? "This hostel is under review. You can view details but cannot perform operations until it's approved."
//             : `This hostel has been rejected. Reason: ${hostel.rejectionReason || "Not specified"}`,
//           [{ text: "OK", style: "cancel" }]
//         );
//       }
//     }
//   };

//   const checkHostelData = async () => {
//     // This function would check if all required data is filled for the selected hostel
//     // You can implement API calls here to verify data completeness
//     return true; // Placeholder - implement your logic
//   };

//   const handleManageHostels = async () => {
//     if (!selectedHostelId) {
//       Alert.alert(
//         "No Hostel Selected",
//         "Please select a hostel first",
//         [{ text: "OK", style: "cancel" }]
//       );
//       return;
//     }

//     // Check if selected hostel exists
//     const selected = hostels.find(h => h.hostelId === selectedHostelId);
//     if (!selected) {
//       Alert.alert(
//         "Hostel Not Found",
//         "The selected hostel could not be found.",
//         [{ text: "OK", style: "cancel" }]
//       );
//       return;
//     }

//     // For non-approved hostels, only allow viewing
//     if (selected.status !== "approved") {
//       Alert.alert(
//         `Hostel ${selected.status.toUpperCase()}`,
//         selected.status === "pending"
//           ? "This hostel is under review. You can view details but cannot perform operations."
//           : "This hostel has been rejected and cannot be managed.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { 
//             text: "View Details", 
//             onPress: () => {
//               router.push({
//                 pathname: "/HostelDetails",
//                 params: {
//                   hostelId: selectedHostelId,
//                   hostelName: selected?.hostelName,
//                   viewOnly: "true"
//                 }
//               });
//             }
//           }
//         ]
//       );
//       return;
//     }

//     const isDataReady = await checkHostelData();
//     if (isDataReady) {
//       router.push({
//         pathname: "/HostelDetails",
//         params: {
//           hostelId: selectedHostelId,
//           hostelName: selectedHostel?.hostelName
//         }
//       });
//     } else {
//       Alert.alert(
//         "Incomplete Data",
//         "Please complete all required sections (Upload, Price, Rooms, Facilities, Summary, Bank Details) before managing the hostel.",
//         [
//           { text: "OK", style: "cancel" },
//           { text: "Complete Now", onPress: () => router.push("/UploadMedia") }
//         ]
//       );
//     }
//   };

//   const handleQuickActionPress = (route: string) => {
//     if (!selectedHostelId) {
//       Alert.alert(
//         "Select Hostel First",
//         "Please select a hostel to continue",
//         [{ text: "OK", style: "cancel" }]
//       );
//       return;
//     }

//     // Check if selected hostel exists
//     const selected = hostels.find(h => h.hostelId === selectedHostelId);
//     if (!selected) {
//       Alert.alert(
//         "Hostel Not Found",
//         "The selected hostel could not be found.",
//         [{ text: "OK", style: "cancel" }]
//       );
//       return;
//     }

//     // For non-approved hostels, only allow viewing
//     if (selected.status !== "approved") {
//       Alert.alert(
//         `Hostel ${selected.status.toUpperCase()}`,
//         selected.status === "pending"
//           ? "This hostel is under review. Operations are disabled until approval."
//           : "This hostel has been rejected and operations are not allowed.",
//         [{ text: "OK", style: "cancel" }]
//       );
//       return;
//     }

//     const params: any = {
//       hostelId: selectedHostelId,
//       hostelName: selectedHostel?.hostelName
//     };

//     // For specific screens, add additional params
//     if (route === '/Facilities') {
//       params.hostelId = selectedHostelId;
//       params.hostelName = selectedHostel?.hostelName;
//     }

//     router.push({
//       pathname: route,
//       params: params
//     });
//   };

//   const renderBannerItem = ({ item }: { item: any }) => (
//     <View style={styles.bannerCard}>
//       <Image source={item} style={styles.bannerImage} />
//     </View>
//   );

//   // Banner pagination dots
//   const renderPaginationDots = () => (
//     <View style={styles.paginationContainer}>
//       {banners.map((_, index) => (
//         <View
//           key={index}
//           style={[
//             styles.paginationDot,
//             currentBannerIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
//           ]}
//         />
//       ))}
//     </View>
//   );

//   // Hostel type icon mapping
//   const getHostelTypeIcon = (type: string) => {
//     switch (type?.toLowerCase()) {
//       case 'boys': return 'human-male';
//       case 'girls': return 'human-female';
//       case 'co-ed': return 'human-male-female';
//       default: return 'home';
//     }
//   };

//   const getHostelTypeColor = (type: string) => {
//     switch (type?.toLowerCase()) {
//       case 'boys': return '#4A90E2';
//       case 'girls': return '#E91E63';
//       case 'co-ed': return '#9C27B0';
//       default: return COLORS.primary;
//     }
//   };

//   const getHostelStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved': return COLORS.success;
//       case 'pending': return COLORS.warning;
//       case 'rejected': return COLORS.error;
//       default: return COLORS.subtitle;
//     }
//   };

//   const getHostelStatusIcon = (status: string) => {
//     switch (status) {
//       case 'approved': return 'check-circle';
//       case 'pending': return 'clock-outline';
//       case 'rejected': return 'close-circle';
//       default: return 'help-circle';
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["right", "left", "bottom"]}>
//       <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 0 }}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => setDrawerVisible(true)}>
//             <Icon name="menu" size={28} color={COLORS.primary} />
//           </TouchableOpacity>
//           <Image source={require("../../assets/logo.png")} style={styles.logo} />
//           <View style={styles.headerIcons}>
//             <TouchableOpacity onPress={() => router.push("/Notifications")}>
//               <Icon name="bell-outline" size={26} color={COLORS.accent} />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => router.push("/Profile")}>
//               <Icon name="account-circle-outline" size={28} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Welcome */}
//         <View style={styles.welcomeContainer}>
//           <View style={styles.welcomeHeader}>
//             <Text style={styles.welcomeText}>
//               Welcome back, {user?.fullName || "Owner"} 👋
//             </Text>
//           </View>
//           <Text style={styles.subText}>Connected Owner App</Text>
//         </View>

//         {/* Location */}
//         <View style={styles.locationSection}>
//           <Icon name="map-marker" size={20} color={COLORS.primary} />
//           {locationStatus === "pending" && (
//             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
//           )}
//           {locationStatus === "granted" && locationName && (
//             <Text style={styles.locationText}>{locationName}</Text>
//           )}
//         </View>

//         {/* Banner Carousel */}
//         <View style={styles.bannerSection}>
//           <FlatList
//             ref={bannerScrollRef}
//             data={banners}
//             renderItem={renderBannerItem}
//             keyExtractor={(_, index) => `banner-${index}`}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onScroll={(e) => {
//               const offsetX = e.nativeEvent.contentOffset.x;
//               const page = Math.round(offsetX / width);
//               setCurrentBannerIndex(page);
//             }}
//             scrollEventThrottle={16}
//             getItemLayout={(_, index) => ({
//               length: width,
//               offset: width * index,
//               index,
//             })}
//           />
//           {renderPaginationDots()}
//         </View>

//         {/* Hostel Dropdown Selector */}
//         <View style={styles.dropdownSection}>
//           <View style={styles.dropdownHeader}>
//             <Text style={styles.dropdownTitle}>Select Hostel to Manage</Text>
//             <View style={styles.hostelStatusCount}>
//               <View style={styles.statusBadge}>
//                 <Icon name="check-circle" size={12} color={COLORS.success} />
//                 <Text style={[styles.statusBadgeText, { color: COLORS.success }]}>
//                   {statusCount.approved}
//                 </Text>
//               </View>
//               <View style={styles.statusBadge}>
//                 <Icon name="clock-outline" size={12} color={COLORS.warning} />
//                 <Text style={[styles.statusBadgeText, { color: COLORS.warning }]}>
//                   {statusCount.pending}
//                 </Text>
//               </View>
//               <View style={styles.statusBadge}>
//                 <Icon name="close-circle" size={12} color={COLORS.error} />
//                 <Text style={[styles.statusBadgeText, { color: COLORS.error }]}>
//                   {statusCount.rejected}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color={COLORS.primary} />
//               <Text style={styles.loadingText}>Loading hostels...</Text>
//             </View>
//           ) : hostels.length === 0 ? (
//             <View style={styles.noHostelsContainer}>
//               <Icon name="home-off" size={40} color="#ccc" />
//               <Text style={styles.noHostelsText}>
//                 No hostels found. Please contact support if this is incorrect.
//               </Text>
//             </View>
//           ) : (
//             <View style={styles.dropdownContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.dropdownButton,
//                   selectedHostel && selectedHostel.status !== "approved" && styles.dropdownButtonDisabled
//                 ]}
//                 onPress={() => setShowHostelDropdown(!showHostelDropdown)}
//                 activeOpacity={0.7}
//                 disabled={hostels.length === 0}
//               >
//                 <View style={styles.dropdownButtonContent}>
//                   {selectedHostel && (
//                     <>
//                       <Icon
//                         name={getHostelTypeIcon(selectedHostel.hostelType)}
//                         size={22}
//                         color={
//                           selectedHostel.status === "approved" 
//                             ? getHostelTypeColor(selectedHostel.hostelType)
//                             : COLORS.subtitle
//                         }
//                         style={styles.homeIcon}
//                       />
//                       <View style={styles.hostelInfo}>
//                         <View style={styles.hostelNameRow}>
//                           <Text 
//                             style={[
//                               styles.dropdownButtonText,
//                               selectedHostel.status !== "approved" && styles.dropdownButtonTextDisabled
//                             ]} 
//                             numberOfLines={1}
//                           >
//                             {selectedHostel.hostelName}
//                           </Text>
//                           <View style={[
//                             styles.hostelStatusBadge,
//                             { backgroundColor: getHostelStatusColor(selectedHostel.status) + '20' }
//                           ]}>
//                             <Icon 
//                               name={getHostelStatusIcon(selectedHostel.status)} 
//                               size={12} 
//                               color={getHostelStatusColor(selectedHostel.status)} 
//                             />
//                             <Text style={[
//                               styles.hostelStatusText,
//                               { color: getHostelStatusColor(selectedHostel.status) }
//                             ]}>
//                               {selectedHostel.status.toUpperCase()}
//                             </Text>
//                           </View>
//                         </View>
//                         {selectedHostel && (
//                           <Text style={[
//                             styles.hostelTypeText,
//                             selectedHostel.status !== "approved" && { color: COLORS.subtitle }
//                           ]}>
//                             {selectedHostel.hostelType} • 
//                             {selectedHostel.status === "approved" 
//                               ? " Active" 
//                               : selectedHostel.status === "pending"
//                                 ? " Under Review"
//                                 : " Not Available"
//                             }
//                           </Text>
//                         )}
//                       </View>
//                     </>
//                   )}
//                   {!selectedHostel && (
//                     <>
//                       <Icon name="home" size={22} color={COLORS.primary} style={styles.homeIcon} />
//                       <View style={styles.hostelInfo}>
//                         <Text style={styles.dropdownButtonText} numberOfLines={1}>
//                           Select a hostel
//                         </Text>
//                         <Text style={styles.hostelTypeText}>
//                           Choose from {approvedHostels.length} approved hostels
//                         </Text>
//                       </View>
//                     </>
//                   )}
//                 </View>
//                 <Icon
//                   name={showHostelDropdown ? "chevron-up" : "chevron-down"}
//                   size={20}
//                   color={selectedHostel?.status === "approved" ? COLORS.primary : COLORS.subtitle}
//                 />
//               </TouchableOpacity>

//               {showHostelDropdown && (
//                 <View style={styles.dropdownMenu}>
//                   <ScrollView
//                     style={styles.dropdownScrollView}
//                     nestedScrollEnabled={true}
//                     showsVerticalScrollIndicator={false}
//                   >
//                     {/* Approved Hostels Section */}
//                     {approvedHostels.length > 0 && (
//                       <>
//                         <View style={styles.dropdownSectionHeader}>
//                           <Text style={styles.dropdownSectionTitle}>Approved Hostels</Text>
//                           <Text style={styles.dropdownSectionCount}>{approvedHostels.length}</Text>
//                         </View>
//                         {approvedHostels.map((hostel) => (
//                           <TouchableOpacity
//                             key={hostel.hostelId}
//                             style={[
//                               styles.dropdownItem,
//                               selectedHostelId === hostel.hostelId && styles.dropdownItemSelected,
//                               hostel.status === "approved" && styles.dropdownItemApproved
//                             ]}
//                             onPress={() => handleSelectHostel(hostel.hostelId)}
//                           >
//                             <Icon
//                               name={getHostelTypeIcon(hostel.hostelType)}
//                               size={18}
//                               color={
//                                 selectedHostelId === hostel.hostelId 
//                                   ? "#fff" 
//                                   : getHostelTypeColor(hostel.hostelType)
//                               }
//                               style={styles.itemIcon}
//                             />
//                             <View style={styles.hostelItemInfo}>
//                               <Text
//                                 style={[
//                                   styles.dropdownItemText,
//                                   selectedHostelId === hostel.hostelId && styles.dropdownItemTextSelected
//                                 ]}
//                                 numberOfLines={1}
//                               >
//                                 {hostel.hostelName}
//                               </Text>
//                               <View style={styles.hostelItemDetails}>
//                                 <Text
//                                   style={[
//                                     styles.hostelItemType,
//                                     selectedHostelId === hostel.hostelId && styles.hostelItemTypeSelected
//                                   ]}
//                                 >
//                                   {hostel.hostelType} • {hostel.status}
//                                 </Text>
//                               </View>
//                             </View>
//                             {selectedHostelId === hostel.hostelId ? (
//                               <Icon name="check" size={18} color="#fff" />
//                             ) : (
//                               <Icon name="check-circle" size={16} color={COLORS.success} />
//                             )}
//                           </TouchableOpacity>
//                         ))}
//                       </>
//                     )}

//                     {/* Other Status Hostels Section */}
//                     {hostels.filter(h => h.status !== "approved").length > 0 && (
//                       <>
//                         <View style={styles.dropdownSectionDivider} />
//                         <View style={styles.dropdownSectionHeader}>
//                           <Text style={styles.dropdownSectionTitle}>Other Hostels</Text>
//                         </View>
//                         {hostels
//                           .filter(h => h.status !== "approved")
//                           .map((hostel) => (
//                             <TouchableOpacity
//                               key={hostel.hostelId}
//                               style={[
//                                 styles.dropdownItem,
//                                 styles.dropdownItemDisabled,
//                                 hostel.status === "pending" && styles.dropdownItemPending,
//                                 hostel.status === "rejected" && styles.dropdownItemRejected
//                               ]}
//                               onPress={() => {
//                                 handleSelectHostel(hostel.hostelId);
//                               }}
//                             >
//                               <Icon
//                                 name={getHostelTypeIcon(hostel.hostelType)}
//                                 size={18}
//                                 color="#ccc"
//                                 style={styles.itemIcon}
//                               />
//                               <View style={styles.hostelItemInfo}>
//                                 <Text
//                                   style={styles.dropdownItemTextDisabled}
//                                   numberOfLines={1}
//                                 >
//                                   {hostel.hostelName}
//                                 </Text>
//                                 <View style={styles.hostelItemDetails}>
//                                   <Text
//                                     style={[
//                                       styles.hostelItemType,
//                                       { color: getHostelStatusColor(hostel.status) }
//                                     ]}
//                                   >
//                                     {hostel.hostelType} • {hostel.status}
//                                   </Text>
//                                   {hostel.rejectionReason && hostel.status === "rejected" && (
//                                     <Text style={styles.rejectionReason} numberOfLines={1}>
//                                       {hostel.rejectionReason}
//                                     </Text>
//                                   )}
//                                 </View>
//                               </View>
//                               <Icon
//                                 name={getHostelStatusIcon(hostel.status)}
//                                 size={16}
//                                 color={getHostelStatusColor(hostel.status)}
//                               />
//                             </TouchableOpacity>
//                           ))}
//                       </>
//                     )}
//                   </ScrollView>
//                 </View>
//               )}
//             </View>
//           )}
//         </View>

//         {/* Quick Actions (3 per row) - Show only if approved hostel selected */}
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.iconGrid}>
//           {quickActions.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[
//                 styles.iconCard,
//                 (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconCardDisabled
//               ]}
//               activeOpacity={(!selectedHostelId || selectedHostel?.status !== "approved") ? 1 : 0.8}
//               onPress={() => {
//                 if (!selectedHostelId) {
//                   Alert.alert(
//                     "Select Hostel",
//                     "Please select a hostel to perform this action.",
//                     [{ text: "OK", style: "cancel" }]
//                   );
//                 } else if (selectedHostel?.status !== "approved") {
//                   Alert.alert(
//                     `Hostel ${selectedHostel?.status?.toUpperCase() || "Not Approved"}`,
//                     selectedHostel?.status === "pending"
//                       ? "This hostel is under review. Operations are disabled until approval."
//                       : "This hostel has been rejected and operations are not allowed.",
//                     [{ text: "OK", style: "cancel" }]
//                   );
//                 } else {
//                   handleQuickActionPress(item.route);
//                 }
//               }}
//             >
//               <View style={[
//                 styles.iconCircle,
//                 (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconCircleDisabled
//               ]}>
//                 <Image 
//                   source={item.icon} 
//                   style={[
//                     styles.iconImage,
//                     (!selectedHostelId || selectedHostel?.status !== "approved") && { tintColor: "#ccc" }
//                   ]} 
//                 />
//               </View>
//               <Text style={[
//                 styles.iconLabel,
//                 (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconLabelDisabled
//               ]}>
//                 {item.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Description Cards */}
//         <FlatList
//           data={quickActions}
//           keyExtractor={(_, index) => index.toString()}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ marginVertical: 16, paddingLeft: 16 }}
//           renderItem={({ item, index }) => (
//             <View style={[
//               styles.descriptionCard,
//               (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descriptionCardDisabled
//             ]}>
//               <Image
//                 source={
//                   index === 0
//                     ? require("../../assets/icons/upload_alt.png")
//                     : index === 1
//                       ? require("../../assets/icons/price_alt.png")
//                       : index === 2
//                         ? require("../../assets/icons/rooms_alt.png")
//                         : index === 3
//                           ? require("../../assets/icons/facilities_alt.png")
//                           : index === 4
//                             ? require("../../assets/icons/summary_alt.png")
//                             : require("../../assets/icons/bank_alt.png")
//                 }
//                 style={[
//                   styles.descIcon,
//                   (!selectedHostelId || selectedHostel?.status !== "approved") && { tintColor: "#ccc" }
//                 ]}
//               />
//               <View style={styles.descTextContainer}>
//                 <Text style={[
//                   styles.descTitle,
//                   (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descTitleDisabled
//                 ]}>
//                   {item.label}
//                 </Text>
//                 <Text style={[
//                   styles.descText,
//                   (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descTextDisabled
//                 ]}>
//                   {(!selectedHostelId || selectedHostel?.status !== "approved")
//                     ? "Select an approved hostel to enable this feature"
//                     : item.description
//                   }
//                 </Text>
//               </View>
//             </View>
//           )}
//         />

//         {/* For You */}
//         <Text style={styles.sectionTitle}>For You</Text>
//         <View style={styles.iconGridSmall}>
//           {forYou.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.iconCardSmall}
//               activeOpacity={0.8}
//               onPress={() => openModal(item)}
//             >
//               <View style={styles.iconCircleSmall}>
//                 <Image source={item.icon} style={styles.iconImageSmall} />
//               </View>
//               <Text style={styles.iconLabelSmall}>{item.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* About the App */}
//         <Text style={styles.sectionTitle}>About the App</Text>
//         <View style={styles.aboutCard}>
//           <Text style={styles.aboutText}>
//             Manage your hostel operations effortlessly with Fyndom Partner App. Instantly edit hostel details, pricing, room availability, and amenities — all in one simple platform.
//           </Text>
//           <Text style={styles.aboutText}>
//             Designed for hostel owners to maximize bookings and manage rewards, offers, and payouts with ease.
//           </Text>
//         </View>

//         {/* Contact & Helpline */}
//         <Text style={styles.sectionTitle}>Contact & Helpline</Text>
//         <View style={styles.helpCard}>
//           <View style={styles.helpItem}>
//             <Icon name="phone" size={20} color={COLORS.primary} />
//             <Text style={styles.helpText}>+91 7674843434</Text>
//           </View>
//           <View style={styles.helpItem}>
//             <Icon name="email" size={20} color={COLORS.primary} />
//             <Text style={styles.helpText}>contact@fyndom.in</Text>
//           </View>
//           <View style={styles.helpItem}>
//             <Icon name="whatsapp" size={20} color={COLORS.primary} />
//             <Text style={styles.helpText}>Chat on WhatsApp</Text>
//           </View>
//           <TouchableOpacity
//             style={styles.helpButton}
//             onPress={() => alert("Chat support coming soon")}
//           >
//             <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.helpGradient}>
//               <Text style={styles.helpButtonText}>Chat with Support</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>

//         {/* Manage Hostels Button */}
//         <TouchableOpacity 
//           style={[
//             styles.manageButton,
//             (!selectedHostelId) && styles.manageButtonDisabled
//           ]} 
//           onPress={handleManageHostels}
//           activeOpacity={(!selectedHostelId) ? 0.5 : 0.8}
//         >
//           <LinearGradient 
//             colors={(!selectedHostelId) 
//               ? ["#ccc", "#999"] 
//               : [COLORS.primary, "#02b828"]
//             } 
//             style={styles.manageGradient}
//           >
//             <Text style={styles.manageText}>
//               {(!selectedHostelId)
//                 ? "Select a Hostel to View Details"
//                 : selectedHostel?.status === "approved"
//                   ? "Manage Selected Hostel"
//                   : `View ${selectedHostel?.status === "pending" ? "Pending" : "Rejected"} Hostel Details`
//               }
//             </Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Side navigation drawer */}
//       <SideNav
//         visible={drawerVisible}
//         onClose={() => setDrawerVisible(false)}
//         currentRoute="/tabs/HostelOwnerHome"
//         onNavigate={(route) => {
//           setDrawerVisible(false);
//           router.push(route as any);
//         }}
//       />

//       {/* Modal for For You quick actions */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={closeModal}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={handleOverlayPress}
//         >
//           <View style={styles.modalOverlayContent}>
//             <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
//               <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
//                 <View style={styles.modalIconWrapper}>
//                   {selectedOffer && (
//                     <Image
//                       source={selectedOffer.icon}
//                       style={[styles.modalIcon, { tintColor: COLORS.accent }]}
//                     />
//                   )}
//                 </View>
//                 <Text style={styles.modalTitle}>{selectedOffer?.label}</Text>
//                 <Text style={styles.modalDescription}>{selectedOffer?.description}</Text>
//                 <TouchableOpacity
//                   onPress={closeModal}
//                   style={[styles.modalCloseButton, { backgroundColor: COLORS.accent }]}
//                 >
//                   <Text style={styles.modalCloseText}>Close</Text>
//                 </TouchableOpacity>
//               </Animated.View>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     paddingTop: Platform.OS === "android" ? 24 : 12,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     backgroundColor: COLORS.background,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
//   logo: { width: 120, height: 50, resizeMode: "contain" },
//   headerIcons: { flexDirection: "row", alignItems: "center", gap: 12 },

//   welcomeContainer: {
//     paddingHorizontal: 16,
//     marginTop: 8,
//   },
//   welcomeHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   welcomeText: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: COLORS.heading,
//     flex: 1,
//   },
//   subText: {
//     fontSize: 13,
//     color: COLORS.subtitle,
//     marginBottom: 8,
//   },

//   locationSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   locationText: {
//     fontSize: 13,
//     color: COLORS.subtitle,
//     marginLeft: 6
//   },

//   bannerSection: {
//     marginVertical: 8,
//     position: "relative",
//   },
//   bannerCard: {
//     width: width - 32,
//     height: 170,
//     borderRadius: 12,
//     overflow: "hidden",
//     marginHorizontal: 16,
//   },
//   bannerImage: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 12,
//     resizeMode: "cover",
//   },
//   paginationContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   paginationDotActive: {
//     backgroundColor: COLORS.primary,
//     width: 20,
//   },
//   paginationDotInactive: {
//     backgroundColor: "#ccc",
//   },

//   // Dropdown Section Styles
//   dropdownSection: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   dropdownHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   dropdownTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: COLORS.heading,
//   },
//   hostelStatusCount: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   statusBadgeText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   loadingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   loadingText: {
//     fontSize: 14,
//     color: COLORS.subtitle,
//     marginLeft: 10,
//   },
//   noHostelsContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 30,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   noHostelsText: {
//     fontSize: 14,
//     color: COLORS.subtitle,
//     textAlign: "center",
//     marginTop: 10,
//     lineHeight: 20,
//   },
//   dropdownContainer: {
//     position: "relative",
//   },
//   dropdownButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   dropdownButtonDisabled: {
//     backgroundColor: "#f5f5f5",
//     borderColor: "#e0e0e0",
//   },
//   dropdownButtonContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   homeIcon: {
//     marginRight: 10,
//   },
//   hostelInfo: {
//     flex: 1,
//   },
//   hostelNameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   dropdownButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: COLORS.heading,
//     flex: 1,
//   },
//   dropdownButtonTextDisabled: {
//     color: COLORS.subtitle,
//   },
//   hostelStatusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 4,
//     marginLeft: 8,
//   },
//   hostelStatusText: {
//     fontSize: 10,
//     fontWeight: "700",
//     marginLeft: 4,
//   },
//   hostelTypeText: {
//     fontSize: 12,
//     color: COLORS.subtitle,
//     marginTop: 2,
//   },
//   dropdownMenu: {
//     position: "absolute",
//     top: "100%",
//     left: 0,
//     right: 0,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginTop: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 5,
//     maxHeight: 350,
//     zIndex: 1000,
//   },
//   dropdownScrollView: {
//     maxHeight: 300,
//   },
//   dropdownSectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#f8f9fa",
//   },
//   dropdownSectionTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.subtitle,
//     letterSpacing: 0.5,
//   },
//   dropdownSectionCount: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: COLORS.primary,
//   },
//   dropdownSectionDivider: {
//     height: 1,
//     backgroundColor: "#eee",
//     marginHorizontal: 16,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   dropdownItemSelected: {
//     backgroundColor: COLORS.primary,
//   },
//   dropdownItemApproved: {
//     backgroundColor: "#f8fff8",
//   },
//   dropdownItemPending: {
//     backgroundColor: "#fffbf0",
//   },
//   dropdownItemRejected: {
//     backgroundColor: "#fff5f5",
//   },
//   dropdownItemDisabled: {
//     opacity: 0.7,
//   },
//   itemIcon: {
//     marginRight: 10,
//   },
//   hostelItemInfo: {
//     flex: 1,
//   },
//   hostelItemDetails: {
//     marginTop: 2,
//   },
//   dropdownItemText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: COLORS.heading,
//   },
//   dropdownItemTextSelected: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   dropdownItemTextDisabled: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#999",
//   },
//   hostelItemType: {
//     fontSize: 11,
//     color: COLORS.subtitle,
//   },
//   hostelItemTypeSelected: {
//     color: "#fff",
//     opacity: 0.9,
//   },
//   rejectionReason: {
//     fontSize: 10,
//     color: COLORS.error,
//     fontStyle: "italic",
//     marginTop: 2,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.heading,
//     marginTop: 16,
//     marginBottom: 10,
//     paddingHorizontal: 16,
//   },

//   iconGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   iconCard: {
//     width: (width - 64) / 3, // 3 per row
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   iconCardDisabled: {
//     opacity: 0.5,
//   },
//   iconCircle: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "#f6f6f6",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: COLORS.cardShadow,
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   iconCircleDisabled: {
//     backgroundColor: "#f0f0f0",
//     shadowOpacity: 0.1,
//   },
//   iconImage: { width: 38, height: 38, resizeMode: "contain" },
//   iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },
//   iconLabelDisabled: { color: "#999" },

//   descriptionCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#D0E8FF",
//     marginRight: 16,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: COLORS.cardShadow,
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     minWidth: width * 0.45,
//     height: 120,
//   },
//   descriptionCardDisabled: {
//     backgroundColor: "#f0f0f0",
//   },
//   descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
//   descTextContainer: { flex: 1 },
//   descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
//   descTitleDisabled: { color: "#999" },
//   descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },
//   descTextDisabled: { color: "#999" },

//   iconGridSmall: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   iconCardSmall: {
//     width: width / 5,
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   iconCircleSmall: {
//     width: 55,
//     height: 55,
//     borderRadius: 27.5,
//     backgroundColor: "#fff",
//     borderWidth: 1.2,
//     borderColor: "#eee",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   iconImageSmall: { width: 35, height: 35, resizeMode: "contain" },
//   iconLabelSmall: {
//     fontSize: 12,
//     color: COLORS.subtitle,
//     marginTop: 4,
//     textAlign: "center",
//   },

//   aboutCard: {
//     backgroundColor: "#E8F5E8",
//     marginHorizontal: 16,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     marginBottom: 16,
//   },
//   aboutText: {
//     fontSize: 14,
//     color: COLORS.text,
//     lineHeight: 20,
//     marginBottom: 8,
//   },

//   helpCard: {
//     backgroundColor: "#FFF9E6",
//     marginHorizontal: 16,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.accent,
//     marginBottom: 16,
//   },
//   helpItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   helpText: {
//     fontSize: 14,
//     color: COLORS.text,
//     marginLeft: 8,
//   },
//   helpButton: {
//     marginTop: 12,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   helpGradient: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: "center",
//   },
//   helpButtonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//   },

//   manageButton: {
//     marginHorizontal: 16,
//     marginVertical: 24,
//     borderRadius: 12,
//     overflow: "hidden"
//   },
//   manageButtonDisabled: {
//     opacity: 0.7,
//   },
//   manageGradient: {
//     paddingVertical: 14,
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   manageText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700"
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalOverlayContent: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: width * 0.8,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 24,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     elevation: 10,
//   },
//   modalIconWrapper: {
//     backgroundColor: "#FFF9C4",
//     padding: 16,
//     borderRadius: 50,
//     marginBottom: 16,
//     borderWidth: 2,
//     borderColor: COLORS.accent,
//   },
//   modalIcon: {
//     width: 48,
//     height: 48,
//     resizeMode: "contain",
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: COLORS.heading,
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   modalDescription: {
//     fontSize: 15,
//     color: COLORS.text,
//     textAlign: "center",
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   modalCloseButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     minWidth: 120,
//   },
//   modalCloseText: {
//     color: "#000",
//     fontWeight: "700",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });

// HostelHome.tsx (full updated code)
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Platform,
  Modal,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import SideNav from "../../components/SideNav";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { selectHostel, updateSubscription, setHasSeenSubscription } from "@/app/reduxStore/reduxSlices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#00C72F", // Green
  accent: "#FFD700", // Yellow
  text: "#222",
  background: "#FFFFFF",
  cardShadow: "#00000010",
  heading: "#000000",
  subtitle: "#555555",
  error: "#FF5252",
  warning: "#FF9800",
  success: "#4CAF50",
};

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

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  features: string[];
  popular?: boolean;
}

export default function HostelHome() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState("pending");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [timeSinceSkip, setTimeSinceSkip] = useState<number | null>(null);
  const [showUpgradeBadge, setShowUpgradeBadge] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const subscriptionScaleAnim = useRef(new Animated.Value(0)).current;
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading,
    error,
    token,
    userId,
    hostels,
    selectedHostelId,
    user,
    subscription
  } = useAppSelector((state) => state.auth);

  // Check if user has active subscription
  const hasActiveSubscription = subscription?.isActive && 
    new Date(subscription.endDate) > new Date();

  // Filter approved hostels only for operations
  const approvedHostels = hostels.filter(h => h.status === "approved" && h.isActive);
  
  // Get selected hostel details (only if approved)
  const selectedHostel = approvedHostels.find(h => h.hostelId === selectedHostelId) || 
                        hostels.find(h => h.hostelId === selectedHostelId);

  // Get hostel status count
  const getHostelStatusCount = () => {
    return {
      approved: hostels.filter(h => h.status === "approved").length,
      pending: hostels.filter(h => h.status === "pending").length,
      rejected: hostels.filter(h => h.status === "rejected").length,
    };
  };

  const statusCount = getHostelStatusCount();

  const banners = [
    require("../../assets/banners/banner1.jpg"),
    require("../../assets/banners/banner2.jpg"),
    require("../../assets/banners/banner3.jpg"),
    require("../../assets/banners/banner4.jpg"),
  ];

  // Banner state and refs
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<FlatList>(null);

  // Auto-scroll banners
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(nextIndex);
      bannerScrollRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  // Check time since last skip
  const checkSkipTime = async () => {
    try {
      const lastSkipTime = await AsyncStorage.getItem(`lastSkipTime_${userId}`);
      if (lastSkipTime) {
        const skipTime = parseInt(lastSkipTime);
        const currentTime = Date.now();
        const timeDiff = currentTime - skipTime;
        const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
        
        setTimeSinceSkip(timeDiff);
        
        if (timeDiff >= twoMinutes && !hasActiveSubscription) {
          setShowUpgradeBadge(true);
        } else {
          setShowUpgradeBadge(false);
          // If less than 2 minutes, schedule check
          const timeLeft = twoMinutes - timeDiff;
          if (timeLeft > 0) {
            if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
            skipTimerRef.current = setTimeout(() => {
              setShowUpgradeBadge(true);
            }, timeLeft);
          }
        }
      }
    } catch (error) {
      console.log("Error checking skip time:", error);
    }
  };

  // Check if subscription modal should be shown
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        // Check if user has seen subscription modal before
        const hasSeenSubscription = await AsyncStorage.getItem(`hasSeenSubscription_${userId}`);
        
        // Check last skip time
        await checkSkipTime();
        
        // Show subscription modal if:
        // 1. User hasn't seen it AND doesn't have active subscription, OR
        // 2. It's been 2 minutes since last skip AND no active subscription
        if (!hasActiveSubscription) {
          if (!hasSeenSubscription || showUpgradeBadge) {
            setTimeout(() => {
              setShowSubscriptionModal(true);
              Animated.timing(subscriptionScaleAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
              }).start();
            }, 1000); // Show after 1 second delay
          }
        }
      } catch (error) {
        console.log("Error checking subscription:", error);
      }
    };

    if (userId && !loading) {
      checkSubscriptionStatus();
    }
  }, [userId, loading, hasActiveSubscription, showUpgradeBadge]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
    };
  }, []);

  // Subscription Plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "1",
      name: "Quarterly",
      duration: "3 Months",
      price: 1999,
      originalPrice: 2499,
      discount: "20% OFF",
      features: [
        "Manage up to 2 hostels",
        "Basic analytics dashboard",
        "Email support",
        "Standard listing priority"
      ],
    },
    {
      id: "2",
      name: "Half Yearly",
      duration: "6 Months",
      price: 2999,
      originalPrice: 3999,
      discount: "25% OFF",
      features: [
        "Manage up to 5 hostels",
        "Advanced analytics dashboard",
        "Priority email & chat support",
        "High listing priority",
        "Featured listing badge",
        "Discount coupons for bookings"
      ],
      popular: true,
    },
    {
      id: "3",
      name: "Yearly",
      duration: "1 Year",
      price: 4999,
      originalPrice: 5999,
      discount: "30% OFF",
      features: [
        "Unlimited hostels",
        "Premium analytics dashboard",
        "24/7 phone support",
        "Highest listing priority",
        "Featured listing badge",
        "Discount coupons for bookings",
        "Free marketing materials",
        "Dedicated account manager"
      ],
    },
  ];

  const loadLocation = useCallback(async () => {
    setLocationStatus("pending");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (address.length > 0) {
        const place = address[0];
        setLocationName(
          `${place.city || place.subregion || ""}, ${place.region || ""}`
        );
      }
      setLocationStatus("granted");
    } catch {
      setLocationStatus("error");
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const quickActions = [
    {
      label: "Upload",
      icon: require("../../assets/icons/upload.png"),
      route: "/UploadMedia",
      description: "Upload hostel details like images,\nrooms and facilities",
    },
    {
      label: "Price",
      icon: require("../../assets/icons/price.png"),
      route: "/Pricing",
      description: "Set or update pricing of rooms easily",
    },
    {
      label: "Rooms",
      icon: require("../../assets/icons/rooms.png"),
      route: "/RoomDetails",
      description: "View and manage your rooms",
    },
    {
      label: "Facilities",
      icon: require("../../assets/icons/facilities.png"),
      route: "/Facilities",
      description: "Update hostel amenities and services",
    },
    {
      label: "Summary",
      icon: require("../../assets/icons/summary.png"),
      route: "/Summary",
      description: "Post an overview summary and key details about your hostel to attract guests.",
    },
    {
      label: "Bank Details",
      icon: require("../../assets/icons/bank.png"),
      route: "/BankDetailsPage",
      description: "Add or update your bank account details for easy payouts.",
    },
  ];

  const forYou = [
    {
      label: "Offers",
      icon: require("../../assets/icons/offers.png"),
      description:
        "Access exclusive hostel offers tailored for you, including seasonal discounts and special bundle deals. Don't miss out on saving while booking comfortable stays.",
    },
    {
      label: "Rewards",
      icon: require("../../assets/icons/rewards.png"),
      description:
        "Earn points on every booking and referral. Redeem rewards for free stays, upgrades, and special services in partner hostels.",
    },
    {
      label: "Discount",
      icon: require("../../assets/icons/discount.png"),
      description:
        "Get special festival and weekend discounts available only for registered users. Keep an eye on flash sales and limited-time offers.",
    },
    {
      label: "Coupons",
      icon: require("../../assets/icons/coupons.png"),
      description:
        "Apply promo codes to instantly reduce your booking amount. Check regularly for new coupons and maximize your savings.",
    },
  ];

  const openModal = (item: any) => {
    setSelectedOffer(item);
    setModalVisible(true);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedOffer(null);
    });
  };

  const handleOverlayPress = () => {
    closeModal();
  };

  const handleSubscriptionOverlayPress = () => {
    closeSubscriptionModal();
  };

  const closeSubscriptionModal = () => {
    Animated.timing(subscriptionScaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowSubscriptionModal(false);
      setSelectedPlan(null);
    });
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // Here you would typically navigate to payment screen
    // For now, we'll just show an alert
    Alert.alert(
      "Proceed to Payment",
      `You selected ${plan.name} plan (${plan.duration}) for ₹${plan.price}`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSelectedPlan(null)
        },
        {
          text: "Continue",
          onPress: () => handleProceedToPayment(plan)
        }
      ]
    );
  };

  const handleProceedToPayment = async (plan: SubscriptionPlan) => {
    try {
      // Here you would integrate with payment gateway
      // For demonstration, we'll simulate successful payment
      
      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      switch (plan.id) {
        case "1": // 3 months
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "2": // 6 months
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case "3": // 1 year
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Update subscription in Redux
      dispatch(updateSubscription({
        planId: plan.id,
        planName: plan.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        features: plan.features,
        price: plan.price,
        duration: plan.duration,
      }));

      // Mark that user has seen subscription modal and bought subscription
      await AsyncStorage.setItem(`hasSeenSubscription_${userId}`, "true");
      await AsyncStorage.setItem(`lastSkipTime_${userId}`, Date.now().toString()); // Reset skip timer
      dispatch(setHasSeenSubscription(true));
      
      // Hide upgrade badge
      setShowUpgradeBadge(false);

      Alert.alert(
        "Subscription Activated!",
        `Your ${plan.name} plan has been activated successfully. You can now access all features.`,
        [{ 
          text: "Great!", 
          onPress: () => {
            closeSubscriptionModal();
          } 
        }]
      );
    } catch (error) {
      Alert.alert(
        "Payment Failed",
        "There was an error processing your payment. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSkipSubscription = async () => {
    try {
      // Mark current time as last skip time
      await AsyncStorage.setItem(`lastSkipTime_${userId}`, Date.now().toString());
      await AsyncStorage.setItem(`hasSeenSubscription_${userId}`, "true");
      
      // Hide upgrade badge for 2 minutes
      setShowUpgradeBadge(false);
      
      // Schedule to show upgrade badge after 2 minutes
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
      skipTimerRef.current = setTimeout(() => {
        setShowUpgradeBadge(true);
      }, 2 * 60 * 1000); // 2 minutes

      closeSubscriptionModal();
      Alert.alert(
        "Limited Access",
        "You can continue with limited features. Upgrade anytime to access all premium features.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.log("Error skipping subscription:", error);
    }
  };

  const handleOpenSubscriptionModal = () => {
    setShowSubscriptionModal(true);
    Animated.timing(subscriptionScaleAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  };

  const handleSelectHostel = (hostelId: string) => {
    const hostel = hostels.find(h => h.hostelId === hostelId);
    if (hostel) {
      dispatch(selectHostel(hostelId));
      setShowHostelDropdown(false);
      
      // Show status-specific alerts
      if (hostel.status !== "approved") {
        Alert.alert(
          `Hostel ${hostel.status === "pending" ? "Under Review" : "Not Approved"}`,
          hostel.status === "pending"
            ? "This hostel is under review. You can view details but cannot perform operations until it's approved."
            : `This hostel has been rejected. Reason: ${hostel.rejectionReason || "Not specified"}`,
          [{ text: "OK", style: "cancel" }]
        );
      }
    }
  };

  const checkHostelData = async () => {
    // This function would check if all required data is filled for the selected hostel
    // You can implement API calls here to verify data completeness
    return true; // Placeholder - implement your logic
  };

  const handleManageHostels = async () => {
    if (!selectedHostelId) {
      Alert.alert(
        "No Hostel Selected",
        "Please select a hostel first",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // Check if selected hostel exists
    const selected = hostels.find(h => h.hostelId === selectedHostelId);
    if (!selected) {
      Alert.alert(
        "Hostel Not Found",
        "The selected hostel could not be found.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // For non-approved hostels, only allow viewing
    if (selected.status !== "approved") {
      Alert.alert(
        `Hostel ${selected.status.toUpperCase()}`,
        selected.status === "pending"
          ? "This hostel is under review. You can view details but cannot perform operations."
          : "This hostel has been rejected and cannot be managed.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "View Details", 
            onPress: () => {
              router.push({
                pathname: "/HostelDetails",
                params: {
                  hostelId: selectedHostelId,
                  hostelName: selected?.hostelName,
                  viewOnly: "true"
                }
              });
            }
          }
        ]
      );
      return;
    }

    const isDataReady = await checkHostelData();
    if (isDataReady) {
      router.push({
        pathname: "/HostelDetails",
        params: {
          hostelId: selectedHostelId,
          hostelName: selectedHostel?.hostelName
        }
      });
    } else {
      Alert.alert(
        "Incomplete Data",
        "Please complete all required sections (Upload, Price, Rooms, Facilities, Summary, Bank Details) before managing the hostel.",
        [
          { text: "OK", style: "cancel" },
          { text: "Complete Now", onPress: () => router.push("/UploadMedia") }
        ]
      );
    }
  };

  const handleQuickActionPress = (route: string) => {
    if (!selectedHostelId) {
      Alert.alert(
        "Select Hostel First",
        "Please select a hostel to continue",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // Check if selected hostel exists
    const selected = hostels.find(h => h.hostelId === selectedHostelId);
    if (!selected) {
      Alert.alert(
        "Hostel Not Found",
        "The selected hostel could not be found.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    // For non-approved hostels, only allow viewing
    if (selected.status !== "approved") {
      Alert.alert(
        `Hostel ${selected.status.toUpperCase()}`,
        selected.status === "pending"
          ? "This hostel is under review. Operations are disabled until approval."
          : "This hostel has been rejected and operations are not allowed.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    const params: any = {
      hostelId: selectedHostelId,
      hostelName: selectedHostel?.hostelName
    };

    // For specific screens, add additional params
    if (route === '/Facilities') {
      params.hostelId = selectedHostelId;
      params.hostelName = selectedHostel?.hostelName;
    }

    router.push({
      pathname: route,
      params: params
    });
  };

  const renderBannerItem = ({ item }: { item: any }) => (
    <View style={styles.bannerCard}>
      <Image source={item} style={styles.bannerImage} />
    </View>
  );

  // Banner pagination dots
  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentBannerIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );

  // Hostel type icon mapping
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
      default: return COLORS.primary;
    }
  };

  const getHostelStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'rejected': return COLORS.error;
      default: return COLORS.subtitle;
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

  const renderSubscriptionPlan = (plan: SubscriptionPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.subscriptionPlanCard,
        selectedPlan?.id === plan.id && styles.subscriptionPlanCardSelected,
        plan.popular && styles.subscriptionPlanCardPopular,
      ]}
      onPress={() => handleSelectPlan(plan)}
      activeOpacity={0.8}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={[
          styles.planName,
          selectedPlan?.id === plan.id && styles.planNameSelected,
        ]}>
          {plan.name}
        </Text>
        <Text style={[
          styles.planDuration,
          selectedPlan?.id === plan.id && styles.planDurationSelected,
        ]}>
          {plan.duration}
        </Text>
      </View>

      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={[
            styles.planPrice,
            selectedPlan?.id === plan.id && styles.planPriceSelected,
          ]}>
            {plan.price}
          </Text>
          <Text style={styles.priceSuffix}>/-</Text>
        </View>
        
        {plan.originalPrice && (
          <Text style={styles.originalPrice}>
            ₹{plan.originalPrice}
          </Text>
        )}
        
        {plan.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{plan.discount}</Text>
          </View>
        )}
      </View>

      <View style={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Icon 
              name="check-circle" 
              size={16} 
              color={selectedPlan?.id === plan.id ? "#fff" : COLORS.success} 
            />
            <Text style={[
              styles.featureText,
              selectedPlan?.id === plan.id && styles.featureTextSelected,
            ]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={[
        styles.selectButton,
        selectedPlan?.id === plan.id && styles.selectButtonSelected,
      ]}>
        <Text style={[
          styles.selectButtonText,
          selectedPlan?.id === plan.id && styles.selectButtonTextSelected,
        ]}>
          {selectedPlan?.id === plan.id ? "SELECTED" : "SELECT PLAN"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Calculate time until next reminder
  const getTimeUntilReminder = () => {
    if (!timeSinceSkip) return "2:00";
    const twoMinutes = 2 * 60 * 1000;
    const timeLeft = Math.max(0, twoMinutes - timeSinceSkip);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "left", "bottom"]}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <Icon name="menu" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <View style={styles.headerIcons}>
            {hasActiveSubscription && (
              <View style={styles.subscriptionBadge}>
                <Icon name="crown" size={16} color="#FFD700" />
              </View>
            )}
            <TouchableOpacity onPress={() => router.push("/Notifications")}>
              <Icon name="bell-outline" size={26} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/Profile")}>
              <Icon name="account-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.fullName || "Owner"} 👋
            </Text>
            <View style={styles.welcomeRight}>
              {!hasActiveSubscription && showUpgradeBadge && (
                <TouchableOpacity 
                  style={styles.reminderBadge}
                  onPress={handleOpenSubscriptionModal}
                >
                  <Icon name="clock-alert-outline" size={14} color="#FF9800" />
                  <Text style={styles.reminderText}>Upgrade Now!</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[
                  styles.upgradeButton,
                  hasActiveSubscription && styles.upgradeButtonActive
                ]}
                onPress={handleOpenSubscriptionModal}
              >
                <Icon 
                  name={hasActiveSubscription ? "crown" : "arrow-up-circle"} 
                  size={20} 
                  color={hasActiveSubscription ? "#FFD700" : COLORS.primary} 
                />
                <Text style={[
                  styles.upgradeButtonText,
                  hasActiveSubscription && styles.upgradeButtonTextActive
                ]}>
                  {hasActiveSubscription ? "Premium" : "Upgrade"}
                </Text>
                {!hasActiveSubscription && showUpgradeBadge && (
                  <View style={styles.upgradeBadge}>
                    <Text style={styles.upgradeBadgeText}>!</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {hasActiveSubscription && subscription && (
            <View style={styles.activeSubscriptionInfo}>
              <Icon name="crown" size={14} color="#FFD700" />
              <Text style={styles.subscriptionText}>
                {subscription.planName} • Expires {new Date(subscription.endDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          <Text style={styles.subText}>Connected Owner App</Text>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <Icon name="map-marker" size={20} color={COLORS.primary} />
          {locationStatus === "pending" && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
          )}
          {locationStatus === "granted" && locationName && (
            <Text style={styles.locationText}>{locationName}</Text>
          )}
        </View>

        {/* Banner Carousel */}
        <View style={styles.bannerSection}>
          <FlatList
            ref={bannerScrollRef}
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(_, index) => `banner-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const page = Math.round(offsetX / width);
              setCurrentBannerIndex(page);
            }}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          {renderPaginationDots()}
        </View>

        {/* Hostel Dropdown Selector */}
        <View style={styles.dropdownSection}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select Hostel to Manage</Text>
            <View style={styles.hostelStatusCount}>
              <View style={styles.statusBadge}>
                <Icon name="check-circle" size={12} color={COLORS.success} />
                <Text style={[styles.statusBadgeText, { color: COLORS.success }]}>
                  {statusCount.approved}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Icon name="clock-outline" size={12} color={COLORS.warning} />
                <Text style={[styles.statusBadgeText, { color: COLORS.warning }]}>
                  {statusCount.pending}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Icon name="close-circle" size={12} color={COLORS.error} />
                <Text style={[styles.statusBadgeText, { color: COLORS.error }]}>
                  {statusCount.rejected}
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading hostels...</Text>
            </View>
          ) : hostels.length === 0 ? (
            <View style={styles.noHostelsContainer}>
              <Icon name="home-off" size={40} color="#ccc" />
              <Text style={styles.noHostelsText}>
                No hostels found. Please contact support if this is incorrect.
              </Text>
            </View>
          ) : (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  selectedHostel && selectedHostel.status !== "approved" && styles.dropdownButtonDisabled
                ]}
                onPress={() => setShowHostelDropdown(!showHostelDropdown)}
                activeOpacity={0.7}
                disabled={hostels.length === 0}
              >
                <View style={styles.dropdownButtonContent}>
                  {selectedHostel && (
                    <>
                      <Icon
                        name={getHostelTypeIcon(selectedHostel.hostelType)}
                        size={22}
                        color={
                          selectedHostel.status === "approved" 
                            ? getHostelTypeColor(selectedHostel.hostelType)
                            : COLORS.subtitle
                        }
                        style={styles.homeIcon}
                      />
                      <View style={styles.hostelInfo}>
                        <View style={styles.hostelNameRow}>
                          <Text 
                            style={[
                              styles.dropdownButtonText,
                              selectedHostel.status !== "approved" && styles.dropdownButtonTextDisabled
                            ]} 
                            numberOfLines={1}
                          >
                            {selectedHostel.hostelName}
                          </Text>
                          <View style={[
                            styles.hostelStatusBadge,
                            { backgroundColor: getHostelStatusColor(selectedHostel.status) + '20' }
                          ]}>
                            <Icon 
                              name={getHostelStatusIcon(selectedHostel.status)} 
                              size={12} 
                              color={getHostelStatusColor(selectedHostel.status)} 
                            />
                            <Text style={[
                              styles.hostelStatusText,
                              { color: getHostelStatusColor(selectedHostel.status) }
                            ]}>
                              {selectedHostel.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        {selectedHostel && (
                          <Text style={[
                            styles.hostelTypeText,
                            selectedHostel.status !== "approved" && { color: COLORS.subtitle }
                          ]}>
                            {selectedHostel.hostelType} • 
                            {selectedHostel.status === "approved" 
                              ? " Active" 
                              : selectedHostel.status === "pending"
                                ? " Under Review"
                                : " Not Available"
                            }
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                  {!selectedHostel && (
                    <>
                      <Icon name="home" size={22} color={COLORS.primary} style={styles.homeIcon} />
                      <View style={styles.hostelInfo}>
                        <Text style={styles.dropdownButtonText} numberOfLines={1}>
                          Select a hostel
                        </Text>
                        <Text style={styles.hostelTypeText}>
                          Choose from {approvedHostels.length} approved hostels
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                <Icon
                  name={showHostelDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={selectedHostel?.status === "approved" ? COLORS.primary : COLORS.subtitle}
                />
              </TouchableOpacity>

              {showHostelDropdown && (
                <View style={styles.dropdownMenu}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Approved Hostels Section */}
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
                              selectedHostelId === hostel.hostelId && styles.dropdownItemSelected,
                              hostel.status === "approved" && styles.dropdownItemApproved
                            ]}
                            onPress={() => handleSelectHostel(hostel.hostelId)}
                          >
                            <Icon
                              name={getHostelTypeIcon(hostel.hostelType)}
                              size={18}
                              color={
                                selectedHostelId === hostel.hostelId 
                                  ? "#fff" 
                                  : getHostelTypeColor(hostel.hostelType)
                              }
                              style={styles.itemIcon}
                            />
                            <View style={styles.hostelItemInfo}>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedHostelId === hostel.hostelId && styles.dropdownItemTextSelected
                                ]}
                                numberOfLines={1}
                              >
                                {hostel.hostelName}
                              </Text>
                              <View style={styles.hostelItemDetails}>
                                <Text
                                  style={[
                                    styles.hostelItemType,
                                    selectedHostelId === hostel.hostelId && styles.hostelItemTypeSelected
                                  ]}
                                >
                                  {hostel.hostelType} • {hostel.status}
                                </Text>
                              </View>
                            </View>
                            {selectedHostelId === hostel.hostelId ? (
                              <Icon name="check" size={18} color="#fff" />
                            ) : (
                              <Icon name="check-circle" size={16} color={COLORS.success} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </>
                    )}

                    {/* Other Status Hostels Section */}
                    {hostels.filter(h => h.status !== "approved").length > 0 && (
                      <>
                        <View style={styles.dropdownSectionDivider} />
                        <View style={styles.dropdownSectionHeader}>
                          <Text style={styles.dropdownSectionTitle}>Other Hostels</Text>
                        </View>
                        {hostels
                          .filter(h => h.status !== "approved")
                          .map((hostel) => (
                            <TouchableOpacity
                              key={hostel.hostelId}
                              style={[
                                styles.dropdownItem,
                                styles.dropdownItemDisabled,
                                hostel.status === "pending" && styles.dropdownItemPending,
                                hostel.status === "rejected" && styles.dropdownItemRejected
                              ]}
                              onPress={() => {
                                handleSelectHostel(hostel.hostelId);
                              }}
                            >
                              <Icon
                                name={getHostelTypeIcon(hostel.hostelType)}
                                size={18}
                                color="#ccc"
                                style={styles.itemIcon}
                              />
                              <View style={styles.hostelItemInfo}>
                                <Text
                                  style={styles.dropdownItemTextDisabled}
                                  numberOfLines={1}
                                >
                                  {hostel.hostelName}
                                </Text>
                                <View style={styles.hostelItemDetails}>
                                  <Text
                                    style={[
                                      styles.hostelItemType,
                                      { color: getHostelStatusColor(hostel.status) }
                                    ]}
                                  >
                                    {hostel.hostelType} • {hostel.status}
                                  </Text>
                                  {hostel.rejectionReason && hostel.status === "rejected" && (
                                    <Text style={styles.rejectionReason} numberOfLines={1}>
                                      {hostel.rejectionReason}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <Icon
                                name={getHostelStatusIcon(hostel.status)}
                                size={16}
                                color={getHostelStatusColor(hostel.status)}
                              />
                            </TouchableOpacity>
                          ))}
                      </>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions (3 per row) - Show only if approved hostel selected */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.iconGrid}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.iconCard,
                (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconCardDisabled
              ]}
              activeOpacity={(!selectedHostelId || selectedHostel?.status !== "approved") ? 1 : 0.8}
              onPress={() => {
                if (!selectedHostelId) {
                  Alert.alert(
                    "Select Hostel",
                    "Please select a hostel to perform this action.",
                    [{ text: "OK", style: "cancel" }]
                  );
                } else if (selectedHostel?.status !== "approved") {
                  Alert.alert(
                    `Hostel ${selectedHostel?.status?.toUpperCase() || "Not Approved"}`,
                    selectedHostel?.status === "pending"
                      ? "This hostel is under review. Operations are disabled until approval."
                      : "This hostel has been rejected and operations are not allowed.",
                    [{ text: "OK", style: "cancel" }]
                  );
                } else {
                  handleQuickActionPress(item.route);
                }
              }}
            >
              <View style={[
                styles.iconCircle,
                (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconCircleDisabled
              ]}>
                <Image 
                  source={item.icon} 
                  style={[
                    styles.iconImage,
                    (!selectedHostelId || selectedHostel?.status !== "approved") && { tintColor: "#ccc" }
                  ]} 
                />
              </View>
              <Text style={[
                styles.iconLabel,
                (!selectedHostelId || selectedHostel?.status !== "approved") && styles.iconLabelDisabled
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description Cards */}
        <FlatList
          data={quickActions}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 16, paddingLeft: 16 }}
          renderItem={({ item, index }) => (
            <View style={[
              styles.descriptionCard,
              (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descriptionCardDisabled
            ]}>
              <Image
                source={
                  index === 0
                    ? require("../../assets/icons/upload_alt.png")
                    : index === 1
                      ? require("../../assets/icons/price_alt.png")
                      : index === 2
                        ? require("../../assets/icons/rooms_alt.png")
                        : index === 3
                          ? require("../../assets/icons/facilities_alt.png")
                          : index === 4
                            ? require("../../assets/icons/summary_alt.png")
                            : require("../../assets/icons/bank_alt.png")
                }
                style={[
                  styles.descIcon,
                  (!selectedHostelId || selectedHostel?.status !== "approved") && { tintColor: "#ccc" }
                ]}
              />
              <View style={styles.descTextContainer}>
                <Text style={[
                  styles.descTitle,
                  (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descTitleDisabled
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.descText,
                  (!selectedHostelId || selectedHostel?.status !== "approved") && styles.descTextDisabled
                ]}>
                  {(!selectedHostelId || selectedHostel?.status !== "approved")
                    ? "Select an approved hostel to enable this feature"
                    : item.description
                  }
                </Text>
              </View>
            </View>
          )}
        />

        {/* For You */}
        <Text style={styles.sectionTitle}>For You</Text>
        <View style={styles.iconGridSmall}>
          {forYou.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconCardSmall}
              activeOpacity={0.8}
              onPress={() => openModal(item)}
            >
              <View style={styles.iconCircleSmall}>
                <Image source={item.icon} style={styles.iconImageSmall} />
              </View>
              <Text style={styles.iconLabelSmall}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About the App */}
        <Text style={styles.sectionTitle}>About the App</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            Manage your hostel operations effortlessly with Fyndom Partner App. Instantly edit hostel details, pricing, room availability, and amenities — all in one simple platform.
          </Text>
          <Text style={styles.aboutText}>
            Designed for hostel owners to maximize bookings and manage rewards, offers, and payouts with ease.
          </Text>
        </View>

        {/* Contact & Helpline */}
        <Text style={styles.sectionTitle}>Contact & Helpline</Text>
        <View style={styles.helpCard}>
          <View style={styles.helpItem}>
            <Icon name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.helpText}>+91 7674843434</Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="email" size={20} color={COLORS.primary} />
            <Text style={styles.helpText}>contact@fyndom.in</Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="whatsapp" size={20} color={COLORS.primary} />
            <Text style={styles.helpText}>Chat on WhatsApp</Text>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => alert("Chat support coming soon")}
          >
            <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.helpGradient}>
              <Text style={styles.helpButtonText}>Chat with Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Manage Hostels Button */}
        <TouchableOpacity 
          style={[
            styles.manageButton,
            (!selectedHostelId) && styles.manageButtonDisabled
          ]} 
          onPress={handleManageHostels}
          activeOpacity={(!selectedHostelId) ? 0.5 : 0.8}
        >
          <LinearGradient 
            colors={(!selectedHostelId) 
              ? ["#ccc", "#999"] 
              : [COLORS.primary, "#02b828"]
            } 
            style={styles.manageGradient}
          >
            <Text style={styles.manageText}>
              {(!selectedHostelId)
                ? "Select a Hostel to View Details"
                : selectedHostel?.status === "approved"
                  ? "Manage Selected Hostel"
                  : `View ${selectedHostel?.status === "pending" ? "Pending" : "Rejected"} Hostel Details`
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Side navigation drawer */}
      <SideNav
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        currentRoute="/tabs/HostelOwnerHome"
        onNavigate={(route) => {
          setDrawerVisible(false);
          router.push(route as any);
        }}
      />

      {/* Modal for For You quick actions */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleOverlayPress}
        >
          <View style={styles.modalOverlayContent}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.modalIconWrapper}>
                  {selectedOffer && (
                    <Image
                      source={selectedOffer.icon}
                      style={[styles.modalIcon, { tintColor: COLORS.accent }]}
                    />
                  )}
                </View>
                <Text style={styles.modalTitle}>{selectedOffer?.label}</Text>
                <Text style={styles.modalDescription}>{selectedOffer?.description}</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={[styles.modalCloseButton, { backgroundColor: COLORS.accent }]}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Subscription Plans Modal */}
      <Modal
        visible={showSubscriptionModal}
        transparent
        animationType="fade"
        onRequestClose={closeSubscriptionModal}
      >
        <TouchableOpacity
          style={styles.subscriptionModalOverlay}
          activeOpacity={1}
          onPress={handleSubscriptionOverlayPress}
        >
          <View style={styles.subscriptionModalOverlayContent}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <Animated.View style={[
                styles.subscriptionModalContent, 
                { transform: [{ scale: subscriptionScaleAnim }] }
              ]}>
                <View style={styles.subscriptionHeader}>
                  <Icon name="crown" size={36} color="#FFD700" />
                  <Text style={styles.subscriptionTitle}>
                    {hasActiveSubscription ? "Premium Plan Active" : "Upgrade Your Experience"}
                  </Text>
                  <Text style={styles.subscriptionSubtitle}>
                    {hasActiveSubscription 
                      ? `You're on the ${subscription?.planName} plan. Enjoy all premium features until ${subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : ''}.`
                      : "Choose a plan that fits your needs. Upgrade anytime to access all premium features."
                    }
                  </Text>
                </View>

                {!hasActiveSubscription && (
                  <>
                    {timeSinceSkip && timeSinceSkip < (2 * 60 * 1000) && (
                      <View style={styles.reminderTimer}>
                        <Icon name="clock-outline" size={16} color="#FF9800" />
                        <Text style={styles.reminderTimerText}>
                          Reminder in: {getTimeUntilReminder()}
                        </Text>
                      </View>
                    )}

                    <ScrollView 
                      style={styles.plansScrollView}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.plansContainer}
                    >
                      {subscriptionPlans.map(renderSubscriptionPlan)}
                    </ScrollView>
                  </>
                )}

                <View style={styles.subscriptionFooter}>
                  {!hasActiveSubscription ? (
                    <>
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkipSubscription}
                      >
                        <Text style={styles.skipButtonText}>
                          {timeSinceSkip && timeSinceSkip < (2 * 60 * 1000) 
                            ? `Remind me in ${getTimeUntilReminder()}`
                            : "Skip for now"
                          }
                        </Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.footerNote}>
                        *All prices are in INR. Cancel anytime. 7-day money-back guarantee.
                      </Text>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.manageSubscriptionButton}
                        onPress={() => {
                          // Navigate to subscription management page
                          router.push("/SubscriptionManagement");
                          closeSubscriptionModal();
                        }}
                      >
                        <Text style={styles.manageSubscriptionButtonText}>Manage Subscription</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.footerNote}>
                        Your subscription will auto-renew on {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : ''}.
                      </Text>
                    </>
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? 24 : 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  logo: { width: 120, height: 50, resizeMode: "contain" },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 12 },
  subscriptionBadge: {
    backgroundColor: "#FFD70020",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  welcomeContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.heading,
    flex: 1,
  },
  welcomeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  reminderText: {
    fontSize: 10,
    color: "#FF9800",
    fontWeight: "700",
    marginLeft: 4,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    position: "relative",
  },
  upgradeButtonActive: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD700",
  },
  upgradeButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginLeft: 4,
  },
  upgradeButtonTextActive: {
    color: "#FF8F00",
  },
  upgradeBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5252",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeSubscriptionInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: "600",
    marginLeft: 4,
  },
  subText: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginBottom: 8,
  },

  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginLeft: 6
  },

  bannerSection: {
    marginVertical: 8,
    position: "relative",
  },
  bannerCard: {
    width: width - 32,
    height: 170,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  paginationDotInactive: {
    backgroundColor: "#ccc",
  },

  // Dropdown Section Styles
  dropdownSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.heading,
  },
  hostelStatusCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginLeft: 10,
  },
  noHostelsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  noHostelsText: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownButtonDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  homeIcon: {
    marginRight: 10,
  },
  hostelInfo: {
    flex: 1,
  },
  hostelNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.heading,
    flex: 1,
  },
  dropdownButtonTextDisabled: {
    color: COLORS.subtitle,
  },
  hostelStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  hostelStatusText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  hostelTypeText: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 350,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
  },
  dropdownSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.subtitle,
    letterSpacing: 0.5,
  },
  dropdownSectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  dropdownSectionDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 16,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dropdownItemApproved: {
    backgroundColor: "#f8fff8",
  },
  dropdownItemPending: {
    backgroundColor: "#fffbf0",
  },
  dropdownItemRejected: {
    backgroundColor: "#fff5f5",
  },
  dropdownItemDisabled: {
    opacity: 0.7,
  },
  itemIcon: {
    marginRight: 10,
  },
  hostelItemInfo: {
    flex: 1,
  },
  hostelItemDetails: {
    marginTop: 2,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.heading,
  },
  dropdownItemTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  dropdownItemTextDisabled: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  hostelItemType: {
    fontSize: 11,
    color: COLORS.subtitle,
  },
  hostelItemTypeSelected: {
    color: "#fff",
    opacity: 0.9,
  },
  rejectionReason: {
    fontSize: 10,
    color: COLORS.error,
    fontStyle: "italic",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.heading,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 10,
  },
  iconCard: {
    width: (width - 64) / 3, // 3 per row
    alignItems: "center",
    marginBottom: 16,
  },
  iconCardDisabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f6f6f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircleDisabled: {
    backgroundColor: "#f0f0f0",
    shadowOpacity: 0.1,
  },
  iconImage: { width: 38, height: 38, resizeMode: "contain" },
  iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },
  iconLabelDisabled: { color: "#999" },

  descriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D0E8FF",
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    minWidth: width * 0.45,
    height: 120,
  },
  descriptionCardDisabled: {
    backgroundColor: "#f0f0f0",
  },
  descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
  descTextContainer: { flex: 1 },
  descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
  descTitleDisabled: { color: "#999" },
  descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },
  descTextDisabled: { color: "#999" },

  iconGridSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  iconCardSmall: {
    width: width / 5,
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleSmall: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#fff",
    borderWidth: 1.2,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  iconImageSmall: { width: 35, height: 35, resizeMode: "contain" },
  iconLabelSmall: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
    textAlign: "center",
  },

  aboutCard: {
    backgroundColor: "#E8F5E8",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },

  helpCard: {
    backgroundColor: "#FFF9E6",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  helpButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  helpGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  helpButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  manageButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    overflow: "hidden"
  },
  manageButtonDisabled: {
    opacity: 0.7,
  },
  manageGradient: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center"
  },
  manageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalOverlayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalIconWrapper: {
    backgroundColor: "#FFF9C4",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  modalIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.heading,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 120,
  },
  modalCloseText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },

  // Subscription Modal Styles
  subscriptionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  subscriptionModalOverlayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  subscriptionModalContent: {
    width: width - 32,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  subscriptionHeader: {
    backgroundColor: "#4A148C",
    padding: 24,
    alignItems: "center",
  },
  subscriptionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  reminderTimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  reminderTimerText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "600",
    marginLeft: 6,
  },
  plansScrollView: {
    maxHeight: 400,
  },
  plansContainer: {
    padding: 20,
  },
  subscriptionPlanCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    padding: 20,
    marginBottom: 16,
    position: "relative",
  },
  subscriptionPlanCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#E8F5E8",
  },
  subscriptionPlanCardPopular: {
    borderColor: "#FFD700",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.heading,
    marginBottom: 4,
  },
  planNameSelected: {
    color: COLORS.primary,
  },
  planDuration: {
    fontSize: 14,
    color: COLORS.subtitle,
  },
  planDurationSelected: {
    color: COLORS.primary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.heading,
    marginHorizontal: 2,
  },
  planPriceSelected: {
    color: COLORS.primary,
  },
  priceSuffix: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.subtitle,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  featureTextSelected: {
    color: COLORS.heading,
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.heading,
  },
  selectButtonTextSelected: {
    color: "#fff",
  },
  subscriptionFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  skipButtonText: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontWeight: "600",
  },
  manageSubscriptionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 12,
  },
  manageSubscriptionButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 14,
  },
});