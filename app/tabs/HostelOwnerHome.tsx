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
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import * as Location from "expo-location";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import SideNav from "../../components/SideNav";
// import { useAppSelector } from "@/hooks/hooks";

// const { width, height } = Dimensions.get("window");

// const COLORS = {
//   primary: "#00C72F",
//   accent: "#FFD700", // Yellow color
//   text: "#222",
//   background: "#FFFFFF",
//   cardShadow: "#00000010",
//   heading: "#000000",
//   subtitle: "#555555",
// };

// export default function HostelHome() {
//   const router = useRouter();
//   const [locationName, setLocationName] = useState<string | null>(null);
//   const [locationStatus, setLocationStatus] = useState("pending");
//   const [drawerVisible, setDrawerVisible] = useState(false);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<any>(null);
//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const { loading, error, token,userId } = useAppSelector((state) => state.auth);
//   console.log("userId",userId);
  

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

//   const checkHostelData = async () => {
//     const data = {
//       images: ["img1", "img2"],
//       videos: ["video1"],
//       location: "Some Location",
//       pricing: { roomA: 5000, roomB: 6500, roomC: 8000 },
//       rooms: [{ type: "A", price: 5000 }, { type: "B", price: 6500 }],
//     };

//     if (
//       data.images &&
//       data.images.length > 0 &&
//       data.videos &&
//       data.videos.length > 0 &&
//       data.location &&
//       data.pricing &&
//       data.rooms &&
//       data.rooms.length > 0
//     ) {
//       return true;
//     }
//     return false;
//   };

//   const handleManageHostels = async () => {
//     const isDataReady = await checkHostelData();
//     if (isDataReady) {
//       router.push("/HostelDetails");
//     } else {
//       alert(
//         "Please upload all images, videos, location, pricing, and room details before managing the hostel."
//       );
//     }
//   };

//   // Updated rooms data with sharing types and white background
//   const rooms = [
//     { 
//       type: "Single Sharing", 
//       price: "₹8000/month",
//       capacity: "1 Person",
//       icon: require("../../assets/icons/single-room.png"),
//     },
//     { 
//       type: "Two Sharing", 
//       price: "₹6500/month",
//       capacity: "2 Persons", 
//       icon: require("../../assets/icons/double-room.png"),
//     },
//     { 
//       type: "Three Sharing", 
//       price: "₹5000/month",
//       capacity: "3 Persons",
//       icon: require("../../assets/icons/triple-room.jpg"),
//     },
//     { 
//       type: "Four Sharing", 
//       price: "₹4000/month",
//       capacity: "4 Persons",
//       icon: require("../../assets/icons/four-sharing.jpg"),
//     },
//   ];

//   const recentBookings = [
//     { guest: "John Doe", room: "Single Sharing", date: "Oct 12 - Oct 15" },
//     { guest: "Alice Smith", room: "Two Sharing", date: "Oct 10 - Oct 12" },
//     { guest: "Bob Johnson", room: "Three Sharing", date: "Oct 5 - Oct 8" },
//   ];

//   const announcements = [
//     { text: "New feature: Bulk upload images via CSV now live!" },
//     { text: "HostelFest promo: 20% off on all bookings until Oct 31." },
//   ];

//   const statistics = [
//     { label: "Bookings This Month", value: "45" },
//     { label: "Occupancy Rate", value: "78%" },
//     { label: "Total Earnings", value: "₹1,25,000" },
//   ];

//   const handleBannerScroll = (event: any) => {
//     const contentOffset = event.nativeEvent.contentOffset;
//     const viewSize = event.nativeEvent.layoutMeasurement;
//     const pageNum = Math.floor(contentOffset.x / viewSize.width);
//     setCurrentBannerIndex(pageNum);
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
//           <Text style={styles.welcomeText}>Welcome back, Owner 👋</Text>
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

//         {/* Updated Banner Carousel */}
//         <View style={styles.bannerSection}>
//           <FlatList
//             ref={bannerScrollRef}
//             data={banners}
//             renderItem={renderBannerItem}
//             keyExtractor={(_, index) => `banner-${index}`}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onScroll={handleBannerScroll}
//             scrollEventThrottle={16}
//             getItemLayout={(_, index) => ({
//               length: width,
//               offset: width * index,
//               index,
//             })}
//           />
//           {renderPaginationDots()}
//         </View>

