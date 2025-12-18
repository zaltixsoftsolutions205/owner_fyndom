import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/reduxStore/store/store";
import ApiClient from "@/app/api/ApiClient";

const COLORS = {
  kellyGreen: "#4CBB17",
  yellow: "#FFD700",
  headerBackground: "#ffffffff",
  headerText: "#40b705ff",
  inputBorder: "#ccc",
  disabledBackground: "#f5f5f5",
  disabledText: "#666",
  editableBorder: "#4CBB17",
};

// Interface for Profile Image response
interface ProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    image: {
      _id: string;
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
      updatedAt: string;
    };
  };
}

interface UserProfileWithImage {
  success: boolean;
  data: {
    user: {
      _id: string;
      fullName: string;
      email: string;
      mobileNumber: string;
      hostelName: string;
      hostelType: string;
      status: string;
      govtRegistrationId?: string;
      fullAddress?: string;
      // ... other user properties
    };
    profileImage: {
      url: string;
      uploadedAt: string;
    } | null;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Email update interfaces
interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

interface UpdateEmailResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Helper function to create initials from name
const getInitials = (name: string): string => {
  if (!name) return "U";

  const nameParts = name.trim().split(' ');
  if (nameParts.length > 0) {
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials.substring(0, 2);
  }
  return "U";
};

// Helper function to generate a color based on user ID
const getColorFromId = (id: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#FFA07A', '#20B2AA', '#9370DB', '#F08080', '#7B68EE', '#6495ED'
  ];

  if (!id) return '#4CBB17'; // Default green

  // Simple hash function to get a consistent color for the same user ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || 'jpg';
};

// Helper function to get mime type from extension
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
  };
  return mimeTypes[extension] || 'image/jpeg';
};

