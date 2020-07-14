import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { normalizeGreek } from '@mrplib/utils';
import { refactorFontSize } from '@mrplib/rn/utils';
import mrp from '@app/mrp';


export default function({
  style,
  textStyle,
  containerStyle,
  text,
  normalize = false,
  uppercase = true,
  disabled,
  loading = false,
  loadingIndicatorColor = 'black',
  onPress
}) {

  let buttonText;

  if(normalize) {
    buttonText = normalizeGreek(text);
  } else {
    buttonText = text;
  }

  if(uppercase) {
    buttonText = buttonText.toUpperCase();
  }

  function _onPress() {
    onPress && onPress();
  }

  return (
    <View style={[styles.closeButtonContainer, containerStyle]}>
      <TouchableOpacity disabled={disabled} style={[styles.closeButton, style]} onPress={_onPress}>
        {loading && <ActivityIndicator size="small" color={loadingIndicatorColor} style={styles.loader} />}
        <Text style={[styles.closeButtonText, textStyle, disabled && styles.closeButtonTextDisabled]}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButtonContainer: {
    // borderColor: 'blue',
    // borderWidth: 1,
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  closeButton: {
    flexDirection: 'row',
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: mrp.colors.mrPengu.orange,
    borderRadius: refactorFontSize(5),


    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },

  loader: {
    marginRight: refactorFontSize(6),
  },

  closeButtonText: {
    color: 'black',
    fontSize: refactorFontSize(14),
    letterSpacing: .5
  },
  closeButtonTextDisabled: {
    color: 'grey'
  }
});
