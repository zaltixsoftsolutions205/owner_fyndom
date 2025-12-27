// import * as DocumentPicker from "expo-document-picker";
// import { router } from "expo-router";
// import * as Sharing from "expo-sharing";
// import React, { useState } from "react";
// import {
//   Dimensions,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import ApiClient from "../app/api/ApiClient";

// const { width } = Dimensions.get("window");

// // 🎨 Colors
// const BG = "#FFFFFF";
// const CARD = "#FFFFFF";
// const ACCENT = "#4CBB17";
// const BUTTON = "#FFDF00";
// const ERROR = "#ef4444";
// const TEXT_DARK = "#222222";
// const TEXT_GRAY = "#555555";

// // Image extensions for preview
// const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

// export default function HostelOwnerRegistration() {
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [alreadyVerified, setAlreadyVerified] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     hostelName: "",
//     email: "",
//     mobileNumber: "",
//     govtRegistrationId: "",
//     fullAddress: "",
//     hostelType: "co-living"
//   });

//   // Add hostel type options
//   const hostelTypes = [
//     { value: "boys", label: "Boys Hostel", icon: "👨‍🎓" },
//     { value: "girls", label: "Girls Hostel", icon: "👩‍🎓" }, 
//     { value: "co-living", label: "Co-Living", icon: "👥" }
//   ];

//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; uri: string; type: string }>>([]);
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewUri, setPreviewUri] = useState("");
//   const [emailExistsModal, setEmailExistsModal] = useState(false); // NEW: Modal state
//   const [apiError, setApiError] = useState(""); // NEW: Store API error message

//   // ✅ Enhanced form validation
//   const validateForm = () => {
//     let newErrors: { [key: string]: string } = {};
    
//     // Full Name validation
//     if (!formData.fullName.trim()) {
//       newErrors.fullName = "Full name is required";
//     } else if (formData.fullName.trim().length < 3) {
//       newErrors.fullName = "Full name must be at least 3 characters";
//     } else if (formData.fullName.trim().length > 50) {
//       newErrors.fullName = "Full name cannot exceed 50 characters";
//     }

//     // Hostel Name validation
//     if (!formData.hostelName.trim()) {
//       newErrors.hostelName = "Hostel name is required";
//     } else if (formData.hostelName.trim().length < 3) {
//       newErrors.hostelName = "Hostel name must be at least 3 characters";
//     } else if (formData.hostelName.trim().length > 100) {
//       newErrors.hostelName = "Hostel name cannot exceed 100 characters";
//     }

//     // Email validation
//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//     } else if (formData.email.length > 100) {
//       newErrors.email = "Email cannot exceed 100 characters";
//     }

//     // Mobile Number validation
//     if (!formData.mobileNumber.trim()) {
//       newErrors.mobileNumber = "Mobile number is required";
//     } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
//       newErrors.mobileNumber = "Please enter a valid 10-digit Indian mobile number";
//     }

//     // Govt Registration ID validation
//     if (!formData.govtRegistrationId.trim()) {
//       newErrors.govtRegistrationId = "Government registration ID is required";
//     } else if (formData.govtRegistrationId.trim().length < 5) {
//       newErrors.govtRegistrationId = "Registration ID must be at least 5 characters";
//     } else if (formData.govtRegistrationId.trim().length > 50) {
//       newErrors.govtRegistrationId = "Registration ID cannot exceed 50 characters";
//     }

//     // Hostel Type validation
//     if (!formData.hostelType) {
//       newErrors.hostelType = "Please select a hostel type";
//     }

//     // Full Address validation
//     if (!formData.fullAddress.trim()) {
//       newErrors.fullAddress = "Full address is required";
//     } else if (formData.fullAddress.trim().length < 10) {
//       newErrors.fullAddress = "Address must be at least 10 characters";
//     } else if (formData.fullAddress.trim().length > 500) {
//       newErrors.fullAddress = "Address cannot exceed 500 characters";
//     }

//     // File upload validation
//     if (uploadedFiles.length === 0) {
//       newErrors.upload = "Please upload at least one document";
//     } else if (uploadedFiles.length > 10) {
//       newErrors.upload = "Maximum 10 files allowed";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ Real-time field validation
//   const validateField = (fieldName: string, value: string) => {
//     let error = "";
    
//     switch (fieldName) {
//       case 'fullName':
//         if (!value.trim()) error = "Full name is required";
//         else if (value.trim().length < 3) error = "Minimum 3 characters";
//         else if (value.trim().length > 50) error = "Maximum 50 characters";
//         break;
        
//       case 'hostelName':
//         if (!value.trim()) error = "Hostel name is required";
//         else if (value.trim().length < 3) error = "Minimum 3 characters";
//         else if (value.trim().length > 100) error = "Maximum 100 characters";
//         break;
        
//       case 'email':
//         if (!value.trim()) error = "Email is required";
//         else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
//         else if (value.length > 100) error = "Maximum 100 characters";
//         break;
        
//       case 'mobileNumber':
//         if (!value.trim()) error = "Mobile number is required";
//         else if (!/^[0-9]*$/.test(value)) error = "Only numbers allowed";
//         else if (value.length !== 10) error = "Must be 10 digits";
//         else if (!/^[6-9]/.test(value)) error = "Must start with 6-9";
//         break;
        
//       case 'govtRegistrationId':
//         if (!value.trim()) error = "Registration ID is required";
//         else if (value.trim().length < 5) error = "Minimum 5 characters";
//         else if (value.trim().length > 50) error = "Maximum 50 characters";
//         break;
        
//       case 'fullAddress':
//         if (!value.trim()) error = "Address is required";
//         else if (value.trim().length < 10) error = "Minimum 10 characters";
//         else if (value.trim().length > 500) error = "Maximum 500 characters";
//         break;
//     }
    
