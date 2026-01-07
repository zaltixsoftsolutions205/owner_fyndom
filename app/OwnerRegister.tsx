import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import ApiClient from "../app/api/ApiClient";

const { width } = Dimensions.get("window");

// 🎨 Colors
const BG = "#FFFFFF";
const CARD = "#FFFFFF";
const ACCENT = "#4CBB17";
const BUTTON = "#FFDF00";
const ERROR = "#ef4444";
const TEXT_DARK = "#222222";
const TEXT_GRAY = "#555555";

// Image extensions for preview
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

// Hostel Types
const HOSTEL_TYPES = [
  { value: "boys", label: "Boys Hostel", icon: "👨‍🎓" },
  { value: "girls", label: "Girls Hostel", icon: "👩‍🎓" },
  { value: "co-living", label: "Co-Living", icon: "👥" }
];

// Number of hostels options
const HOSTEL_COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1} Hostel${i > 0 ? 's' : ''}`
}));

// Single Hostel Interface
interface Hostel {
  id: number;
  hostelName: string;
  hostelType: string;
  govtRegistrationId: string;
  fullAddress: string;
  documents: Array<{
    name: string;
    uri: string;
    type: string;
  }>;
  errors: {
    hostelName?: string;
    hostelType?: string;
    govtRegistrationId?: string;
    fullAddress?: string;
    documents?: string;
  };
}

export default function HostelOwnerRegistration() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Owner Information
  const [ownerInfo, setOwnerInfo] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  // Number of hostels to register
  const [numberOfHostels, setNumberOfHostels] = useState(1);

  // Hostels array
  const [hostels, setHostels] = useState<Hostel[]>([
    {
      id: 1,
      hostelName: "",
      hostelType: "co-living",
      govtRegistrationId: "",
      fullAddress: "",
      documents: [],
      errors: {}
    }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState("");
  const [emailExistsModal, setEmailExistsModal] = useState(false);
  const [apiError, setApiError] = useState("");
  const [currentHostelIndex, setCurrentHostelIndex] = useState(0);

  // ✅ Enhanced form validation
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    let hostelErrors = [...hostels];

    // Owner Information validation
    if (!ownerInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (ownerInfo.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (ownerInfo.fullName.trim().length > 50) {
      newErrors.fullName = "Full name cannot exceed 50 characters";
    }

    if (!ownerInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerInfo.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (ownerInfo.email.length > 100) {
      newErrors.email = "Email cannot exceed 100 characters";
    }

    if (!ownerInfo.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(ownerInfo.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit Indian mobile number";
    }

    // Validate each hostel
    let hasHostelErrors = false;
    hostels.forEach((hostel, index) => {
      const hostelError: any = {};

      if (!hostel.hostelName.trim()) {
        hostelError.hostelName = "Hostel name is required";
        hasHostelErrors = true;
      } else if (hostel.hostelName.trim().length < 3) {
        hostelError.hostelName = "Hostel name must be at least 3 characters";
        hasHostelErrors = true;
      } else if (hostel.hostelName.trim().length > 100) {
        hostelError.hostelName = "Hostel name cannot exceed 100 characters";
        hasHostelErrors = true;
      }

      if (!hostel.hostelType) {
        hostelError.hostelType = "Please select a hostel type";
        hasHostelErrors = true;
      }

      if (!hostel.govtRegistrationId.trim()) {
        hostelError.govtRegistrationId = "Government registration ID is required";
        hasHostelErrors = true;
      } else if (hostel.govtRegistrationId.trim().length < 5) {
        hostelError.govtRegistrationId = "Registration ID must be at least 5 characters";
        hasHostelErrors = true;
      } else if (hostel.govtRegistrationId.trim().length > 50) {
        hostelError.govtRegistrationId = "Registration ID cannot exceed 50 characters";
        hasHostelErrors = true;
      }

      if (!hostel.fullAddress.trim()) {
        hostelError.fullAddress = "Full address is required";
        hasHostelErrors = true;
      } else if (hostel.fullAddress.trim().length < 10) {
        hostelError.fullAddress = "Address must be at least 10 characters";
        hasHostelErrors = true;
      } else if (hostel.fullAddress.trim().length > 500) {
        hostelError.fullAddress = "Address cannot exceed 500 characters";
        hasHostelErrors = true;
      }

      if (hostel.documents.length === 0) {
        hostelError.documents = "Please upload at least one document for this hostel";
        hasHostelErrors = true;
      } else if (hostel.documents.length > 10) {
        hostelError.documents = "Maximum 10 files per hostel";
        hasHostelErrors = true;
      }

      hostelErrors[index].errors = hostelError;
    });

    setHostels(hostelErrors);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0 && !hasHostelErrors;
  };

  // ✅ Real-time field validation
  const validateField = (fieldName: string, value: string, isOwnerField: boolean = true) => {
    let error = "";

    if (isOwnerField) {
      switch (fieldName) {
        case 'fullName':
          if (!value.trim()) error = "Full name is required";
          else if (value.trim().length < 3) error = "Minimum 3 characters";
          else if (value.trim().length > 50) error = "Maximum 50 characters";
          break;

        case 'email':
          if (!value.trim()) error = "Email is required";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
          else if (value.length > 100) error = "Maximum 100 characters";
          break;

        case 'mobileNumber':
          if (!value.trim()) error = "Mobile number is required";
          else if (!/^[0-9]*$/.test(value)) error = "Only numbers allowed";
          else if (value.length !== 10) error = "Must be 10 digits";
          else if (!/^[6-9]/.test(value)) error = "Must start with 6-9";
          break;
      }

      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    } else {
      // Validate hostel field
      const updatedHostels = [...hostels];
      const hostel = updatedHostels[currentHostelIndex];

      switch (fieldName) {
        case 'hostelName':
          if (!value.trim()) error = "Hostel name is required";
          else if (value.trim().length < 3) error = "Minimum 3 characters";
          else if (value.trim().length > 100) error = "Maximum 100 characters";
          break;

        case 'govtRegistrationId':
          if (!value.trim()) error = "Registration ID is required";
          else if (value.trim().length < 5) error = "Minimum 5 characters";
          else if (value.trim().length > 50) error = "Maximum 50 characters";
          break;

        case 'fullAddress':
          if (!value.trim()) error = "Address is required";
          else if (value.trim().length < 10) error = "Minimum 10 characters";
          else if (value.trim().length > 500) error = "Maximum 500 characters";
          break;
      }

      updatedHostels[currentHostelIndex].errors = {
        ...updatedHostels[currentHostelIndex].errors,
        [fieldName]: error
      };

      setHostels(updatedHostels);
    }

    return error === "";
  };

  // ✅ Handle owner field change
  const handleOwnerFieldChange = (fieldName: string, value: string) => {
    setOwnerInfo(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }

    if (fieldName === 'email' && emailExistsModal) {
      setEmailExistsModal(false);
    }
  };

  // ✅ Handle hostel field change
  const handleHostelFieldChange = (fieldName: string, value: string) => {
    const updatedHostels = [...hostels];
    updatedHostels[currentHostelIndex] = {
      ...updatedHostels[currentHostelIndex],
      [fieldName]: value
    };

    // Clear error when user starts typing
    if (updatedHostels[currentHostelIndex].errors[fieldName]) {
      updatedHostels[currentHostelIndex].errors = {
        ...updatedHostels[currentHostelIndex].errors,
        [fieldName]: ""
      };
    }

    setHostels(updatedHostels);
  };

  // ✅ Handle number of hostels change
  const handleNumberOfHostelsChange = (count: number) => {
    setNumberOfHostels(count);

    if (count > hostels.length) {
      // Add new hostels
      const newHostels = [...hostels];
      for (let i = hostels.length + 1; i <= count; i++) {
        newHostels.push({
          id: i,
          hostelName: "",
          hostelType: "co-living",
          govtRegistrationId: "",
          fullAddress: "",
          documents: [],
          errors: {}
        });
      }
      setHostels(newHostels);
    } else if (count < hostels.length) {
      // Remove extra hostels
      const newHostels = hostels.slice(0, count);
      setHostels(newHostels);

      // Adjust current index if needed
      if (currentHostelIndex >= count) {
        setCurrentHostelIndex(count - 1);
      }
    }
  };

  // ✅ Navigate between hostels
  const goToNextHostel = () => {
    if (currentHostelIndex < hostels.length - 1) {
      setCurrentHostelIndex(currentHostelIndex + 1);
    }
  };

  const goToPrevHostel = () => {
    if (currentHostelIndex > 0) {
      setCurrentHostelIndex(currentHostelIndex - 1);
    }
  };

  // ✅ Check if file is an image
  const isImageFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? IMAGE_EXTENSIONS.includes(extension) : false;
  };

  // ✅ File upload picker for current hostel
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/png", "image/jpeg", "image/*"],
        multiple: true,
      });

      const files = result.assets || (result.type === "success" ? [result] : []);
      if (!files || files.length === 0) return;

      let newFiles: Array<{ name: string; uri: string; type: string }> = [];
      const currentHostel = hostels[currentHostelIndex];

      for (let file of files) {
        if (file && file.uri && file.name && !currentHostel.documents.some((f) => f.uri === file.uri)) {
          const fileType = isImageFile(file.name) ? 'image' : 'pdf';
          newFiles.push({
            name: file.name,
            uri: file.uri,
            type: fileType
          });
        }
      }

      if (newFiles.length > 0) {
        const updatedHostels = [...hostels];
        const updatedFiles = [...currentHostel.documents, ...newFiles];

        if (updatedFiles.length > 10) {
          Toast.show({
            type: "error",
            text1: "Maximum 10 files per hostel",
            text2: `You have ${updatedFiles.length} files. Please remove some.`
          });
          return;
        }

        updatedHostels[currentHostelIndex].documents = updatedFiles;
        setHostels(updatedHostels);
        Toast.show({ type: "success", text1: "Files uploaded ✅" });

        // Clear upload error if files are added
        if (updatedHostels[currentHostelIndex].errors.documents) {
          updatedHostels[currentHostelIndex].errors = {
            ...updatedHostels[currentHostelIndex].errors,
            documents: ""
          };
          setHostels(updatedHostels);
        }
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "File upload failed" });
    }
  };

  // ✅ Handle view file
  const handleViewFile = async (file: { name: string; uri: string; type: string }) => {
    try {
      if (file.type === 'image') {
        setPreviewUri(file.uri);
        setPreviewVisible(true);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `View ${file.name}`,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Sharing not supported",
            text2: "Cannot open PDF on this device"
          });
        }
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      Toast.show({
        type: "error",
        text1: "Unable to open file",
        text2: "File might be corrupted or unsupported"
      });
    }
  };

  // ✅ Remove file from current hostel
  const handleRemoveFile = (index: number) => {
    const updatedHostels = [...hostels];
    updatedHostels[currentHostelIndex].documents =
      updatedHostels[currentHostelIndex].documents.filter((_, i) => i !== index);
    setHostels(updatedHostels);
    Toast.show({ type: "success", text1: "File removed" });
  };

  // ✅ Email Already Registered Modal Component
  const EmailExistsModal = () => (
    <Modal
      visible={emailExistsModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setEmailExistsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.emailModalContent}>
          <View style={styles.emailModalHeader}>
            <Text style={styles.emailModalTitle}>⚠️ Email Already Registered</Text>
          </View>

          <View style={styles.emailModalBody}>
            <Text style={styles.emailModalText}>
              The email <Text style={styles.emailHighlight}>{ownerInfo.email}</Text> is already registered in our system.
            </Text>

            <Text style={styles.emailModalSubtext}>
              You can either:
            </Text>

            <View style={styles.emailModalOptions}>
              <View style={styles.optionCard}>
                <Text style={styles.optionNumber}>1</Text>
                <Text style={styles.optionTitle}>Use a Different Email</Text>
                <Text style={styles.optionDesc}>
                  Change your email address to continue with new registration
                </Text>
              </View>

              <View style={styles.optionCard}>
                <Text style={styles.optionNumber}>2</Text>
                <Text style={styles.optionTitle}>Login to Existing Account</Text>
                <Text style={styles.optionDesc}>
                  If this is your email, login to your existing account
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.emailModalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.changeEmailButton]}
              onPress={() => {
                setEmailExistsModal(false);
                setOwnerInfo(prev => ({ ...prev, email: "" }));
              }}
            >
              <Text style={styles.changeEmailButtonText}>Change Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.loginButton]}
              onPress={() => {
                setEmailExistsModal(false);
                router.push("/HostelOwnerLogin");
              }}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ✅ Submit form to backend
  const handleSubmit = async () => {
    // First validate form
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Please fix the errors before submitting."
      });
      return;
    }

    try {
      setIsSubmitted(true);
      setApiError(""); // Clear previous API errors

      const formDataToSend = new FormData();

      // Append owner information
      formDataToSend.append("fullName", ownerInfo.fullName.trim());
      formDataToSend.append("email", ownerInfo.email.trim());
      formDataToSend.append("mobileNumber", ownerInfo.mobileNumber.trim());
      formDataToSend.append("numberOfHostels", numberOfHostels.toString());

      // Append hostels data as JSON
      const hostelsData = hostels.map(hostel => ({
        hostelName: hostel.hostelName.trim(),
        hostelType: hostel.hostelType,
        govtRegistrationId: hostel.govtRegistrationId.trim(),
        fullAddress: hostel.fullAddress.trim(),
      }));

      formDataToSend.append("hostels", JSON.stringify(hostelsData));

      // Append documents for each hostel
      hostels.forEach((hostel, hostelIndex) => {
        hostel.documents.forEach((file) => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          let mimeType = 'application/pdf';

          if (ext === 'png') mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

          formDataToSend.append(
            `hostel_${hostelIndex}_documents`,
            {
              uri: file.uri,
              type: mimeType,
              name: file.name,
            } as any
          );
        });
      });


      console.log("📎 Total files to upload:", hostels.reduce((sum, hostel) => sum + hostel.documents.length, 0));

      // ✅ POST API Call
      const response = await ApiClient.post("/hostel-registration/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Registration Success:", response.data);

      Toast.show({
        type: "success",
        text1: "Registration successful!",
        text2: `${numberOfHostels} hostel${numberOfHostels > 1 ? 's' : ''} registered. Please wait for admin approval.`,
      });

      // Show progress steps
      setTimeout(() => setCurrentStep(2), 2000);
      setTimeout(() => setCurrentStep(3), 5000);
      setTimeout(() => setCurrentStep(4), 8000);
    } catch (error: any) {
      console.error("❌ Registration failed:", error);

      if (error.response) {
        console.error("📋 Backend error response:", {
          status: error.response.status,
          data: error.response.data,
        });

        const errorMessage =
          error.response.data?.message ||
          error.response.data?.errors?.[0]?.msg ||
          "Registration failed. Please try again.";

        // Check if error is about email already registered
        if (errorMessage.toLowerCase().includes("email already") ||
          errorMessage.toLowerCase().includes("email exists") ||
          error.response.status === 400 && errorMessage === "Email already registered") {

          // Show custom modal instead of toast
          setEmailExistsModal(true);
          setApiError(errorMessage);

        } else {
          // For other errors, show toast
          Toast.show({
            type: "error",
            text1: "Registration Failed",
            text2: errorMessage,
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your connection and try again",
        });
      }

      setIsSubmitted(false);
    }
  };

  // ✅ Image Preview Modal
  const ImagePreviewModal = () => (
    <Modal
      visible={previewVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setPreviewVisible(false);
        setPreviewUri("");
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );

  // ✅ Approved Step
  if (isSubmitted && currentStep === 4) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredApproved}>
          <Text style={styles.bigEmoji}>✅</Text>
          <Text style={styles.approvedTitle}>Approved!</Text>
          <Text style={styles.subtitle}>
            Your {numberOfHostels} hostel registration{numberOfHostels > 1 ? 's' : ''} {numberOfHostels > 1 ? 'have' : 'has'} been successfully verified.
          </Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.push("/HostelOwnerLogin")}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </SafeAreaView>
    );
  }

  // ✅ Progress stepper while verifying
  if (isSubmitted) {
    const steps = [
      { id: 1, title: "Form Submitted", description: "Your registration has been submitted." },
      { id: 2, title: "Under Review", description: "Our team is verifying your documents." },
      { id: 3, title: "Verification Pending", description: "You'll get login access once approved." },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.centered}>
          <Text style={styles.pageTitle}>Verification Progress</Text>
          <View style={styles.stepper}>
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const isLast = index === steps.length - 1;
              return (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepIndicatorWrapper}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && { backgroundColor: ACCENT },
                        isActive && { borderWidth: 3, borderColor: ACCENT },
                      ]}
                    >
                      {isCompleted && <Text style={styles.stepCheck}>✓</Text>}
                    </View>
                    {!isLast && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, (isCompleted || isActive) && { color: ACCENT }]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <Toast />
      </SafeAreaView>
    );
  }

  // ✅ Already verified screen
  if (alreadyVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.bigEmoji}>✅</Text>
          <Text style={styles.title}>Already Verified</Text>
          <Text style={styles.subtitle}>You can sign in to your dashboard.</Text>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.push("/HostelOwnerLogin")}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </SafeAreaView>
    );
  }

  // Get current hostel
  const currentHostel = hostels[currentHostelIndex];

  // ✅ Main Registration Form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Hostel Owner Registration</Text>

          <View style={styles.card}>
            {/* Owner Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Owner Information</Text>

              <FormInput
                label="Full Name *"
                value={ownerInfo.fullName}
                onChangeText={(t: string) => handleOwnerFieldChange('fullName', t)}
                onBlur={() => validateField('fullName', ownerInfo.fullName)}
                error={errors.fullName}
                placeholder="Enter your full name"
                maxLength={50}
              />

              <FormInput
                label="Email *"
                value={ownerInfo.email}
                onChangeText={(t: string) => handleOwnerFieldChange('email', t)}
                onBlur={() => validateField('email', ownerInfo.email)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                placeholder="Enter your email"
                maxLength={100}
              />

              <FormInput
                label="Mobile Number *"
                value={ownerInfo.mobileNumber}
                onChangeText={(t: string) => {
                  const numericValue = t.replace(/[^0-9]/g, '');
                  handleOwnerFieldChange('mobileNumber', numericValue);
                }}
                onBlur={() => validateField('mobileNumber', ownerInfo.mobileNumber)}
                keyboardType="phone-pad"
                error={errors.mobileNumber}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
            </View>

            {/* Number of Hostels Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Hostels</Text>
              <Text style={styles.sectionSubtitle}>Select how many hostels you want to register (max 10)</Text>

              <View style={styles.hostelCountContainer}>
                {HOSTEL_COUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.hostelCountButton,
                      numberOfHostels === option.value && styles.hostelCountButtonSelected
                    ]}
                    onPress={() => handleNumberOfHostelsChange(option.value)}
                  >
                    <Text style={[
                      styles.hostelCountText,
                      numberOfHostels === option.value && styles.hostelCountTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hostel Information Section */}
            <View style={styles.section}>
              <View style={styles.hostelHeader}>
                <Text style={styles.sectionTitle}>
                  Hostel {currentHostelIndex + 1} of {hostels.length}
                </Text>

                <View style={styles.hostelNavigation}>
                  <TouchableOpacity
                    style={[styles.navButton, currentHostelIndex === 0 && styles.navButtonDisabled]}
                    onPress={goToPrevHostel}
                    disabled={currentHostelIndex === 0}
                  >
                    <Text style={styles.navButtonText}>← Previous</Text>
                  </TouchableOpacity>

                  <Text style={styles.hostelCounter}>
                    {currentHostelIndex + 1}/{hostels.length}
                  </Text>

                  <TouchableOpacity
                    style={[styles.navButton, currentHostelIndex === hostels.length - 1 && styles.navButtonDisabled]}
                    onPress={goToNextHostel}
                    disabled={currentHostelIndex === hostels.length - 1}
                  >
                    <Text style={styles.navButtonText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionSubtitle}>
                Fill details for Hostel {currentHostelIndex + 1}
              </Text>

              <FormInput
                label="Hostel Name *"
                value={currentHostel.hostelName}
                onChangeText={(t: string) => handleHostelFieldChange('hostelName', t)}
                onBlur={() => validateField('hostelName', currentHostel.hostelName, false)}
                error={currentHostel.errors.hostelName}
                placeholder={`Enter name for Hostel ${currentHostelIndex + 1}`}
                maxLength={100}
              />

              {/* Hostel Type Selector */}
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Hostel Type *</Text>
                <View style={styles.hostelTypeContainer}>
                  {HOSTEL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.hostelTypeButton,
                        currentHostel.hostelType === type.value && styles.hostelTypeButtonSelected
                      ]}
                      onPress={() => {
                        handleHostelFieldChange('hostelType', type.value);
                        if (currentHostel.errors.hostelType) {
                          const updatedHostels = [...hostels];
                          updatedHostels[currentHostelIndex].errors = {
                            ...updatedHostels[currentHostelIndex].errors,
                            hostelType: ""
                          };
                          setHostels(updatedHostels);
                        }
                      }}
                    >
                      <Text style={styles.hostelTypeIcon}>{type.icon}</Text>
                      <Text style={[
                        styles.hostelTypeLabel,
                        currentHostel.hostelType === type.value && styles.hostelTypeLabelSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {currentHostel.errors.hostelType && (
                  <Text style={styles.errorText}>{currentHostel.errors.hostelType}</Text>
                )}
              </View>

              <FormInput
                label="Govt. Registration ID *"
                value={currentHostel.govtRegistrationId}
                onChangeText={(t: string) => handleHostelFieldChange('govtRegistrationId', t)}
                onBlur={() => validateField('govtRegistrationId', currentHostel.govtRegistrationId, false)}
                error={currentHostel.errors.govtRegistrationId}
                placeholder="Enter government registration ID"
                maxLength={50}
              />

              {/* File Upload Section for Current Hostel */}
              <View style={styles.uploadContainer}>
                <Text style={styles.inputLabel}>Upload Documents for Hostel {currentHostelIndex + 1} *</Text>
                <Text style={styles.requiredDocs}>
                  Upload: Licence, Aadhaar, PAN, NOC, Property Docs (PDF or Images)
                </Text>
                <Text style={styles.fileLimitText}>Max 10 files per hostel • PDF, PNG, JPG</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={handleFileUpload}>
                  <Text style={styles.uploadBtnText}>📁 Choose Files</Text>
                </TouchableOpacity>
                {currentHostel.errors.documents && (
                  <Text style={styles.errorText}>{currentHostel.errors.documents}</Text>
                )}

                {currentHostel.documents.length > 0 && (
                  <View style={styles.fileCountContainer}>
                    <Text style={styles.fileCountText}>
                      {currentHostel.documents.length} file{currentHostel.documents.length !== 1 ? 's' : ''} selected for this hostel
                    </Text>
                  </View>
                )}

                {currentHostel.documents.map((file, i) => (
                  <View key={i} style={styles.fileCard}>
                    <View style={styles.fileHeader}>
                      <Text style={styles.fileItem} numberOfLines={1} ellipsizeMode="middle">
                        {file.name}
                      </Text>
                      <Text style={styles.fileTypeBadge}>
                        {file.type === 'image' ? '📷 Image' : '📄 PDF'}
                      </Text>
                    </View>
                    <View style={styles.fileActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleViewFile(file)}
                        style={[styles.fileActionBtn, styles.viewBtn]}
                      >
                        <Text style={styles.fileActionText}>
                          {file.type === 'image' ? '👀 Preview' : '📄 View'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveFile(i)}
                        style={[styles.fileActionBtn, styles.removeBtn]}
                      >
                        <Text style={styles.fileActionText}>🗑 Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <FormInput
                label="Full Address *"
                value={currentHostel.fullAddress}
                onChangeText={(t: string) => handleHostelFieldChange('fullAddress', t)}
                onBlur={() => validateField('fullAddress', currentHostel.fullAddress, false)}
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: "top", minHeight: 100 }}
                error={currentHostel.errors.fullAddress}
                placeholder="Enter complete hostel address"
                maxLength={500}
              />
            </View>

            {/* Validation Summary */}
            {(Object.keys(errors).length > 0 || hostels.some(h => Object.keys(h.errors).length > 0)) && (
              <View style={styles.validationSummary}>
                <Text style={styles.validationTitle}>Please fix the following errors:</Text>
                {Object.entries(errors).map(([key, value]) => (
                  value && <Text key={key} style={styles.validationError}>• Owner: {value}</Text>
                ))}
                {hostels.map((hostel, index) => (
                  Object.entries(hostel.errors).map(([key, value]) => (
                    value && (
                      <Text key={`hostel-${index}-${key}`} style={styles.validationError}>
                        • Hostel {index + 1}: {value}
                      </Text>
                    )
                  ))
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.buttonSubmit, isSubmitted && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitted}
            >
              <Text style={styles.buttonSubmitText}>
                {isSubmitted ? "Submitting..." : `Register ${numberOfHostels} Hostel${numberOfHostels > 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/HostelOwnerLogin")}
              style={{ marginTop: 16 }}
            >
              <Text style={styles.linkText}>Already Verified? Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/")} style={{ marginTop: 14 }}>
              <Text style={styles.backText}>⬅ Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <ImagePreviewModal />

      {/* Email Already Registered Modal */}
      <EmailExistsModal />

      <Toast />
    </SafeAreaView>
  );
}

