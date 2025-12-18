// import React, { useState, useEffect } from "react";
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import Toast from "react-native-toast-message";

// const { width, height } = Dimensions.get("window");
// const KELLY_GREEN = "#4CBB17";
// const GOLDEN_YELLOW = "#FFDF00";

// const BankDetailsScreen = () => {
//   const router = useRouter();

//   const [accountHolderName, setAccountHolderName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [ifscCode, setIfscCode] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [branchName, setBranchName] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [loading, setLoading] = useState(false);

//   const validateAndSubmit = () => {
//     if (
//       !accountHolderName.trim() ||
//       !accountNumber.trim() ||
//       !ifscCode.trim() ||
//       !bankName.trim() ||
//       !branchName.trim()
//     ) {
//       Toast.show({
//         type: "error",
//         text1: "Missing Fields",
//         text2: "Please fill all required fields.",
//       });
//       return;
//     }

//     // Add any further validation as needed (e.g., IFSC format)

//     setLoading(true);

//     // Simulate API call or data saving
//     setTimeout(() => {
//       setLoading(false);
//       Toast.show({
//         type: "success",
//         text1: "Saved Successfully",
//         text2: "Bank details have been updated.",
//       });
//       router.back();
//     }, 1500);
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.safeArea}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Back Button */}
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Icon name="arrow-left" size={width * 0.06} color={KELLY_GREEN} />
//         </TouchableOpacity>

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Icon name="bank" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
//           <Text style={styles.header}>Bank Details</Text>
//           <Text style={styles.subHeader}>Add your bank information</Text>
//         </View>

//         {/* Input Fields */}
//         <View style={styles.card}>
//           <InputField
//             label="Account Holder Name"
//             value={accountHolderName}
//             onChangeText={setAccountHolderName}
//             placeholder="Enter account holder name"
//           />
//           <InputField
//             label="Account Number"
//             value={accountNumber}
//             onChangeText={setAccountNumber}
//             placeholder="Enter account number"
//             keyboardType="numeric"
//           />
//           <InputField
//             label="IFSC Code"
//             value={ifscCode}
//             onChangeText={setIfscCode}
//             placeholder="Enter IFSC code"
//             autoCapitalize="characters"
//             maxLength={11}
//           />
//           <InputField
//             label="Bank Name"
//             value={bankName}
//             onChangeText={setBankName}
//             placeholder="Enter bank name"
//           />
//           <InputField
//             label="Branch Name"
//             value={branchName}
//             onChangeText={setBranchName}
//             placeholder="Enter branch name"
//           />
//           <InputField
//             label="UPI ID (Optional)"
//             value={upiId}
//             onChangeText={setUpiId}
//             placeholder="Enter UPI ID"
//             autoCapitalize="none"
//           />
//         </View>

//         {/* Save Button */}
//         <TouchableOpacity
//           style={[styles.saveButton, loading && styles.saveButtonDisabled]}
//           onPress={validateAndSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#222" />
//           ) : (
//             <Text style={styles.saveText}>Save Details</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>

//       <Toast />
//     </KeyboardAvoidingView>
//   );
// };

// const InputField = ({
//   label,
//   value,
//   onChangeText,
//   placeholder,
//   keyboardType = "default",
//   autoCapitalize = "words",
//   maxLength,
// }: {
//   label: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   placeholder: string;
//   keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
//   autoCapitalize?: "none" | "sentences" | "words" | "characters";
//   maxLength?: number;
// }) => (
//   <View style={{ marginBottom: 14 }}>
//     <Text style={styles.inputLabel}>{label}</Text>
//     <TextInput
//       style={styles.input}
//       value={value}
//       onChangeText={onChangeText}
//       placeholder={placeholder}
//       keyboardType={keyboardType}
//       autoCapitalize={autoCapitalize}
//       maxLength={maxLength}
//       placeholderTextColor="#888"
//     />
//   </View>
// );

// export default BankDetailsScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 40,
//     alignItems: "center",
//   },