//     setErrors(prev => ({
//       ...prev,
//       [fieldName]: error
//     }));
    
//     return error === "";
//   };

//   // ✅ Handle field change with validation
//   const handleFieldChange = (fieldName: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [fieldName]: value
//     }));
    
//     // Clear error when user starts typing
//     if (errors[fieldName]) {
//       setErrors(prev => ({
//         ...prev,
//         [fieldName]: ""
//       }));
//     }
    
//     // If email field is being edited, hide the email exists modal
//     if (fieldName === 'email' && emailExistsModal) {
//       setEmailExistsModal(false);
//     }
//   };

//   // ✅ Check if file is an image
//   const isImageFile = (fileName: string) => {
//     const extension = fileName.split('.').pop()?.toLowerCase();
//     return extension ? IMAGE_EXTENSIONS.includes(extension) : false;
//   };

//   // ✅ File upload picker
//   const handleFileUpload = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["application/pdf", "image/png", "image/jpeg", "image/*"],
//         multiple: true,
//       });

//       const files = result.assets || (result.type === "success" ? [result] : []);
//       if (!files || files.length === 0) return;

//       let newFiles: Array<{ name: string; uri: string; type: string }> = [];
//       for (let file of files) {
//         if (file && file.uri && file.name && !uploadedFiles.some((f) => f.uri === file.uri)) {
//           const fileType = isImageFile(file.name) ? 'image' : 'pdf';
//           newFiles.push({
//             name: file.name,
//             uri: file.uri,
//             type: fileType
//           });
//         }
//       }
      
//       if (newFiles.length > 0) {
//         const updatedFiles = [...uploadedFiles, ...newFiles];
//         if (updatedFiles.length > 10) {
//           Toast.show({ 
//             type: "error", 
//             text1: "Maximum 10 files allowed",
//             text2: `You have ${updatedFiles.length} files. Please remove some.`
//           });
//           return;
//         }
        
//         setUploadedFiles(updatedFiles);
//         Toast.show({ type: "success", text1: "Files uploaded ✅" });
        
//         // Clear upload error if files are added
//         if (errors.upload) {
//           setErrors(prev => ({
//             ...prev,
//             upload: ""
//           }));
//         }
//       }
//     } catch (error) {
//       Toast.show({ type: "error", text1: "File upload failed" });
//     }
//   };

//   // ✅ Handle view file
//   const handleViewFile = async (file: { name: string; uri: string; type: string }) => {
//     try {
//       if (file.type === 'image') {
//         setPreviewUri(file.uri);
//         setPreviewVisible(true);
//       } else {
//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(file.uri, {
//             mimeType: 'application/pdf',
//             dialogTitle: `View ${file.name}`,
//           });
//         } else {
//           Toast.show({
//             type: "error",
//             text1: "Sharing not supported",
//             text2: "Cannot open PDF on this device"
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error viewing file:", error);
//       Toast.show({
//         type: "error",
//         text1: "Unable to open file",
//         text2: "File might be corrupted or unsupported"
//       });
//     }
//   };

//   // ✅ Close image preview
//   const closePreview = () => {
//     setPreviewVisible(false);
//     setPreviewUri("");
//   };

//   // ✅ Remove file
//   const handleRemoveFile = (index: number) => {
//     setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
//     Toast.show({ type: "success", text1: "File removed" });
//   };

//   // ✅ Email Already Registered Modal Component
//   const EmailExistsModal = () => (
//     <Modal
//       visible={emailExistsModal}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setEmailExistsModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.emailModalContent}>
//           <View style={styles.emailModalHeader}>
//             <Text style={styles.emailModalTitle}>⚠️ Email Already Registered</Text>
//           </View>
          
//           <View style={styles.emailModalBody}>
//             <Text style={styles.emailModalText}>
//               The email <Text style={styles.emailHighlight}>{formData.email}</Text> is already registered in our system.
//             </Text>
            
//             <Text style={styles.emailModalSubtext}>
//               You can either:
//             </Text>
            
//             <View style={styles.emailModalOptions}>
//               <View style={styles.optionCard}>
//                 <Text style={styles.optionNumber}>1</Text>
//                 <Text style={styles.optionTitle}>Use a Different Email</Text>
//                 <Text style={styles.optionDesc}>
//                   Change your email address to continue with new registration
//                 </Text>
//               </View>
              
//               <View style={styles.optionCard}>
//                 <Text style={styles.optionNumber}>2</Text>
//                 <Text style={styles.optionTitle}>Login to Existing Account</Text>
//                 <Text style={styles.optionDesc}>
//                   If this is your email, login to your existing account
//                 </Text>
//               </View>
//             </View>
//           </View>
          
//           <View style={styles.emailModalFooter}>
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.changeEmailButton]}
//               onPress={() => {
//                 setEmailExistsModal(false);
//                 setFormData(prev => ({ ...prev, email: "" }));
//               }}
//             >
//               <Text style={styles.changeEmailButtonText}>Change Email</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.loginButton]}
//               onPress={() => {
//                 setEmailExistsModal(false);
//                 router.push("/HostelOwnerLogin");
//               }}
//             >
//               <Text style={styles.loginButtonText}>Go to Login</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ✅ Submit form to backend
//   const handleSubmit = async () => {
//     // First validate form
//     if (!validateForm()) {
//       Toast.show({ 
//         type: "error", 
//         text1: "Validation Failed", 
//         text2: "Please fix the errors before submitting." 
//       });
//       return;
//     }

//     try {
//       setIsSubmitted(true);
//       setApiError(""); // Clear previous API errors

