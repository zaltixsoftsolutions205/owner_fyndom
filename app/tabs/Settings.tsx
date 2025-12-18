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
        <Text style={styles.policyText}>
          This app collects and uses your personal information only for hostel management purposes…
        </Text>
      )}

      {renderModal(
        "terms",
        "Terms & Conditions",
        <Text style={styles.policyText}>
          By using this app you agree to standard regulations and responsibilities…
        </Text>
      )}

      {renderModal(
        "help",
        "Help",
        <>
          <Text style={styles.policyText}>For support contact:</Text>
          <Text style={styles.policyText}>Phone: +91 98765 43210</Text>
          <Text style={styles.policyText}>Email: support@hostelbookingapp.com</Text>
        </>
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
  policyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
