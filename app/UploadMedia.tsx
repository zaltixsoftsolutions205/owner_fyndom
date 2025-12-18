// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   Modal,
// } from "react-native";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import Toast from "react-native-toast-message";
// import HostelPhotoApi, { Photo } from "../app/api/hostelPhotoApi";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width } = Dimensions.get("window");

// function UploadMedia() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets(); // safe area insets

//   const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
//   const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     loadUploadedPhotos();
//   }, []);

//   const loadUploadedPhotos = async () => {
//     try {
//       setLoading(true);
//       const response = await HostelPhotoApi.getHostelPhotos();

//       if (response.success) {
//         const photos = response.data || [];
//         setUploadedPhotos(photos);
//       } else {
//         showToast("error", "Failed to load photos", response.message);
//       }
//     } catch (error: any) {
//       showToast("error", "Error loading photos", error.message || "Please try again");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pickPhotos = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera roll permissions to upload photos."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//       allowsEditing: false,
//       base64: false,
//       exif: false,
//     });

//     if (!result.canceled && result.assets) {
//       const newPhotos = result.assets.map((asset) => ({
//         uri: asset.uri,
//         type: "image/jpeg",
//         fileName: asset.fileName || `photo_${Date.now()}.jpg`,
//       }));

//       setSelectedPhotos((prev) => [...prev, ...newPhotos]);
//       showToast("success", `${newPhotos.length} photo(s) selected`);
//     }
//   };

//   const takePhoto = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera permissions to take photos."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//       allowsEditing: false,
//       base64: false,
//       exif: false,
//     });

//     if (!result.canceled && result.assets) {
//       const newPhoto = {
//         uri: result.assets[0].uri,
//         type: "image/jpeg",
//         fileName: `camera_${Date.now()}.jpg`,
//       };

//       setSelectedPhotos((prev) => [newPhoto, ...prev]);
//       showToast("success", "Photo taken successfully");
//     }
//   };

//   const removeSelectedPhoto = (index: number) => {
//     setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
//   };

//   const uploadPhotos = async () => {
//     if (selectedPhotos.length === 0) {
//       showToast("error", "No photos selected", "Please select photos first");
//       return;
//     }

//     setUploading(true);
//     try {
//       const response = await HostelPhotoApi.uploadPhotos(selectedPhotos);

//       if (response.success) {
//         showToast(
//           "success",
//           "Photos uploaded successfully!",
//           "Students can now see your hostel photos"
//         );
//         setSelectedPhotos([]);
//         await loadUploadedPhotos();
//       }
//     } catch (error: any) {
//       showToast("error", "Upload failed", error.message || "Please try again");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const deletePhoto = async (photoId: string) => {
//     setDeleting(photoId);
//     try {
//       const response = await HostelPhotoApi.deletePhoto(photoId);

//       if (response.success) {
//         showToast("success", "Photo deleted", "Photo has been removed successfully");
//         setUploadedPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
//         setModalVisible(false);
//         setSelectedPhoto(null);
//       }
//     } catch (error: any) {
//       showToast("error", "Delete failed", error.message || "Please try again");
//     } finally {
//       setDeleting(null);
//     }
//   };

//   const confirmDelete = (photo: Photo) => {
//     setSelectedPhoto(photo);
//     setModalVisible(true);
//   };

//   const handlePhotoPress = (photo: Photo) => {
//     setSelectedPhoto(photo);
//     setModalVisible(true);
//   };