//       const formDataToSend = new FormData();
//       formDataToSend.append("fullName", formData.fullName.trim());
//       formDataToSend.append("hostelName", formData.hostelName.trim());
//       formDataToSend.append("email", formData.email.trim());
//       formDataToSend.append("mobileNumber", formData.mobileNumber.trim());
//       formDataToSend.append("govtRegistrationId", formData.govtRegistrationId.trim());
//       formDataToSend.append("fullAddress", formData.fullAddress.trim());
//       formDataToSend.append("hostelType", formData.hostelType);

//       // Append documents
//       uploadedFiles.forEach((file) => {
//         const fileExtension = file.name.split(".").pop()?.toLowerCase();
//         let mimeType = "application/pdf";

//         if (fileExtension === "png") mimeType = "image/png";
//         else if (fileExtension === "jpg" || fileExtension === "jpeg") mimeType = "image/jpeg";

//         formDataToSend.append("documents", {
//           uri: file.uri,
//           type: mimeType,
//           name: file.name,
//         } as any);
//       });

//       console.log("📎 Files to upload:", uploadedFiles.length);

//       // ✅ POST API Call
//       const response = await ApiClient.post("/hostel-owner/register", formDataToSend, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       console.log("✅ Registration Success:", response.data);

//       Toast.show({
//         type: "success",
//         text1: "Registration successful!",
//         text2: "Please wait for admin approval.",
//       });

//       // Show progress steps
//       setTimeout(() => setCurrentStep(2), 2000);
//       setTimeout(() => setCurrentStep(3), 5000);
//       setTimeout(() => setCurrentStep(4), 8000);
//     } catch (error: any) {
//       console.error("❌ Registration failed:", error);

//       if (error.response) {
//         console.error("📋 Backend error response:", {
//           status: error.response.status,
//           data: error.response.data,
//         });

//         const errorMessage =
//           error.response.data?.message ||
//           error.response.data?.errors?.[0]?.msg ||
//           "Registration failed. Please try again.";

//         // Check if error is about email already registered
//         if (errorMessage.toLowerCase().includes("email already") || 
//             errorMessage.toLowerCase().includes("email exists") ||
//             error.response.status === 400 && errorMessage === "Email already registered") {
          
//           // Show custom modal instead of toast
//           setEmailExistsModal(true);
//           setApiError(errorMessage);
          
//         } else {
//           // For other errors, show toast
//           Toast.show({
//             type: "error",
//             text1: "Registration Failed",
//             text2: errorMessage,
//           });
//         }
//       } else {
//         Toast.show({
//           type: "error",
//           text1: "Network Error",
//           text2: "Please check your connection and try again",
//         });
//       }

//       setIsSubmitted(false);
//     }
//   };

//   // ✅ Image Preview Modal
//   const ImagePreviewModal = () => (
//     <Modal
//       visible={previewVisible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={closePreview}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalHeader}>
//           <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
//             <Text style={styles.closeButtonText}>✕</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.imageContainer}>
//           <Image
//             source={{ uri: previewUri }}
//             style={styles.previewImage}
//             resizeMode="contain"
//           />
//         </View>
//       </View>
//     </Modal>
//   );

//   // ✅ Approved Step
//   if (isSubmitted && currentStep === 4) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.centeredApproved}>
//           <Text style={styles.bigEmoji}>✅</Text>
//           <Text style={styles.approvedTitle}>Approved!</Text>
//           <Text style={styles.subtitle}>
//             Your hostel registration has been successfully verified.
//           </Text>
//           <TouchableOpacity
//             style={styles.buttonPrimary}
//             onPress={() => router.push("/HostelOwnerLogin")}
//           >
//             <Text style={styles.buttonText}>Go to Login</Text>
//           </TouchableOpacity>
//         </View>
//         <Toast />
//       </SafeAreaView>
//     );
//   }

//   // ✅ Progress stepper while verifying
//   if (isSubmitted) {
//     const steps = [
//       { id: 1, title: "Form Submitted", description: "Your registration has been submitted." },
//       { id: 2, title: "Under Review", description: "Our team is verifying your documents." },
//       { id: 3, title: "Verification Pending", description: "You'll get login access once approved." },
//     ];

//     return (
//       <SafeAreaView style={styles.container}>
//         <ScrollView contentContainerStyle={styles.centered}>
//           <Text style={styles.pageTitle}>Verification Progress</Text>
//           <View style={styles.stepper}>
//             {steps.map((step, index) => {
//               const isCompleted = step.id < currentStep;
//               const isActive = step.id === currentStep;
//               const isLast = index === steps.length - 1;
//               return (
//                 <View key={step.id} style={styles.stepRow}>
//                   <View style={styles.stepIndicatorWrapper}>
//                     <View
//                       style={[
//                         styles.stepCircle,
//                         isCompleted && { backgroundColor: ACCENT },
//                         isActive && { borderWidth: 3, borderColor: ACCENT },
//                       ]}
//                     >
//                       {isCompleted && <Text style={styles.stepCheck}>✓</Text>}
//                     </View>
//                     {!isLast && <View style={styles.stepLine} />}
//                   </View>
//                   <View style={styles.stepContent}>
//                     <Text style={[styles.stepTitle, (isCompleted || isActive) && { color: ACCENT }]}>
//                       {step.title}
//                     </Text>
//                     <Text style={styles.stepDesc}>{step.description}</Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>
//         <Toast />
//       </SafeAreaView>
//     );
//   }

//   // ✅ Already verified screen
//   if (alreadyVerified) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.centered}>
//           <Text style={styles.bigEmoji}>✅</Text>
//           <Text style={styles.title}>Already Verified</Text>
//           <Text style={styles.subtitle}>You can sign in to your dashboard.</Text>
//           <TouchableOpacity
//             style={styles.buttonPrimary}
//             onPress={() => router.push("/HostelOwnerLogin")}
//           >
//             <Text style={styles.buttonText}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//         <Toast />
//       </SafeAreaView>
//     );
//   }