//         {/* Quick Actions */}
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.iconGrid}>
//           {quickActions.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.iconCard}
//               activeOpacity={0.8}
//               onPress={() => router.push(item.route as any)}
//             >
//               <View style={styles.iconCircle}>
//                 <Image source={item.icon} style={styles.iconImage} />
//               </View>
//               <Text style={styles.iconLabel}>{item.label}</Text>
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
//             <View style={styles.descriptionCard}>
//               <Image
//                 source={
//                   index === 0
//                     ? require("../../assets/icons/upload_alt.png")
//                     : index === 1
//                     ? require("../../assets/icons/price_alt.png")
//                     : index === 2
//                     ? require("../../assets/icons/rooms_alt.png")
//                     : index === 3
//                     ? require("../../assets/icons/facilities_alt.png")
//                     : require("../../assets/icons/summary_alt.png")
//                 }
//                 style={styles.descIcon}
//               />
//               <View style={styles.descTextContainer}>
//                 <Text style={styles.descTitle}>{item.label}</Text>
//                 <Text style={styles.descText}>{item.description}</Text>
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

//         {/* Updated Rooms as Cards with smaller size and white background */}
//         <Text style={styles.sectionTitle}>Available Rooms</Text>
//         <View style={styles.roomsContainer}>
//           {rooms.map((room, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.roomCard}
//               activeOpacity={0.8}
//               onPress={() => router.push("/Rooms")}
//             >
//               <Image source={room.icon} style={styles.roomIcon} />
//               <Text style={styles.roomType}>{room.type}</Text>
//               <Text style={styles.roomCapacity}>{room.capacity}</Text>
//               <Text style={styles.roomPrice}>{room.price}</Text>
//               <View style={styles.roomBadge}>
//                 <Text style={styles.roomBadgeText}>Available</Text>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Recent Bookings */}
//         <Text style={styles.sectionTitle}>Recent Bookings</Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ paddingLeft: 16, marginBottom: 16 }}
//         >
//           {recentBookings.map((booking, index) => (
//             <View key={index} style={styles.bookingCard}>
//               <Text style={styles.bookingGuest}>{booking.guest}</Text>
//               <Text style={styles.bookingRoom}>{booking.room}</Text>
//               <Text style={styles.bookingDate}>{booking.date}</Text>
//             </View>
//           ))}
//         </ScrollView>

//         {/* Tips & Announcements */}
//         <Text style={styles.sectionTitle}>Tips & Announcements</Text>
//         <View style={styles.announcementContainer}>
//           {announcements.map((item, index) => (
//             <View key={index} style={styles.announcementCard}>
//               <Text style={styles.announcementText}>{item.text}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Statistics Summary */}
//         <Text style={styles.sectionTitle}>Statistics</Text>
//         <View style={styles.statisticsRow}>
//           {statistics.map((stat, index) => (
//             <View key={index} style={styles.statisticsCard}>
//               <Text style={styles.statisticsValue}>{stat.value}</Text>
//               <Text style={styles.statisticsLabel}>{stat.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Manage Hostels Button */}
//         <TouchableOpacity style={styles.manageButton} onPress={handleManageHostels}>
//           <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.manageGradient}>
//             <Text style={styles.manageText}>Manage Hostels</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Updated SideNav with proper navigation */}
//       <SideNav 
//         visible={drawerVisible} 
//         onClose={() => setDrawerVisible(false)}
//         currentRoute="/HostelHome"
//         onNavigate={(route) => {
//           setDrawerVisible(false);
//           router.push(route as any);
//         }}
//       />