export default function Profile() {
  const router = useRouter();

  // Get auth state from Redux
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [hostelName, setHostelName] = useState("");
  const [fullName, setFullName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFullName, setTempFullName] = useState("");
  const [isEditingHostelName, setIsEditingHostelName] = useState(false);
  const [tempHostelName, setTempHostelName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingHostelName, setUpdatingHostelName] = useState(false);

  // Email update states
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Fetch user profile with image on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set user data from Redux auth state
      setMobileNumber(user.mobileNumber || "");
      setEmail(user.email || "");
      setHostelName(user.hostelName || "");
      setFullName(user.fullName || "");
      setTempFullName(user.fullName || "");

      // Fetch profile image
      fetchProfileImage();
    }
  }, [user, isAuthenticated]);

  // Fetch profile image from API
  const fetchProfileImage = async () => {
    if (!token || !user?._id) {
      console.log("No token or user ID available");
      setProfileImageLoading(false);
      return;
    }

    setProfileImageLoading(true);
    try {
      const response = await ApiClient.get<UserProfileWithImage>('/profile-image/user-profile');

      if (response.success && response.data.profileImage) {
        // Update profile picture with URL from server
        setProfilePic(response.data.profileImage.url);
      } else {
        // No profile image found, use initials
        setProfilePic(null);
      }

    } catch (error: any) {
      console.error("Error fetching profile image:", error);
      // Don't show error alert for this - it's okay if no image exists
    } finally {
      setProfileImageLoading(false);
    }
  };

  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    if (!token || !user?._id) {
      console.log("No token or user ID available");
      return;
    }

    setFetchingProfile(true);
    try {
      // Fetch complete profile with image
      const response = await ApiClient.get<UserProfileWithImage>('/profile-image/user-profile');

      if (response.success) {
        // Update user data
        const userData = response.data.user;
        setMobileNumber(userData.mobileNumber || "");
        setEmail(userData.email || "");
        setHostelName(userData.hostelName || "");
        setFullName(userData.fullName || "");
        setTempFullName(userData.fullName || "");
        setIsEditingName(false);

        // Update profile image
        if (response.data.profileImage) {
          setProfilePic(response.data.profileImage.url);
        } else {
          setProfilePic(null);
        }

        Alert.alert("Success", "Profile data refreshed successfully!");
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to fetch profile data. Please try again.");
    } finally {
      setFetchingProfile(false);
    }
  };

  // Start editing name
  const startEditingName = () => {
    setTempFullName(fullName);
    setIsEditingName(true);
  };

  // Cancel editing name
  const cancelEditingName = () => {
    setTempFullName(fullName);
    setIsEditingName(false);
  };

  // Hostel name editing handlers
  const startEditingHostelName = () => {
    setTempHostelName(hostelName);
    setIsEditingHostelName(true);
  };

  const cancelEditingHostelName = () => {
    setTempHostelName(hostelName);
    setIsEditingHostelName(false);
  };

  // FIXED: Use correct API endpoint for updating hostel name
  const saveHostelName = async () => {
    if (!tempHostelName.trim()) {
      Alert.alert("Error", "Hostel name cannot be empty");
      return;
    }

    if (tempHostelName.trim() === hostelName) {
      setIsEditingHostelName(false);
      return;
    }

    setUpdatingHostelName(true);

    try {
      const response = await ApiClient.put(
        "/hostel-owner/update-basic-profile",
        {
          hostelName: tempHostelName.trim(),
        }
      );

      if (response.success) {
        setHostelName(tempHostelName.trim());
        setIsEditingHostelName(false);

        Alert.alert("Success", "Hostel name updated successfully");

        // Optional: refresh profile from server
        fetchUserProfile();
      } else {
        Alert.alert("Error", response.message || "Failed to update hostel name");
      }
    } catch (error: any) {
      console.error("Error updating hostel name:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update hostel name"
      );
    } finally {
      setUpdatingHostelName(false);
    }
  };


  // FIXED: Use correct API endpoint for updating name
  const saveName = async () => {
    if (!tempFullName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    if (tempFullName.trim() === fullName) {
      setIsEditingName(false);
      return;
    }

    setUpdatingName(true);
    try {
      const response = await ApiClient.put(
        "/hostel-owner/update-basic-profile",
        {
          fullName: tempFullName.trim()
        }
      );

      if (response.success) {
        setFullName(tempFullName.trim());
        setIsEditingName(false);

        Alert.alert("Success", "Name updated successfully");

        // Refresh profile (optional but recommended)
        fetchUserProfile();
      } else {
        Alert.alert("Error", response.message || "Failed to update name");
      }
    } catch (error: any) {
      console.error("Error updating name:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update name"
      );
    } finally {
      setUpdatingName(false);
    }
  };


  // Email update functions
  const startEmailChange = () => {
    setIsChangingEmail(true);
    setNewEmail("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  const cancelEmailChange = () => {
    setIsChangingEmail(false);
    setNewEmail("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  const sendOtpToCurrentEmail = async () => {
    setSendingOtp(true);
    try {
      const response = await ApiClient.post<SendOtpResponse>('/hostel-owners/email/send-otp');
      if (response.success) {
        setOtpSent(true);
        Alert.alert("Success", "OTP sent to your current email");
      } else {
        Alert.alert("Error", response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await ApiClient.post<VerifyOtpResponse>('/hostel-owners/email/verify-otp', {
        otp: otp.trim()
      });
      if (response.success) {
        setOtpVerified(true);
        Alert.alert("Success", "OTP verified successfully");
      } else {
        Alert.alert("Error", response.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const updateEmail = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid OTP");
      return;
    }

    setUpdatingEmail(true);
    try {
      const response = await ApiClient.put<UpdateEmailResponse>('/hostel-owners/email/update', {
        otp: otp.trim(),
        newEmail: newEmail.trim()
      });

      if (response.success) {
        setEmail(newEmail.trim());
        Alert.alert("Success", "Email updated successfully!");
        setIsChangingEmail(false);
        setNewEmail("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);

        // Optionally fetch fresh profile data
        fetchUserProfile();
      } else {
        Alert.alert("Error", response.message || "Failed to update email");
      }
    } catch (error: any) {
      console.error("Error updating email:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update email");
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Upload the selected image
      uploadProfileImage(result.assets[0]);
    }
  };

  // Upload profile image to server
  const uploadProfileImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!token) {
      Alert.alert("Error", "Please login to upload profile image.");
      return;
    }

    setUploadingImage(true);

    try {
      // Create FormData
      const formData = new FormData();
      const filename = imageAsset.uri.split('/').pop() || `profile_${Date.now()}.jpg`;
      const extension = getFileExtension(filename);
      const mimeType = getMimeType(extension);

      // Simple approach - just pass the URI and let React Native handle it
      formData.append('profileImage', {
        uri: imageAsset.uri,
        type: mimeType,
        name: filename,
      } as any);

      console.log("Uploading profile image...", {
        filename,
        mimeType,
        uri: imageAsset.uri.substring(0, 50) + '...',
      });

      // Upload to the new endpoint
      const uploadResponse = await ApiClient.postFormData<ProfileImageResponse>(
        '/profile-image/upload',
        formData
      );

      if (uploadResponse.success) {
        // Update local state with the new image URL
        setProfilePic(uploadResponse.data.image.url);
        Alert.alert("Success", "Profile image uploaded successfully!");

        // Optionally refresh the profile data
        fetchProfileImage();
      } else {
        Alert.alert("Error", uploadResponse.message || "Failed to upload profile image.");
      }

    } catch (error: any) {
      console.error("Error uploading image:", error);

      let errorMessage = "Failed to upload profile image.";
      if (error.message?.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your connection.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete profile image
  const deleteProfileImage = async () => {
    if (!profilePic) {
      Alert.alert("Info", "No profile image to delete.");
      return;
    }

    Alert.alert(
      "Delete Profile Image",
      "Are you sure you want to delete your profile image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await ApiClient.delete('/profile-image');
              if (response.success) {
                setProfilePic(null);
                Alert.alert("Success", "Profile image deleted successfully!");
              }
            } catch (error: any) {
              console.error("Error deleting image:", error);
              Alert.alert("Error", "Failed to delete profile image.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const updateNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    // Here you would typically update notification preference in backend
  };

  const profileImageSize = 120;

  // Show loading state while fetching profile
  if (fetchingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.kellyGreen} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBackground} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Center content container */}
          <View style={styles.centerContent}>

            {/* Profile Image with Camera Icon */}
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={uploadingImage || profileImageLoading}
                style={styles.profileImageTouchable}
              >
                <View
                  style={[
                    styles.profileImageContainer,
                    {
                      width: profileImageSize,
                      height: profileImageSize,
                      borderRadius: profileImageSize / 2,
                      backgroundColor: getColorFromId(user?._id || ''),
                    },
                  ]}
                >
                  {uploadingImage ? (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="white" />
                    </View>
                  ) : profileImageLoading ? (
                    <ActivityIndicator size="large" color="white" />
                  ) : profilePic ? (
                    <Image
                      source={{ uri: profilePic }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : user?.fullName ? (
                    <View style={styles.initialsContainer}>
                      <Text style={styles.initialsText}>
                        {getInitials(fullName || user.fullName)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.placeholderCircle}>
                      <Icon name="account" size={48} color="white" />
                    </View>
                  )}

                  {/* Camera Icon Overlay */}
                  <View style={styles.cameraIconContainer}>
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Icon name="camera" size={20} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Name and action buttons */}
              <View style={styles.nameSection}>
                {isEditingName ? (
                  <View style={styles.nameEditContainer}>
                    <TextInput
                      style={styles.nameInput}
                      value={tempFullName}
                      onChangeText={setTempFullName}
                      placeholder="Enter your name"
                      placeholderTextColor="#999"
                      autoFocus={true}
                      maxLength={50}
                    />
                    <View style={styles.nameEditButtons}>
                      <TouchableOpacity
                        style={styles.saveNameButton}
                        onPress={saveName}
                        disabled={updatingName || !tempFullName.trim()}
                      >
                        {updatingName ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.saveNameButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelNameButton}
                        onPress={cancelEditingName}
                        disabled={updatingName}
                      >
                        <Text style={styles.cancelNameButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.nameDisplayContainer}>
                    <Text style={styles.fullNameText}>{fullName || "No name"}</Text>
                    <TouchableOpacity
                      style={styles.editNameButton}
                      onPress={startEditingName}
                    >
                      <Icon name="pencil" size={18} color={COLORS.kellyGreen} />
                      <Text style={styles.editNameButtonText}></Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Image action buttons */}
              <View style={styles.imageActionButtons}>
                {profilePic && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteProfileImage}
                    disabled={loading}
                  >
                    <Icon name="delete" size={16} color="#FF6B6B" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.refreshImageButton}
                  onPress={fetchProfileImage}
                  disabled={profileImageLoading}
                >
                  <Icon name="refresh" size={16} color={COLORS.kellyGreen} />
                  <Text style={styles.refreshImageButtonText}>
                    {profileImageLoading ? "Refreshing..." : "Refresh"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Display Fields */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.disabledField, styles.field]}>
                <Text style={styles.disabledFieldText}>
                  {mobileNumber || "Not available"}
                </Text>
              </View>
            </View>

            {/* Email field with change option */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              {isChangingEmail ? (
                <View style={styles.emailChangeContainer}>
                  {/* Step 1: Send OTP to current email */}
                  {!otpSent && (
                    <View style={styles.otpStepContainer}>
                      <Text style={styles.otpStepText}>
                        Step 1: Verify your current email
                      </Text>
                      <TouchableOpacity
                        style={styles.sendOtpButton}
                        onPress={sendOtpToCurrentEmail}
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.sendOtpButtonText}>
                            Send OTP to Current Email
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Step 2: Enter OTP */}
                  {otpSent && !otpVerified && (
                    <View style={styles.otpStepContainer}>
                      <Text style={styles.otpStepText}>
                        Step 2: Enter OTP sent to your email
                      </Text>
                      <TextInput
                        style={styles.otpInput}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={6}
                      />
                      <TouchableOpacity
                        style={styles.verifyOtpButton}
                        onPress={verifyOtp}
                        disabled={verifyingOtp}
                      >
                        {verifyingOtp ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.verifyOtpButtonText}>
                            Verify OTP
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Step 3: Enter new email */}
                  {otpVerified && (
                    <View style={styles.otpStepContainer}>
                      <Text style={styles.otpStepText}>
                        Step 3: Enter new email address
                      </Text>
                      <TextInput
                        style={styles.newEmailInput}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="Enter new email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <View style={styles.emailActionButtons}>
                        <TouchableOpacity
                          style={styles.updateEmailButton}
                          onPress={updateEmail}
                          disabled={updatingEmail || !newEmail.trim()}
                        >
                          {updatingEmail ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text style={styles.updateEmailButtonText}>
                              Update Email
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEmailButton}
                          onPress={cancelEmailChange}
                          disabled={updatingEmail}
                        >
                          <Text style={styles.cancelEmailButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.disabledField, styles.field, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  <Text style={styles.disabledFieldText}>
                    {email || "Not available"}
                  </Text>
                  <TouchableOpacity onPress={startEmailChange} style={{ padding: 6 }}>
                    <Icon name="pencil" size={18} color={COLORS.kellyGreen} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Hostel Name</Text>
              {isEditingHostelName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempHostelName}
                    onChangeText={setTempHostelName}
                    placeholder="Enter hostel name"
                    placeholderTextColor="#999"
                    autoFocus={true}
                    maxLength={100}
                  />
                  <View style={styles.nameEditButtons}>
                    <TouchableOpacity
                      style={styles.saveNameButton}
                      onPress={saveHostelName}
                      disabled={updatingHostelName || !tempHostelName.trim()}
                    >
                      {updatingHostelName ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.saveNameButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelNameButton}
                      onPress={cancelEditingHostelName}
                      disabled={updatingHostelName}
                    >
                      <Text style={styles.cancelNameButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.disabledField, styles.field, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  <Text style={styles.disabledFieldText}>
                    {hostelName || "Not available"}
                  </Text>
                  <TouchableOpacity onPress={startEditingHostelName} style={{ padding: 6 }}>
                    <Icon name="pencil" size={18} color={COLORS.kellyGreen} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Additional Information (Optional) */}
            {user?.govtRegistrationId && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Government Registration ID</Text>
                <View style={[styles.disabledField, styles.field]}>
                  <Text style={styles.disabledFieldText}>
                    {user.govtRegistrationId}
                  </Text>
                </View>
              </View>
            )}

            {/* Notifications */}
            <View style={styles.notificationsRow}>
              <Text style={styles.notificationsLabel}>Enable Notifications</Text>
              <Switch
                trackColor={{ false: "#ccc", true: COLORS.yellow }}
                thumbColor={notificationsEnabled ? COLORS.kellyGreen : "#f4f3f4"}
                ios_backgroundColor="#ccc"
                value={notificationsEnabled}
                onValueChange={updateNotifications}
                disabled={loading}
              />
            </View>

            {/* Status Badge */}
            {user?.status && (
              <View style={[
                styles.statusBadge,
                user.status === 'approved' ? styles.statusApproved :
                  user.status === 'pending' ? styles.statusPending :
                    styles.statusRejected
              ]}>
                <Text style={styles.statusText}>
                  Status: {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Text>
              </View>
            )}

            {/* Refresh Profile Button */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchUserProfile}
              disabled={fetchingProfile}
            >
              <Icon name="refresh" size={20} color={COLORS.kellyGreen} />
              <Text style={styles.refreshButtonText}>
                {fetchingProfile ? "Refreshing..." : "Refresh Profile Data"}
              </Text>
            </TouchableOpacity>

            {/* Upload Status */}
            {uploadingImage && (
              <View style={styles.uploadStatus}>
                <ActivityIndicator size="small" color={COLORS.kellyGreen} />
                <Text style={styles.uploadStatusText}>Uploading image...</Text>
              </View>
            )}

            {/* Name Update Status */}
            {updatingName && (
              <View style={styles.uploadStatus}>
                <ActivityIndicator size="small" color={COLORS.kellyGreen} />
                <Text style={styles.uploadStatusText}>Updating name...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.kellyGreen,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.headerText,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.headerText,
    position: "relative",
    top: -6,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  profileImageTouchable: {
    position: 'relative',
  },
  profileImageContainer: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  placeholderCircle: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.kellyGreen,
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: "white",
    zIndex: 5,
  },
  nameSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  fullNameText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    marginRight: 8,
  },
  editNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  editNameButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.kellyGreen,
    fontWeight: '500',
  },
  nameEditContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  nameInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.editableBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#f9fff9',
    marginBottom: 12,
  },
  nameEditButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  saveNameButton: {
    backgroundColor: COLORS.kellyGreen,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveNameButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelNameButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 80,
    alignItems: 'center',
  },
  cancelNameButtonText: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: 14,
  },
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  refreshImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  refreshImageButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.kellyGreen,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 20,
    width: "100%",
    maxWidth: 360,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 15,
    color: "#374151",
  },
  field: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: "center",
  },
  disabledField: {
    backgroundColor: COLORS.disabledBackground,
    borderColor: "#e0e0e0",
  },
  disabledFieldText: {
    fontSize: 16,
    color: COLORS.disabledText,
  },
  editableField: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    minHeight: 44,
    justifyContent: "center",
  },
  fieldText: {
    fontSize: 16,
    color: "#111",
  },
  input: {
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  notificationsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
    maxWidth: 360,
  },
  notificationsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusApproved: {
    backgroundColor: "#d4edda",
  },
  statusPending: {
    backgroundColor: "#fff3cd",
  },
  statusRejected: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#155724",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.kellyGreen + "40",
    marginBottom: 20,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.kellyGreen,
    fontWeight: "500",
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadStatusText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.kellyGreen,
    fontWeight: '500',
  },
  // Email update styles
  emailChangeContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  otpStepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  otpStepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  sendOtpButton: {
    backgroundColor: COLORS.kellyGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  sendOtpButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  otpInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    marginBottom: 12,
  },
  verifyOtpButton: {
    backgroundColor: '#4CBB17',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  verifyOtpButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  newEmailInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  emailActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  updateEmailButton: {
    backgroundColor: COLORS.kellyGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  updateEmailButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelEmailButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flex: 1,
    alignItems: 'center',
  },
  cancelEmailButtonText: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: 14,
  },
});