//   // ✅ Main Registration Form
//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
//         <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
//           <Text style={styles.pageTitle}>Hostel Owner Registration</Text>

//           <View style={styles.card}>
//             <FormInput
//               label="Full Name *"
//               value={formData.fullName}
//               onChangeText={(t: string) => handleFieldChange('fullName', t)}
//               onBlur={() => validateField('fullName', formData.fullName)}
//               error={errors.fullName}
//               placeholder="Enter your full name"
//               maxLength={50}
//             />
            
//             <FormInput
//               label="Hostel Name *"
//               value={formData.hostelName}
//               onChangeText={(t: string) => handleFieldChange('hostelName', t)}
//               onBlur={() => validateField('hostelName', formData.hostelName)}
//               error={errors.hostelName}
//               placeholder="Enter hostel name"
//               maxLength={100}
//             />
            
//             <FormInput
//               label="Email *"
//               value={formData.email}
//               onChangeText={(t: string) => handleFieldChange('email', t)}
//               onBlur={() => validateField('email', formData.email)}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               error={errors.email}
//               placeholder="Enter your email"
//               maxLength={100}
//             />
            
//             <FormInput
//               label="Mobile Number *"
//               value={formData.mobileNumber}
//               onChangeText={(t: string) => {
//                 // Allow only numbers
//                 const numericValue = t.replace(/[^0-9]/g, '');
//                 handleFieldChange('mobileNumber', numericValue);
//               }}
//               onBlur={() => validateField('mobileNumber', formData.mobileNumber)}
//               keyboardType="phone-pad"
//               error={errors.mobileNumber}
//               placeholder="Enter 10-digit mobile number"
//               maxLength={10}
//             />
            
//             <FormInput
//               label="Govt. Registration ID *"
//               value={formData.govtRegistrationId}
//               onChangeText={(t: string) => handleFieldChange('govtRegistrationId', t)}
//               onBlur={() => validateField('govtRegistrationId', formData.govtRegistrationId)}
//               error={errors.govtRegistrationId}
//               placeholder="Enter government registration ID"
//               maxLength={50}
//             />

//             {/* Hostel Type Selector */}
//             <View style={{ marginBottom: 15 }}>
//               <Text style={styles.label}>Hostel Type *</Text>
//               <View style={styles.hostelTypeContainer}>
//                 {hostelTypes.map((type) => (
//                   <TouchableOpacity
//                     key={type.value}
//                     style={[
//                       styles.hostelTypeButton,
//                       formData.hostelType === type.value && styles.hostelTypeButtonSelected
//                     ]}
//                     onPress={() => {
//                       setFormData({ ...formData, hostelType: type.value });
//                       if (errors.hostelType) {
//                         setErrors(prev => ({ ...prev, hostelType: "" }));
//                       }
//                     }}
//                   >
//                     <Text style={styles.hostelTypeIcon}>{type.icon}</Text>
//                     <Text style={[
//                       styles.hostelTypeLabel,
//                       formData.hostelType === type.value && styles.hostelTypeLabelSelected
//                     ]}>
//                       {type.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               {errors.hostelType && <Text style={styles.errorText}>{errors.hostelType}</Text>}
//             </View>

//             {/* File Upload Section */}
//             <View style={styles.uploadContainer}>
//               <Text style={styles.inputLabel}>Upload Documents *</Text>
//               <Text style={styles.requiredDocs}>
//                 Upload: Licence, Aadhaar, PAN, NOC, Property Docs (PDF or Images)
//               </Text>
//               <Text style={styles.fileLimitText}>Max 10 files • PDF, PNG, JPG</Text>
//               <TouchableOpacity style={styles.uploadBtn} onPress={handleFileUpload}>
//                 <Text style={styles.uploadBtnText}>📁 Choose Files</Text>
//               </TouchableOpacity>
//               {errors.upload && <Text style={styles.errorText}>{errors.upload}</Text>}
              
//               {uploadedFiles.length > 0 && (
//                 <View style={styles.fileCountContainer}>
//                   <Text style={styles.fileCountText}>
//                     {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
//                   </Text>
//                 </View>
//               )}
              
//               {uploadedFiles.map((file, i) => (
//                 <View key={i} style={styles.fileCard}>
//                   <View style={styles.fileHeader}>
//                     <Text style={styles.fileItem} numberOfLines={1} ellipsizeMode="middle">
//                       {file.name}
//                     </Text>
//                     <Text style={styles.fileTypeBadge}>
//                       {file.type === 'image' ? '📷 Image' : '📄 PDF'}
//                     </Text>
//                   </View>
//                   <View style={styles.fileActionsRow}>
//                     <TouchableOpacity
//                       onPress={() => handleViewFile(file)}
//                       style={[styles.fileActionBtn, styles.viewBtn]}
//                     >
//                       <Text style={styles.fileActionText}>
//                         {file.type === 'image' ? '👀 Preview' : '📄 View'}
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleRemoveFile(i)}
//                       style={[styles.fileActionBtn, styles.removeBtn]}
//                     >
//                       <Text style={styles.fileActionText}>🗑 Remove</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ))}
//             </View>

//             <FormInput
//               label="Full Address *"
//               value={formData.fullAddress}
//               onChangeText={(t: string) => handleFieldChange('fullAddress', t)}
//               onBlur={() => validateField('fullAddress', formData.fullAddress)}
//               multiline
//               numberOfLines={4}
//               style={{ textAlignVertical: "top", minHeight: 100 }}
//               error={errors.fullAddress}
//               placeholder="Enter complete hostel address"
//               maxLength={500}
//             />
            