//       {/* Updated Modal Popup */}
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
//             <TouchableOpacity 
//               activeOpacity={1} 
//               onPress={(e) => e.stopPropagation()}
//             >
//               <Animated.View 
//                 style={[
//                   styles.modalContent, 
//                   { transform: [{ scale: scaleAnim }] }
//                 ]}
//               >
//                 <View style={styles.modalIconWrapper}>
//                   {selectedOffer && (
//                     <Image 
//                       source={selectedOffer.icon} 
//                       style={[
//                         styles.modalIcon,
//                         { tintColor: COLORS.accent }
//                       ]} 
//                     />
//                   )}
//                 </View>
//                 <Text style={styles.modalTitle}>{selectedOffer?.label}</Text>
//                 <Text style={styles.modalDescription}>{selectedOffer?.description}</Text>
//                 <TouchableOpacity 
//                   onPress={closeModal} 
//                   style={[
//                     styles.modalCloseButton,
//                     { backgroundColor: COLORS.accent }
//                   ]}
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
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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

//   welcomeContainer: { paddingHorizontal: 16, marginTop: 12 },
//   welcomeText: { fontSize: 20, fontWeight: "700", color: COLORS.heading },
//   subText: { fontSize: 13, color: COLORS.subtitle, marginTop: 4 },

//   locationSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginVertical: 10,
//   },
//   locationText: { fontSize: 13, color: COLORS.subtitle, marginLeft: 6 },

//   // Updated Banner Styles
//   bannerSection: {
//     marginVertical: 10,
//     position: 'relative',
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
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
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
//     backgroundColor: '#ccc',
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.heading,
//     marginTop: 16,
//     marginBottom: 10,
//     paddingHorizontal: 16,
//   },

//   iconGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
//   iconCard: { width: width / 5, alignItems: "center" },
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
//   iconImage: { width: 38, height: 38, resizeMode: "contain" },
//   iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },

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
//   descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
//   descTextContainer: { flex: 1 },
//   descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
//   descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },

//   iconGridSmall: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
//   iconCardSmall: { width: width / 5, alignItems: "center" },
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
//   iconLabelSmall: { fontSize: 12, color: COLORS.subtitle, marginTop: 4 },

//   // Updated Rooms Container Styles - Smaller cards with white background
//   roomsContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginHorizontal: 16,
//     gap: 10,
//   },
//   roomCard: {
//     width: (width - 52) / 2, // Smaller width
//     backgroundColor: "#FFFFFF", // White background
//     borderRadius: 12,
//     padding: 12, // Reduced padding
//     marginBottom: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//     position: 'relative',
//   },
//   roomIcon: {
//     width: 40, // Smaller icon
//     height: 40,
//     marginBottom: 8,
//     resizeMode: "contain",
//   },
//   roomType: {
//     fontSize: 13, // Smaller font
//     fontWeight: "700",
//     color: COLORS.heading,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   roomCapacity: {
//     fontSize: 11, // Smaller font
//     color: COLORS.subtitle,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   roomPrice: {
//     fontSize: 12, // Smaller font
//     fontWeight: "600",
//     color: COLORS.primary,
//     marginBottom: 6,
//   },
//   roomBadge: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },
//   roomBadgeText: {
//     color: '#fff',
//     fontSize: 9, // Smaller font
//     fontWeight: '600',
//   },

//   manageButton: { marginHorizontal: 16, marginVertical: 24, borderRadius: 12, overflow: "hidden" },
//   manageGradient: { paddingVertical: 14, justifyContent: "center", alignItems: "center" },
//   manageText: { color: "#fff", fontSize: 16, fontWeight: "700" },

//   // Modal Styles
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

//   bookingCard: {
//     backgroundColor: "#e6f2ff",
//     borderRadius: 12,
//     padding: 12,
//     marginRight: 12,
//     width: 160,
//   },
//   bookingGuest: { fontSize: 14, fontWeight: "700", color: COLORS.heading },
//   bookingRoom: { fontSize: 13, color: COLORS.subtitle, marginVertical: 4 },
//   bookingDate: { fontSize: 12, color: COLORS.subtitle },

//   announcementContainer: { paddingHorizontal: 16, marginBottom: 16 },
//   announcementCard: {
//     backgroundColor: "#fff4e6",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//   },
//   announcementText: { fontSize: 14, color: "#774d00" },

