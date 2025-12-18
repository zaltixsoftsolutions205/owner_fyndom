import React, { useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { goBack } from "../../utils/navigationHistory";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { getAllRooms } from "../reduxStore/reduxSlices/roomSlice";

const COLORS = {
  primary: "#00C72F",
  background: "#FFFFFF",
  text: "#222",
  subtitle: "#555",
  error: "#FF3B30",
  success: "#34C759",
};

export default function AllRoomsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { 
    allRooms, 
    allRoomsLoading, 
    allRoomsError, 
    summary,
    sharingTypeAvailability 
  } = useAppSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(getAllRooms());
  }, [dispatch]);

  const getSharingTypeColor = (sharingType: string) => {
    const colors = {
      single: "#FF6B6B",
      double: "#4ECDC4",
      triple: "#45B7D1",
      four: "#96CEB4",
      five: "#FFEAA7",
    };
    return colors[sharingType as keyof typeof colors] || COLORS.primary;
  };

  const getStatusColor = (isAvailable: boolean, remaining: number) => {
    if (!isAvailable) return COLORS.error;
    if (remaining === 0) return COLORS.error;
    if (remaining < 3) return "#FF9500";
    return COLORS.success;
  };

  const renderRoomItem = ({ item }: { item: any }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
          <Text style={styles.floorText}>Floor {item.floor}</Text>
        </View>
        <View 
          style={[
            styles.typeBadge,
            { backgroundColor: getSharingTypeColor(item.sharingType) }
          ]}
        >
          <Text style={styles.typeText}>
            {item.sharingType.charAt(0).toUpperCase() + item.sharingType.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.capacitySection}>
        <Text style={styles.capacityText}>
          Capacity: {item.capacity} beds
        </Text>
        <Text style={styles.occupancyText}>
          Occupied: {item.occupied} | Remaining: {item.remaining}
        </Text>
      </View>
      
      <View style={styles.statusSection}>
        <View 
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.isAvailable, item.remaining) }
          ]}
        >
          <Text style={styles.statusText}>
            {item.isAvailable ? 'Available' : 'Full'}
          </Text>
        </View>
        <Text style={styles.statusDetail}>{item.status}</Text>
      </View>
    </View>
  );

  const renderSharingTypeSummary = () => {
    if (!sharingTypeAvailability) return null;

    return Object.entries(sharingTypeAvailability).map(([type, data]: [string, any]) => (
      <View key={type} style={styles.typeSummaryCard}>
        <Text style={styles.typeTitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Sharing
        </Text>
        <View style={styles.typeStats}>
          <Text style={styles.typeStat}>
            Rooms: {data.availableRooms}/{data.totalRooms}
          </Text>
          <Text style={styles.typeStat}>
            Beds: {data.availableBeds}/{data.totalBeds}
          </Text>
        </View>
        <View 
          style={[
            styles.availabilityIndicator,
            { backgroundColor: data.available ? COLORS.success : COLORS.error }
          ]}
        />
      </View>
    ));
  };

  if (allRoomsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (allRoomsError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load rooms</Text>
          <Text style={styles.errorSubtext}>{allRoomsError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(getAllRooms())}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack(router)} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Rooms</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        {summary && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Hostel Overview</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summary.totalRooms}</Text>
                <Text style={styles.summaryLabel}>Total Rooms</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summary.totalBeds}</Text>
                <Text style={styles.summaryLabel}>Total Beds</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summary.occupiedBeds}</Text>
                <Text style={styles.summaryLabel}>Occupied</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summary.vacantBeds}</Text>
                <Text style={styles.summaryLabel}>Vacant</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sharing Type Summary */}
        {sharingTypeAvailability && (
          <View style={styles.sharingTypeSection}>
            <Text style={styles.sectionTitle}>Room Type Summary</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeSummaryContainer}
            >
              {renderSharingTypeSummary()}
            </ScrollView>
          </View>
        )}

        {/* All Rooms List */}
        <View style={styles.roomsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Rooms ({allRooms.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Sorted by floor and room number
            </Text>
          </View>
          
          <FlatList
            data={allRooms}
            renderItem={renderRoomItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.roomsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.subtitle,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
    textAlign: "center",
  },
  sharingTypeSection: {
    padding: 16,
  },
  typeSummaryContainer: {
    paddingVertical: 4,
  },
  typeSummaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: "#e9ecef",
    position: "relative",
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  typeStats: {
    gap: 4,
  },
  typeStat: {
    fontSize: 12,
    color: COLORS.subtitle,
  },
  availabilityIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roomsSection: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: 4,
  },
  roomsList: {
    gap: 12,
  },
  roomCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  floorText: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  capacitySection: {
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  occupancyText: {
    fontSize: 13,
    color: COLORS.subtitle,
  },
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusDetail: {
    fontSize: 12,
    color: COLORS.subtitle,
  },
});