//   backBtn: { marginTop: height * 0.02, alignSelf: "flex-start", paddingHorizontal: 10 },

//   headerContainer: { alignItems: "center", marginBottom: 16, marginTop: 6 },
//   header: { fontSize: width * 0.06, fontWeight: "900", color: KELLY_GREEN, textAlign: "center" },
//   subHeader: {
//     fontSize: width * 0.04,
//     color: "#161515",
//     textAlign: "center",
//     marginTop: 4,
//     paddingHorizontal: 20,
//   },

//   card: {
//     width: "100%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 3,
//   },

//   inputLabel: {
//     fontSize: 14,
//     color: KELLY_GREEN,
//     marginBottom: 6,
//     fontWeight: "600",
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: "#222",
//     backgroundColor: "#fafafa",
//   },

//   saveButton: {
//     alignSelf: "center",
//     width: width * 0.55,
//     backgroundColor: GOLDEN_YELLOW,
//     paddingVertical: 14,
//     borderRadius: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 5,
//     marginTop: 20,
//     marginBottom: 40,
//   },
//   saveButtonDisabled: {
//     opacity: 0.6,
//   },
//   saveText: {
//     color: "#222",
//     fontSize: width * 0.042,
//     fontWeight: "700",
//     letterSpacing: 1,
//   },
// });


//-----------------------------------------------------------------------------------------------------------------------

// import React, { useState, useEffect } from "react";
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import Toast from "react-native-toast-message";
// import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
// import ApiClient from "@/app/api/ApiClient";

// const { width, height } = Dimensions.get("window");
// const KELLY_GREEN = "#4CBB17";
// const GOLDEN_YELLOW = "#FFDF00";

// interface BankDetails {
//   accountHolderName: string;
//   accountNumber: string;
//   ifscCode: string;
//   bankName: string;
//   branchName: string;
//   upiId?: string;
//   isVerified?: boolean;
// }

// interface BankResponse {
//   success: boolean;
//   message: string;
//   data: {
//     bankDetails: BankDetails;
//   };
// }

// const BankDetailsScreen = () => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   // Get state from redux
//   const { user } = useAppSelector((state) => state.auth);

//   // Form state
//   const [accountHolderName, setAccountHolderName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [ifscCode, setIfscCode] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [branchName, setBranchName] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [errors, setErrors] = useState<{[key: string]: string}>({});
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

//   // Load bank details on mount
//   useEffect(() => {
//     loadBankDetails();
//   }, []);

//   const loadBankDetails = async () => {
//     setLoading(true);
//     try {
//       // First check if we have bank details in user data
//       if (user?.bankDetails) {
//         setBankDetails(user.bankDetails);
//         populateForm(user.bankDetails);
//       } else {
//         // Optionally, you could fetch bank details from API here
//         // const response = await ApiClient.get<BankResponse>('/bank/details');
//         // if (response.success) {
//         //   setBankDetails(response.data.bankDetails);
//         //   populateForm(response.data.bankDetails);
//         // }
//       }
//     } catch (error) {
//       console.error('Error loading bank details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const populateForm = (details: BankDetails) => {
//     setAccountHolderName(details.accountHolderName || "");
//     setAccountNumber(details.accountNumber || "");
//     setIfscCode(details.ifscCode || "");
//     setBankName(details.bankName || "");
//     setBranchName(details.branchName || "");
//     setUpiId(details.upiId || "");
//   };

//   const validateForm = () => {
//     const newErrors: {[key: string]: string} = {};

//     if (!accountHolderName.trim()) {
//       newErrors.accountHolderName = "Account holder name is required";
//     }

//     if (!accountNumber.trim()) {
//       newErrors.accountNumber = "Account number is required";
//     } else if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''))) {
//       newErrors.accountNumber = "Account number should be 9-18 digits";
//     }

//     if (!ifscCode.trim()) {
//       newErrors.ifscCode = "IFSC code is required";
//     } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
//       newErrors.ifscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
//     }

