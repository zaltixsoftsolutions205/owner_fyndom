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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setBankStatusCompleted, setBankStatusPending } from './utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth } from './reduxStore/reduxSlices/authSlice';
import ApiClient from './api/ApiClient';
import { bankService } from '../app/api/bankService';

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

interface BankDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    hostelId: string;
    hostelName: string;
    bankDetails: BankDetails & {
      isVerified: boolean;
    };
  };
  errors?: any;
}

const BankDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { user, selectedHostelId, hostels } = useAppSelector((state) => state.auth);

  // Get hostel ID from params or selected hostel
  const hostelId = params.hostelId as string || selectedHostelId;
  const hostelName = params.hostelName as string || '';

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isHostelApproved, setIsHostelApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Added this line
  const [existingBankDetails, setExistingBankDetails] = useState<BankDetails | null>(null);

  useEffect(() => {
    checkHostelApprovalStatus();
  }, [hostelId]);

  // Check if the hostel is approved
  const checkHostelApprovalStatus = () => {
    setLoading(true);
    try {
      if (!hostelId) {
        Alert.alert('No Hostel Selected', 'Please select a hostel first', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      // Find the hostel in user's hostels
      const hostel = hostels.find(h => h.hostelId === hostelId);

      if (!hostel) {
        Alert.alert('Hostel Not Found', 'The selected hostel was not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      // Check if hostel is approved and active
      if (hostel.status === 'approved' && hostel.isActive === true) {
        setIsHostelApproved(true);
        // Load bank details for approved hostel
        loadBankDetailsForHostel();
      } else {
        setIsHostelApproved(false);
        Alert.alert(
          'Hostel Not Approved',
          `Bank details can only be set for approved hostels. Current status: ${hostel.status}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error checking hostel status:', error);
      Alert.alert('Error', 'Failed to verify hostel status');
    } finally {
      setLoading(false);
    }
  };

  // Load bank details for the approved hostel
  // Update the loadBankDetailsForHostel function in BankDetailsPage.tsx
  const loadBankDetailsForHostel = async () => {
    if (!hostelId) return;

    try {
      const response = await bankService.getBankDetails(hostelId);

      if (response.success && response.data) {
        const bankDetails = response.data.bankDetails;
        setExistingBankDetails(bankDetails);

        // Populate form with existing bank details
        setAccountHolderName(bankDetails.accountHolderName || '');
        setAccountNumber(bankDetails.accountNumber || '');
        setIfscCode(bankDetails.ifscCode || '');
        setBankName(bankDetails.bankName || '');
        setBranchName(bankDetails.branchName || '');
        setUpiId(bankDetails.upiId || '');

        console.log('✅ Bank details loaded:', bankDetails);
      } else {
        console.log('ℹ️ No bank details found for this hostel');
        // Keep form empty for new entry
      }
    } catch (error: any) {
      console.log('⚠️ Bank details not found or error loading:', error.message);
      // It's okay if no bank details exist yet
    }
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
    // Clear previous errors
    setErrors({});

    if (!validateForm()) {
      Toast.show({ type: 'error', text1: 'Please fix the errors' });
      return;
    }

    if (!hostelId || !isHostelApproved) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hostel is not approved or not selected'
      });
      return;
    }

    const payload = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      upiId: upiId?.trim() || '', // Send empty string if not provided
    };

    console.log('📝 Submitting bank details:', {
      hostelId,
      payload,
      isHostelApproved
    });

    setSaving(true);

    try {
      // Call the bank service
      const response = await bankService.setBankDetails(hostelId, payload);

      console.log('✅ Bank details API response:', response);

      if (response.success && response.data) {
        // Update bank status in storage
        await setBankStatusCompleted();

        // Update user data in AsyncStorage with new bank details
        try {
          const rawUser = await AsyncStorage.getItem('user');
          if (rawUser) {
            const parsedUser = JSON.parse(rawUser);

            // Update or add bank details for this hostel
            if (!parsedUser.hostelBankDetails) {
              parsedUser.hostelBankDetails = {};
            }

            parsedUser.hostelBankDetails[hostelId] = {
              ...response.data.bankDetails,
              hostelId: response.data.hostelId,
              hostelName: response.data.hostelName
            };

            await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
          }
        } catch (e) {
          console.warn('Error updating user storage:', e);
        }

        // Refresh auth state
        await dispatch(initializeAuth());

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Bank details saved for ${response.data.hostelName}`
        });

        // Navigate to next screen or back
        setTimeout(() => {
          router.replace({
            pathname: '/HostelDetails',
            params: {
              hostelId: response.data.hostelId,
              hostelName: response.data.hostelName
            }
          });
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to save bank details'
        });
        await setBankStatusPending();
      }
    } catch (error: any) {
      console.error('❌ Bank save error:', error.message);

      // Parse backend validation errors
      const errorMessage = error.message || 'Failed to save bank details';

      // Check if it's a validation error and parse field-specific errors
      if (errorMessage.toLowerCase().includes('validation')) {
        // Try to extract field errors from the message
        const fieldErrors: Record<string, string> = {};

        // Common validation error patterns
        if (errorMessage.includes('accountHolderName')) {
          fieldErrors.accountHolderName = 'Please check account holder name';
        }
        if (errorMessage.includes('accountNumber')) {
          fieldErrors.accountNumber = 'Please check account number';
        }
        if (errorMessage.includes('ifscCode') || errorMessage.includes('IFSC')) {
          fieldErrors.ifscCode = 'Please check IFSC code';
        }
        if (errorMessage.includes('bankName')) {
          fieldErrors.bankName = 'Please check bank name';
        }
        if (errorMessage.includes('branchName')) {
          fieldErrors.branchName = 'Please check branch name';
        }
        if (errorMessage.includes('upiId') || errorMessage.includes('UPI')) {
          fieldErrors.upiId = 'Please check UPI ID';
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please check the highlighted fields'
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: errorMessage
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage
        });
      }

      await setBankStatusPending();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert(
      'Skip Bank Details',
      'Are you sure you want to skip adding bank details for this hostel? You can add them later from the Hostel Details page.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            try {
              await setBankStatusCompleted();

              // Mark as skipped for this hostel
              const rawUser = await AsyncStorage.getItem('user');
              if (rawUser) {
                const parsedUser = JSON.parse(rawUser);
                if (!parsedUser.skippedBankDetails) {
                  parsedUser.skippedBankDetails = [];
                }
                if (!parsedUser.skippedBankDetails.includes(hostelId)) {
                  parsedUser.skippedBankDetails.push(hostelId);
                  await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
                }
              }

              await dispatch(initializeAuth());

              router.replace({
                pathname: '/HostelDetails',
                params: { hostelId, hostelName }
              });
            } catch (e) {
              console.warn('Error during skip flow', e);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not skip. Try again.'
              });
            }
          },
        },
      ]
    );
  };

  // Test function to debug
  const testWithExactData = async () => {
    console.log('🧪 Testing with exact data from API docs...');

    const exactData = {
      accountHolderName: "Rangannagari Guru Ashok",
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
      branchName: "Hyderabad",
      upiId: "ashok@upi",
    };

    try {
      const response = await ApiClient.post<BankDetailsResponse>(
        `/bank/hostel/${hostelId}/details`,
        exactData
      );
      console.log('✅ Test successful:', response);
      Alert.alert('Success', 'Test data accepted by server');
    } catch (error: any) {
      console.error('❌ Test failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.errors) {
        console.log('🔍 Backend validation errors:', JSON.stringify(error.response.data.errors, null, 2));
        Alert.alert(
          'Validation Errors',
          JSON.stringify(error.response.data.errors, null, 2)
        );
      } else {
        Alert.alert('Error', error.message || 'Test failed');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={KELLY_GREEN} />
        <Text style={styles.loadingText}>Checking hostel status...</Text>
      </View>
    );
  }

  if (!isHostelApproved) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Details</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Hostel Not Approved</Text>
          <Text style={styles.errorText}>
            Bank details can only be set for approved hostels.
            Please select an approved hostel from the home screen.
          </Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.replace('/tabs/HostelOwnerHome')}
          >
            <Text style={styles.returnButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
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
        {/* Hostel Info Banner */}
        <View style={styles.hostelBanner}>
          <Icon name="home" size={24} color="#fff" />
          <View style={styles.hostelInfo}>
            <Text style={styles.hostelName} numberOfLines={1}>
              {hostelName || 'Selected Hostel'}
            </Text>
            <Text style={styles.hostelId}>ID: {hostelId}</Text>
          </View>
          <View style={styles.approvedBadge}>
            <Icon name="check-circle" size={16} color="#fff" />
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        </View>

        <View style={styles.headerContainer}>
          <Icon name="bank" size={55} color={KELLY_GREEN} style={{ marginBottom: 8 }} />
          <Text style={styles.headerText}>Bank Details</Text>

          {existingBankDetails?.isVerified && (
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
              * Required fields. These bank details will be used for payments related to {hostelName}.
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
                  {existingBankDetails ? 'Update & Next' : 'Save & Next'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Debug Button (Remove in production) */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={testWithExactData}
          >
            <Text style={styles.debugButtonText}>Test with Exact Data</Text>
          </TouchableOpacity>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Icon name="shield-check" size={20} color={KELLY_GREEN} />
          <Text style={styles.instructionsText}>
            Bank details are stored securely and encrypted. Payments will be processed to this account.
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: "#f8fdf8"
  },
  errorTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: width * 0.038,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  returnButton: {
    backgroundColor: KELLY_GREEN,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: width * 0.038,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  hostelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KELLY_GREEN,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    gap: 12,
  },
  hostelInfo: {
    flex: 1,
  },
  hostelName: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  hostelId: {
    fontSize: width * 0.03,
    color: 'rgba(255,255,255,0.8)',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  approvedText: {
    color: 'white',
    fontSize: width * 0.028,
    fontWeight: '600',
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
  debugButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#666',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.035,
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