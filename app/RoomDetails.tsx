import TokenDebug from "../components/TokenDebug";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { addRoom, clearRoomError, clearRoomSuccess } from "../app/reduxStore/reduxSlices/roomSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
const KELLY_GREEN = "#4CBB17";
const GOLDEN_YELLOW = "#FFDF00";
const LIGHT_GREEN = "#E8F5E9";
const DARK_GREEN = "#2E7D32";

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
  floor: string;
  number: string;
  capacity: string;
  occupied: string;
  sharing: string;
}

export default function RoomDetails() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, success } = useAppSelector((state) => state.rooms);

  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, floor: "", number: "", capacity: "", occupied: "0", sharing: "" },
  ]);

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
  }, [success, error, dispatch]);

  const addNewRoom = () => {
    setRooms([
      ...rooms,
      {
        id: rooms.length + 1,
        floor: "",
        number: "",
        capacity: "",
        occupied: "0",
        sharing: ""
      },
    ]);
  };

  const updateRoom = (id: number, field: keyof Room, value: string) => {
    setRooms(prev =>
      prev.map(room => (room.id === id ? { ...room, [field]: value } : room))
    );
  };

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Current token in RoomDetails:", token);
      return token;
    } catch (error) {
      console.error("Error checking token:", error);
      return null;
    }
  };

  const saveRoom = async (id: number) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

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

    const roomData = {
      floor: room.floor.trim(),
      roomNumber: room.number.trim(),
      sharingType: room.sharing,
      capacity: capacityValue,
      occupied: occupiedValue,
    };

    console.log("📤 Preparing to send room data:", roomData);

    try {
      const result = await dispatch(addRoom(roomData)).unwrap();

      console.log("✅ Save room successful:", result);

      if (result.success) {
        const remaining = capacityValue - occupiedValue;
        Toast.show({
          type: "success",
          text1: `Room #${id} Saved ✅`,
          text2: `Remaining beds: ${remaining}`,
          position: "bottom",
          visibilityTime: 3000,
        });
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

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/Facilities"); // Adjust path as needed
  };

  return (
    <View style={styles.container}>
      <TokenDebug />
      
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Icon name="arrow-left" size={28} color={KELLY_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Details</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {rooms.map((room, index) => {
          const capacityValue = parseInt(room.capacity || "0");
          const occupiedValue = parseInt(room.occupied || "0");
          const remaining = Math.max(capacityValue - occupiedValue, 0);

          return (
            <View key={room.id} style={styles.card}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>Room #{index + 1}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: 
                    capacityValue > 0 && occupiedValue >= capacityValue ? '#FF6B6B' :
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
                  keyboardType="number-pad"
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
                    color={remaining > 0 ? DARK_GREEN : '#D32F2F'} 
                  />
                  <Text style={[
                    styles.remainingValue,
                    { color: remaining > 0 ? DARK_GREEN : '#D32F2F' }
                  ]}>
                    {remaining} {remaining === 1 ? 'bed' : 'beds'} available
                  </Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => cancelRoom(room.id)}
                  disabled={loading}
                >
                  <Icon name="close-circle" size={20} color="#666" />
                  <Text style={[styles.cancelText, loading && { opacity: 0.5 }]}>
                    {rooms.length > 1 ? "Remove" : "Clear"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: KELLY_GREEN },
                    loading && { opacity: 0.6 }
                  ]}
                  onPress={() => saveRoom(room.id)}
                  disabled={loading}
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

        {/* Row: Add Another Room (left) + Next (right) */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.addButton, loading && { opacity: 0.5 }]}
            onPress={addNewRoom}
            disabled={loading}
          >
            <Icon name="plus-circle" size={16} color={KELLY_GREEN} />
            <Text style={[styles.addButtonText, { color: KELLY_GREEN }]}>
              Add Another Room
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, loading && { opacity: 0.5 }]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Icon name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Icon name="information-outline" size={20} color={KELLY_GREEN} />
          <Text style={styles.instructionsText}>
            Fill in all required fields (*) and click "Save Room" to add to your hostel.
            Occupied beds cannot exceed total capacity.
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
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: DARK_GREEN,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 28,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
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