//     if (!bankName.trim()) {
//       newErrors.bankName = "Bank name is required";
//     }

//     if (!branchName.trim()) {
//       newErrors.branchName = "Branch name is required";
//     }

//     if (upiId && !/^[\w.-]+@[\w]+$/.test(upiId)) {
//       newErrors.upiId = "Invalid UPI ID format (e.g., name@bank)";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     const bankData = {
//       accountHolderName,
//       accountNumber,
//       ifscCode,
//       bankName,
//       branchName,
//       upiId,
//     };

//     setSaving(true);
//     try {
//       const response = await ApiClient.post<BankResponse>('/bank/details', bankData);

//       if (response.success) {
//         Toast.show({
//           type: 'success',
//           text1: 'Success',
//           text2: 'Bank details updated successfully!',
//         });
//         setBankDetails(response.data.bankDetails);
//         router.back();
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Error',
//           text2: response.message || 'Failed to update bank details',
//         });
//       }
//     } catch (error: any) {
//       console.error('Update error:', error);
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: error.response?.data?.message || 'Failed to update bank details',
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={KELLY_GREEN} />
//         <Text style={styles.loadingText}>Loading bank details...</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.safeArea}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Back Button */}
//         <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//           <Icon name="arrow-left" size={width * 0.06} color={KELLY_GREEN} />
//         </TouchableOpacity>

//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Icon name="bank" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
//           <Text style={styles.header}>Bank Details</Text>
//           <Text style={styles.subHeader}>Add or update your bank information</Text>

//           {/* Show verification status */}
//           {bankDetails?.isVerified && (
//             <View style={styles.verifiedBadge}>
//               <Icon name="check-circle" size={16} color="white" />
//               <Text style={styles.verifiedText}>Verified</Text>
//             </View>
//           )}
//         </View>

//         {/* Input Fields */}
//         <View style={styles.card}>
//           <InputField
//             label="Account Holder Name *"
//             value={accountHolderName}
//             onChangeText={(text) => {
//               setAccountHolderName(text);
//               if (errors.accountHolderName) setErrors({...errors, accountHolderName: ''});
//             }}
//             placeholder="Enter account holder name"
//             error={errors.accountHolderName}
//             disabled={saving}
//           />

//           <InputField
//             label="Account Number *"
//             value={accountNumber}
//             onChangeText={(text) => {
//               setAccountNumber(text.replace(/[^0-9]/g, ''));
//               if (errors.accountNumber) setErrors({...errors, accountNumber: ''});
//             }}
//             placeholder="Enter account number"
//             keyboardType="numeric"
//             maxLength={18}
//             error={errors.accountNumber}
//             disabled={saving}
//           />

//           <InputField
//             label="IFSC Code *"
//             value={ifscCode}
//             onChangeText={(text) => {
//               setIfscCode(text.toUpperCase());
//               if (errors.ifscCode) setErrors({...errors, ifscCode: ''});
//             }}
//             placeholder="Enter IFSC code"
//             autoCapitalize="characters"
//             maxLength={11}
//             error={errors.ifscCode}
//             disabled={saving}
//           />

//           <InputField
//             label="Bank Name *"
//             value={bankName}
//             onChangeText={(text) => {
//               setBankName(text);
//               if (errors.bankName) setErrors({...errors, bankName: ''});
//             }}
//             placeholder="Enter bank name"
//             error={errors.bankName}
//             disabled={saving}
//           />

//           <InputField
//             label="Branch Name *"
//             value={branchName}
//             onChangeText={(text) => {
//               setBranchName(text);
//               if (errors.branchName) setErrors({...errors, branchName: ''});
//             }}
//             placeholder="Enter branch name"
//             error={errors.branchName}
//             disabled={saving}
//           />

//           <InputField
//             label="UPI ID (Optional)"
//             value={upiId}
//             onChangeText={(text) => {
//               setUpiId(text.toLowerCase());
//               if (errors.upiId) setErrors({...errors, upiId: ''});
//             }}
//             placeholder="Enter UPI ID"
//             autoCapitalize="none"
//             error={errors.upiId}
//             disabled={saving}
//           />

