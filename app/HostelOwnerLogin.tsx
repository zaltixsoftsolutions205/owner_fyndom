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
  clearError as clearForgotPasswordError
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
} from "react-native";
import Toast from "react-native-toast-message";
import { getBankStatus } from "@/app/utils/storage";
import { setBankStatusPending } from "@/app/utils/storage";


const { width, height } = Dimensions.get("window");

const PAGE_BG = "#FFFFFF";
const PRIMARY = "#4CBB17";
const BUTTON = "#FFDF00";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";

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

  const dispatch = useAppDispatch();
  const { loading: authLoading, error: authError, token } = useAppSelector((state) => state.auth);
  const {
    loading: forgotPasswordLoading,
    error: forgotPasswordError,
    success: forgotPasswordSuccess,
    step: forgotPasswordStep
  } = useAppSelector((state) => state.forgotPassword);

  // Clear errors when switching modes
  useEffect(() => {
    if (resetMode) {
      dispatch(clearError());
    } else {
      dispatch(clearForgotPasswordError());
      dispatch(resetState());
    }
  }, [resetMode]);

  // Show toast for forgot password errors
  useEffect(() => {
    if (forgotPasswordError) {
      Toast.show({
        type: "error",
        text1: "Forgot Password Error",
        text2: forgotPasswordError,
      });
    }
  }, [forgotPasswordError]);

  // Show toast for auth errors
  useEffect(() => {
    if (authError) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: authError,
      });
    }
  }, [authError]);

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
    if (!confirmPassword.trim())
      newErrors.confirmPassword = "Confirm password required";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) {
      Toast.show({ type: "error", text1: "Please fix the errors above." });
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
      });

      // Single redirect after login success
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
      console.log("❌ Login error in component:", err);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err || "Invalid credentials",
      });
      // Make sure bank_status remains pending (no accidental completed)
      await setBankStatusPending().catch(() => { });
    }
  };


  // Step 1: Request OTP
  const handleSendResetOtp = () => {
    if (!validateResetEmail()) {
      Toast.show({ type: "error", text1: "Please provide a valid email." });
      return;
    }
    dispatch(sendResetOTP(resetEmail));
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    if (!validateResetOtp()) {
      Toast.show({ type: "error", text1: "Please enter a valid OTP." });
      return;
    }
    dispatch(verifyOTP({ email: resetEmail, otp: resetOtp }));
  };

  // Step 3: Reset password
  const handleSetNewPassword = () => {
    if (!validateNewPassword()) {
      Toast.show({ type: "error", text1: "Please fix the password fields." });
      return;
    }
    dispatch(resetPassword({
      email: resetEmail,
      otp: resetOtp,
      newPassword
    }));
  };

  // Reset the entire flow
  const resetForgotPasswordFlow = () => {
    setResetMode(false);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    dispatch(resetState());
  };

  // Handle success after password reset
  useEffect(() => {
    if (forgotPasswordStep === 'success') {
      Toast.show({
        type: "success",
        text1: "Password Updated 🎉",
        text2: "Login with your new password.",
      });
      setTimeout(() => {
        resetForgotPasswordFlow();
      }, 2000);
    }
  }, [forgotPasswordStep]);

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
                {resetMode
                  ? "🔒 Forgot Password"
                  : "🔑 Hostel Owner Login"}
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
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
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
                    }}
                    style={{ alignSelf: "flex-end", marginBottom: 10 }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: PRIMARY,
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
                        opacity: isLoading ? 0.7 : 1
                      },
                    ]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    <Text style={[styles.buttonText, { color: PAGE_BG }]}>
                      {authLoading ? "Logging in..." : "Login"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* FORGOT PASSWORD FLOW */}
              {resetMode && (
                <>
                  {/* STEP 1: ENTER EMAIL */}
                  {forgotPasswordStep === 'email' && (
                    <>
                      <FormInput
                        label="Registered Email"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.resetEmail}
                        placeholder="Enter your registered email"
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
                        <Text style={styles.buttonText}>
                          {forgotPasswordLoading ? "Sending OTP..." : "Send OTP"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 2: ENTER OTP */}
                  {forgotPasswordStep === 'otp' && (
                    <>
                      <Text style={styles.infoText}>
                        OTP sent to: {resetEmail}
                      </Text>
                      <FormInput
                        label="OTP"
                        value={resetOtp}
                        onChangeText={setResetOtp}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        error={errors.resetOtp}
                        placeholder="Enter the 6-digit OTP"
                        rightIcon={
                          <TouchableOpacity
                            onPress={() => setShowOtpPassword(!showOtpPassword)}
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
                        <Text style={styles.buttonText}>
                          {forgotPasswordLoading ? "Verifying..." : "Verify OTP"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 3: ENTER NEW PASSWORD */}
                  {forgotPasswordStep === 'reset' && (
                    <>
                      <FormInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        error={errors.newPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Enter new password"
                        rightIcon={
                          <TouchableOpacity
                            onPress={() =>
                              setShowNewPassword(!showNewPassword)
                            }
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
                        rightIcon={
                          <TouchableOpacity
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
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
                        <Text style={styles.buttonText}>
                          {forgotPasswordLoading ? "Resetting..." : "Set New Password"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 4: SUCCESS */}
                  {forgotPasswordStep === 'success' && (
                    <>
                      <Text style={styles.successMsg}>
                        🎉 Password Updated Successfully!
                      </Text>
                      <Text style={styles.infoText}>
                        You can now login with your new password.
                      </Text>
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

                  {/* BACK TO LOGIN */}
                  <TouchableOpacity
                    onPress={resetForgotPasswordFlow}
                    style={{ marginTop: 12, alignSelf: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      ⬅ Back to Login
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Register navigation */}
              <TouchableOpacity
                onPress={() => router.push("/OwnerRegister")}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>⬅ Back to Register</Text>
              </TouchableOpacity>
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
        ]}
      >
        <TextInput
          style={styles.inputField}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#888"
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
  errorText: { color: ERROR, fontSize: 12.5, marginTop: 3 },
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
  backButton: { marginTop: 14, alignSelf: "center" },
  backButtonText: { color: PRIMARY, fontWeight: "700", fontSize: 14 },
  bgContainer: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  successMsg: {
    color: SUCCESS,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
});