//   const showToast = (
//     type: "success" | "error" | "info",
//     text1: string,
//     text2?: string
//   ) => {
//     Toast.show({ type, text1, text2, position: "bottom" });
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Header pushed down by safe-area inset */}
//         <View
//           style={[
//             styles.header,
//             { paddingTop: insets.top + 8 }, // <<< move header clearly below camera/notch
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Icon name="arrow-left" size={24} color="#333" />
//           </TouchableOpacity>
//           <Text style={styles.title}>Upload Hostel Photos</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         <ScrollView
//           style={styles.content}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 24 }}
//         >
//           {/* Instructions */}
//           <View style={styles.instructionCard}>
//             <Icon name="camera" size={40} color="#4CBB17" />
//             <Text style={styles.instructionTitle}>Showcase Your Hostel</Text>
//             <Text style={styles.instructionText}>
//               Upload high-quality photos of rooms, common areas, and facilities to
//               attract more students.
//             </Text>
//             <Text style={styles.tips}>
//               • Add at least 3-5 photos{"\n"}
//               • Include different areas{"\n"}
//               • Use good lighting
//             </Text>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.actionButton} onPress={pickPhotos}>
//               <Icon name="image-multiple" size={24} color="#fff" />
//               <Text style={styles.buttonText}>Choose Photos</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionButton, styles.cameraButton]}
//               onPress={takePhoto}
//             >
//               <Icon name="camera" size={24} color="#fff" />
//               <Text style={styles.buttonText}>Take Photo</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Selected Photos */}
//           {selectedPhotos.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>
//                 Selected Photos ({selectedPhotos.length})
//               </Text>
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 <View style={styles.photosContainer}>
//                   {selectedPhotos.map((photo, index) => (
//                     <View key={index} style={styles.photoCard}>
//                       <Image source={{ uri: photo.uri }} style={styles.photo} />
//                       <TouchableOpacity
//                         style={styles.removeButton}
//                         onPress={() => removeSelectedPhoto(index)}
//                       >
//                         <Icon name="close" size={16} color="#fff" />
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </View>
//               </ScrollView>

//               <TouchableOpacity
//                 style={[
//                   styles.uploadButton,
//                   uploading && styles.uploadButtonDisabled,
//                 ]}
//                 onPress={uploadPhotos}
//                 disabled={uploading}
//               >
//                 {uploading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Icon name="cloud-upload" size={20} color="#fff" />
//                     <Text style={styles.uploadButtonText}>
//                       Upload {selectedPhotos.length} Photo(s)
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Uploaded Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>
//                 Your Hostel Photos ({uploadedPhotos.length})
//               </Text>
//               <TouchableOpacity
//                 onPress={loadUploadedPhotos}
//                 style={styles.refreshButton}
//               >
//                 <Icon name="refresh" size={20} color="#4CBB17" />
//                 <Text style={styles.refreshText}>Refresh</Text>
//               </TouchableOpacity>
//             </View>

//             {loading ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#4CBB17" />
//                 <Text style={styles.loadingText}>Loading photos...</Text>
//               </View>
//             ) : uploadedPhotos.length > 0 ? (
//               <View>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   <View style={styles.photosContainer}>
//                     {uploadedPhotos.map((photo) => (
//                       <TouchableOpacity
//                         key={photo._id}
//                         style={styles.photoCard}
//                         onPress={() => handlePhotoPress(photo)}
//                       >
//                         <Image
//                           source={{ uri: photo.url }}
//                           style={styles.photo}
//                         />
//                         {photo.isPrimary && (
//                           <View style={styles.primaryBadge}>
//                             <Icon name="star" size={12} color="#FFD700" />
//                             <Text style={styles.primaryText}>Primary</Text>
//                           </View>
//                         )}
//                         <TouchableOpacity
//                           style={styles.deleteButton}
//                           onPress={() => confirmDelete(photo)}
//                           disabled={deleting === photo._id}
//                         >
//                           {deleting === photo._id ? (
//                             <ActivityIndicator size="small" color="#fff" />
//                           ) : (
//                             <Icon
//                               name="delete-outline"
//                               size={18}
//                               color="#fff"
//                             />
//                           )}
//                         </TouchableOpacity>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </ScrollView>
//                 <Text style={styles.photoCountText}>
//                   {uploadedPhotos.length} photo(s) uploaded
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.emptyState}>
//                 <Icon name="image-off" size={50} color="#ccc" />
//                 <Text style={styles.emptyText}>No photos uploaded yet</Text>
//                 <Text style={styles.emptySubtext}>
//                   Upload photos to showcase your hostel to students
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Photo Preview Modal */}
//           <Modal
//             visible={modalVisible}
//             transparent={true}
//             animationType="fade"
//             onRequestClose={() => setModalVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.modalContent}>
//                 {selectedPhoto && (
//                   <>
//                     <Image
//                       source={{ uri: selectedPhoto.url }}
//                       style={styles.modalImage}
//                       resizeMode="contain"
//                     />
//                     <View style={styles.modalActions}>
//                       <TouchableOpacity
//                         style={[styles.modalButton, styles.deleteModalButton]}
//                         onPress={() => deletePhoto(selectedPhoto._id)}
//                         disabled={deleting === selectedPhoto._id}
//                       >
//                         {deleting === selectedPhoto._id ? (
//                           <ActivityIndicator color="#fff" />
//                         ) : (
//                           <>
//                             <Icon name="delete" size={20} color="#fff" />
//                             <Text style={styles.modalButtonText}>Delete</Text>
//                           </>
//                         )}
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={[styles.modalButton, styles.closeModalButton]}
//                         onPress={() => setModalVisible(false)}
//                       >
//                         <Text style={styles.modalButtonText}>Close</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </>
//                 )}
//               </View>
//             </View>
//           </Modal>
//         </ScrollView>

