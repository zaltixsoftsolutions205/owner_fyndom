// app/tabs/allrooms.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { getAllRooms, deleteRoom, clearRoomError } from "../../app/reduxStore/reduxSlices/roomSlice";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#00C72F",
  accent: "#FFD700",
  background: "#FFFFFF",
  text: "#222",
  subtitle: "#666",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  info: "#5AC8FA",
};

// Room Status Colors
const ROOM_STATUS_COLORS = {
  available: "#34C759",
  partiallyFilled: "#FF9500",
  full: "#FF3B30",
  maintenance: "#8E8E93",
};

interface Room {
  _id: string;
  floor: string;
  roomNumber: string;
  sharingType: string;
  capacity: number;
  occupied: number;
  remaining: number;
  isAvailable: boolean;
  status: string;
  hostelId?: string;
}

interface RoomSummary {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
}

interface SharingTypeAvailability {
  available: boolean;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  availableBeds: number;
}

export default function AllRoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, available, occupied
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [hostelId, setHostelId] = useState<string>("");
  const [hostelName, setHostelName] = useState<string>("");
  
  const {
    allRooms,
    allRoomsLoading,
    allRoomsError,
    summary,
    sharingTypeAvailability,
    deleteLoading,
    deleteError,
  } = useAppSelector((state) => state.rooms);
  
  const { selectedHostelId, hostels } = useAppSelector((state) => state.auth);

  // Get params and initialize
  useEffect(() => {
    const hostelIdFromParams = params.hostelId as string;
    const hostelNameFromParams = params.hostelName as string;
    
    // Use hostelId from params first, then from selectedHostelId
    const effectiveHostelId = hostelIdFromParams || selectedHostelId;
    
    if (effectiveHostelId) {
      setHostelId(effectiveHostelId);
      
      // Find hostel name
      const hostel = hostels.find(h => h.hostelId === effectiveHostelId);
      if (hostel) {
        setHostelName(hostel.hostelName);
      } else if (hostelNameFromParams) {
        setHostelName(hostelNameFromParams);
      }
      
      console.log(`🚀 Initializing AllRoomsScreen for hostel: ${effectiveHostelId}`);
    }
  }, [params, selectedHostelId, hostels]);

  // Fetch rooms when hostelId is set
  useEffect(() => {
    if (hostelId) {
      console.log(`📋 Fetching rooms for hostel: ${hostelId}`);
      dispatch(getAllRooms(hostelId));
    }
  }, [hostelId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (allRoomsError) {
      Toast.show({
        type: "error",
        text1: "Failed to Load Rooms",
        text2: allRoomsError,
        position: "bottom",
        visibilityTime: 4000,
      });
      dispatch(clearRoomError());
    }
    
    if (deleteError) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: deleteError,
        position: "bottom",
        visibilityTime: 4000,
      });
      dispatch(clearRoomError());
    }
  }, [allRoomsError, deleteError, dispatch]);

  const onRefresh = useCallback(async () => {
    if (!hostelId) {
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    try {
      await dispatch(getAllRooms(hostelId)).unwrap();
      Toast.show({
        type: "success",
        text1: "Refreshed",
        text2: "Room list updated",
        position: "bottom",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, hostelId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddRoom = () => {
    if (!hostelId) {
      Alert.alert("Error", "Please select a hostel first");
      return;
    }
    router.push({
      pathname: "/RoomDetails",
      params: {
        hostelId: hostelId,
        hostelName: hostelName,
      },
    });
  };

  const handleRoomPress = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleEditRoom = (room: Room) => {
    if (!hostelId) return;
    
    router.push({
      pathname: "/RoomDetails",
      params: {
        hostelId: hostelId,
        hostelName: hostelName,
        editRoom: JSON.stringify(room),
      },
    });
  };

  const confirmDeleteRoom = (roomId: string, roomNumber: string) => {
    setRoomToDelete(roomId);
    Alert.alert(
      "Delete Room",
      `Are you sure you want to delete Room ${roomNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteRoom(roomId),
        },
      ]
    );
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      Toast.show({
        type: "success",
        text1: "Room Deleted",
        text2: "Room has been deleted successfully",
        position: "bottom",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setRoomToDelete(null);
    }
  };

  const getRoomStatusColor = (room: Room) => {
    if (!room.isAvailable) return ROOM_STATUS_COLORS.maintenance;
    if (room.remaining === 0) return ROOM_STATUS_COLORS.full;
    if (room.occupied > 0) return ROOM_STATUS_COLORS.partiallyFilled;
    return ROOM_STATUS_COLORS.available;
  };

  const getRoomStatusText = (room: Room) => {
    if (!room.isAvailable) return "Maintenance";
    if (room.remaining === 0) return "Full";
    if (room.occupied > 0) return "Partially Filled";
    return "Available";
  };

  const getSharingTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      single: "#FF6B6B",
      double: "#4ECDC4",
      triple: "#45B7D1",
      four: "#96CEB4",
      five: "#FFEAA7",
      six: "#DDA0DD",
      seven: "#98D8C8",
      eight: "#F7DC6F",
      nine: "#BB8FCE",
      ten: "#85C1E9",
    };
    return colors[type] || COLORS.primary;
  };

  const getSharingTypeDisplayName = (type: string) => {
    const names: { [key: string]: string } = {
      single: "Single",
      double: "Double",
      triple: "Triple",
      four: "4-Sharing",
      five: "5-Sharing",
      six: "6-Sharing",
      seven: "7-Sharing",
      eight: "8-Sharing",
      nine: "9-Sharing",
      ten: "10-Sharing",
    };
    return names[type] || type;
  };

  // Filter rooms based on selected filter and search
  const filteredRooms = allRooms.filter((room) => {
    // Apply status filter
    if (filter === "available" && (!room.isAvailable || room.remaining === 0)) return false;
    if (filter === "occupied" && room.occupied === 0) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        room.roomNumber.toLowerCase().includes(query) ||
        room.floor.toLowerCase().includes(query) ||
        room.sharingType.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Group rooms by floor
  const roomsByFloor: { [key: string]: Room[] } = {};
  filteredRooms.forEach((room) => {
    if (!roomsByFloor[room.floor]) {
      roomsByFloor[room.floor] = [];
    }
    roomsByFloor[room.floor].push(room);
  });

  const floorKeys = Object.keys(roomsByFloor).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const renderRoomCard = (room: Room) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleRoomPress(room)}
      activeOpacity={0.9}
    >
      <View style={styles.roomCardHeader}>
        <View style={styles.roomNumberContainer}>
          <Icon name="door" size={20} color={COLORS.primary} />
          <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getRoomStatusColor(room) + "20" },
          ]}
        >
          <Icon
            name={
              !room.isAvailable
                ? "wrench"
                : room.remaining === 0
                ? "close-circle"
                : room.occupied > 0
                ? "alert-circle"
                : "check-circle"
            }
            size={12}
            color={getRoomStatusColor(room)}
          />
          <Text
            style={[styles.statusText, { color: getRoomStatusColor(room) }]}
          >
            {getRoomStatusText(room)}
          </Text>
        </View>
      </View>

      <View style={styles.roomDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="floor-plan" size={16} color="#666" />
            <Text style={styles.detailText}>Floor {room.floor}</Text>
          </View>
          <View
            style={[
              styles.sharingTypeBadge,
              { backgroundColor: getSharingTypeColor(room.sharingType) + "20" },
            ]}
          >
            <Icon
              name="account-multiple"
              size={14}
              color={getSharingTypeColor(room.sharingType)}
            />
            <Text
              style={[
                styles.sharingTypeText,
                { color: getSharingTypeColor(room.sharingType) },
              ]}
            >
              {getSharingTypeDisplayName(room.sharingType)}
            </Text>
          </View>
        </View>

        <View style={styles.capacityRow}>
          <View style={styles.capacityItem}>
            <Icon name="bed" size={18} color={COLORS.primary} />
            <Text style={styles.capacityText}>
              {room.occupied}/{room.capacity} beds
            </Text>
          </View>
          <View style={styles.capacityItem}>
            <Icon
              name={room.remaining > 0 ? "bed-empty" : "bed"}
              size={18}
              color={room.remaining > 0 ? COLORS.success : COLORS.error}
            />
            <Text
              style={[
                styles.capacityText,
                { color: room.remaining > 0 ? COLORS.success : COLORS.error },
              ]}
            >
              {room.remaining} vacant
            </Text>
          </View>
        </View>

        <View style={styles.occupancyBar}>
          <View
            style={[
              styles.occupancyFill,
              {
                width: `${(room.occupied / room.capacity) * 100}%`,
                backgroundColor:
                  room.occupied === room.capacity
                    ? COLORS.error
                    : room.occupied > 0
                    ? COLORS.warning
                    : COLORS.success,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.roomActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditRoom(room)}
        >
          <Icon name="pencil" size={18} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteRoom(room._id, room.roomNumber)}
          disabled={deleteLoading && roomToDelete === room._id}
        >
          {deleteLoading && roomToDelete === room._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="delete" size={18} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSharingTypeSummary = () => {
    if (!sharingTypeAvailability) return null;

    const types = Object.entries(sharingTypeAvailability)
      .filter(([_, data]) => data.totalRooms > 0)
      .slice(0, 4);

    if (types.length === 0) return null;

    return (
      <View style={styles.sharingSummarySection}>
        <Text style={styles.sectionSubtitle}>Sharing Type Summary</Text>
        <View style={styles.sharingTypeGrid}>
          {types.map(([type, data]: [string, SharingTypeAvailability]) => (
            <View key={type} style={styles.sharingTypeCard}>
              <Text style={styles.sharingTypeName}>
                {getSharingTypeDisplayName(type)}
              </Text>
              <View style={styles.sharingTypeStats}>
                <View style={styles.statItem}>
                  <Icon name="door" size={12} color="#666" />
                  <Text style={styles.statValue}>{data.totalRooms}</Text>
                  <Text style={styles.statLabel}>Rooms</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="bed" size={12} color="#666" />
                  <Text style={styles.statValue}>{data.availableBeds}</Text>
                  <Text style={styles.statLabel}>Vacant</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="bed-empty" size={80} color="#E0E0E0" />
      <Text style={styles.emptyStateTitle}>No Rooms Found</Text>
      <Text style={styles.emptyStateText}>
        {hostelId
          ? "This hostel doesn't have any rooms yet."
          : "Please select a hostel to view rooms."}
      </Text>
      {hostelId && (
        <TouchableOpacity style={styles.addFirstRoomButton} onPress={handleAddRoom}>
          <Text style={styles.addFirstRoomText}>Add Your First Room</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading rooms...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="alert-circle-outline" size={60} color={COLORS.error} />
      <Text style={styles.errorTitle}>Failed to Load Rooms</Text>
      <Text style={styles.errorText}>{allRoomsError}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => hostelId && dispatch(getAllRooms(hostelId))}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoomDetailsModal = () => (
    <Modal
      visible={showRoomDetails}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRoomDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedRoom && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Room {selectedRoom.roomNumber} Details
                </Text>
                <TouchableOpacity onPress={() => setShowRoomDetails(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Basic Information</Text>
                  <View style={styles.modalRow}>
                    <View style={styles.modalInfoItem}>
                      <Icon name="floor-plan" size={20} color={COLORS.primary} />
                      <Text style={styles.modalInfoLabel}>Floor</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedRoom.floor}
                      </Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Icon
                        name="account-multiple"
                        size={20}
                        color={getSharingTypeColor(selectedRoom.sharingType)}
                      />
                      <Text style={styles.modalInfoLabel}>Sharing Type</Text>
                      <Text style={styles.modalInfoValue}>
                        {getSharingTypeDisplayName(selectedRoom.sharingType)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Capacity Details</Text>
                  <View style={styles.modalRow}>
                    <View style={styles.modalInfoItem}>
                      <Icon name="bed" size={20} color={COLORS.primary} />
                      <Text style={styles.modalInfoLabel}>Total Capacity</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedRoom.capacity} beds
                      </Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Icon name="account-check" size={20} color={COLORS.warning} />
                      <Text style={styles.modalInfoLabel}>Occupied</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedRoom.occupied} beds
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <View style={styles.modalInfoItem}>
                      <Icon
                        name="bed-empty"
                        size={20}
                        color={COLORS.success}
                      />
                      <Text style={styles.modalInfoLabel}>Available</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedRoom.remaining} beds
                      </Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Icon
                        name={
                          selectedRoom.isAvailable
                            ? "check-circle"
                            : "close-circle"
                        }
                        size={20}
                        color={
                          selectedRoom.isAvailable
                            ? COLORS.success
                            : COLORS.error
                        }
                      />
                      <Text style={styles.modalInfoLabel}>Status</Text>
                      <Text style={styles.modalInfoValue}>
                        {getRoomStatusText(selectedRoom)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Occupancy Rate</Text>
                  <View style={styles.occupancyRateContainer}>
                    <Text style={styles.occupancyRateText}>
                      {((selectedRoom.occupied / selectedRoom.capacity) * 100).toFixed(1)}%
                    </Text>
                    <View style={styles.occupancyRateBar}>
                      <View
                        style={[
                          styles.occupancyRateFill,
                          {
                            width: `${(selectedRoom.occupied / selectedRoom.capacity) * 100}%`,
                            backgroundColor:
                              selectedRoom.occupied === selectedRoom.capacity
                                ? COLORS.error
                                : selectedRoom.occupied > 0
                                ? COLORS.warning
                                : COLORS.success,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalEditButton}
                  onPress={() => {
                    setShowRoomDetails(false);
                    handleEditRoom(selectedRoom);
                  }}
                >
                  <Icon name="pencil" size={20} color="#fff" />
                  <Text style={styles.modalEditButtonText}>Edit Room</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowRoomDetails(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, "#02b828"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Rooms</Text>
            {hostelName ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {hostelName}
              </Text>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Icon name="magnify" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
              <Icon name="plus" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms by number, floor, or type..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Summary Stats */}
        {summary && !allRoomsLoading && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.totalRooms}</Text>
              <Text style={styles.summaryLabel}>Total Rooms</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.totalBeds}</Text>
              <Text style={styles.summaryLabel}>Total Beds</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                {summary.occupiedBeds}
              </Text>
              <Text style={styles.summaryLabel}>Occupied</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {summary.vacantBeds}
              </Text>
              <Text style={styles.summaryLabel}>Vacant</Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              All ({allRooms.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "available" && styles.filterButtonActive]}
            onPress={() => setFilter("available")}
          >
            <Text style={[styles.filterText, filter === "available" && styles.filterTextActive]}>
              Available ({allRooms.filter(r => r.isAvailable && r.remaining > 0).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "occupied" && styles.filterButtonActive]}
            onPress={() => setFilter("occupied")}
          >
            <Text style={[styles.filterText, filter === "occupied" && styles.filterTextActive]}>
              Occupied ({allRooms.filter(r => r.occupied > 0).length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {allRoomsLoading && !refreshing ? (
          renderLoadingState()
        ) : allRoomsError ? (
          renderErrorState()
        ) : filteredRooms.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Sharing Type Summary */}
            {renderSharingTypeSummary()}

            {/* Rooms by Floor */}
            <View style={styles.content}>
              {floorKeys.map((floor) => (
                <View key={floor} style={styles.floorSection}>
                  <View style={styles.floorHeader}>
                    <Icon name="stairs" size={20} color={COLORS.primary} />
                    <Text style={styles.floorTitle}>Floor {floor}</Text>
                    <Text style={styles.floorCount}>
                      ({roomsByFloor[floor].length} rooms)
                    </Text>
                  </View>
                  <View style={styles.roomsGrid}>
                    {roomsByFloor[floor].map((room) => (
                      <View key={room._id} style={styles.roomCardWrapper}>
                        {renderRoomCard(room)}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Total Count */}
            <View style={styles.totalCountContainer}>
              <Text style={styles.totalCountText}>
                Showing {filteredRooms.length} of {allRooms.length} rooms
              </Text>
            </View>
          </>
        )}

        {/* Spacing for bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Room Floating Button */}
      {!allRoomsLoading && hostelId && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleAddRoom}>
          <LinearGradient
            colors={[COLORS.primary, "#02b828"]}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="plus" size={24} color="#fff" />
            <Text style={styles.floatingButtonText}>Add Room</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Room Details Modal */}
      {renderRoomDetailsModal()}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 4,
  },
  // Summary Stats
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: "#fff",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  // Content Area
  content: {
    padding: 16,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstRoomButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstRoomText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Loading State
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.subtitle,
  },
  // Error State
  errorState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Sharing Type Summary
  sharingSummarySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  sharingTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sharingTypeCard: {
    flex: 1,
    minWidth: width / 2 - 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sharingTypeName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  sharingTypeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  // Floor Section
  floorSection: {
    marginBottom: 24,
  },
  floorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  floorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 8,
  },
  floorCount: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginLeft: 8,
    fontWeight: "500",
  },
  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  roomCardWrapper: {
    width: width / 2 - 22,
  },
  // Room Card
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  roomNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  roomDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
  },
  sharingTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  sharingTypeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  capacityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  occupancyBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  occupancyFill: {
    height: "100%",
    borderRadius: 3,
  },
  roomActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  // Total Count
  totalCountContainer: {
    alignItems: "center",
    padding: 16,
    marginTop: 8,
  },
  totalCountText: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontStyle: "italic",
  },
  // Floating Button
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  modalInfoLabel: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  occupancyRateContainer: {
    alignItems: "center",
  },
  occupancyRateText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  occupancyRateBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  occupancyRateFill: {
    height: "100%",
    borderRadius: 5,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    gap: 12,
  },
  modalEditButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modalEditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCloseButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});