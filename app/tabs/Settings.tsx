// // app/(tabs)/Settings.tsx
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import { goBack } from "../../utils/navigationHistory";
// import React, { useState } from "react";
// import {
//   Alert,
//   Dimensions,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   StatusBar,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
// import { logout } from "../../app/reduxStore/reduxSlices/authSlice";
// import ApiClient from "../../app/api/ApiClient";

// const { width, height } = Dimensions.get("window");
// const scale = (size: number) => (width / 375) * size;
// const verticalScale = (size: number) => (height / 812) * size;

// const COLORS = {
//   kellyGreen: "#4CBB17",
//   yellow: "#FFD700",
//   headerBackground: "#ffffffff",
//   headerText: "#FFD700",
//   cardBorder: "rgba(76,187,23,0.2)",
//   modalOverlay: "rgba(0,0,0,0.5)",
//   inputBorder: "#ccc",
//   danger: "#ff4d6d",
// };

// const SHADOW = {
//   shadowColor: COLORS.kellyGreen,
//   shadowOffset: { width: 0, height: 6 },
//   shadowOpacity: 0.12,
//   shadowRadius: 12,
//   elevation: 6,
// };

// export default function SettingsScreen() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { user } = useAppSelector((state) => state.auth);

//   const [notifications, setNotifications] = useState(true);
//   const [activeModal, setActiveModal] = useState<string | null>(null);
//   const [changingPassword, setChangingPassword] = useState(false);