//           <Text style={styles.noteText}>
//             * Required fields. Please ensure all details are accurate.
//           </Text>
//         </View>

//         {/* Save Button */}
//         <TouchableOpacity
//           style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={saving}
//         >
//           {saving ? (
//             <ActivityIndicator size="small" color="#222" />
//           ) : (
//             <Text style={styles.saveText}>
//               {bankDetails ? 'Update Details' : 'Save Details'}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>

//       <Toast />
//     </KeyboardAvoidingView>
//   );
// };

// const InputField = ({
//   label,
//   value,
//   onChangeText,
//   placeholder,
//   keyboardType = "default",
//   autoCapitalize = "words",
//   maxLength,
//   error,
//   disabled = false,
// }: {
//   label: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   placeholder: string;
//   keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
//   autoCapitalize?: "none" | "sentences" | "words" | "characters";
//   maxLength?: number;
//   error?: string;
//   disabled?: boolean;
// }) => (
//   <View style={{ marginBottom: 14 }}>
//     <Text style={styles.inputLabel}>{label}</Text>
//     <TextInput
//       style={[styles.input, error && styles.inputError, disabled && styles.inputDisabled]}
//       value={value}
//       onChangeText={onChangeText}
//       placeholder={placeholder}
//       keyboardType={keyboardType}
//       autoCapitalize={autoCapitalize}
//       maxLength={maxLength}
//       placeholderTextColor="#888"
//       editable={!disabled}
//     />
//     {error && <Text style={styles.errorText}>{error}</Text>}
//   </View>
// );

// export default BankDetailsScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#fff" },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 40,
//     alignItems: "center",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: KELLY_GREEN,
//   },
//   backBtn: { marginTop: height * 0.02, alignSelf: "flex-start", paddingHorizontal: 10 },
//   headerContainer: { alignItems: "center", marginBottom: 16, marginTop: 6 },
//   header: { fontSize: width * 0.06, fontWeight: "900", color: KELLY_GREEN, textAlign: "center" },
//   subHeader: {
//     fontSize: width * 0.04,
//     color: "#161515",
//     textAlign: "center",
//     marginTop: 4,
//     paddingHorizontal: 20,
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginTop: 8,
//   },
//   verifiedText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   card: {
//     width: "100%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: KELLY_GREEN,
//     marginBottom: 6,
//     fontWeight: "600",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: "#222",
//     backgroundColor: "#fafafa",
//   },
//   inputError: {
//     borderColor: '#FF6B6B',
//     backgroundColor: '#FFF5F5',
//   },
//   inputDisabled: {
//     backgroundColor: '#f0f0f0',
//     color: '#666',
//   },
//   errorText: {
//     color: '#FF6B6B',
//     fontSize: 12,
//     marginTop: 4,
//   },
//   noteText: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 8,
//   },
//   saveButton: {
//     alignSelf: "center",
//     width: width * 0.55,
//     backgroundColor: GOLDEN_YELLOW,
//     paddingVertical: 14,
//     borderRadius: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 5,
//     marginTop: 20,
//     marginBottom: 40,
//   },
//   saveButtonDisabled: {
//     opacity: 0.6,
//   },
//   saveText: {
//     color: "#222",
//     fontSize: width * 0.042,
//     fontWeight: "700",
//     letterSpacing: 1,
//   },
// });


//----------------------------------------------------------------------------------------------------------------------
// app/BankDetailsPage.tsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import ApiClient from './api/ApiClient';
import { setBankStatusCompleted, setBankStatusPending } from './utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth } from './reduxStore/reduxSlices/authSlice';

const { width, height } = Dimensions.get('window');
const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  isVerified?: boolean;
}

const BankDetailsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      if (user?.bankDetails) {
        setBankDetails(user.bankDetails as BankDetails);
        populateForm(user.bankDetails as BankDetails);
      }
    } catch (e) {
      console.warn('Error loading bank details:', e);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (details: BankDetails) => {
    setAccountHolderName(details.accountHolderName || '');
    setAccountNumber(details.accountNumber || '');
    setIfscCode(details.ifscCode || '');
    setBankName(details.bankName || '');
    setBranchName(details.branchName || '');
    setUpiId(details.upiId || '');
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};

    if (!accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
    if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    else if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''))) newErrors.accountNumber = 'Account number should be 9-18 digits';
    if (!ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) newErrors.ifscCode = 'Invalid IFSC code format (e.g., SBIN0001234)';
    if (!bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!branchName.trim()) newErrors.branchName = 'Branch name is required';
    if (upiId && !/^[\w.-]+@[\w]+$/.test(upiId)) newErrors.upiId = 'Invalid UPI ID format (e.g., name@bank)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({ type: 'error', text1: 'Please fix the errors' });
      return;
    }

    setSaving(true);

    const payload = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      upiId: upiId?.trim() || undefined,
    };

    try {
      const response = await ApiClient.post<{ success: boolean; message?: string; data?: { bankDetails?: BankDetails; user?: any } }>('/bank/details', payload);

      if (!response || response.success === false) {
        const msg = response?.message || 'Failed to save bank details';
        Toast.show({ type: 'error', text1: 'Error', text2: msg });
        await setBankStatusPending();
        setSaving(false);
        return;
      }

      const savedBank = response?.data?.bankDetails || { ...payload, isVerified: false };

      try {
        const rawUser = await AsyncStorage.getItem('user');
        let updatedUser = user || null;
        if (rawUser) {
          updatedUser = JSON.parse(rawUser);
          if (updatedUser) {
            updatedUser.bankDetails = { ...savedBank, isVerified: !!savedBank.isVerified };
          }
        } else if (user) {
          updatedUser = { ...user, bankDetails: { ...savedBank, isVerified: !!savedBank.isVerified } };
        }

        if (updatedUser) {
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.warn('Error updating user in storage after bank save', e);
      }

      await setBankStatusCompleted();

      try {
        await dispatch(initializeAuth());
      } catch (e) {
        console.warn('Error dispatching initializeAuth after bank save', e);
      }

      Toast.show({ type: 'success', text1: 'Bank details saved' });
      router.replace('/HostelDetails');
    } catch (error: any) {
      console.error('Bank save error: ', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to save' });
      await setBankStatusPending();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert('Skip bank details', 'Are you sure you want to skip adding bank details? You can add them later from Profile.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        style: 'destructive',
        onPress: async () => {
          try {
            await setBankStatusCompleted();
            const rawUser = await AsyncStorage.getItem('user');
            if (rawUser) {
              const parsed = JSON.parse(rawUser);
              parsed.bankDetails = parsed.bankDetails || { isVerified: false };
              await AsyncStorage.setItem('user', JSON.stringify(parsed));
            }
            await dispatch(initializeAuth());
            router.replace('/HostelDetails');
          } catch (e) {
            console.warn('Error during skip flow', e);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not skip. Try again.' });
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KELLY_GREEN} />
        <Text style={styles.loadingText}>Loading bank details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Icon name="bank" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
          <Text style={styles.headerText}>Add Your Bank Details</Text>
          
          {bankDetails?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={16} color="#fff" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Bank Details Card */}
        <View style={styles.card}>
          {/* Input Fields */}
          <InputField 
            label="Account Holder Name *" 
            value={accountHolderName} 
            onChangeText={(t) => { setAccountHolderName(t); if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: '' }); }} 
            placeholder="Enter account holder name" 
            iconName="account"
            error={errors.accountHolderName} 
            disabled={saving} 
          />

          <InputField 
            label="Account Number *" 
            value={accountNumber} 
            onChangeText={(t) => { setAccountNumber(t.replace(/[^0-9]/g, '')); if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' }); }} 
            placeholder="Enter account number" 
            keyboardType="numeric"
            iconName="credit-card"
            maxLength={18} 
            error={errors.accountNumber} 
            disabled={saving} 
          />

          <InputField 
            label="IFSC Code *" 
            value={ifscCode} 
            onChangeText={(t) => { setIfscCode(t.toUpperCase()); if (errors.ifscCode) setErrors({ ...errors, ifscCode: '' }); }} 
            placeholder="Enter IFSC code" 
            autoCapitalize="characters"
            iconName="identifier"
            maxLength={11} 
            error={errors.ifscCode} 
            disabled={saving} 
          />

          <InputField 
            label="Bank Name *" 
            value={bankName} 
            onChangeText={(t) => { setBankName(t); if (errors.bankName) setErrors({ ...errors, bankName: '' }); }} 
            placeholder="Enter bank name" 
            iconName="bank"
            error={errors.bankName} 
            disabled={saving} 
          />

          <InputField 
            label="Branch Name *" 
            value={branchName} 
            onChangeText={(t) => { setBranchName(t); if (errors.branchName) setErrors({ ...errors, branchName: '' }); }} 
            placeholder="Enter branch name" 
            iconName="map-marker"
            error={errors.branchName} 
            disabled={saving} 
          />

          <InputField 
            label="UPI ID (Optional)" 
            value={upiId} 
            onChangeText={(t) => { setUpiId(t.toLowerCase()); if (errors.upiId) setErrors({ ...errors, upiId: '' }); }} 
            placeholder="Enter UPI ID" 
            autoCapitalize="none"
            iconName="qrcode"
            error={errors.upiId} 
            disabled={saving} 
          />

          {/* Note */}
          <View style={styles.noteCard}>
            <Icon name="information-outline" size={18} color={KELLY_GREEN} />
            <Text style={styles.noteText}>
              * Required fields. Ensure all details are accurate for successful payments.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.skipButton, saving && { opacity: 0.5 }]}
            onPress={handleSkip}
            disabled={saving}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {bankDetails ? 'Update & Next' : 'Save & Next'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Icon name="shield-check" size={20} color={KELLY_GREEN} />
          <Text style={styles.instructionsText}>
            Your bank details are securely stored. You'll receive hostel payments directly to this account.
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
};

const InputField = ({
  label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'words', maxLength, error, disabled = false, iconName
}: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string; keyboardType?: any; autoCapitalize?: any; maxLength?: number; error?: string; disabled?: boolean; iconName: string;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      <Icon 
        name={iconName} 
        size={20} 
        color={error ? '#FF6B6B' : KELLY_GREEN} 
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, disabled && { color: '#999' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={!disabled}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

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
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8fdf8"
  },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.038,
    color: KELLY_GREEN,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: "900",
    color: KELLY_GREEN,
    textAlign: "center",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
    gap: 6,
  },
  verifiedText: {
    color: 'white',
    fontSize: width * 0.032,
    fontWeight: '600',
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: width * 0.037,
    fontWeight: "600",
    marginBottom: 8,
    color: DARK_GREEN,
    marginTop: 4,
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: KELLY_GREEN,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === "ios" ? 14 : 12,
    zIndex: 1,
  },
  input: {
    padding: Platform.OS === "ios" ? 15 : 12,
    paddingLeft: 45,
    fontSize: width * 0.037,
    backgroundColor: "transparent",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: DARK_GREEN,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: width * 0.032,
    marginTop: 4,
    marginLeft: 4,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: width * 0.033,
    color: DARK_GREEN,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: KELLY_GREEN,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#fff",
  },
  skipButtonText: {
    fontSize: width * 0.037,
    fontWeight: "600",
    color: KELLY_GREEN
  },
  saveButton: {
    flex: 2,
    padding: 15,
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
  saveButtonText: {
    fontSize: width * 0.037,
    fontWeight: "700",
    color: "#fff"
  },
  instructions: {
    marginTop: 10,
    padding: 18,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: KELLY_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: '100%',
  },
  instructionsText: {
    flex: 1,
    fontSize: width * 0.033,
    color: DARK_GREEN,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default BankDetailsScreen;