//             {/* Validation Summary */}
//             {Object.keys(errors).length > 0 && (
//               <View style={styles.validationSummary}>
//                 <Text style={styles.validationTitle}>Please fix the following errors:</Text>
//                 {Object.entries(errors).map(([key, value]) => (
//                   value && <Text key={key} style={styles.validationError}>• {value}</Text>
//                 ))}
//               </View>
//             )}
            
//             <TouchableOpacity 
//               style={[styles.buttonSubmit, isSubmitted && styles.buttonDisabled]} 
//               onPress={handleSubmit}
//               disabled={isSubmitted}
//             >
//               <Text style={styles.buttonSubmitText}>
//                 {isSubmitted ? "Submitting..." : "Submit Registration"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => router.push("/HostelOwnerLogin")}
//               style={{ marginTop: 16 }}
//             >
//               <Text style={styles.linkText}>Already Verified? Login</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => router.push("/")} style={{ marginTop: 14 }}>
//               <Text style={styles.backText}>⬅ Back to Home</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Image Preview Modal */}
//       <ImagePreviewModal />

//       {/* Email Already Registered Modal */}
//       <EmailExistsModal />

//       <Toast />
//     </SafeAreaView>
//   );
// }

// function FormInput({ label, error, style, onBlur, maxLength, ...props }: any) {
//   const [focused, setFocused] = useState(false);
//   const [characterCount, setCharacterCount] = useState(props.value?.length || 0);
  
//   const handleChangeText = (text: string) => {
//     if (maxLength && text.length > maxLength) {
//       text = text.substring(0, maxLength);
//     }
//     setCharacterCount(text.length);
//     if (props.onChangeText) {
//       props.onChangeText(text);
//     }
//   };