//   // Change Password states
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleLogout = () => {
//     Alert.alert("Logout", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: () => {
//           dispatch(logout());
//           router.replace("/HostelOwnerLogin");
//         },
//       },
//     ]);
//   };

//   const resetPasswordFields = () => {
//     setOldPassword("");
//     setNewPassword("");
//     setConfirmPassword("");
//   };

//   const savePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       Alert.alert("Error", "Please fill in all password fields.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert("Error", "New password and confirmation do not match.");
//       return;
//     }

//     if (newPassword.length < 6) {
//       Alert.alert("Error", "Password must be at least 6 characters long.");
//       return;
//     }

//     try {
//       setChangingPassword(true);

//       const response = await ApiClient.put(
//         "/hostel-owner/change-password",
//         {
//           oldPassword,
//           newPassword,
//           confirmPassword,
//         }
//       );

//       if (response.success) {
//         Alert.alert(
//           "Success",
//           "Password changed successfully. Please login again.",
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 resetPasswordFields();
//                 setActiveModal(null);

//                 // 🔐 Logout after password change (SECURITY)
//                 dispatch(logout());
//                 router.replace("/HostelOwnerLogin");
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert("Error", response.message || "Failed to change password");
//       }
//     } catch (error: any) {
//       console.error("Change password error:", error);

//       Alert.alert(
//         "Error",
//         error.response?.data?.message || "Something went wrong"
//       );
//     } finally {
//       setChangingPassword(false);
//     }
//   };


//   const renderModal = (key: string, title: string, content: React.ReactNode) => (
//     <Modal visible={activeModal === key} animationType="slide" transparent={true}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={styles.modalOverlay}
//       >
//         <View style={styles.modalContent}>
//           <Text style={styles.modalHeader}>{title}</Text>
//           <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView>
//           <TouchableOpacity
//             style={styles.closeBtn}
//             onPress={() => {
//               if (key === "changePassword") resetPasswordFields();
//               setActiveModal(null);
//             }}
//           >
//             <Text style={styles.closeText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBackground} translucent={false} />
//       <LinearGradient colors={["#ffffff", "#ffffff"]} style={StyleSheet.absoluteFill} />

//       {/* Header */}
//       <View style={styles.headerBar}>
//         <TouchableOpacity onPress={() => goBack(router)} style={styles.headerButton}>
//           <Ionicons name="arrow-back" size={24} color={COLORS.yellow} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Settings</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ paddingBottom: verticalScale(40), paddingHorizontal: scale(12) }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* User Info */}
//         <View style={styles.userSection}>
//           <Ionicons name="person-circle" size={60} color={COLORS.kellyGreen} />
//           <View style={styles.userInfo}>
//             <Text style={styles.userName}>{user?.fullName || "Hostel Owner"}</Text>
//             <Text style={styles.userEmail}>{user?.email || "owner@email.com"}</Text>
//             <Text style={styles.userRole}>{user?.role ? `Role: ${user.role}` : "Hostel Owner"}</Text>
//           </View>
//         </View>

//         {/* Account */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account</Text>

//           {/* 🔥 Redirect to Profile Page */}
//           <TouchableOpacity style={styles.row} onPress={() => router.push("/Profile")}>
//             <Ionicons name="person-circle" size={scale(22)} color={COLORS.yellow} />
//             <Text style={styles.rowText}>Edit Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.row} onPress={() => setActiveModal("changePassword")}>
//             <Ionicons name="key" size={scale(22)} color={COLORS.danger} />
//             <Text style={styles.rowText}>Change Password</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Preferences */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Preferences</Text>
//           <View style={styles.rowBetween}>
//             <View style={styles.row}>
//               <Ionicons name="notifications" size={scale(22)} color={COLORS.yellow} />
//               <Text style={styles.rowText}>Push Notifications</Text>
//             </View>
//             <Switch
//               trackColor={{ false: "#ccc", true: COLORS.yellow }}
//               thumbColor={notifications ? COLORS.kellyGreen : "#f4f3f4"}
//               value={notifications}
//               onValueChange={setNotifications}
//             />
//           </View>
//         </View>

//         {/* Security */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Security</Text>

//           <TouchableOpacity style={styles.row} onPress={() => setActiveModal("privacyPolicy")}>
//             <Ionicons name="shield-checkmark" size={scale(22)} color={COLORS.yellow} />
//             <Text style={styles.rowText}>Privacy Policy</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.row} onPress={() => setActiveModal("terms")}>
//             <Ionicons name="document-text" size={scale(22)} color={COLORS.danger} />
//             <Text style={styles.rowText}>Terms & Conditions</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.row} onPress={() => setActiveModal("help")}>
//             <Ionicons name="help-circle" size={scale(22)} color={COLORS.yellow} />
//             <Text style={styles.rowText}>Help</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Logout */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Ionicons name="log-out" size={scale(20)} color="white" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Password / Terms / Help Modals */}
//       {renderModal(
//         "changePassword",
//         "Change Password",
//         <>
//           <Text style={styles.label}>Old Password</Text>
//           <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
//           <Text style={styles.label}>New Password</Text>
//           <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
//           <Text style={styles.label}>Confirm New Password</Text>
//           <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

//           <TouchableOpacity
//             style={[
//               styles.saveBtn,
//               changingPassword && { opacity: 0.6 }
//             ]}
//             onPress={savePassword}
//             disabled={changingPassword}
//           >
//             <Text style={{ color: "#fff", fontWeight: "700" }}>
//               {changingPassword ? "Updating..." : "Save Password"}
//             </Text>
//           </TouchableOpacity>

//         </>
//       )}

//       {renderModal(
//         "privacyPolicy",
//         "Privacy Policy",
//         <Text style={styles.policyText}>
//           This app collects and uses your personal information only for hostel management purposes…
//         </Text>
//       )}

//       {renderModal(
//         "terms",
//         "Terms & Conditions",
//         <Text style={styles.policyText}>
//           By using this app you agree to standard regulations and responsibilities…
//         </Text>
//       )}

//       {renderModal(
//         "help",
//         "Help",
//         <>
//           <Text style={styles.policyText}>For support contact:</Text>
//           <Text style={styles.policyText}>Phone: +91 98765 43210</Text>
//           <Text style={styles.policyText}>Email: support@hostelbookingapp.com</Text>
//         </>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
//   headerBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     height: 56,
//     paddingHorizontal: 16,
//     backgroundColor: COLORS.headerBackground,
//   },
//   headerButton: { padding: 6 },
//   headerTitle: {
//     color: COLORS.headerText,
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   userSection: {
//     backgroundColor: "#fff",
//     marginBottom: verticalScale(16),
//     padding: scale(16),
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: COLORS.cardBorder,
//     flexDirection: "row",
//     alignItems: "center",
//     ...SHADOW,
//   },
//   userInfo: { flex: 1 },
//   userName: { fontSize: scale(18), fontWeight: "700", color: "#023047" },
//   userEmail: { fontSize: scale(14), color: "#666" },
//   userRole: { fontSize: scale(12), color: COLORS.kellyGreen, fontWeight: "600" },
//   section: {
//     backgroundColor: "#fff",
//     marginBottom: verticalScale(16),
//     padding: scale(14),
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: COLORS.cardBorder,
//     ...SHADOW,
//   },
//   sectionTitle: { fontSize: scale(16), fontWeight: "600", color: "#023047", marginBottom: 10 },
//   row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
//   rowText: { marginLeft: 10, fontSize: scale(15), color: "#111827" },
//   rowBetween: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   logoutBtn: {
//     backgroundColor: COLORS.danger,
//     flexDirection: "row",
//     marginTop: 20,
//     marginBottom: 40,
//     padding: 14,
//     justifyContent: "center",
//     borderRadius: 12,
//     ...SHADOW,
//   },
//   logoutText: { color: "white", fontWeight: "600", marginLeft: 10, fontSize: 16 },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
//   modalContent: {
//     backgroundColor: "white",
//     margin: 20,
//     borderRadius: 16,
//     padding: 20,
//     maxHeight: "80%",
//   },
//   modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
//   closeBtn: {
//     marginTop: 10,
//     backgroundColor: COLORS.kellyGreen,
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   closeText: { color: "white", fontWeight: "600" },
//   label: { fontWeight: "600", marginBottom: 6, color: "#374151" },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.inputBorder,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//   },
//   saveBtn: {
//     backgroundColor: COLORS.kellyGreen,
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   policyText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//   },
// });
// app/(tabs)/Settings.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { goBack } from "../../utils/navigationHistory";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../app/reduxStore/reduxSlices/authSlice";
import ApiClient from "../../app/api/ApiClient";

const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;

const COLORS = {
  kellyGreen: "#4CBB17",
  yellow: "#FFD700",
  headerBackground: "#ffffffff",
  headerText: "#FFD700",
  cardBorder: "rgba(76,187,23,0.2)",
  modalOverlay: "rgba(0,0,0,0.5)",
  inputBorder: "#ccc",
  danger: "#ff4d6d",
};

const SHADOW = {
  shadowColor: COLORS.kellyGreen,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,
};

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [notifications, setNotifications] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/HostelOwnerLogin");
        },
      },
    ]);
  };

  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const savePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await ApiClient.put(
        "/hostel-owner/change-password",
        {
          oldPassword,
          newPassword,
          confirmPassword,
        }
      );

      if (response.success) {
        Alert.alert(
          "Success",
          "Password changed successfully. Please login again.",
          [
            {
              text: "OK",
              onPress: () => {
                resetPasswordFields();
                setActiveModal(null);

                // 🔐 Logout after password change (SECURITY)
                dispatch(logout());
                router.replace("/HostelOwnerLogin");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Change password error:", error);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const renderModal = (key: string, title: string, content: React.ReactNode) => (
    <Modal visible={activeModal === key} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              if (key === "changePassword") resetPasswordFields();
              setActiveModal(null);
            }}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBackground} translucent={false} />
      <LinearGradient colors={["#ffffff", "#ffffff"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => goBack(router)} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.yellow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: verticalScale(40), paddingHorizontal: scale(12) }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <Ionicons name="person-circle" size={60} color={COLORS.kellyGreen} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "Hostel Owner"}</Text>
            <Text style={styles.userEmail}>{user?.email || "owner@email.com"}</Text>
            <Text style={styles.userRole}>{user?.role ? `Role: ${user.role}` : "Hostel Owner"}</Text>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* 🔥 Redirect to Profile Page */}
          <TouchableOpacity style={styles.row} onPress={() => router.push("/Profile")}>
            <Ionicons name="person-circle" size={scale(22)} color={COLORS.yellow} />
            <Text style={styles.rowText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => setActiveModal("changePassword")}>
            <Ionicons name="key" size={scale(22)} color={COLORS.danger} />
            <Text style={styles.rowText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Ionicons name="notifications" size={scale(22)} color={COLORS.yellow} />
              <Text style={styles.rowText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#ccc", true: COLORS.yellow }}
              thumbColor={notifications ? COLORS.kellyGreen : "#f4f3f4"}
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <TouchableOpacity style={styles.row} onPress={() => setActiveModal("privacyPolicy")}>
            <Ionicons name="shield-checkmark" size={scale(22)} color={COLORS.yellow} />
            <Text style={styles.rowText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => setActiveModal("terms")}>
            <Ionicons name="document-text" size={scale(22)} color={COLORS.danger} />
            <Text style={styles.rowText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => setActiveModal("help")}>
            <Ionicons name="help-circle" size={scale(22)} color={COLORS.yellow} />
            <Text style={styles.rowText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={scale(20)} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password / Terms / Help Modals */}
      {renderModal(
        "changePassword",
        "Change Password",
        <>
          <Text style={styles.label}>Old Password</Text>
          <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              changingPassword && { opacity: 0.6 }
            ]}
            onPress={savePassword}
            disabled={changingPassword}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {changingPassword ? "Updating..." : "Save Password"}
            </Text>
          </TouchableOpacity>

        </>
      )}

      {renderModal(
        "privacyPolicy",
        "Privacy Policy",
        <ScrollView style={styles.policyScroll}>
          <View style={styles.policyContent}>
            <Text style={styles.policyTitle}>Privacy Policy</Text>
            <Text style={styles.policySubtitle}>Effective Date: January 1, 2024</Text>
            
            <Text style={styles.policySectionTitle}>1. Information We Collect</Text>
            <Text style={styles.policyText}>
              We collect the following information strictly for hostel registration and management purposes:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Personal Information:</Text> Full name, email address, contact number</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Business Information:</Text> Hostel name, address, location data</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Media Files:</Text> Photos of your hostel premises for verification and display</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Financial Information:</Text> Bank account details for payment processing (securely encrypted)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Location Data:</Text> Geographical location of your hostel for accurate mapping</Text>
            </View>

            <Text style={styles.policySectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.policyText}>
              Your information is used exclusively for:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Hostel registration and verification processes</Text>
              <Text style={styles.bulletPoint}>• Displaying your hostel to potential guests</Text>
              <Text style={styles.bulletPoint}>• Processing payments and financial transactions</Text>
              <Text style={styles.bulletPoint}>• Providing customer support and service</Text>
              <Text style={styles.bulletPoint}>• Sending important updates about your hostel listing</Text>
            </View>

            <Text style={styles.policySectionTitle}>3. Data Security</Text>
            <Text style={styles.policyText}>
              We implement industry-standard security measures to protect your data:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>End-to-end encryption</Text> for all sensitive data</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Secure servers</Text> with regular security audits</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Limited access</Text> to authorized personnel only</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Regular backups</Text> to prevent data loss</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>SSL/TLS encryption</Text> for all data transmissions</Text>
            </View>

            <Text style={styles.policySectionTitle}>4. Data Protection Commitment</Text>
            <Text style={styles.policyText}>
              <Text style={styles.boldText}>We do not and will never:</Text>
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Sell or rent your personal information to third parties</Text>
              <Text style={styles.bulletPoint}>• Use your data for marketing purposes without explicit consent</Text>
              <Text style={styles.bulletPoint}>• Share your bank details with unauthorized parties</Text>
              <Text style={styles.bulletPoint}>• Use your information for our personal benefit</Text>
              <Text style={styles.bulletPoint}>• Retain your data longer than necessary for legal purposes</Text>
            </View>

            <Text style={styles.policySectionTitle}>5. Your Rights</Text>
            <Text style={styles.policyText}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Access your personal information</Text>
              <Text style={styles.bulletPoint}>• Request correction of inaccurate data</Text>
              <Text style={styles.bulletPoint}>• Request deletion of your account and associated data</Text>
              <Text style={styles.bulletPoint}>• Withdraw consent for data processing</Text>
              <Text style={styles.bulletPoint}>• Export your data in a readable format</Text>
            </View>

            <Text style={styles.policySectionTitle}>6. Contact Us</Text>
            <Text style={styles.policyText}>
              If you have questions about our privacy practices or wish to exercise your rights:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>Email: contact@fyndom.in</Text>
              <Text style={styles.contactItem}>Phone: +91 7674843434</Text>
              <Text style={styles.contactItem}>Address: Hyderabad</Text>
            </View>

            <Text style={styles.policyNote}>
              <Text style={styles.boldText}>Note:</Text> This privacy policy may be updated periodically. We will notify you of any significant changes through the app or via email.
            </Text>
          </View>
        </ScrollView>
      )}

      {renderModal(
        "terms",
        "Terms & Conditions",
        <ScrollView style={styles.policyScroll}>
          <View style={styles.policyContent}>
            <Text style={styles.policyTitle}>Terms & Conditions</Text>
            <Text style={styles.policySubtitle}>Effective Date: January 1, 2024</Text>
            
            <Text style={styles.policySectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.policyText}>
              By accessing and using this Hostel Management application, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services.
            </Text>

            <Text style={styles.policySectionTitle}>2. User Responsibilities</Text>
            <Text style={styles.policyText}>
              As a hostel owner/user, you agree to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Provide accurate and complete information during registration</Text>
              <Text style={styles.bulletPoint}>• Maintain the confidentiality of your account credentials</Text>
              <Text style={styles.bulletPoint}>• Update hostel information regularly for accuracy</Text>
              <Text style={styles.bulletPoint}>• Comply with all applicable laws and regulations</Text>
              <Text style={styles.bulletPoint}>• Not engage in fraudulent activities or misrepresentation</Text>
            </View>

            <Text style={styles.policySectionTitle}>3. Service Usage</Text>
            <Text style={styles.policyText}>
              You may use our services only for lawful purposes and in accordance with these terms. Prohibited activities include:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Violating any local, state, or national laws</Text>
              <Text style={styles.bulletPoint}>• Infringing on intellectual property rights</Text>
              <Text style={styles.bulletPoint}>• Transmitting harmful or malicious content</Text>
              <Text style={styles.bulletPoint}>• Attempting to gain unauthorized access to our systems</Text>
              <Text style={styles.bulletPoint}>• Interfering with other users' experience</Text>
            </View>

            <Text style={styles.policySectionTitle}>4. Payment Terms</Text>
            <Text style={styles.policyText}>
              All financial transactions processed through our platform are subject to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Clear disclosure of all fees and charges</Text>
              <Text style={styles.bulletPoint}>• Secure payment processing through trusted partners</Text>
              <Text style={styles.bulletPoint}>• Refund policies as per individual hostel regulations</Text>
              <Text style={styles.bulletPoint}>• Timely settlement of due amounts</Text>
            </View>

            <Text style={styles.policySectionTitle}>5. Limitation of Liability</Text>
            <Text style={styles.policyText}>
              Our platform acts as an intermediary between hostel owners and guests. We are not responsible for:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Quality of services provided by listed hostels</Text>
              <Text style={styles.bulletPoint}>• Disputes between hostel owners and guests</Text>
              <Text style={styles.bulletPoint}>• Force majeure events affecting hostel operations</Text>
              <Text style={styles.bulletPoint}>• Technical issues beyond our reasonable control</Text>
            </View>

            <Text style={styles.policySectionTitle}>6. Termination</Text>
            <Text style={styles.policyText}>
              We reserve the right to terminate or suspend your account if you violate these terms. Upon termination:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Your right to use our services immediately ceases</Text>
              <Text style={styles.bulletPoint}>• All outstanding payments become due</Text>
              <Text style={styles.bulletPoint}>• We may retain necessary data for legal compliance</Text>
            </View>

            <Text style={styles.policySectionTitle}>7. Modifications</Text>
            <Text style={styles.policyText}>
              We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </Text>

            <Text style={styles.policySectionTitle}>8. Governing Law</Text>
            <Text style={styles.policyText}>
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore.
            </Text>
          </View>
        </ScrollView>
      )}

      {renderModal(
        "help",
        "Help & Support",
        <ScrollView style={styles.policyScroll}>
          <View style={styles.policyContent}>
            <Text style={styles.policyTitle}>Help & Support Center</Text>
            
            <Text style={styles.policySectionTitle}>Need Assistance?</Text>
            <Text style={styles.policyText}>
              We're here to help you with any issues or questions regarding our Hostel Management application.
            </Text>

            <Text style={styles.policySectionTitle}>Common Issues & Solutions</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}><Text style={styles.boldText}>Account Access:</Text> Reset password through the Change Password option in Settings</Text>
              <Text style={styles.bulletPoint}><Text style={styles.boldText}>Profile Updates:</Text> Edit your profile information in the Profile section</Text>
              <Text style={styles.bulletPoint}><Text style={styles.boldText}>Payment Issues:</Text> Check your bank details and ensure they are correctly entered</Text>
              <Text style={styles.bulletPoint}><Text style={styles.boldText}>Listing Management:</Text> Update hostel information through the dashboard</Text>
              <Text style={styles.bulletPoint}><Text style={styles.boldText}>Notification Problems:</Text> Enable push notifications in Settings > Preferences</Text>
            </View>

            <Text style={styles.policySectionTitle}>Contact Support</Text>
            <Text style={styles.policyText}>
              For personalized assistance, contact our support team:
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={16} color={COLORS.kellyGreen} />
                <Text style={styles.contactItem}>Phone: +91 7674843434</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={16} color={COLORS.kellyGreen} />
                <Text style={styles.contactItem}>Email:contact@fyndom.in</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="time" size={16} color={COLORS.kellyGreen} />
                <Text style={styles.contactItem}>Hours: Mon-Sat, 9:00 AM - 6:00 PM IST</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="chatbubbles" size={16} color={COLORS.kellyGreen} />
                <Text style={styles.contactItem}>Live Chat: Available in-app during business hours</Text>
              </View>
            </View>

            <Text style={styles.policySectionTitle}>Emergency Contact</Text>
            <Text style={styles.policyText}>
              For urgent matters requiring immediate attention:
            </Text>
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyText}>Emergency Hotline: +91 7674843434</Text>
              <Text style={styles.emergencyNote}>Available 24/7 for critical issues only</Text>
            </View>

            <Text style={styles.policySectionTitle}>FAQ</Text>
            <Text style={styles.policyText}>
              <Text style={styles.boldText}>Q: How do I update my bank details?</Text>
              {"\n"}A: Go to Profile  Financial Information section
            </Text>
            <Text style={styles.policyText}>
              <Text style={styles.boldText}>Q: Can I list multiple hostels?</Text>
              {"\n"}A: Yes, upgrade to Premium plan for multiple listings
            </Text>
            <Text style={styles.policyText}>
              <Text style={styles.boldText}>Q: How are payments processed?</Text>
              {"\n"}A: Payments are processed securely through our payment gateway partners
            </Text>

            <Text style={styles.policyNote}>
              <Text style={styles.boldText}>Note:</Text> For faster resolution, please have your User ID and hostel details ready when contacting support.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: COLORS.headerBackground,
  },
  headerButton: { padding: 6 },
  headerTitle: {
    color: COLORS.headerText,
    fontSize: 20,
    fontWeight: "700",
  },
  userSection: {
    backgroundColor: "#fff",
    marginBottom: verticalScale(16),
    padding: scale(16),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOW,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: scale(18), fontWeight: "700", color: "#023047" },
  userEmail: { fontSize: scale(14), color: "#666" },
  userRole: { fontSize: scale(12), color: COLORS.kellyGreen, fontWeight: "600" },
  section: {
    backgroundColor: "#fff",
    marginBottom: verticalScale(16),
    padding: scale(14),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW,
  },
  sectionTitle: { fontSize: scale(16), fontWeight: "600", color: "#023047", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowText: { marginLeft: 10, fontSize: scale(15), color: "#111827" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 40,
    padding: 14,
    justifyContent: "center",
    borderRadius: 12,
    ...SHADOW,
  },
  logoutText: { color: "white", fontWeight: "600", marginLeft: 10, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  closeBtn: {
    marginTop: 10,
    backgroundColor: COLORS.kellyGreen,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: { color: "white", fontWeight: "600" },
  label: { fontWeight: "600", marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.kellyGreen,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  policyScroll: {
    flex: 1,
  },
  policyContent: {
    paddingBottom: 20,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.kellyGreen,
    marginBottom: 8,
    textAlign: "center",
  },
  policySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  policySectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#023047",
    marginTop: 15,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: "700",
    color: "#023047",
  },
  contactInfo: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactItem: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  emergencyContact: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 4,
  },
  emergencyNote: {
    fontSize: 12,
    color: "#856404",
    fontStyle: "italic",
  },
  policyNote: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
});