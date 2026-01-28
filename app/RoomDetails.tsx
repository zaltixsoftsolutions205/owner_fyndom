// app/RoomDetails.tsx
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import {
  addRoom,
  getAllRooms,
  deleteRoom,
  clearRoomError,
  clearRoomSuccess,
  resetRoomState,
} from "../app/reduxStore/reduxSlices/roomSlice";

const { width, height } = Dimensions.get("window");
const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";
const RED = "#FF6B6B";

const sharingOptions = [
  { label: "Single", value: "single" },
  { label: "Double", value: "double" },
  { label: "Triple", value: "triple" },
  { label: "Quad", value: "four" },
  { label: "Five", value: "five" },
  { label: "Six", value: "six" },
  { label: "Seven", value: "seven" },
  { label: "Eight", value: "eight" },
  { label: "Nine", value: "nine" },
  { label: "Ten", value: "ten" },
];

interface Room {
  id: number;
  _id?: string;
  floor: string;
  number: string;
  capacity: string;
  occupied: string;
  sharing: string;
}

export default function RoomDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();

  const {
    loading,
    error,
    success,
    allRooms,
    allRoomsLoading,
    allRoomsError,
    summary,
    sharingTypeAvailability,
    deleteLoading,
    deleteError
  } = useAppSelector((state) => state.rooms);

  const {
    selectedHostelId,
    hostels,
    token
  } = useAppSelector((state) => state.auth);

  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, floor: "", number: "", capacity: "", occupied: "0", sharing: "" },
  ]);
  const [editMode, setEditMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hostelId, setHostelId] = useState<string>("");
  const [selectedHostelStatus, setSelectedHostelStatus] = useState<string>("");
  const [isHostelRejected, setIsHostelRejected] = useState<boolean>(false);
  const [isHostelPending, setIsHostelPending] = useState<boolean>(false);

  // Get hostelId from params or selectedHostelId
  useEffect(() => {
    const hostelIdFromParams = params.hostelId as string;
    if (hostelIdFromParams) {
      setHostelId(hostelIdFromParams);
    } else if (selectedHostelId) {
      setHostelId(selectedHostelId);
    }
  }, [params.hostelId, selectedHostelId]);

  // Check hostel status when hostelId changes
  useEffect(() => {
    if (hostelId && hostels.length > 0) {
      const currentHostel = hostels.find(h => h.hostelId === hostelId);
      if (currentHostel) {
        setSelectedHostelStatus(currentHostel.status);
        setIsHostelRejected(currentHostel.status === "rejected");
        setIsHostelPending(currentHostel.status === "pending");

        if (currentHostel.status === "rejected") {
          Toast.show({
            type: "error",
            text1: "Hostel Rejected",
            text2: "Cannot add rooms. This hostel has been rejected.",
            position: "bottom",
            visibilityTime: 4000,
          });
        } else if (currentHostel.status === "pending") {
          Toast.show({
            type: "info",
            text1: "Hostel Pending Approval",
            text2: "Cannot add rooms until hostel is approved.",
            position: "bottom",
            visibilityTime: 4000,
          });
        }
      }
    }
  }, [hostelId, hostels]);

  // Fetch rooms when hostelId changes and hostel is approved
  useEffect(() => {
    if (hostelId && !isHostelRejected && !isHostelPending) {
      console.log("🔄 Fetching rooms for approved hostel:", hostelId);
      dispatch(getAllRooms(hostelId));
    }
  }, [hostelId, isHostelRejected, isHostelPending, dispatch]);

  // Update rooms state when allRooms changes
  useEffect(() => {
    if (allRooms && allRooms.length > 0) {
      console.log("📋 Setting rooms from API data");
      setRooms(
        allRooms.map((room, index) => ({
          id: index + 1,
          _id: room._id,
          floor: room.floor,
          number: room.roomNumber,
          capacity: String(room.capacity),
          occupied: String(room.occupied),
          sharing: room.sharingType,
        }))
      );
      setEditMode(true);
    } else {
      setEditMode(false);
      // Reset to one empty room if no rooms exist
      setRooms([{ id: 1, floor: "", number: "", capacity: "", occupied: "0", sharing: "" }]);
    }
  }, [allRooms]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: "Room Saved Successfully!",
        text2: "Room has been added to your hostel",
        position: "bottom",
        visibilityTime: 3000,
      });
      dispatch(clearRoomSuccess());
      // Refresh rooms list
      if (hostelId && !isHostelRejected && !isHostelPending) {
        dispatch(getAllRooms(hostelId));
      }
    }

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error Saving Room",
        text2: error,
        position: "bottom",
        visibilityTime: 4000,
      });
      dispatch(clearRoomError());
    }

    if (allRoomsError) {
      Toast.show({
        type: "error",
        text1: "Error Fetching Rooms",
        text2: allRoomsError,
        position: "bottom",
        visibilityTime: 4000,
      });
      dispatch(clearRoomError());
    }

    if (deleteError) {
      Toast.show({
        type: "error",
        text1: "Error Deleting Room",
        text2: deleteError,
        position: "bottom",
        visibilityTime: 4000,
      });
      dispatch(clearRoomError());
    }
  }, [success, error, allRoomsError, deleteError, dispatch, hostelId, isHostelRejected, isHostelPending]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (hostelId && !isHostelRejected && !isHostelPending) {
      await dispatch(getAllRooms(hostelId));
    }
    setRefreshing(false);
  };

  const addNewRoom = () => {
    // Check if hostel is rejected or pending
    if (isHostelRejected) {
      Toast.show({
        type: "error",
        text1: "Cannot Add Room",
        text2: "This hostel has been rejected. Cannot add rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    if (isHostelPending) {
      Toast.show({
        type: "info",
        text1: "Cannot Add Room",
        text2: "Hostel is pending approval. Please wait for approval before adding rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    setRooms([
      ...rooms,
      {
        id: newId,
        floor: "",
        number: "",
        capacity: "",
        occupied: "0",
        sharing: ""
      },
    ]);
    setEditMode(false);
  };

  const updateRoom = (id: number, field: keyof Room, value: string) => {
    setRooms(prev =>
      prev.map(room => (room.id === id ? { ...room, [field]: value } : room))
    );
  };

  const saveRoom = async (id: number) => {
    // Check hostel status before saving
    if (isHostelRejected) {
      Toast.show({
        type: "error",
        text1: "Cannot Save Room",
        text2: "This hostel has been rejected. Cannot add rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    if (isHostelPending) {
      Toast.show({
        type: "info",
        text1: "Cannot Save Room",
        text2: "Hostel is pending approval. Please wait for approval before adding rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    const room = rooms.find(r => r.id === id);
    if (!room) return;

    // Validation
    if (!room.floor.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Floor is required",
        position: "bottom",
      });
      return;
    }

    if (!room.number.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Room number is required",
        position: "bottom",
      });
      return;
    }

    const capacityValue = parseInt(room.capacity);
    if (!room.capacity || isNaN(capacityValue) || capacityValue <= 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Valid capacity is required (minimum 1)",
        position: "bottom",
      });
      return;
    }

    if (!room.sharing) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Sharing option is required",
        position: "bottom",
      });
      return;
    }

    const occupiedValue = parseInt(room.occupied || "0");
    if (isNaN(occupiedValue) || occupiedValue < 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Occupied must be a valid number",
        position: "bottom",
      });
      return;
    }

    if (occupiedValue > capacityValue) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Occupied cannot exceed capacity",
        position: "bottom",
      });
      return;
    }

    // Check if room number already exists (excluding the room being edited)
    if (allRooms && allRooms.length > 0) {
      const existingRoom = allRooms.find(r =>
        r.roomNumber === room.number.trim() &&
        r._id !== room._id // Allow same room to update itself
      );
      if (existingRoom) {
        Toast.show({
          type: "error",
          text1: "Duplicate Room Number",
          text2: `Room number ${room.number} already exists in this hostel`,
          position: "bottom",
          visibilityTime: 4000,
        });
        return;
      }
    }

    // Prepare room data with hostelId
    const roomData = {
      hostelId: hostelId,
      floor: room.floor.trim(),
      roomNumber: room.number.trim(),
      sharingType: room.sharing,
      capacity: capacityValue,
      occupied: occupiedValue,
    };

    console.log("📤 Preparing to send room data:", roomData);

    if (!roomData.hostelId) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Hostel ID is required",
        position: "bottom",
      });
      return;
    }

    // Check if we have a valid token
    if (!token) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Please login again",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const result = await dispatch(addRoom(roomData)).unwrap();
      console.log("✅ Save room successful:", result);

      if (result.success) {
        const remaining = capacityValue - occupiedValue;
        Toast.show({
          type: "success",
          text1: `Room #${room.number} Saved ✅`,
          text2: `Remaining beds: ${remaining}`,
          position: "bottom",
          visibilityTime: 3000,
        });

        // Clear the saved room from form
        setRooms(prev => prev.filter(r => r.id !== id));

        // Add a new empty room if this was the last one
        if (rooms.length === 1) {
          const newId = Math.max(...rooms.map(r => r.id)) + 1;
          setRooms([{
            id: newId,
            floor: "",
            number: "",
            capacity: "",
            occupied: "0",
            sharing: ""
          }]);
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to save room:", error);
      const errorMessage = error?.message || "Failed to save room. Please try again.";
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: errorMessage,
        position: "bottom",
        visibilityTime: 4000,
      });
    }
  };

  const cancelRoom = (id: number) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter(r => r.id !== id));
      Toast.show({
        type: "info",
        text1: `Room #${id} Cancelled`,
        position: "bottom",
        visibilityTime: 1500,
      });
    } else {
      setRooms([{ id: 1, floor: "", number: "", capacity: "", occupied: "0", sharing: "" }]);
      Toast.show({
        type: "info",
        text1: "Form cleared",
        position: "bottom",
        visibilityTime: 1500,
      });
    }
  };

  const confirmDeleteRoom = (roomId: string, roomNumber: string) => {
    // Check if hostel is rejected before deleting
    if (isHostelRejected) {
      Toast.show({
        type: "error",
        text1: "Cannot Delete Room",
        text2: "This hostel has been rejected. Cannot modify rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    if (isHostelPending) {
      Toast.show({
        type: "info",
        text1: "Cannot Delete Room",
        text2: "Hostel is pending approval. Cannot modify rooms.",
        position: "bottom",
        visibilityTime: 4000,
      });
      return;
    }

    Alert.alert(
      "Delete Room",
      `Are you sure you want to delete room ${roomNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteRoom(roomId)
        }
      ]
    );
  };




  const handleDeleteRoom = async (roomId: string) => {
    try {
      const result = await dispatch(deleteRoom(roomId)).unwrap();
      console.log("✅ Delete room successful:", result);

      Toast.show({
        type: "success",
        text1: "Room Deleted",
        text2: "Room has been deleted successfully",
        position: "bottom",
        visibilityTime: 3000,
      });

      // Refresh rooms list
      if (hostelId && !isHostelRejected && !isHostelPending) {
        dispatch(getAllRooms(hostelId));
      }
    } catch (error: any) {
      console.error("❌ Failed to delete room:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/Facilities");
  };

  const getSelectedHostelName = () => {
    if (!hostelId) return "Select Hostel";
    const hostel = hostels.find(h => h.hostelId === hostelId);
    return hostel ? hostel.hostelName : "Unknown Hostel";
  };

  const getSelectedHostelStatus = () => {
    if (!hostelId) return "";
    const hostel = hostels.find(h => h.hostelId === hostelId);
    return hostel ? hostel.status : "";
  };

  const renderStatusBadge = () => {
    const status = getSelectedHostelStatus();
    if (!status) return null;

    let backgroundColor = "";
    let textColor = "";
    let statusText = "";

    switch (status.toLowerCase()) {
      case "approved":
        backgroundColor = LIGHT_GREEN;
        textColor = DARK_GREEN;
        statusText = "✓ Approved";
        break;
      case "rejected":
        backgroundColor = "#FFEBEE";
        textColor = RED;
        statusText = "✗ Rejected";
        break;
      case "pending":
        backgroundColor = "#FFF3E0";
        textColor = "#FF9800";
        statusText = "⏳ Pending";
        break;
      default:
        backgroundColor = "#F5F5F5";
        textColor = "#666";
        statusText = status;
    }

    return (
      <View style={[styles.statusBadgeContainer, { backgroundColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>
          {statusText}
        </Text>
      </View>
    );
  };

  const renderExistingRooms = () => {
    if (!hostelId) {
      return (
        <View style={styles.noHostelContainer}>
          <Icon name="home-off" size={50} color="#ccc" />
          <Text style={styles.noHostelText}>Please select a hostel first</Text>
          <Text style={styles.noHostelSubText}>Go to home screen and select a hostel</Text>
        </View>
      );
    }

    if (isHostelRejected) {
      return (
        <View style={styles.rejectedContainer}>
          <Icon name="close-circle" size={60} color={RED} />
          <Text style={styles.rejectedTitle}>Hostel Rejected</Text>
          <Text style={styles.rejectedText}>
            This hostel has been rejected. You cannot add, edit, or delete rooms for a rejected hostel.
          </Text>
          <Text style={styles.rejectedSubText}>
            Please contact support if you believe this is an error.
          </Text>
        </View>
      );
    }

    if (isHostelPending) {
      return (
        <View style={styles.pendingContainer}>
          <Icon name="clock-outline" size={60} color="#FF9800" />
          <Text style={styles.pendingTitle}>Pending Approval</Text>
          <Text style={styles.pendingText}>
            This hostel is waiting for admin approval. You cannot add, edit, or delete rooms until it's approved.
          </Text>
          <Text style={styles.pendingSubText}>
            You can view existing rooms but cannot make changes.
          </Text>
        </View>
      );
    }

    if (allRoomsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KELLY_GREEN} />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      );
    }

    if (allRooms.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="home-off" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No rooms found for this hostel</Text>
          <Text style={styles.emptySubText}>Add your first room below</Text>
        </View>
      );
    }

    return (
      <View style={styles.existingRoomsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Existing Rooms</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryText}>
              {summary?.totalRooms || 0} Rooms • {summary?.vacantBeds || 0} Vacant Beds
            </Text>
          </View>
        </View>

        <FlatList
          data={allRooms}
          keyExtractor={(item, index) => item._id ?? index.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.existingRoomCard}>
              <View style={styles.roomHeaderRow}>
                <View style={styles.roomBasicInfo}>
                  <Icon name="door" size={20} color={KELLY_GREEN} />
                  <Text style={styles.roomNumberText}>{item.roomNumber}</Text>
                  <View style={[
                    styles.roomStatusBadge,
                    { backgroundColor: item.remaining > 0 ? LIGHT_GREEN : '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.roomStatusText,
                      { color: item.remaining > 0 ? DARK_GREEN : RED }
                    ]}>
                      {item.occupied}/{item.capacity}
                    </Text>
                  </View>
                </View>
                {!isHostelRejected && !isHostelPending && (
                  <TouchableOpacity
                    onPress={() => confirmDeleteRoom(item._id, item.roomNumber)}
                    disabled={deleteLoading}
                  >
                    <Icon name="delete" size={22} color={RED} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.roomDetailsRow}>
                <View style={styles.detailItem}>
                  <Icon name="floor-plan" size={16} color="#666" />
                  <Text style={styles.detailText}>Floor: {item.floor}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="account-multiple" size={16} color="#666" />
                  <Text style={styles.detailText}>{item.sharingType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="bed-empty" size={16} color="#666" />
                  <Text style={styles.detailText}>{item.remaining} available</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  const renderAddRoomSection = () => {
    if (!hostelId) {
      return null;
    }

    if (isHostelRejected || isHostelPending) {
      return null;
    }

    return (
      <>
        <Text style={styles.addRoomTitle}>Add New Room</Text>

        {rooms.map((room, index) => {
          const capacityValue = parseInt(room.capacity || "0");
          const occupiedValue = parseInt(room.occupied || "0");
          const remaining = Math.max(capacityValue - occupiedValue, 0);

          return (
            <View key={room.id} style={styles.card}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>New Room #{index + 1}</Text>
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      capacityValue > 0 && occupiedValue >= capacityValue ? RED :
                        capacityValue > 0 && occupiedValue > 0 ? '#FFA726' :
                          KELLY_GREEN
                  }
                ]}>
                  <Text style={styles.statusText}>
                    {capacityValue > 0 && occupiedValue >= capacityValue ? 'Full' :
                      capacityValue > 0 && occupiedValue > 0 ? 'Partial' :
                        'Empty'}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Floor *</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="floor-plan"
                  size={20}
                  color={KELLY_GREEN}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: KELLY_GREEN, color: DARK_GREEN }]}
                  placeholder="Enter floor number"
                  placeholderTextColor="#999"
                  value={room.floor}
                  onChangeText={text => updateRoom(room.id, "floor", text)}
                  editable={!isHostelRejected && !isHostelPending}
                />
              </View>

              <Text style={styles.label}>Room Number *</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="door"
                  size={20}
                  color={KELLY_GREEN}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: KELLY_GREEN, color: DARK_GREEN }]}
                  placeholder="Room No. e.g., 101"
                  placeholderTextColor="#999"
                  value={room.number}
                  onChangeText={text => updateRoom(room.id, "number", text)}
                  editable={!isHostelRejected && !isHostelPending}
                />
              </View>

              <Text style={styles.label}>Capacity *</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="account-group"
                  size={20}
                  color={KELLY_GREEN}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: KELLY_GREEN, color: DARK_GREEN }]}
                  placeholder="Capacity e.g., 4"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={room.capacity}
                  onChangeText={text => updateRoom(room.id, "capacity", text)}
                  editable={!isHostelRejected && !isHostelPending}
                />
              </View>

              <Text style={styles.label}>Currently Occupied</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="account-check"
                  size={20}
                  color={GOLDEN_YELLOW}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { borderColor: GOLDEN_YELLOW, color: '#B8860B' }]}
                  placeholder="Occupied e.g., 2"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={room.occupied}
                  onChangeText={text => updateRoom(room.id, "occupied", text)}
                  editable={!isHostelRejected && !isHostelPending}
                />
              </View>

              <Text style={styles.label}>Sharing Option *</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="account-multiple"
                  size={20}
                  color={KELLY_GREEN}
                  style={styles.inputIcon}
                />
                <View style={styles.inputWrapper}>
                  <RNPickerSelect
                    placeholder={{ label: "Select Sharing Type", value: "" }}
                    items={sharingOptions}
                    value={room.sharing}
                    onValueChange={value => updateRoom(room.id, "sharing", value)}
                    style={{
                      inputIOS: {
                        fontSize: width * 0.037,
                        fontWeight: "500",
                        borderWidth: 1.5,
                        borderColor: KELLY_GREEN,
                        borderRadius: 12,
                        padding: Platform.OS === "ios" ? height * 0.018 : height * 0.014,
                        paddingLeft: 45,
                        backgroundColor: "#fff",
                        color: DARK_GREEN,
                        paddingHorizontal: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                      },
                      inputAndroid: {
                        fontSize: width * 0.037,
                        fontWeight: "500",
                        borderWidth: 1.5,
                        borderColor: KELLY_GREEN,
                        borderRadius: 12,
                        paddingVertical: height * 0.014,
                        paddingLeft: 45,
                        backgroundColor: "#fff",
                        color: DARK_GREEN,
                        paddingHorizontal: 10,
                      },
                      placeholder: {
                        color: "#999",
                        fontWeight: "400",
                        fontSize: width * 0.035,
                      },
                      iconContainer: {
                        top: Platform.OS === 'ios' ? height * 0.018 : height * 0.018,
                        right: 10,
                      }
                    }}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => (
                      <Icon
                        name="chevron-down"
                        size={24}
                        color={KELLY_GREEN}
                      />
                    )}
                    disabled={isHostelRejected || isHostelPending}
                  />
                </View>
              </View>

              <View style={styles.remainingContainer}>
                <Text style={styles.label}>Remaining Beds</Text>
                <View style={[
                  styles.remainingPill,
                  { backgroundColor: remaining > 0 ? LIGHT_GREEN : '#FFEBEE' }
                ]}>
                  <Icon
                    name={remaining > 0 ? "bed-empty" : "bed"}
                    size={20}
                    color={remaining > 0 ? DARK_GREEN : RED}
                  />
                  <Text style={[
                    styles.remainingValue,
                    { color: remaining > 0 ? DARK_GREEN : RED }
                  ]}>
                    {remaining} {remaining === 1 ? 'bed' : 'beds'} available
                  </Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => cancelRoom(room.id)}
                  disabled={loading || isHostelRejected || isHostelPending}
                >
                  <Icon name="close-circle" size={20} color="#666" />
                  <Text style={[styles.cancelText, (loading || isHostelRejected || isHostelPending) && { opacity: 0.5 }]}>
                    {rooms.length > 1 ? "Remove" : "Clear"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: KELLY_GREEN },
                    (loading || isHostelRejected || isHostelPending) && { opacity: 0.6 }
                  ]}
                  onPress={() => saveRoom(room.id)}
                  disabled={loading || isHostelRejected || isHostelPending}
                >
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.saveText}>
                    {loading ? "Saving..." : "Save Room"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Room Details</Text>
          <View style={styles.hostelInfoContainer}>
            <Text style={styles.hostelNameText} numberOfLines={1}>
              {getSelectedHostelName()}
            </Text>
            {renderStatusBadge()}
          </View>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[KELLY_GREEN]}
            tintColor={KELLY_GREEN}
          />
        }
      >
        {/* Existing Rooms Section */}
        {renderExistingRooms()}

        {/* Add New Room Section */}
        {renderAddRoomSection()}

        {/* Bottom Buttons */}
        {hostelId && !isHostelRejected && !isHostelPending && (
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={[styles.addButton, (loading || isHostelRejected || isHostelPending) && { opacity: 0.5 }]}
              onPress={addNewRoom}
              disabled={loading || isHostelRejected || isHostelPending}
            >
              <Icon name="plus-circle" size={16} color={KELLY_GREEN} />
              <Text style={[styles.addButtonText, { color: KELLY_GREEN }]}>
                Add Another Room
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, (loading || isHostelRejected || isHostelPending) && { opacity: 0.5 }]}
              onPress={handleNext}
              disabled={loading || isHostelRejected || isHostelPending}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Icon name="information-outline" size={20} color={KELLY_GREEN} />
          <Text style={styles.instructionsText}>
            • Rooms can only be added to approved hostels
            {"\n"}• Rejected or pending hostels cannot have rooms added/modified
            {"\n"}• Room number must be unique for the selected hostel
            {"\n"}• Occupied beds cannot exceed total capacity
          </Text>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}

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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  hostelInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  hostelNameText: {
    fontSize: width * 0.035,
    color: '#666',
    textAlign: 'center',
    marginRight: 8,
    maxWidth: '60%',
  },
  statusBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: 28,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  noHostelContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  noHostelText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  noHostelSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  rejectedContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: RED,
  },
  rejectedTitle: {
    marginTop: 15,
    fontSize: 18,
    color: RED,
    fontWeight: '700',
    textAlign: 'center',
  },
  rejectedText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  rejectedSubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pendingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  pendingTitle: {
    marginTop: 15,
    fontSize: 18,
    color: '#FF9800',
    fontWeight: '700',
    textAlign: 'center',
  },
  pendingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  pendingSubText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: DARK_GREEN,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  existingRoomsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GREEN,
  },
  summaryBadge: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  existingRoomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_GREEN,
  },
  roomStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roomDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 15,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  addRoomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 15,
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
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: width * 0.05,
    fontWeight: "800",
    color: DARK_GREEN,
    paddingLeft: 12,
    backgroundColor: LIGHT_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: width * 0.03,
  },
  label: {
    fontSize: width * 0.037,
    fontWeight: "600",
    marginBottom: 8,
    color: DARK_GREEN,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === "ios" ? height * 0.02 : height * 0.018,
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: Platform.OS === "ios" ? height * 0.017 : height * 0.014,
    paddingLeft: 45,
    fontSize: width * 0.037,
    backgroundColor: "#fff",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: KELLY_GREEN,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  remainingContainer: {
    marginBottom: 20,
  },
  remainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  remainingValue: {
    fontSize: width * 0.037,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    padding: height * 0.017,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: "#fff",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cancelText: {
    fontSize: width * 0.037,
    fontWeight: "600",
    color: "#666"
  },
  saveBtn: {
    flex: 1,
    padding: height * 0.017,
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
  saveText: {
    fontSize: width * 0.037,
    fontWeight: "700",
    color: "#fff"
  },
  bottomButtonsRow: {
    flexDirection: "row",
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: KELLY_GREEN,
    borderStyle: 'dashed',
    backgroundColor: LIGHT_GREEN,
  },
  addButtonText: {
    fontSize: width * 0.037,
    fontWeight: "600",
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    elevation: 3,
    shadowColor: DARK_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: width * 0.037,
    fontWeight: "700",
    color: "#fff",
    marginRight: 6,
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
  },
  instructionsText: {
    flex: 1,
    fontSize: width * 0.033,
    color: DARK_GREEN,
    lineHeight: 20,
    fontWeight: '400',
  },
});