//         <Toast />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//     // paddingTop is injected dynamically using insets.top
//   },
//   backButton: {
//     padding: 4,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   instructionCard: {
//     backgroundColor: "#f8fff8",
//     padding: 20,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#e8f5e8",
//     marginBottom: 20,
//   },
//   instructionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#4CBB17",
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   instructionText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   tips: {
//     fontSize: 12,
//     color: "#888",
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   actionButton: {
//     flex: 1,
//     backgroundColor: "#4CBB17",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   cameraButton: {
//     backgroundColor: "#219150",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   refreshButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 6,
//   },
//   refreshText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: "#4CBB17",
//     fontWeight: "600",
//   },
//   photosContainer: {
//     flexDirection: "row",
//   },
//   photoCard: {
//     position: "relative",
//     marginRight: 12,
//   },
//   photo: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: "#f5f5f5",
//   },
//   removeButton: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     backgroundColor: "rgba(255,0,0,0.7)",
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   deleteButton: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     backgroundColor: "rgba(255,0,0,0.8)",
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   primaryBadge: {
//     position: "absolute",
//     top: 4,
//     left: 4,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     borderRadius: 6,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   primaryText: {
//     color: "#FFD700",
//     fontSize: 10,
//     fontWeight: "bold",
//     marginLeft: 2,
//   },
//   uploadButton: {
//     backgroundColor: "#4CBB17",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   uploadButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   emptyState: {
//     alignItems: "center",
//     padding: 40,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//   },
//   emptyText: {
//     marginTop: 12,
//     color: "#999",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   emptySubtext: {
//     marginTop: 8,
//     color: "#ccc",
//     fontSize: 14,
//     textAlign: "center",
//   },
//   loadingContainer: {
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 8,
//     color: "#666",
//     fontSize: 14,
//   },
//   photoCountText: {
//     textAlign: "center",
//     color: "#666",
//     fontSize: 12,
//     marginTop: 8,
//     fontStyle: "italic",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     width: "90%",
//     maxHeight: "80%",
//   },
//   modalImage: {
//     width: "100%",
//     height: 300,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   deleteModalButton: {
//     backgroundColor: "#FF3B30",
//   },
//   closeModalButton: {
//     backgroundColor: "#8E8E93",
//   },
//   modalButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
// });

// export default UploadMedia;


// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   Modal,
// } from "react-native";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import Toast from "react-native-toast-message";
// import HostelPhotoApi, { Photo } from "../app/api/hostelPhotoApi";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width } = Dimensions.get("window");

// function UploadMedia() {
//   const router = useRouter();
//   const insets = useSafeAreaInsets(); // safe area insets

//   const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
//   const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     loadUploadedPhotos();
//   }, []);

//   const loadUploadedPhotos = async () => {
//     try {
//       setLoading(true);
//       const response = await HostelPhotoApi.getHostelPhotos();

//       if (response.success) {
//         const photos = response.data || [];
//         setUploadedPhotos(photos);
//       } else {
//         showToast("error", "Failed to load photos", response.message);
//       }
//     } catch (error: any) {
//       showToast("error", "Error loading photos", error.message || "Please try again");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pickPhotos = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera roll permissions to upload photos."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.8,
//       allowsEditing: false,
//       base64: false,
//       exif: false,
//     });

//     if (!result.canceled && result.assets) {
//       const newPhotos = result.assets.map((asset) => ({
//         uri: asset.uri,
//         type: "image/jpeg",
//         fileName: asset.fileName || `photo_${Date.now()}.jpg`,
//       }));

//       setSelectedPhotos((prev) => [...prev, ...newPhotos]);
//       showToast("success", `${newPhotos.length} photo(s) selected`);
//     }
//   };

//   const takePhoto = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Please grant camera permissions to take photos."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//       allowsEditing: false,
//       base64: false,
//       exif: false,
//     });

//     if (!result.canceled && result.assets) {
//       const newPhoto = {
//         uri: result.assets[0].uri,
//         type: "image/jpeg",
//         fileName: `camera_${Date.now()}.jpg`,
//       };

//       setSelectedPhotos((prev) => [newPhoto, ...prev]);
//       showToast("success", "Photo taken successfully");
//     }
//   };

//   const removeSelectedPhoto = (index: number) => {
//     setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
//   };

//   const uploadPhotos = async () => {
//     if (selectedPhotos.length === 0) {
//       showToast("error", "No photos selected", "Please select photos first");
//       return;
//     }

//     setUploading(true);
//     try {
//       const response = await HostelPhotoApi.uploadPhotos(selectedPhotos);

//       if (response.success) {
//         showToast(
//           "success",
//           "Photos uploaded successfully!",
//           "Students can now see your hostel photos"
//         );
//         setSelectedPhotos([]);
//         await loadUploadedPhotos();
//       }
//     } catch (error: any) {
//       showToast("error", "Upload failed", error.message || "Please try again");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const deletePhoto = async (photoId: string) => {
//     setDeleting(photoId);
//     try {
//       const response = await HostelPhotoApi.deletePhoto(photoId);

//       if (response.success) {
//         showToast("success", "Photo deleted", "Photo has been removed successfully");
//         setUploadedPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
//         setModalVisible(false);
//         setSelectedPhoto(null);
//       }
//     } catch (error: any) {
//       showToast("error", "Delete failed", error.message || "Please try again");
//     } finally {
//       setDeleting(null);
//     }
//   };

//   const confirmDelete = (photo: Photo) => {
//     setSelectedPhoto(photo);
//     setModalVisible(true);
//   };

//   const handlePhotoPress = (photo: Photo) => {
//     setSelectedPhoto(photo);
//     setModalVisible(true);
//   };

//   const showToast = (
//     type: "success" | "error" | "info",
//     text1: string,
//     text2?: string
//   ) => {
//     Toast.show({ type, text1, text2, position: "bottom" });
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Header pushed down by safe-area inset */}
//         <View
//           style={[
//             styles.header,
//             { paddingTop: insets.top + 8 }, // <<< move header clearly below camera/notch
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Icon name="arrow-left" size={24} color="#333" />
//           </TouchableOpacity>
//           <Text style={styles.title}>Upload Hostel Photos</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         <ScrollView
//           style={styles.content}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 24 }}
//         >
//           {/* Instructions */}
//           <View style={styles.instructionCard}>
//             <Icon name="camera" size={40} color="#4CBB17" />
//             <Text style={styles.instructionTitle}>Showcase Your Hostel</Text>
//             <Text style={styles.instructionText}>
//               Upload high-quality photos of rooms, common areas, and facilities to
//               attract more students.
//             </Text>
//             <Text style={styles.tips}>
//               • Add at least 3-5 photos{"\n"}
//               • Include different areas{"\n"}
//               • Use good lighting
//             </Text>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.actionButton} onPress={pickPhotos}>
//               <Icon name="image-multiple" size={24} color="#fff" />
//               <Text style={styles.buttonText}>Choose Photos</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionButton, styles.cameraButton]}
//               onPress={takePhoto}
//             >
//               <Icon name="camera" size={24} color="#fff" />
//               <Text style={styles.buttonText}>Take Photo</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Selected Photos */}
//           {selectedPhotos.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>
//                 Selected Photos ({selectedPhotos.length})
//               </Text>
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 <View style={styles.photosContainer}>
//                   {selectedPhotos.map((photo, index) => (
//                     <View key={index} style={styles.photoCard}>
//                       <Image source={{ uri: photo.uri }} style={styles.photo} />
//                       <TouchableOpacity
//                         style={styles.removeButton}
//                         onPress={() => removeSelectedPhoto(index)}
//                       >
//                         <Icon name="close" size={16} color="#fff" />
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </View>
//               </ScrollView>

//               <TouchableOpacity
//                 style={[
//                   styles.uploadButton,
//                   uploading && styles.uploadButtonDisabled,
//                 ]}
//                 onPress={uploadPhotos}
//                 disabled={uploading}
//               >
//                 {uploading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Icon name="cloud-upload" size={20} color="#fff" />
//                     <Text style={styles.uploadButtonText}>
//                       Upload {selectedPhotos.length} Photo(s)
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Uploaded Photos Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>
//                 Your Hostel Photos ({uploadedPhotos.length})
//               </Text>
//               <TouchableOpacity
//                 onPress={loadUploadedPhotos}
//                 style={styles.refreshButton}
//               >
//                 <Icon name="refresh" size={20} color="#4CBB17" />
//                 <Text style={styles.refreshText}>Refresh</Text>
//               </TouchableOpacity>
//             </View>

//             {loading ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#4CBB17" />
//                 <Text style={styles.loadingText}>Loading photos...</Text>
//               </View>
//             ) : uploadedPhotos.length > 0 ? (
//               <View>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   <View style={styles.photosContainer}>
//                     {uploadedPhotos.map((photo) => (
//                       <TouchableOpacity
//                         key={photo._id}
//                         style={styles.photoCard}
//                         onPress={() => handlePhotoPress(photo)}
//                       >
//                         <Image
//                           source={{ uri: photo.url }}
//                           style={styles.photo}
//                         />
//                         {photo.isPrimary && (
//                           <View style={styles.primaryBadge}>
//                             <Icon name="star" size={12} color="#FFD700" />
//                             <Text style={styles.primaryText}>Primary</Text>
//                           </View>
//                         )}
//                         <TouchableOpacity
//                           style={styles.deleteButton}
//                           onPress={() => confirmDelete(photo)}
//                           disabled={deleting === photo._id}
//                         >
//                           {deleting === photo._id ? (
//                             <ActivityIndicator size="small" color="#fff" />
//                           ) : (
//                             <Icon
//                               name="delete-outline"
//                               size={18}
//                               color="#fff"
//                             />
//                           )}
//                         </TouchableOpacity>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </ScrollView>
//                 <Text style={styles.photoCountText}>
//                   {uploadedPhotos.length} photo(s) uploaded
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.emptyState}>
//                 <Icon name="image-off" size={50} color="#ccc" />
//                 <Text style={styles.emptyText}>No photos uploaded yet</Text>
//                 <Text style={styles.emptySubtext}>
//                   Upload photos to showcase your hostel to students
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Photo Preview Modal */}
//           <Modal
//             visible={modalVisible}
//             transparent={true}
//             animationType="fade"
//             onRequestClose={() => setModalVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.modalContent}>
//                 {selectedPhoto && (
//                   <>
//                     <Image
//                       source={{ uri: selectedPhoto.url }}
//                       style={styles.modalImage}
//                       resizeMode="contain"
//                     />
//                     <View style={styles.modalActions}>
//                       <TouchableOpacity
//                         style={[styles.modalButton, styles.deleteModalButton]}
//                         onPress={() => deletePhoto(selectedPhoto._id)}
//                         disabled={deleting === selectedPhoto._id}
//                       >
//                         {deleting === selectedPhoto._id ? (
//                           <ActivityIndicator color="#fff" />
//                         ) : (
//                           <>
//                             <Icon name="delete" size={20} color="#fff" />
//                             <Text style={styles.modalButtonText}>Delete</Text>
//                           </>
//                         )}
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={[styles.modalButton, styles.closeModalButton]}
//                         onPress={() => setModalVisible(false)}
//                       >
//                         <Text style={styles.modalButtonText}>Close</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </>
//                 )}
//               </View>
//             </View>
//           </Modal>
//         </ScrollView>

