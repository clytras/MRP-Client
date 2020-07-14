import React from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import AnimatedLoader from "@mrplib/rn/packages/react-native-animated-loader";


const { width: screenWidth }  = Dimensions.get('window');

export default function({
  visible,
  speed = 1
}) {
  return (
    <AnimatedLoader
      visible={visible}
      animationStyle={styles.loaderLottie}
      //autoSize={true}
      resizeMode={Platform.select({ android: "cover", ios: "contain"})}
      overlayColor="rgba(0,0,0,0.55)"
      source={require('@assets/animations/loader_thin.json')}
      speed={speed}
    />
  );
}

const styles = StyleSheet.create({
  loaderLottie: {
    width: screenWidth,
    height: screenWidth
  }
});
