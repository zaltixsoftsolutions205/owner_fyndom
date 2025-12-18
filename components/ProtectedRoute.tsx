// app/components/ProtectedRoute.tsx
import React from 'react';
import { useAppSelector } from '../hooks/hooks';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, isInitialized } = useAppSelector((state) => state.auth);

  // Show loading while initializing auth state
  if (!isInitialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C72F" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Redirect href="/HostelOwnerLogin" />;
  }

  console.log('✅ User authenticated, rendering protected content');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ProtectedRoute;