//   statisticsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginBottom: 24,
//   },
//   statisticsCard: {
//     alignItems: "center",
//     backgroundColor: "#e6ffe6",
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 12,
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   statisticsValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.primary,
//   },
//   statisticsLabel: {
//     fontSize: 13,
//     color: COLORS.subtitle,
//     marginTop: 4,
//     textAlign: "center",
//   },
// });


//------------------------------------------------------------------------------------------------------------

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
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import * as Location from "expo-location";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import SideNav from "../../components/SideNav";
// import { useAppSelector } from "@/hooks/hooks";

// const { width } = Dimensions.get("window");

// const COLORS = {
//   primary: "#00C72F", // Green
//   accent: "#FFD700", // Yellow
//   text: "#222",
//   background: "#FFFFFF",
//   cardShadow: "#00000010",
//   heading: "#000000",
//   subtitle: "#555555",
// };

// export default function HostelHome() {
//   const router = useRouter();
//   const [locationName, setLocationName] = useState<string | null>(null);
//   const [locationStatus, setLocationStatus] = useState("pending");
//   const [drawerVisible, setDrawerVisible] = useState(false);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<any>(null);
//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const { loading, error, token, userId } = useAppSelector((state) => state.auth);
//   console.log("userId", userId);

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

//   const checkHostelData = async () => {
//     const data = {
//       images: ["img1", "img2"],
//       videos: ["video1"],
//       location: "Some Location",
//       pricing: { roomA: 5000, roomB: 6500, roomC: 8000 },
//       rooms: [{ type: "A", price: 5000 }, { type: "B", price: 6500 }],
//     };

//     if (
//       data.images &&
//       data.images.length > 0 &&
//       data.videos &&
//       data.videos.length > 0 &&
//       data.location &&
//       data.pricing &&
//       data.rooms &&
//       data.rooms.length > 0
//     ) {
//       return true;
//     }
//     return false;
//   };

//   const handleManageHostels = async () => {
//     const isDataReady = await checkHostelData();
//     if (isDataReady) {
//       router.push("/HostelDetails");
//     } else {
//       alert(
//         "Please upload all images, videos, location, pricing, and room details before managing the hostel."
//       );
//     }
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
//           <Text style={styles.welcomeText}>Welcome back, Owner 👋</Text>
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

//         {/* Quick Actions (3 per row) */}
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.iconGrid}>
//           {quickActions.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.iconCard}
//               activeOpacity={0.8}
//               onPress={() => router.push(item.route as any)}
//             >
//               <View style={styles.iconCircle}>
//                 <Image source={item.icon} style={styles.iconImage} />
//               </View>
//               <Text style={styles.iconLabel}>{item.label}</Text>
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
//             <View style={styles.descriptionCard}>
//               <Image
//                 source={
//                   index === 0
//                     ? require("../../assets/icons/upload_alt.png")
//                     : index === 1
//                     ? require("../../assets/icons/price_alt.png")
//                     : index === 2
//                     ? require("../../assets/icons/rooms_alt.png")
//                     : index === 3
//                     ? require("../../assets/icons/facilities_alt.png")
//                     : index === 4
//                     ? require("../../assets/icons/summary_alt.png")
//                     : require("../../assets/icons/bank_alt.png")
//                 }
//                 style={styles.descIcon}
//               />
//               <View style={styles.descTextContainer}>
//                 <Text style={styles.descTitle}>{item.label}</Text>
//                 <Text style={styles.descText}>{item.description}</Text>
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
//             Hostel Owner App is your complete platform for managing hostels efficiently. Easily update your hostel details, pricing, rooms, and facilities.
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
//             <Text style={styles.helpText}>+91 98765 43210</Text>
//           </View>
//           <View style={styles.helpItem}>
//             <Icon name="email" size={20} color={COLORS.primary} />
//             <Text style={styles.helpText}>support@hostelapp.com</Text>
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
//         <TouchableOpacity style={styles.manageButton} onPress={handleManageHostels}>
//           <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.manageGradient}>
//             <Text style={styles.manageText}>Manage Hostels</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Side navigation drawer */}
//       <SideNav
//         visible={drawerVisible}
//         onClose={() => setDrawerVisible(false)}
//         currentRoute="/HostelHome"
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
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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