//   return (
//     <View style={{ marginBottom: 16, width: "100%" }}>
//       <View style={styles.labelContainer}>
//         <Text
//           style={[
//             styles.inputLabel,
//             focused && { color: ACCENT },
//             error && { color: ERROR },
//           ]}
//         >
//           {label}
//         </Text>
//         {maxLength && (
//           <Text style={styles.characterCount}>
//             {characterCount}/{maxLength}
//           </Text>
//         )}
//       </View>
//       <TextInput
//         style={[
//           styles.input,
//           focused && {
//             borderColor: ACCENT,
//             backgroundColor: "#fff",
//             color: TEXT_DARK,
//           },
//           error && { borderColor: ERROR },
//           style,
//         ]}
//         onFocus={() => setFocused(true)}
//         onBlur={() => {
//           setFocused(false);
//           if (onBlur) onBlur();
//         }}
//         placeholderTextColor="#9ca3af"
//         onChangeText={handleChangeText}
//         value={props.value}
//         {...props}
//       />
//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//     backgroundColor: BG,
//   },
//   flex: { flex: 1 },
//   scroll: { padding: 20, paddingBottom: 60 },
//   centered: {
//     flexGrow: 1,
//     alignItems: "flex-start",
//     justifyContent: "flex-start",
//     padding: 24,
//   },
//   centeredApproved: {
//     flexGrow: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   pageTitle: {
//     fontSize: 26,
//     fontWeight: "900",
//     color: ACCENT,
//     marginBottom: 20,
//     textAlign: "center",
//     letterSpacing: 1.5,
//     width: "100%",
//   },
//   card: {
//     backgroundColor: CARD,
//     padding: 24,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   labelContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   inputLabel: {
//     color: TEXT_GRAY,
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   characterCount: {
//     fontSize: 12,
//     color: TEXT_GRAY,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: TEXT_DARK,
//     backgroundColor: "#fff",
//   },
//   errorText: {
//     color: ERROR,
//     fontSize: 13,
//     marginTop: 4,
//   },
//   requiredDocs: {
//     color: TEXT_GRAY,
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   fileLimitText: {
//     color: "#6b7280",
//     fontSize: 12,
//     marginBottom: 8,
//   },
//   uploadContainer: { marginBottom: 22 },
//   uploadBtn: {
//     backgroundColor: BUTTON,
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//     borderWidth: 1.5,
//     borderColor: BUTTON,
//   },
//   uploadBtnText: {
//     color: BG,
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   fileCountContainer: {
//     backgroundColor: "#f0fdf4",
//     padding: 8,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#bbf7d0",
//   },
//   fileCountText: {
//     color: "#166534",
//     fontSize: 14,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   fileCard: {
//     backgroundColor: "#f8f9fa",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#e5e5e5",
//   },
//   fileHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   fileItem: {
//     color: TEXT_GRAY,
//     fontSize: 14,
//     flex: 1,
//     marginRight: 8,
//   },
//   fileTypeBadge: {
//     fontSize: 12,
//     color: TEXT_GRAY,
//     backgroundColor: '#e5e7eb',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   fileActionsRow: {
//     flexDirection: "row",
//     marginTop: 6,
//   },
//   fileActionBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   viewBtn: {
//     backgroundColor: ACCENT,
//   },
//   removeBtn: {
//     backgroundColor: ERROR,
//   },
//   fileActionText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   buttonPrimary: {
//     backgroundColor: BUTTON,
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 20,
//     width: "100%",
//   },
//   buttonText: {
//     color: BG,
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   buttonSubmit: {
//     backgroundColor: BUTTON,
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 24,
//   },
//   buttonDisabled: {
//     backgroundColor: "#9ca3af",
//     opacity: 0.7,
//   },
//   buttonSubmitText: {
//     color: BG,
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   bigEmoji: { fontSize: 70, marginBottom: 20 },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: ACCENT,
//     marginBottom: 10,
//   },
//   approvedTitle: {
//     fontSize: 26,
//     fontWeight: "900",
//     color: ACCENT,
//     marginBottom: 12,
//   },
//   subtitle: {
//     color: TEXT_GRAY,
//     textAlign: "center",
//     fontSize: 16,
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   linkText: {
//     color: ACCENT,
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   backText: {
//     color: "#6b7280",
//     textAlign: "center",
//   },
//   // Stepper
//   stepper: {
//     marginTop: 20,
//     width: "100%",
//   },
//   stepRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 30,
//   },
//   stepIndicatorWrapper: {
//     alignItems: "center",
//     marginRight: 14,
//     position: "relative",
//   },
//   stepCircle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     borderWidth: 2,
//     borderColor: "#ccc",
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 1,
//   },
//   stepCheck: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   stepLine: {
//     position: "absolute",
//     top: 26,
//     left: 12,
//     width: 2,
//     height: 40,
//     backgroundColor: "#ccc",
//   },
//   stepContent: { flex: 1 },
//   stepTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: TEXT_GRAY,
//   },
//   stepDesc: {
//     fontSize: 14,
//     color: TEXT_GRAY,
//     marginTop: 4,
//   },
//   // Validation Summary
//   validationSummary: {
//     backgroundColor: "#fee2e2",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#fecaca",
//   },
//   validationTitle: {
//     color: "#991b1b",
//     fontWeight: "600",
//     marginBottom: 4,
//     fontSize: 14,
//   },
//   validationError: {
//     color: "#991b1b",
//     fontSize: 13,
//     marginLeft: 4,
//     marginTop: 2,
//   },
//   // Image Preview Modal Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.9)',
//   },
//   modalHeader: {
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   imageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   previewImage: {
//     width: '100%',
//     height: '100%',
//   },
//   // Email Already Registered Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emailModalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     width: '100%',
//     maxWidth: 400,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.2,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   emailModalHeader: {
//     backgroundColor: '#fef3c7',
//     paddingVertical: 20,
//     paddingHorizontal: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#fde68a',
//   },
//   emailModalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#92400e',
//     textAlign: 'center',
//   },
//   emailModalBody: {
//     padding: 24,
//   },
//   emailModalText: {
//     fontSize: 16,
//     color: TEXT_GRAY,
//     lineHeight: 24,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   emailHighlight: {
//     fontWeight: '700',
//     color: '#dc2626',
//     backgroundColor: '#fee2e2',
//     paddingHorizontal: 4,
//     borderRadius: 4,
//   },
//   emailModalSubtext: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: TEXT_DARK,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   emailModalOptions: {
//     gap: 12,
//     marginBottom: 16,
//   },
//   optionCard: {
//     backgroundColor: '#f8fafc',
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   optionNumber: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: ACCENT,
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     textAlign: 'center',
//     lineHeight: 28,
//     marginBottom: 8,
//   },
//   optionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: TEXT_DARK,
//     marginBottom: 4,
//   },
//   optionDesc: {
//     fontSize: 14,
//     color: TEXT_GRAY,
//     lineHeight: 20,
//   },
//   emailModalFooter: {
//     flexDirection: 'row',
//     padding: 20,
//     paddingTop: 0,
//     gap: 12,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   changeEmailButton: {
//     backgroundColor: '#f3f4f6',
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//   },
//   loginButton: {
//     backgroundColor: ACCENT,
//   },
//   changeEmailButtonText: {
//     color: TEXT_DARK,
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   // Hostel Type Selector
//   hostelTypeContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   hostelTypeButton: {
//     flex: 1,
//     minWidth: 100,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderRadius: 10,
//     alignItems: 'center',
//     backgroundColor: '#f9f9f9',
//   },
//   hostelTypeButtonSelected: {
//     borderColor: '#4CBB17',
//     backgroundColor: '#f0fff4',
//   },
//   hostelTypeIcon: {
//     fontSize: 20,
//     marginBottom: 5,
//   },
//   hostelTypeLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#666',
//     textAlign: 'center',
//   },
//   hostelTypeLabelSelected: {
//     color: '#4CBB17',
//   },
//   label: {
//     color: TEXT_GRAY,
//     fontWeight: "600",
//     marginBottom: 6,
//     fontSize: 14,
//   },
// });
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
import { Picker } from "@react-native-picker/picker"; // Import Picker for dropdown

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

export default function HostelOwnerRegistration() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    govtRegistrationId: "",
    fullAddress: "",
    hostelType: "co-living",
    numberOfHostels: "1",
  });

  // State for hostel names
  const [hostelNames, setHostelNames] = useState<string[]>([""]);

  // Add hostel type options
  const hostelTypes = [
    { value: "boys", label: "Boys Hostel", icon: "👨‍🎓" },
    { value: "girls", label: "Girls Hostel", icon: "👩‍🎓" }, 
    { value: "co-living", label: "Co-Living", icon: "👥" }
  ];

  // Number of hostels options (1 to 10) for dropdown
  const hostelCountOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} Hostel${i + 1 > 1 ? 's' : ''}`
  }));

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; uri: string; type: string }>>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState("");
  const [emailExistsModal, setEmailExistsModal] = useState(false);
  const [apiError, setApiError] = useState("");

  // ✅ Handle number of hostels change from dropdown
  const handleNumberOfHostelsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      numberOfHostels: value
    }));

    const count = parseInt(value);
    const currentLength = hostelNames.length;

    if (count > currentLength) {
      // Add more hostel name fields
      const newFields = Array(count - currentLength).fill("");
      setHostelNames(prev => [...prev, ...newFields]);
    } else if (count < currentLength) {
      // Remove extra hostel name fields (from the end)
      setHostelNames(prev => prev.slice(0, count));
    }

    // Clear hostel name errors when changing count
    if (errors.hostelNames) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.hostelNames;
        return newErrors;
      });
    }
  };

  // ✅ Handle hostel name change
  const handleHostelNameChange = (index: number, value: string) => {
    const updatedNames = [...hostelNames];
    updatedNames[index] = value;
    setHostelNames(updatedNames);

    // Clear specific hostel name error
    if (errors[`hostelName_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`hostelName_${index}`];
        return newErrors;
      });
    }

    // Clear general hostel names error
    if (errors.hostelNames) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.hostelNames;
        return newErrors;
      });
    }
  };

  // ✅ Enhanced form validation
  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = "Full name cannot exceed 50 characters";
    }

    // Hostel Names validation
    const hostelCount = parseInt(formData.numberOfHostels);
    let hasEmptyHostelName = false;
    let hasInvalidHostelName = false;
    
    for (let i = 0; i < hostelCount; i++) {
      const hostelName = hostelNames[i] || "";
      if (!hostelName.trim()) {
        hasEmptyHostelName = true;
        newErrors[`hostelName_${i}`] = `Hostel ${i + 1} name is required`;
      } else if (hostelName.trim().length < 3) {
        hasInvalidHostelName = true;
        newErrors[`hostelName_${i}`] = `Hostel ${i + 1} name must be at least 3 characters`;
      } else if (hostelName.trim().length > 100) {
        hasInvalidHostelName = true;
        newErrors[`hostelName_${i}`] = `Hostel ${i + 1} name cannot exceed 100 characters`;
      }
    }

    if (hasEmptyHostelName && !newErrors.hostelNames) {
      newErrors.hostelNames = "Please fill all hostel names";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email cannot exceed 100 characters";
    }

    // Mobile Number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit Indian mobile number";
    }

    // Govt Registration ID validation
    if (!formData.govtRegistrationId.trim()) {
      newErrors.govtRegistrationId = "Government registration ID is required";
    } else if (formData.govtRegistrationId.trim().length < 5) {
      newErrors.govtRegistrationId = "Registration ID must be at least 5 characters";
    } else if (formData.govtRegistrationId.trim().length > 50) {
      newErrors.govtRegistrationId = "Registration ID cannot exceed 50 characters";
    }

    // Hostel Type validation
    if (!formData.hostelType) {
      newErrors.hostelType = "Please select a hostel type";
    }

    // Full Address validation
    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = "Full address is required";
    } else if (formData.fullAddress.trim().length < 10) {
      newErrors.fullAddress = "Address must be at least 10 characters";
    } else if (formData.fullAddress.trim().length > 500) {
      newErrors.fullAddress = "Address cannot exceed 500 characters";
    }

    // File upload validation
    if (uploadedFiles.length === 0) {
      newErrors.upload = "Please upload at least one document";
    } else if (uploadedFiles.length > 10) {
      newErrors.upload = "Maximum 10 files allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Real-time field validation
  const validateField = (fieldName: string, value: string) => {
    let error = "";
    
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
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === "";
  };

  // ✅ Handle field change with validation
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
    
    // If email field is being edited, hide the email exists modal
    if (fieldName === 'email' && emailExistsModal) {
      setEmailExistsModal(false);
    }
  };

  // ✅ Check if file is an image
  const isImageFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? IMAGE_EXTENSIONS.includes(extension) : false;
  };

  // ✅ File upload picker
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/png", "image/jpeg", "image/*"],
        multiple: true,
      });

      const files = result.assets || (result.type === "success" ? [result] : []);
      if (!files || files.length === 0) return;

      let newFiles: Array<{ name: string; uri: string; type: string }> = [];
      for (let file of files) {
        if (file && file.uri && file.name && !uploadedFiles.some((f) => f.uri === file.uri)) {
          const fileType = isImageFile(file.name) ? 'image' : 'pdf';
          newFiles.push({
            name: file.name,
            uri: file.uri,
            type: fileType
          });
        }
      }
      
      if (newFiles.length > 0) {
        const updatedFiles = [...uploadedFiles, ...newFiles];
        if (updatedFiles.length > 10) {
          Toast.show({ 
            type: "error", 
            text1: "Maximum 10 files allowed",
            text2: `You have ${updatedFiles.length} files. Please remove some.`
          });
          return;
        }
        
        setUploadedFiles(updatedFiles);
        Toast.show({ type: "success", text1: "Files uploaded ✅" });
        
        // Clear upload error if files are added
        if (errors.upload) {
          setErrors(prev => ({
            ...prev,
            upload: ""
          }));
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

  // ✅ Close image preview
  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewUri("");
  };

  // ✅ Remove file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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
              The email <Text style={styles.emailHighlight}>{formData.email}</Text> is already registered in our system.
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
                setFormData(prev => ({ ...prev, email: "" }));
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
      formDataToSend.append("fullName", formData.fullName.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("mobileNumber", formData.mobileNumber.trim());
      formDataToSend.append("govtRegistrationId", formData.govtRegistrationId.trim());
      formDataToSend.append("fullAddress", formData.fullAddress.trim());
      formDataToSend.append("hostelType", formData.hostelType);
      formDataToSend.append("numberOfHostels", formData.numberOfHostels);
      
      // Append hostel names
      const hostelCount = parseInt(formData.numberOfHostels);
      for (let i = 0; i < hostelCount; i++) {
        formDataToSend.append(`hostelNames[${i}]`, hostelNames[i]?.trim() || "");
      }

      // Append documents
      uploadedFiles.forEach((file) => {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        let mimeType = "application/pdf";

        if (fileExtension === "png") mimeType = "image/png";
        else if (fileExtension === "jpg" || fileExtension === "jpeg") mimeType = "image/jpeg";

        formDataToSend.append("documents", {
          uri: file.uri,
          type: mimeType,
          name: file.name,
        } as any);
      });

      console.log("📎 Files to upload:", uploadedFiles.length);

      // ✅ POST API Call
      const response = await ApiClient.post("/hostel-owner/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Registration Success:", response.data);

      Toast.show({
        type: "success",
        text1: "Registration successful!",
        text2: "Please wait for admin approval.",
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
      onRequestClose={closePreview}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closePreview} style={styles.closeButton}>
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
            Your hostel registration has been successfully verified.
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

  // ✅ Main Registration Form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Hostel Owner Registration</Text>

          <View style={styles.card}>
            <FormInput
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(t: string) => handleFieldChange('fullName', t)}
              onBlur={() => validateField('fullName', formData.fullName)}
              error={errors.fullName}
              placeholder="Enter your full name"
              maxLength={50}
            />
            
            {/* Number of Hostels Dropdown */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Number of Hostels *</Text>
              <View style={styles.dropdownContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.numberOfHostels}
                    onValueChange={handleNumberOfHostelsChange}
                    style={styles.picker}
                    dropdownIconColor={ACCENT}
                  >
                    {hostelCountOptions.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.dropdownInfo}>
                  You can onboard up to 10 hostels in this registration
                </Text>
              </View>
            </View>

            {/* Dynamic Hostel Name Fields */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Hostel Names *</Text>
              {errors.hostelNames && (
                <Text style={styles.errorText}>{errors.hostelNames}</Text>
              )}
              <View style={styles.hostelNamesContainer}>
                {Array.from({ length: parseInt(formData.numberOfHostels) }).map((_, index) => (
                  <View key={index} style={styles.hostelNameField}>
                    <View style={styles.hostelNumberBadge}>
                      <Text style={styles.hostelNumberText}>Hostel {index + 1}</Text>
                    </View>
                    <FormInput
                      value={hostelNames[index] || ""}
                      onChangeText={(t: string) => handleHostelNameChange(index, t)}
                      placeholder={`Enter name for Hostel ${index + 1}`}
                      maxLength={100}
                      error={errors[`hostelName_${index}`]}
                    />
                  </View>
                ))}
              </View>
            </View>
            
            <FormInput
              label="Email *"
              value={formData.email}
              onChangeText={(t: string) => handleFieldChange('email', t)}
              onBlur={() => validateField('email', formData.email)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              placeholder="Enter your email"
              maxLength={100}
            />
            
            <FormInput
              label="Mobile Number *"
              value={formData.mobileNumber}
              onChangeText={(t: string) => {
                // Allow only numbers
                const numericValue = t.replace(/[^0-9]/g, '');
                handleFieldChange('mobileNumber', numericValue);
              }}
              onBlur={() => validateField('mobileNumber', formData.mobileNumber)}
              keyboardType="phone-pad"
              error={errors.mobileNumber}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
            
            <FormInput
              label="Govt. Registration ID *"
              value={formData.govtRegistrationId}
              onChangeText={(t: string) => handleFieldChange('govtRegistrationId', t)}
              onBlur={() => validateField('govtRegistrationId', formData.govtRegistrationId)}
              error={errors.govtRegistrationId}
              placeholder="Enter government registration ID"
              maxLength={50}
            />

            {/* Hostel Type Selector */}
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.label}>Hostel Type *</Text>
              <View style={styles.hostelTypeContainer}>
                {hostelTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.hostelTypeButton,
                      formData.hostelType === type.value && styles.hostelTypeButtonSelected
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, hostelType: type.value });
                      if (errors.hostelType) {
                        setErrors(prev => ({ ...prev, hostelType: "" }));
                      }
                    }}
                  >
                    <Text style={styles.hostelTypeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.hostelTypeLabel,
                      formData.hostelType === type.value && styles.hostelTypeLabelSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.hostelType && <Text style={styles.errorText}>{errors.hostelType}</Text>}
            </View>

            {/* File Upload Section */}
            <View style={styles.uploadContainer}>
              <Text style={styles.inputLabel}>Upload Documents *</Text>
              <Text style={styles.requiredDocs}>
                Upload: Licence, Aadhaar, PAN, NOC, Property Docs (PDF or Images)
              </Text>
              <Text style={styles.fileLimitText}>Max 10 files • PDF, PNG, JPG</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleFileUpload}>
                <Text style={styles.uploadBtnText}>📁 Choose Files</Text>
              </TouchableOpacity>
              {errors.upload && <Text style={styles.errorText}>{errors.upload}</Text>}
              
              {uploadedFiles.length > 0 && (
                <View style={styles.fileCountContainer}>
                  <Text style={styles.fileCountText}>
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                  </Text>
                </View>
              )}
              
              {uploadedFiles.map((file, i) => (
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
              value={formData.fullAddress}
              onChangeText={(t: string) => handleFieldChange('fullAddress', t)}
              onBlur={() => validateField('fullAddress', formData.fullAddress)}
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: "top", minHeight: 100 }}
              error={errors.fullAddress}
              placeholder="Enter complete hostel address"
              maxLength={500}
            />
            
            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <View style={styles.validationSummary}>
                <Text style={styles.validationTitle}>Please fix the following errors:</Text>
                {Object.entries(errors).map(([key, value]) => (
                  value && <Text key={key} style={styles.validationError}>• {value}</Text>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.buttonSubmit, isSubmitted && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isSubmitted}
            >
              <Text style={styles.buttonSubmitText}>
                {isSubmitted ? "Submitting..." : "Submit Registration"}
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
      {label && (
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
      )}
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
  // Number of Hostels Dropdown Styles
  dropdownContainer: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    color: TEXT_DARK,
  },
  pickerItem: {
    fontSize: 16,
  },
  dropdownInfo: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Hostel Name Fields
  hostelNamesContainer: {
    gap: 12,
  },
  hostelNameField: {
    position: 'relative',
  },
  hostelNumberBadge: {
    position: 'absolute',
    top: -6,
    left: 12,
    zIndex: 1,
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostelNumberText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});