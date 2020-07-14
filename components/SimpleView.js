import React from 'react';
import { View, StyleSheet } from 'react-native';


export default function() {
  return (
    <View style={styles.container}></View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'red'
  }
})