//   welcomeContainer: { paddingHorizontal: 16, marginTop: 12 },
//   welcomeText: { fontSize: 20, fontWeight: "700", color: COLORS.heading },
//   subText: { fontSize: 13, color: COLORS.subtitle, marginTop: 4 },

//   locationSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginVertical: 10,
//   },
//   locationText: { fontSize: 13, color: COLORS.subtitle, marginLeft: 6 },

//   bannerSection: {
//     marginVertical: 10,
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
//   iconImage: { width: 38, height: 38, resizeMode: "contain" },
//   iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },

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
//   descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
//   descTextContainer: { flex: 1 },
//   descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
//   descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },

//   iconGridSmall: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
//   iconCardSmall: { width: width / 5, alignItems: "center" },
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
//   iconLabelSmall: { fontSize: 12, color: COLORS.subtitle, marginTop: 4 },

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

//   manageButton: { marginHorizontal: 16, marginVertical: 24, borderRadius: 12, overflow: "hidden" },
//   manageGradient: { paddingVertical: 14, justifyContent: "center", alignItems: "center" },
//   manageText: { color: "#fff", fontSize: 16, fontWeight: "700" },

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


//------------------------------------------------------------------------------------------------------------


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
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import * as Location from "expo-location";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import SideNav from "../../components/SideNav";
// import { useAppSelector } from "@/hooks/hooks";

// const { width } = Dimensions.get("window");

// const COLORS = {
//   primary: "#00C72F", // Green
//   accent: "#FFD700", // Yellow
//   text: "#222",
//   background: "#FFFFFF",
//   cardShadow: "#00000010",
//   heading: "#000000",
//   subtitle: "#555555",
// };

// export default function HostelHome() {
//   const router = useRouter();
//   const [locationName, setLocationName] = useState<string | null>(null);
//   const [locationStatus, setLocationStatus] = useState("pending");
//   const [drawerVisible, setDrawerVisible] = useState(false);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<any>(null);
//   const scaleAnim = useRef(new Animated.Value(0)).current;

//   const { loading, error, token, userId } = useAppSelector((state) => state.auth);
//   console.log("userId", userId);

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

//   const checkHostelData = async () => {
//     const data = {
//       images: ["img1", "img2"],
//       videos: ["video1"],
//       location: "Some Location",
//       pricing: { roomA: 5000, roomB: 6500, roomC: 8000 },
//       rooms: [{ type: "A", price: 5000 }, { type: "B", price: 6500 }],
//     };

//     if (
//       data.images &&
//       data.images.length > 0 &&
//       data.videos &&
//       data.videos.length > 0 &&
//       data.location &&
//       data.pricing &&
//       data.rooms &&
//       data.rooms.length > 0
//     ) {
//       return true;
//     }
//     return false;
//   };

//   const handleManageHostels = async () => {
//     const isDataReady = await checkHostelData();
//     if (isDataReady) {
//       router.push("/HostelDetails");
//     } else {
//       alert(
//         "Please upload all images, videos, location, pricing, and room details before managing the hostel."
//       );
//     }
//   };

//   const handleSubmitQuickActions = () => {
//     alert("Quick Actions submitted! (You can customize this action)");
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
//           <Text style={styles.welcomeText}>Welcome back, Owner 👋</Text>
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

//         {/* Quick Actions (3 per row) */}
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.iconGrid}>
//           {quickActions.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.iconCard}
//               activeOpacity={0.8}
//               onPress={() => router.push(item.route as any)}
//             >
//               <View style={styles.iconCircle}>
//                 <Image source={item.icon} style={styles.iconImage} />
//               </View>
//               <Text style={styles.iconLabel}>{item.label}</Text>
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
//             <View style={styles.descriptionCard}>
//               <Image
//                 source={
//                   index === 0
//                     ? require("../../assets/icons/upload_alt.png")
//                     : index === 1
//                     ? require("../../assets/icons/price_alt.png")
//                     : index === 2
//                     ? require("../../assets/icons/rooms_alt.png")
//                     : index === 3
//                     ? require("../../assets/icons/facilities_alt.png")
//                     : index === 4
//                     ? require("../../assets/icons/summary_alt.png")
//                     : require("../../assets/icons/bank_alt.png")
//                 }
//                 style={styles.descIcon}
//               />
//               <View style={styles.descTextContainer}>
//                 <Text style={styles.descTitle}>{item.label}</Text>
//                 <Text style={styles.descText}>{item.description}</Text>
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
// Manage your hostel operations effortlessly with Fyndom Partner App. Instantly edit hostel details, pricing, room availability, and amenities — all in one simple platform.
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
//         <TouchableOpacity style={styles.manageButton} onPress={handleManageHostels}>
//           <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.manageGradient}>
//             <Text style={styles.manageText}>Manage Hostels</Text>
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
//     paddingTop: Platform.OS === "android" ? 24 : 12, // Adjusted slightly up from 40/20
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

