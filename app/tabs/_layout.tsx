// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00C72F',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="HostelOwnerHome"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />

        {/* File must be app/(tabs)/allrooms.tsx */}
        <Tabs.Screen
          name="allrooms"
          options={{
            title: 'Rooms',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bed-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}