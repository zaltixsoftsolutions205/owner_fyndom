// 
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { recordRoute } from "../utils/navigationHistory";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.7;

interface SideNavProps {
  visible: boolean;
  onClose: () => void;
  currentRoute?: string;
}

const SideNav: React.FC<SideNavProps> = ({
  visible,
  onClose,
  currentRoute = "/tabs/HostelHome",
}) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const menuItems = [
    { label: "Home", icon: "home-outline", route: "/tabs/HostelOwnerHome", activeIcon: "home" },
    { label: "Profile", icon: "account-outline", route: "/Profile", activeIcon: "account" },
    { label: "Bookings", icon: "calendar-check", route: "/tabs/Bookings", activeIcon: "calendar-check" },
    { label: "Rooms", icon: "bed-outline", route: "/tabs/allrooms", activeIcon: "bed" },
    { label: "Facilities", icon: "wrench-outline", route: "/Facilities", activeIcon: "wrench" },
    { label: "Pricing", icon: "currency-inr", route: "/Pricing", activeIcon: "currency-inr" },
    { label: "Upload Media", icon: "cloud-upload-outline", route: "/UploadMedia", activeIcon: "cloud-upload" },
    { label: "Summary", icon: "file-document-outline", route: "/Summary", activeIcon: "file-document" },
    { label: "Notifications", icon: "bell-outline", route: "/Notifications", activeIcon: "bell" },
    { label: "Settings", icon: "cog-outline", route: "/tabs/Settings", activeIcon: "cog" },
    { label: "Help & Support", icon: "help-circle-outline", route: "help-support", activeIcon: "help-circle" },
    { label: "Logout", icon: "logout", route: "/HostelOwnerLogin", activeIcon: "logout" },
  ];

  const handleNavigation = (route: string) => {
    if (route === "help-support") {
      setHelpModalVisible(true);
      return;
    }
    onClose();
    setTimeout(() => {
      // record current route so the destination can go back to it
      try {
        // prefer router pathname if available, otherwise fall back to provided currentRoute
        const current = (router as any).pathname || currentRoute;
        console.log("SideNav: recording current route before navigate", { current, target: route });
        recordRoute(current);
      } catch (e) {
        console.error("SideNav: recordRoute failed", e);
      }

      try {
        console.log("SideNav: pushing route", route);
        router.push(route as any);
      } catch (err) {
        console.error("SideNav: router.push failed for route", route, err);
        // fallback to home tab if push failed
        try {
          router.push("/tabs/HostelOwnerHome");
        } catch (e) {
          console.error("SideNav: fallback push to home failed", e);
        }
      }
    }, 300);
  };

  const closeHelpModal = () => setHelpModalVisible(false);
  const isActiveRoute = (route: string) => currentRoute === route;

  return (
    <>
      {visible && <Pressable style={styles.overlay} onPress={onClose} />}

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.profileSection}>
            <Icon name="account-circle" size={60} color="#00C72F" />
            <Text style={styles.welcomeText}>Welcome, Owner!</Text>
            <Text style={styles.subText}>Fyndom</Text>
          </View>
        </View>

        {/* SCROLLABLE MENU */}
        <ScrollView
          style={styles.menuContainer}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((item, index) => {
            const isActive = isActiveRoute(item.route);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isActive && styles.activeMenuItem]}
                onPress={() => handleNavigation(item.route)}
              >
                <Icon
                  name={isActive ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? "#00C72F" : "#666"}
                />
                <Text
                  style={[styles.menuText, isActive && styles.activeMenuText]}
                >
                  {item.label}
                </Text>

                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Connected Hostels App</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>

      {/* Help Modal */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeHelpModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeHelpModal}>
          <Pressable
            style={styles.helpModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Icon name="help-circle" size={32} color="#00C72F" />
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity
                onPress={closeHelpModal}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                We're here to help you!
              </Text>

              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Contact Details</Text>

                <View style={styles.contactItem}>
                  <Icon name="email-outline" size={20} color="#00C72F" />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>
                      contact@fyndom.com
                    </Text>
                  </View>
                </View>

                <View style={styles.contactItem}>
                  <Icon name="phone-outline" size={20} color="#00C72F" />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>+91 7674843434</Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

/* ----------------------------  STYLES  ---------------------------- */

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    elevation: 10,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileSection: { alignItems: "center" },
  welcomeText: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  subText: { fontSize: 14, color: "#666", marginTop: 4 },

  menuContainer: { flexGrow: 1, paddingVertical: 10 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  activeMenuItem: { backgroundColor: "#E8F5E8" },
  menuText: { marginLeft: 15, fontSize: 16, color: "#666", flex: 1 },
  activeMenuText: { color: "#00C72F", fontWeight: "700" },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: "#00C72F",
    position: "absolute",
    right: 15,
    borderRadius: 2,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontWeight: "600", color: "#666" },
  versionText: { fontSize: 12, color: "#999", marginTop: 3 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  helpModal: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    marginLeft: 10,
  },
  closeButton: { padding: 5 },
  modalContent: { padding: 20 },
  modalDescription: { fontSize: 15, color: "#666", marginBottom: 20 },
  contactSection: { marginTop: 10 },
  contactTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  contactItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contactInfo: { marginLeft: 12 },
  contactLabel: { fontSize: 13, color: "#666" },
  contactValue: { fontSize: 15, fontWeight: "600" },
});

export default SideNav;