//   welcomeContainer: { paddingHorizontal: 16, marginTop: 12 },
//   welcomeText: { fontSize: 20, fontWeight: "700", color: COLORS.heading },
//   subText: { fontSize: 13, color: COLORS.subtitle, marginTop: 4 },

//   locationSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginVertical: 10,
//   },
//   locationText: { fontSize: 13, color: COLORS.subtitle, marginLeft: 6 },

//   bannerSection: {
//     marginVertical: 10,
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
//   iconImage: { width: 38, height: 38, resizeMode: "contain" },
//   iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },

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
//   descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
//   descTextContainer: { flex: 1 },
//   descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
//   descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },

//   // Submit button styles
//   submitButton: {
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 12,
//     overflow: "hidden",
//     alignSelf: "center",
//     width: width * 0.5,
//   },
//   submitGradient: {
//     paddingVertical: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   submitText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   iconGridSmall: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
//   iconCardSmall: { width: width / 5, alignItems: "center" },
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
//   iconLabelSmall: { fontSize: 12, color: COLORS.subtitle, marginTop: 4 },

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

//   manageButton: { marginHorizontal: 16, marginVertical: 24, borderRadius: 12, overflow: "hidden" },
//   manageGradient: { paddingVertical: 14, justifyContent: "center", alignItems: "center" },
//   manageText: { color: "#fff", fontSize: 16, fontWeight: "700" },

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
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import SideNav from "../../components/SideNav";
import { useAppSelector } from "@/hooks/hooks";
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
};

// Define types for hostel data
interface HostelData {
  id: string;
  name: string;
  images: string[];
  videos: string[];
  location: string;
  pricing: any;
  rooms: any[];
  facilities: any[];
  summary: string;
  bankDetails: any;
  createdAt: string;
  isActive: boolean;
}

