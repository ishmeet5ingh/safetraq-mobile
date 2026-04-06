import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const AuthLoaderScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.text}>Loading session...</Text>
    </View>
  );
};

export default AuthLoaderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#111827',
  },
});