//         <Toast />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//     // paddingTop is injected dynamically using insets.top
//   },
//   backButton: {
//     padding: 4,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   instructionCard: {
//     backgroundColor: "#f8fff8",
//     padding: 20,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#e8f5e8",
//     marginBottom: 20,
//   },
//   instructionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#4CBB17",
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   instructionText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   tips: {
//     fontSize: 12,
//     color: "#888",
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   actionButton: {
//     flex: 1,
//     backgroundColor: "#4CBB17",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   cameraButton: {
//     backgroundColor: "#219150",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   refreshButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 6,
//   },
//   refreshText: {
//     marginLeft: 4,
//     fontSize: 12,
//     color: "#4CBB17",
//     fontWeight: "600",
//   },
//   photosContainer: {
//     flexDirection: "row",
//   },
//   photoCard: {
//     position: "relative",
//     marginRight: 12,
//   },
//   photo: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: "#f5f5f5",
//   },
//   removeButton: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     backgroundColor: "rgba(255,0,0,0.7)",
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   deleteButton: {
//     position: "absolute",
//     top: 4,
//     right: 4,
//     backgroundColor: "rgba(255,0,0,0.8)",
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   primaryBadge: {
//     position: "absolute",
//     top: 4,
//     left: 4,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     borderRadius: 6,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   primaryText: {
//     color: "#FFD700",
//     fontSize: 10,
//     fontWeight: "bold",
//     marginLeft: 2,
//   },
//   uploadButton: {
//     backgroundColor: "#4CBB17",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 12,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   uploadButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   emptyState: {
//     alignItems: "center",
//     padding: 40,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 12,
//   },
//   emptyText: {
//     marginTop: 12,
//     color: "#999",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   emptySubtext: {
//     marginTop: 8,
//     color: "#ccc",
//     fontSize: 14,
//     textAlign: "center",
//   },
//   loadingContainer: {
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 8,
//     color: "#666",
//     fontSize: 14,
//   },
//   photoCountText: {
//     textAlign: "center",
//     color: "#666",
//     fontSize: 12,
//     marginTop: 8,
//     fontStyle: "italic",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.8)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     width: "90%",
//     maxHeight: "80%",
//   },
//   modalImage: {
//     width: "100%",
//     height: 300,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   deleteModalButton: {
//     backgroundColor: "#FF3B30",
//   },
//   closeModalButton: {
//     backgroundColor: "#8E8E93",
//   },
//   modalButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     marginLeft: 8,
//   },
// });

// export default UploadMedia;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import HostelPhotoApi, { Photo } from "../app/api/hostelPhotoApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

function UploadMedia() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // safe area insets

  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadUploadedPhotos();
  }, []);

  const loadUploadedPhotos = async () => {
    try {
      setLoading(true);
      const response = await HostelPhotoApi.getHostelPhotos();

      if (response.success) {
        const photos = response.data || [];
        setUploadedPhotos(photos);
      } else {
        showToast("error", "Failed to load photos", response.message);
      }
    } catch (error: any) {
      showToast("error", "Error loading photos", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => ({
        uri: asset.uri,
        type: "image/jpeg",
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      }));

      setSelectedPhotos((prev) => [...prev, ...newPhotos]);
      showToast("success", `${newPhotos.length} photo(s) selected`);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets) {
      const newPhoto = {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        fileName: `camera_${Date.now()}.jpg`,
      };

      setSelectedPhotos((prev) => [newPhoto, ...prev]);
      showToast("success", "Photo taken successfully");
    }
  };

  const removeSelectedPhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedPhotos.length === 0) {
      showToast("error", "No photos selected", "Please select photos first");
      return;
    }

    setUploading(true);
    try {
      const response = await HostelPhotoApi.uploadPhotos(selectedPhotos);

      if (response.success) {
        showToast(
          "success",
          "Photos uploaded successfully!",
          "Students can now see your hostel photos"
        );
        setSelectedPhotos([]);
        await loadUploadedPhotos();
      }
    } catch (error: any) {
      showToast("error", "Upload failed", error.message || "Please try again");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    setDeleting(photoId);
    try {
      const response = await HostelPhotoApi.deletePhoto(photoId);

      if (response.success) {
        showToast("success", "Photo deleted", "Photo has been removed successfully");
        setUploadedPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
        setModalVisible(false);
        setSelectedPhoto(null);
      }
    } catch (error: any) {
      showToast("error", "Delete failed", error.message || "Please try again");
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleNext = () => {
    router.push('/Pricing');
  };

  const showToast = (
    type: "success" | "error" | "info",
    text1: string,
    text2?: string
  ) => {
    Toast.show({ type, text1, text2, position: "bottom" });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header pushed down by safe-area inset */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 8 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Hostel Photos</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Instructions */}
          <View style={styles.instructionCard}>
            <Icon name="camera" size={40} color="#4CBB17" />
            <Text style={styles.instructionTitle}>Showcase Your Hostel</Text>
            <Text style={styles.instructionText}>
              Upload high-quality photos of rooms, common areas, and facilities to
              attract more students.
            </Text>
            <Text style={styles.tips}>
              • Add at least 3-5 photos{"\n"}
              • Include different areas{"\n"}
              • Use good lighting
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={pickPhotos}>
              <Icon name="image-multiple" size={24} color="#fff" />
              <Text style={styles.buttonText}>Choose Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
            >
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Photos */}
          {selectedPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Selected Photos ({selectedPhotos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosContainer}>
                  {selectedPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoCard}>
                      <Image source={{ uri: photo.uri }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeSelectedPhoto(index)}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.uploadButtonDisabled,
                ]}
                onPress={uploadPhotos}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>
                      Upload {selectedPhotos.length} Photo(s)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Uploaded Photos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Hostel Photos ({uploadedPhotos.length})
              </Text>
              <TouchableOpacity
                onPress={loadUploadedPhotos}
                style={styles.refreshButton}
              >
                <Icon name="refresh" size={20} color="#4CBB17" />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CBB17" />
                <Text style={styles.loadingText}>Loading photos...</Text>
              </View>
            ) : uploadedPhotos.length > 0 ? (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.photosContainer}>
                    {uploadedPhotos.map((photo) => (
                      <TouchableOpacity
                        key={photo._id}
                        style={styles.photoCard}
                        onPress={() => handlePhotoPress(photo)}
                      >
                        <Image
                          source={{ uri: photo.url }}
                          style={styles.photo}
                        />
                        {photo.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Icon name="star" size={12} color="#FFD700" />
                            <Text style={styles.primaryText}>Primary</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => confirmDelete(photo)}
                          disabled={deleting === photo._id}
                        >
                          {deleting === photo._id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Icon
                              name="delete-outline"
                              size={18}
                              color="#fff"
                            />
                          )}
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <Text style={styles.photoCountText}>
                  {uploadedPhotos.length} photo(s) uploaded
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="image-off" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No photos uploaded yet</Text>
                <Text style={styles.emptySubtext}>
                  Upload photos to showcase your hostel to students
                </Text>
              </View>
            )}
          </View>

          {/* Photo Preview Modal */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedPhoto && (
                  <>
                    <Image
                      source={{ uri: selectedPhoto.url }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.deleteModalButton]}
                        onPress={() => deletePhoto(selectedPhoto._id)}
                        disabled={deleting === selectedPhoto._id}
                      >
                        {deleting === selectedPhoto._id ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Icon name="delete" size={20} color="#fff" />
                            <Text style={styles.modalButtonText}>Delete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.closeModalButton]}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.modalButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>

        {/* Next Button - Centered, compact, and higher up */}
        <View style={styles.nextButtonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Icon name="arrow-right" size={16} color="#fff" />
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionCard: {
    backgroundColor: "#f8fff8",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8f5e8",
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CBB17",
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  tips: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#4CBB17",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cameraButton: {
    backgroundColor: "#219150",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  refreshText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#4CBB17",
    fontWeight: "600",
  },
  photosContainer: {
    flexDirection: "row",
  },
  photoCard: {
    position: "relative",
    marginRight: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,0,0,0.7)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,0,0,0.8)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  uploadButton: {
    backgroundColor: "#4CBB17",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  photoCountText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  deleteModalButton: {
    backgroundColor: "#FF3B30",
  },
  closeModalButton: {
    backgroundColor: "#8E8E93",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  // New Next Button Styles: now center, compact, and somewhat up
  nextButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: -20,   // brings button higher; adjust as needed
    marginBottom: 36, // some bottom margin, not flush with edge
    backgroundColor: "#fff",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CBB17",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 80,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 6,
  },
});

export default UploadMedia;