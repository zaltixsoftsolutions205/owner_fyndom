// app/HostelOwnerLogin.tsx - COMPLETE WORKING VERSION
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { clearError, login } from "./reduxStore/reduxSlices/authSlice";
import {
  sendResetOTP,
  verifyOTP,
  resetPassword,
  resetState,
  clearError as clearForgotPasswordError,
  setStep,
  goBackStep,
} from "./reduxStore/reduxSlices/forgotPasswordSlice";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { getBankStatus } from "@/app/utils/storage";
import { setBankStatusPending } from "@/app/utils/storage";
import ApiClient from "../app/api/ApiClient";

const { width, height } = Dimensions.get("window");

const PAGE_BG = "#FFFFFF";
const PRIMARY = "#4CBB17";
const BUTTON = "#FFDF00";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";
const INFO = "#3b82f6";

const SHADOW = {
  shadowColor: PRIMARY,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,
};

interface FormInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  placeholder?: string;
  editable?: boolean;
}

export default function HostelOwnerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [resetMode, setResetMode] = useState(false);

  // Forgot password states
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtpPassword, setShowOtpPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testingConnection, setTestingConnection] = useState(false);

  const dispatch = useAppDispatch();
  const { loading: authLoading, error: authError, token } = useAppSelector((state) => state.auth);
  const {
    loading: forgotPasswordLoading,
    error: forgotPasswordError,
    success: forgotPasswordSuccess,
    step: forgotPasswordStep,
    email: storedEmail,
    resetToken: storedResetToken
  } = useAppSelector((state) => state.forgotPassword);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Clear errors when switching modes
  useEffect(() => {
    if (resetMode) {
      dispatch(clearError());
    } else {
      dispatch(clearForgotPasswordError());
      dispatch(resetState());
    }
  }, [resetMode]);

  // Sync email with Redux store
  useEffect(() => {
    if (storedEmail && resetMode) {
      setResetEmail(storedEmail);
    }
  }, [storedEmail, resetMode]);

  // Show toast for forgot password errors
  useEffect(() => {
    if (forgotPasswordError) {
      Toast.show({
        type: "error",
        text1: "Forgot Password Error",
        text2: forgotPasswordError,
        position: "top",
        visibilityTime: 5000,
      });
      dispatch(clearForgotPasswordError());
    }
  }, [forgotPasswordError, dispatch]);

  
  // Show success toast for OTP sent
  useEffect(() => {
    if (forgotPasswordStep === 'otp' && forgotPasswordSuccess) {
      Toast.show({
        type: "success",
        text1: "OTP Sent Successfully",
        text2: `OTP sent to ${resetEmail}`,
        position: "top",
        visibilityTime: 3000,
      });
      setCountdown(60);
    }
  }, [forgotPasswordStep, forgotPasswordSuccess, resetEmail]);

  // Show success for password reset
  useEffect(() => {
    if (forgotPasswordStep === 'success' && forgotPasswordSuccess) {
      Toast.show({
        type: "success",
        text1: "Password Updated Successfully 🎉",
        text2: "You can now login with your new password",
        position: "top",
        visibilityTime: 4000,
      });
      // Auto redirect after 3 seconds
      setTimeout(() => {
        resetForgotPasswordFlow();
      }, 3000);
    }
  }, [forgotPasswordStep, forgotPasswordSuccess]);

  // Validate email and password for login
  const validateLogin = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate email for OTP request
  const validateResetEmail = () => {
    let newErrors: { [key: string]: string } = {};
    if (!resetEmail.trim()) newErrors.resetEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(resetEmail))
      newErrors.resetEmail = "Enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP
  const validateResetOtp = () => {
    let newErrors: { [key: string]: string } = {};
    if (!resetOtp.trim()) newErrors.resetOtp = "OTP is required";
    else if (!/^\d{6}$/.test(resetOtp))
      newErrors.resetOtp = "OTP must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate new password
  const validateNewPassword = () => {
    let newErrors: { [key: string]: string } = {};
    if (!newPassword.trim()) newErrors.newPassword = "New password required";
    else if (newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    else if (!/(?=.*[A-Z])/.test(newPassword))
      newErrors.newPassword = "Include at least one uppercase letter";
    else if (!/(?=.*[!@#$%^&*])/.test(newPassword))
      newErrors.newPassword = "Include at least one special character (!@#$%^&*)";

    if (!confirmPassword.trim())
      newErrors.confirmPassword = "Confirm password required";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Test server connection
  const testServerConnection = async () => {
    setTestingConnection(true);
    try {
      const isConnected = await ApiClient.testConnection();
      if (isConnected) {
        Alert.alert(
          '✅ Connection Successful',
          'Server is reachable and responding properly.\n\nYou can proceed with forgot password flow.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Connection Failed',
          'Cannot connect to server. Please check:\n\n1. Backend server is running\n2. Correct IP address in settings\n3. Both devices on same WiFi network\n4. Port 5000 is not blocked',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Connection Failed', `Error: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors above.",
        position: "top"
      });
      return;
    }
    dispatch(clearError());

    try {
      console.log("🔄 Starting login process...");
      const res = await dispatch(login(formData)).unwrap();
      console.log("✅ Login successful, response:", res);

      Toast.show({
        type: "success",
        text1: "Login Successful 🎉",
        text2: "Redirecting to dashboard...",
        position: "top",
        visibilityTime: 2000,
      });

      setTimeout(async () => {
        try {
          const bankStatus = await getBankStatus();
          if (bankStatus === "completed") {
            router.replace("/HostelDetails");
          } else {
            router.replace("/tabs/HostelOwnerHome");
          }
        } catch (e) {
          console.warn("Error reading bank status after login", e);
          router.replace("/tabs/HostelOwnerHome");
        }
      }, 400);
    } catch (err: any) {
      // console.log("❌ Login error in component:", err);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err || "Invalid credentials",
        position: "top",
        visibilityTime: 4000,
      });
      await setBankStatusPending().catch(() => { });
    }
  };

  // Step 1: Request OTP
  const handleSendResetOtp = () => {
    if (!validateResetEmail()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please provide a valid email.",
        position: "top"
      });
      return;
    }
    console.log('📤 Requesting OTP for:', resetEmail);
    dispatch(sendResetOTP(resetEmail));
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    if (!validateResetOtp()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid OTP.",
        position: "top"
      });
      return;
    }
    console.log('🔍 Verifying OTP:', resetOtp);
    dispatch(verifyOTP({ email: resetEmail, otp: resetOtp }));
  };

  // Step 3: Reset password - USING resetToken
  const handleSetNewPassword = () => {
    if (!validateNewPassword()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the password fields.",
        position: "top"
      });
      return;
    }

    console.log('🔄 Resetting password for:', resetEmail);
    console.log('📦 Using reset token:', storedResetToken);

    if (!storedResetToken) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Reset token not found. Please verify OTP again.",
        position: "top",
      });
      return;
    }

    dispatch(resetPassword({
      email: resetEmail,
      resetToken: storedResetToken,
      newPassword
    }));
  };

  // Handle OTP resend
  const handleResendOtp = () => {
    if (countdown > 0) {
      Toast.show({
        type: "info",
        text1: "Please wait",
        text2: `Resend available in ${countdown} seconds`,
        position: "top",
      });
      return;
    }

    console.log('🔄 Resending OTP to:', resetEmail);
    dispatch(sendResetOTP(resetEmail));
  };

  // Reset the entire flow
  const resetForgotPasswordFlow = () => {
    setResetMode(false);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setCountdown(0);
    dispatch(resetState());
  };

  // Go back one step in forgot password flow
  const handleGoBackStep = () => {
    if (forgotPasswordStep === 'email') {
      resetForgotPasswordFlow();
    } else {
      dispatch(goBackStep());
      if (forgotPasswordStep === 'otp') {
        setResetOtp('');
      } else if (forgotPasswordStep === 'reset') {
        setNewPassword('');
        setConfirmPassword('');
      }
    }
  };

  // Direct test of forgot password API
  const testForgotPasswordAPI = async () => {
    try {
      const testEmail = "test@example.com";
      Alert.alert(
        'Test Forgot Password API',
        `This will test the forgot password endpoint with email: ${testEmail}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              try {
                const response = await ApiClient.post("/auth/forgot-password", {
                  email: testEmail
                });
                Alert.alert(
                  '✅ API Test Result',
                  `Success: ${response.success}\n\nMessage: ${response.message}\n\nData: ${JSON.stringify(response.data, null, 2)}`
                );
              } catch (error: any) {
                Alert.alert(
                  '❌ API Test Failed',
                  `Error: ${error.message}\n\nDetails: ${JSON.stringify(error.response?.data, null, 2)}`
                );
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Test Error', error.message);
    }
  };

  const isLoading = authLoading || forgotPasswordLoading;

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <View style={styles.bgContainer} pointerEvents="none">
        <LinearGradient
          colors={["#ffffff", "#e6fffb"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={[styles.flexOne, { backgroundColor: "transparent" }]}>
        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 30 })}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* TITLE */}
              <Text style={styles.cardTitle}>
                {resetMode ? "🔒 Forgot Password" : "🔑 Hostel Owner Login"}
              </Text>


              {/* LOGIN FORM */}
              {!resetMode && (
                <>
                  <FormInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    placeholder="Enter your email"
                    editable={!authLoading}
                  />
                  <FormInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry={!showNewPassword}
                    error={errors.password}
                    placeholder="Enter your password"
                    editable={!authLoading}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        disabled={authLoading}
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#888"
                        />
                      </TouchableOpacity>
                    }
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setResetMode(true);
                      setErrors({});
                      dispatch(setStep('email'));
                    }}
                    style={{ alignSelf: "flex-end", marginBottom: 10 }}
                    disabled={authLoading}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: PRIMARY,
                        opacity: authLoading ? 0.5 : 1
                      }}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.buttonPrimary,
                      {
                        marginTop: 15,
                        backgroundColor: BUTTON,
                        opacity: authLoading ? 0.7 : 1
                      },
                    ]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.buttonText, { color: PAGE_BG }]}>
                        Login
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* FORGOT PASSWORD FLOW */}
              {resetMode && (
                <>
                  {/* STEP 1: ENTER EMAIL */}
                  {forgotPasswordStep === 'email' && (
                    <>
                      <Text style={styles.infoText}>
                        Enter your registered email to receive a password reset OTP
                      </Text>
                      <FormInput
                        label="Registered Email"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.resetEmail}
                        placeholder="Enter your registered email"
                        editable={!forgotPasswordLoading}
                      />
                      <TouchableOpacity
                        style={[
                          styles.buttonPrimary,
                          {
                            marginTop: 15,
                            backgroundColor: SUCCESS,
                            opacity: forgotPasswordLoading ? 0.7 : 1
                          },
                        ]}
                        onPress={handleSendResetOtp}
                        activeOpacity={0.8}
                        disabled={forgotPasswordLoading}
                      >
                        {forgotPasswordLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 2: ENTER OTP */}
                  {forgotPasswordStep === 'otp' && (
                    <>
                      <Text style={styles.infoText}>
                        OTP sent to: <Text style={{ fontWeight: 'bold', color: PRIMARY }}>{resetEmail}</Text>
                      </Text>
                      <FormInput
                        label="OTP"
                        value={resetOtp}
                        onChangeText={setResetOtp}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        maxLength={6}
                        error={errors.resetOtp}
                        placeholder="Enter the 6-digit OTP"
                        editable={!forgotPasswordLoading}
                        rightIcon={
                          <TouchableOpacity
                            onPress={() => setShowOtpPassword(!showOtpPassword)}
                            disabled={forgotPasswordLoading}
                          >
                            <Ionicons
                              name={showOtpPassword ? "eye-off" : "eye"}
                              size={20}
                              color="#888"
                            />
                          </TouchableOpacity>
                        }
                        secureTextEntry={!showOtpPassword}
                      />

                      {/* Resend OTP section */}
                      <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                          Didn't receive OTP?{" "}
                        </Text>
                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={countdown > 0 || forgotPasswordLoading}
                        >
                          <Text style={[
                            styles.resendButton,
                            (countdown > 0 || forgotPasswordLoading) && { color: '#94a3b8' }
                          ]}>
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.buttonPrimary,
                          {
                            marginTop: 15,
                            backgroundColor: SUCCESS,
                            opacity: forgotPasswordLoading ? 0.7 : 1
                          },
                        ]}
                        onPress={handleVerifyOtp}
                        activeOpacity={0.8}
                        disabled={forgotPasswordLoading}
                      >
                        {forgotPasswordLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Verify OTP</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 3: ENTER NEW PASSWORD */}
                  {forgotPasswordStep === 'reset' && (
                    <>
                      <Text style={styles.infoText}>
                        Set your new password (min 6 chars with uppercase & special char)
                      </Text>
                      <FormInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        error={errors.newPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Enter new password"
                        editable={!forgotPasswordLoading}
                        rightIcon={
                          <TouchableOpacity
                            onPress={() =>
                              setShowNewPassword(!showNewPassword)
                            }
                            disabled={forgotPasswordLoading}
                          >
                            <Ionicons
                              name={showNewPassword ? "eye-off" : "eye"}
                              size={20}
                              color="#888"
                            />
                          </TouchableOpacity>
                        }
                      />
                      <FormInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={errors.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Re-enter new password"
                        editable={!forgotPasswordLoading}
                        rightIcon={
                          <TouchableOpacity
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={forgotPasswordLoading}
                          >
                            <Ionicons
                              name={showConfirmPassword ? "eye-off" : "eye"}
                              size={20}
                              color="#888"
                            />
                          </TouchableOpacity>
                        }
                      />
                      <TouchableOpacity
                        style={[
                          styles.buttonPrimary,
                          {
                            marginTop: 15,
                            backgroundColor: SUCCESS,
                            opacity: forgotPasswordLoading ? 0.7 : 1
                          },
                        ]}
                        onPress={handleSetNewPassword}
                        activeOpacity={0.8}
                        disabled={forgotPasswordLoading}
                      >
                        {forgotPasswordLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Reset Password</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 4: SUCCESS */}
                  {forgotPasswordStep === 'success' && (
                    <>
                      <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={SUCCESS} />
                        <Text style={styles.successMsg}>
                          Password Updated Successfully!
                        </Text>
                        <Text style={styles.infoText}>
                          You can now login with your new password.
                        </Text>
                        <Text style={[styles.infoText, { fontSize: 12, color: '#888' }]}>
                          Redirecting to login in 3 seconds...
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.buttonPrimary,
                          { backgroundColor: BUTTON, marginTop: 15 },
                        ]}
                        onPress={resetForgotPasswordFlow}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.buttonText, { color: PAGE_BG }]}>
                          Login Now
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* BACK BUTTONS */}
                  <View style={styles.backButtonsContainer}>
                    <TouchableOpacity
                      onPress={handleGoBackStep}
                      style={styles.backButton}
                      disabled={forgotPasswordLoading}
                    >
                      <Text style={styles.backButtonText}>
                        {forgotPasswordStep === 'email' ? '⬅ Back to Login' : '⬅ Back'}
                      </Text>
                    </TouchableOpacity>

                    {forgotPasswordStep !== 'success' && (
                      <TouchableOpacity
                        onPress={resetForgotPasswordFlow}
                        style={[styles.backButton, { marginLeft: 10 }]}
                        disabled={forgotPasswordLoading}
                      >
                        <Text style={[styles.backButtonText, { color: ERROR }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              {/* Register navigation */}
              {!resetMode && (
                <TouchableOpacity
                  onPress={() => router.push("/OwnerRegister")}
                  style={styles.registerButton}
                  disabled={authLoading}
                >
                  <Text style={styles.registerButtonText}>
                    Don't have an account? Register
                  </Text>
                </TouchableOpacity>
              )}

              {/* API Test Button (Debug - remove in production) */}
              {/* {__DEV__ && (
                <TouchableOpacity
                  onPress={testForgotPasswordAPI}
                  style={styles.debugButton}
                  disabled={forgotPasswordLoading}
                >
                  <Text style={styles.debugButtonText}>
                    [Debug] Test Forgot Password API
                  </Text>
                </TouchableOpacity>
              )} */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    </View>
  );
}

// FormInput component
function FormInput({
  label,
  error,
  rightIcon,
  editable = true,
  ...props
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 15, width: "100%" }}>
      <Text style={styles.label2}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          focused && { borderColor: PRIMARY, backgroundColor: "#f0fffd" },
          error && { borderColor: ERROR },
          !editable && { backgroundColor: "#f5f5f5", opacity: 0.7 }
        ]}
      >
        <TextInput
          style={[styles.inputField, !editable && { color: '#666' }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#888"
          editable={editable}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContainer: {
    padding: width * 0.06,
    minHeight: height * 0.94,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: width * 0.06,
    backgroundColor: PAGE_BG,
    ...SHADOW,
    marginVertical: 18,
    zIndex: 3,
  },
  cardTitle: {
    fontSize: width < 380 ? 20 : 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: PRIMARY,
  },
  label2: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
  },
  iconContainer: {
    marginLeft: 8,
  },
  errorText: {
    color: ERROR,
    fontSize: 12.5,
    marginTop: 3,
    marginLeft: 4,
  },
  buttonPrimary: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    ...SHADOW,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#FFFFFF"
  },
  backButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  },
  successMsg: {
    color: SUCCESS,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  resendText: {
    fontSize: 13,
    color: '#64748b',
  },
  resendButton: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  registerButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  registerButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 15,
    alignSelf: 'center',
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  debugButtonText: {
    color: INFO,
    fontSize: 11,
    fontWeight: '500',
  },
});