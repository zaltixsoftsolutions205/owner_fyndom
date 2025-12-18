import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { goBack } from "../../utils/navigationHistory";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../reduxStore/store/store";
import { fetchAllBookings } from "../reduxStore/reduxSlices/bookingsSlice";

const { width, height } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;

const COLORS = {
  kellyGreen: "#4CBB17",
  yellow: "#FFD700",
  headerBackground: "#ffffffff",
  headerText: "#4dbf06ff",
  cardBorder: "rgba(76,187,23,0.2)",
  pillPaidBackground: "#ebf7d4",
  pillPaidBorder: "#4CBB17",
  pillPendingBackground: "#fff9d9",
  pillPendingBorder: "#FFD700",
  errorRed: "#FF4444",
  cancelledRed: "#FF6B6B",
};

const SHADOW = {
  shadowColor: COLORS.kellyGreen,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 6,
};

export default function Bookings() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error, summary } = useSelector((state: RootState) => state.bookings);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      await dispatch(fetchAllBookings({ status: "all" })).unwrap();
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return COLORS.kellyGreen;
      case "pending":
        return COLORS.yellow;
      case "cancelled":
        return COLORS.cancelledRed;
      default:
        return COLORS.yellow;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return COLORS.kellyGreen;
      case "pending":
        return COLORS.yellow;
      case "failed":
        return COLORS.errorRed;
      default:
        return COLORS.yellow;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && !refreshing && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Icon name="arrow-left" size={26} color={COLORS.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.kellyGreen} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBackground} translucent={false} />
      <LinearGradient colors={["#ffffff", "#ffffff"]} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => goBack(router)} style={styles.headerButton}>
          <Icon name="arrow-left" size={26} color={COLORS.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Stats */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalBookings}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.kellyGreen }]}>{summary.confirmed}</Text>
            <Text style={styles.summaryLabel}>Confirmed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.yellow }]}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.cancelledRed }]}>{summary.cancelled}</Text>
            <Text style={styles.summaryLabel}>Cancelled</Text>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={20} color={COLORS.errorRed} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadBookings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.kellyGreen]}
            tintColor={COLORS.kellyGreen}
          />
        }
      >
        {bookings.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Icon name="book-open-outline" size={64} color={COLORS.kellyGreen} />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubText}>When students book rooms, they'll appear here.</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking._id} style={styles.card}>
              {/* Student Info */}
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <Icon name="account" size={scale(24)} color={COLORS.kellyGreen} />
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.mainLabel}>{booking.student.name}</Text>
                  <Text style={styles.subLabel}>{booking.student.mobile}</Text>
                  <Text style={styles.subLabel}>{booking.student.email}</Text>
                </View>
                <View style={styles.bookingIdContainer}>
                  <Text style={styles.bookingId}>#{booking.bookingId}</Text>
                </View>
              </View>

              {/* Room and Payment Info */}
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Icon name="bed-outline" size={scale(16)} color={COLORS.kellyGreen} />
                  <Text style={styles.pillText}>
                    Room {booking.room.roomNumber} • {booking.bookingDetails.sharingType}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: booking.payment.status === "completed" 
                        ? COLORS.pillPaidBackground 
                        : COLORS.pillPendingBackground,
                      borderColor: booking.payment.status === "completed" 
                        ? COLORS.pillPaidBorder 
                        : COLORS.pillPendingBorder,
                    },
                  ]}
                >
                  <Icon
                    name={booking.payment.status === "completed" ? "check-circle-outline" : "alert-circle-outline"}
                    size={scale(16)}
                    color={getPaymentStatusColor(booking.payment.status)}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      { color: getPaymentStatusColor(booking.payment.status) },
                    ]}
                  >
                    {booking.payment.status === "completed" ? "Paid" : "Pending"} • {formatCurrency(booking.payment.amount)}
                  </Text>
                </View>
              </View>

              {/* Dates */}
              <View style={styles.datesContainer}>
                <View style={styles.dateItem}>
                  <Icon name="calendar-check" size={14} color="#666" />
                  <Text style={styles.dateText}>Check-in: {formatDate(booking.dates.checkIn)}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Icon name="clock-outline" size={14} color="#666" />
                  <Text style={styles.dateText}>Booked: {formatDate(booking.dates.bookedAt)}</Text>
                </View>
              </View>

              {/* Status */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${getStatusColor(booking.status.bookingStatus)}20` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status.bookingStatus) }]}>
                    {booking.status.bookingStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    backgroundColor: COLORS.headerBackground,
    paddingHorizontal: 16,
  },
  headerButton: { padding: 6 },
  headerTitle: {
    color: COLORS.headerText,
    fontSize: 20,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.kellyGreen,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#023047",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.errorRed,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.errorRed,
    fontSize: 14,
  },
  retryText: {
    color: COLORS.kellyGreen,
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContainer: {
    padding: scale(16),
    paddingBottom: verticalScale(30),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#023047",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: scale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(10),
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#D0F0C0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: COLORS.kellyGreen,
  },
  studentInfo: {
    flex: 1,
  },
  bookingIdContainer: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.kellyGreen,
  },
  mainLabel: {
    fontSize: scale(15),
    fontWeight: "700",
    color: "#023047",
  },
  subLabel: {
    fontSize: scale(13),
    color: "#555",
    fontWeight: "500",
    marginTop: 2,
  },
  pillRow: {
    flexDirection: "row",
    marginTop: 6,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: 18,
    marginRight: 8,
    marginTop: 6,
    borderWidth: 1,
  },
  pillText: {
    fontSize: scale(13),
    fontWeight: "600",
    marginLeft: 6,
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  statusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
});