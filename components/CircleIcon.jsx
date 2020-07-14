import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';
import CircleIcons from '@jsassets/CircleIcons';


export default function({
  icon,
  text,
  onPress,
  enabled = true,
  style,
  imageStyle,
  textStyle,
  numberOfLines
}) {

  function _onPress() {
    enabled && onPress && onPress();
  }

  return (
    <TouchableOpacity style={[
      styles.container,
      !enabled && disabledContainer,
      style
    ]}
    onPress={_onPress}>
      <Image pointerEvents="none" source={CircleIcons[icon]} style={[styles.icon, imageStyle]}/>
      {text && <Text style={[styles.text, textStyle]} numberOfLines={numberOfLines}>{text}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    //zIndex: 10,
    // flex: 0,
    // width: '30%',
    // //height: refactorFontSize(100),
    // //height: '60%',
    // //height: '30%',
    // alignItems: 'center'
  },
  disabledContainer: {
    opacity: .5
  },
  icon: {
    zIndex: -1,
    flex: 0,
    //width: '100%',
    // height: refactorFontSize(110),
    // resizeMode: 'contain'
    // borderWidth: 1,
    // borderColor: 'magenta'
  },
  text: {
    // ...mrp.styles.menuItemTitle,
    // textAlign: 'center',
    // marginTop: refactorFontSize(5)
  }
});