export default function HostelHome() {
  const router = useRouter();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState("pending");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [addHostelModalVisible, setAddHostelModalVisible] = useState(false);
  const [newHostelName, setNewHostelName] = useState("");
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const { loading, error, token, userId } = useAppSelector((state) => state.auth);
  console.log("userId", userId);

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

  // Load hostels on component mount
  useEffect(() => {
    loadHostels();
  }, []);

  const loadHostels = async () => {
    setLoadingHostels(true);
    try {
      const savedHostels = await AsyncStorage.getItem(`hostels_${userId}`);
      if (savedHostels) {
        const parsedHostels = JSON.parse(savedHostels);
        setHostels(parsedHostels);
        // Set the first hostel as selected by default
        if (parsedHostels.length > 0) {
          setSelectedHostelId(parsedHostels[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading hostels:", error);
    } finally {
      setLoadingHostels(false);
    }
  };

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

  const handleAddHostel = () => {
    setAddHostelModalVisible(true);
  };

  const handleSaveHostelName = async () => {
    if (!newHostelName.trim()) {
      Alert.alert("Error", "Please enter a hostel name");
      return;
    }

    const newHostel: HostelData = {
      id: Date.now().toString(),
      name: newHostelName.trim(),
      images: [],
      videos: [],
      location: "",
      pricing: {},
      rooms: [],
      facilities: [],
      summary: "",
      bankDetails: null,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    try {
      const updatedHostels = [...hostels, newHostel];
      await AsyncStorage.setItem(`hostels_${userId}`, JSON.stringify(updatedHostels));
      setHostels(updatedHostels);
      setSelectedHostelId(newHostel.id);
      setNewHostelName("");
      setAddHostelModalVisible(false);
      Alert.alert("Success", "Hostel added successfully!");
    } catch (error) {
      console.error("Error saving hostel:", error);
      Alert.alert("Error", "Failed to save hostel. Please try again.");
    }
  };

  const handleSelectHostel = (hostelId: string) => {
    setSelectedHostelId(hostelId);
    setShowHostelDropdown(false);
  };

  const checkHostelData = async (hostelId: string) => {
    const hostel = hostels.find(h => h.id === hostelId);
    if (!hostel) return false;

    return (
      hostel.images &&
      hostel.images.length > 0 &&
      hostel.videos &&
      hostel.videos.length > 0 &&
      hostel.location &&
      hostel.pricing &&
      Object.keys(hostel.pricing).length > 0 &&
      hostel.rooms &&
      hostel.rooms.length > 0 &&
      hostel.facilities &&
      hostel.facilities.length > 0 &&
      hostel.summary &&
      hostel.bankDetails
    );
  };

  const handleManageHostels = async () => {
    if (!selectedHostelId) {
      Alert.alert(
        "No Hostel Selected",
        "Please add or select a hostel first",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Hostel", onPress: handleAddHostel }
        ]
      );
      return;
    }

    const isDataReady = await checkHostelData(selectedHostelId);
    if (isDataReady) {
      const selectedHostel = hostels.find(h => h.id === selectedHostelId);
      router.push({
        pathname: "/HostelDetails",
        params: { hostelId: selectedHostelId, hostelName: selectedHostel?.name }
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
        "Please add or select a hostel to continue",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Hostel", onPress: handleAddHostel }
        ]
      );
      return;
    }

    const selectedHostel = hostels.find(h => h.id === selectedHostelId);
    router.push({
      pathname: route,
      params: { 
        hostelId: selectedHostelId, 
        hostelName: selectedHostel?.name 
      }
    });
  };

  const handleSubmitQuickActions = () => {
    alert("Quick Actions submitted! (You can customize this action)");
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

  const selectedHostel = hostels.find(h => h.id === selectedHostelId);

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
            <TouchableOpacity onPress={() => router.push("/Notifications")}>
              <Icon name="bell-outline" size={26} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/Profile")}>
              <Icon name="account-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome & Hostel Selector */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>Welcome back, Owner 👋</Text>
            <TouchableOpacity 
              style={styles.addHostelButtonSmall}
              onPress={handleAddHostel}
            >
              <Icon name="plus" size={16} color={COLORS.primary} />
              <Text style={styles.addHostelTextSmall}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>Connected Owner App</Text>
          
          {/* Compact Hostel Selector */}
          {loadingHostels ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingIndicator} />
          ) : hostels.length > 0 ? (
            <View style={styles.hostelSelectorContainer}>
              <TouchableOpacity 
                style={styles.hostelSelector}
                onPress={() => setShowHostelDropdown(!showHostelDropdown)}
                activeOpacity={0.7}
              >
                <View style={styles.hostelSelectorContent}>
                  <Icon name="home" size={18} color={COLORS.primary} />
                  <Text style={styles.selectedHostelName} numberOfLines={1}>
                    {selectedHostel?.name || "Select Hostel"}
                  </Text>
                  <Icon 
                    name={showHostelDropdown ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={COLORS.primary} 
                  />
                </View>
              </TouchableOpacity>
              
              {/* Dropdown */}
              {showHostelDropdown && (
                <View style={styles.hostelDropdown}>
                  {hostels.map((hostel) => (
                    <TouchableOpacity
                      key={hostel.id}
                      style={[
                        styles.hostelDropdownItem,
                        selectedHostelId === hostel.id && styles.hostelDropdownItemSelected
                      ]}
                      onPress={() => handleSelectHostel(hostel.id)}
                    >
                      <Icon 
                        name="home" 
                        size={16} 
                        color={selectedHostelId === hostel.id ? "#fff" : COLORS.primary} 
                      />
                      <Text 
                        style={[
                          styles.hostelDropdownText,
                          selectedHostelId === hostel.id && styles.hostelDropdownTextSelected
                        ]}
                        numberOfLines={1}
                      >
                        {hostel.name}
                      </Text>
                      {selectedHostelId === hostel.id && (
                        <Icon name="check" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.noHostelCardCompact}
              onPress={handleAddHostel}
            >
              <View style={styles.noHostelContent}>
                <Icon name="home-plus" size={20} color={COLORS.primary} />
                <Text style={styles.noHostelTextCompact}>Add your first hostel</Text>
              </View>
              <Icon name="chevron-right" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
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

        {/* Quick Actions (3 per row) */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.iconGrid}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconCard}
              activeOpacity={0.8}
              onPress={() => handleQuickActionPress(item.route)}
            >
              <View style={styles.iconCircle}>
                <Image source={item.icon} style={styles.iconImage} />
              </View>
              <Text style={styles.iconLabel}>{item.label}</Text>
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
            <View style={styles.descriptionCard}>
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
                style={styles.descIcon}
              />
              <View style={styles.descTextContainer}>
                <Text style={styles.descTitle}>{item.label}</Text>
                <Text style={styles.descText}>{item.description}</Text>
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
        <TouchableOpacity style={styles.manageButton} onPress={handleManageHostels}>
          <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.manageGradient}>
            <Text style={styles.manageText}>Manage Hostels</Text>
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

      {/* Add Hostel Modal */}
      <Modal
        visible={addHostelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddHostelModalVisible(false)}
      >
        <View style={styles.addHostelModalOverlay}>
          <View style={styles.addHostelModalContent}>
            <Text style={styles.addHostelModalTitle}>Add New Hostel</Text>
            <Text style={styles.addHostelModalSubtitle}>
              Enter a name for your hostel. You can add multiple hostels and switch between them.
            </Text>
            
            <TextInput
              style={styles.hostelNameInput}
              placeholder="Enter hostel name (e.g., Green Valley Hostel)"
              placeholderTextColor="#999"
              value={newHostelName}
              onChangeText={setNewHostelName}
              autoFocus
            />
            
            <View style={styles.addHostelModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAddHostelModalVisible(false);
                  setNewHostelName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveHostelName}
              >
                <LinearGradient colors={[COLORS.primary, "#02b828"]} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>Add Hostel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  addHostelButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: 8,
  },
  addHostelTextSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  subText: { 
    fontSize: 13, 
    color: COLORS.subtitle, 
    marginBottom: 12,
  },

  hostelSelectorContainer: {
    position: "relative",
    zIndex: 100,
    marginTop: 4,
  },
  hostelSelector: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hostelSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedHostelName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.heading,
    flex: 1,
    marginHorizontal: 10,
  },
  hostelDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
    zIndex: 1000,
  },
  hostelDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  hostelDropdownItemSelected: {
    backgroundColor: COLORS.primary,
  },
  hostelDropdownText: {
    fontSize: 14,
    color: COLORS.heading,
    flex: 1,
    marginLeft: 10,
  },
  hostelDropdownTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  noHostelCardCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  noHostelContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  noHostelTextCompact: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.heading,
    marginLeft: 8,
  },
  loadingIndicator: {
    marginVertical: 10,
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
  iconImage: { width: 38, height: 38, resizeMode: "contain" },
  iconLabel: { fontSize: 13, fontWeight: "600", color: COLORS.subtitle, marginTop: 4 },

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
  descIcon: { width: 45, height: 45, resizeMode: "contain", marginRight: 14 },
  descTextContainer: { flex: 1 },
  descTitle: { fontSize: 16, fontWeight: "700", color: COLORS.heading, marginBottom: 6 },
  descText: { fontSize: 13, color: COLORS.subtitle, lineHeight: 18 },

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

  // Add Hostel Modal Styles
  addHostelModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addHostelModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  addHostelModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.heading,
    marginBottom: 8,
    textAlign: "center",
  },
  addHostelModalSubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  hostelNameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: "#f9f9f9",
  },
  addHostelModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    textAlign: "center",
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});