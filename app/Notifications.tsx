import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { goBack } from "../utils/navigationHistory";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const COLORS = {
  background: ["#ffffff", "#ffffff"],
  kellyGreen: "#4CBB17",
  yellow: "#FFD700",
  text: "#222",
  cardText: "#333",
  headerBackground: "#fdfdfdff",
  headerText: "#30b300ff",
};

// Sample notifications
const notifications = [
  {
    id: "1",
    title: "Booking Confirmed",
    description: "Your room booking has been confirmed successfully.",
    time: "2h ago",
    icon: "check-circle-outline",
  },
  {
    id: "2",
    title: "Payment Received",
    description: "We’ve received your payment for the month of September.",
    time: "5h ago",
    icon: "currency-inr",
  },
  {
    id: "3",
    title: "Maintenance Scheduled",
    description: "Water tank cleaning is scheduled for tomorrow.",
    time: "1d ago",
    icon: "wrench-outline",
  },
];

export default function Notifications() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconWrapper}>
        <Icon name={item.icon} size={26} color={COLORS.kellyGreen} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.headerBackground}
        translucent={false}
      />
      <LinearGradient colors={COLORS.background} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => goBack(router)}
          style={styles.headerButton}
        >
          <Icon name="arrow-left" size={26} color={COLORS.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
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
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: COLORS.kellyGreen,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  iconWrapper: {
    marginRight: 12,
    backgroundColor: "rgba(76,187,23,0.1)", // light kelly green background
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cardText,
  },
  description: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