function FormInput({ label, error, style, onBlur, maxLength, ...props }: any) {
  const [focused, setFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(props.value?.length || 0);

  const handleChangeText = (text: string) => {
    if (maxLength && text.length > maxLength) {
      text = text.substring(0, maxLength);
    }
    setCharacterCount(text.length);
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  };

  return (
    <View style={{ marginBottom: 16, width: "100%" }}>
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.inputLabel,
            focused && { color: ACCENT },
            error && { color: ERROR },
          ]}
        >
          {label}
        </Text>
        {maxLength && (
          <Text style={styles.characterCount}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          focused && {
            borderColor: ACCENT,
            backgroundColor: "#fff",
            color: TEXT_DARK,
          },
          error && { borderColor: ERROR },
          style,
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (onBlur) onBlur();
        }}
        placeholderTextColor="#9ca3af"
        onChangeText={handleChangeText}
        value={props.value}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: BG,
  },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  centered: {
    flexGrow: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 24,
  },
  centeredApproved: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: ACCENT,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1.5,
    width: "100%",
  },
  card: {
    backgroundColor: CARD,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  section: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginBottom: 16,
  },
  hostelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostelNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_GRAY,
  },
  hostelCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
    marginHorizontal: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    color: TEXT_GRAY,
    fontWeight: "600",
    fontSize: 14,
  },
  characterCount: {
    fontSize: 12,
    color: TEXT_GRAY,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_DARK,
    backgroundColor: "#fff",
  },
  errorText: {
    color: ERROR,
    fontSize: 13,
    marginTop: 4,
  },
  requiredDocs: {
    color: TEXT_GRAY,
    fontSize: 13,
    marginBottom: 4,
  },
  fileLimitText: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 8,
  },
  uploadContainer: { marginBottom: 22 },
  uploadBtn: {
    backgroundColor: BUTTON,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: BUTTON,
  },
  uploadBtnText: {
    color: BG,
    fontWeight: "700",
    fontSize: 15,
  },
  fileCountContainer: {
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  fileCountText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  fileCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fileItem: {
    color: TEXT_GRAY,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  fileTypeBadge: {
    fontSize: 12,
    color: TEXT_GRAY,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileActionsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  fileActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  viewBtn: {
    backgroundColor: ACCENT,
  },
  removeBtn: {
    backgroundColor: ERROR,
  },
  fileActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: BUTTON,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: BG,
    fontWeight: "700",
    fontSize: 16,
  },
  buttonSubmit: {
    backgroundColor: BUTTON,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  buttonSubmitText: {
    color: BG,
    fontWeight: "700",
    fontSize: 16,
  },
  bigEmoji: { fontSize: 70, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: ACCENT,
    marginBottom: 10,
  },
  approvedTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: ACCENT,
    marginBottom: 12,
  },
  subtitle: {
    color: TEXT_GRAY,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  linkText: {
    color: ACCENT,
    textAlign: "center",
    fontWeight: "600",
  },
  backText: {
    color: "#6b7280",
    textAlign: "center",
  },
  // Stepper
  stepper: {
    marginTop: 20,
    width: "100%",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  stepIndicatorWrapper: {
    alignItems: "center",
    marginRight: 14,
    position: "relative",
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  stepCheck: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepLine: {
    position: "absolute",
    top: 26,
    left: 12,
    width: 2,
    height: 40,
    backgroundColor: "#ccc",
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_GRAY,
  },
  stepDesc: {
    fontSize: 14,
    color: TEXT_GRAY,
    marginTop: 4,
  },
  // Validation Summary
  validationSummary: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  validationTitle: {
    color: "#991b1b",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 14,
  },
  validationError: {
    color: "#991b1b",
    fontSize: 13,
    marginLeft: 4,
    marginTop: 2,
  },
  // Image Preview Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // Email Already Registered Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emailModalHeader: {
    backgroundColor: '#fef3c7',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  emailModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    textAlign: 'center',
  },
  emailModalBody: {
    padding: 24,
  },
  emailModalText: {
    fontSize: 16,
    color: TEXT_GRAY,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  emailModalSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 16,
    textAlign: 'center',
  },
  emailModalOptions: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: TEXT_GRAY,
    lineHeight: 20,
  },
  emailModalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeEmailButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  loginButton: {
    backgroundColor: ACCENT,
  },
  changeEmailButtonText: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Hostel Type Selector
  hostelTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hostelTypeButton: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  hostelTypeButtonSelected: {
    borderColor: '#4CBB17',
    backgroundColor: '#f0fff4',
  },
  hostelTypeIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  hostelTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  hostelTypeLabelSelected: {
    color: '#4CBB17',
  },
  label: {
    color: TEXT_GRAY,
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
  },
  // Hostel Count Selector
  hostelCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  hostelCountButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  hostelCountButtonSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  hostelCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_GRAY,
  },
  hostelCountTextSelected: {
    color: '#fff',
  },
});