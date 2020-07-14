

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { refactorFontSize } from '@mrplib/rn/utils';
import mrp from '@app/mrp';

const _defaultSpacing = refactorFontSize(34);

export default function Title({
  // reference,
  text = '',
  topSpacing = _defaultSpacing,
  bottomSpacing = _defaultSpacing
}) {
  // const [_text, setText] = useState(text);

  // const intRef = useRef({
  //   testMe
  // });

  // function testMe(val) {
  //   setText('This is test 2! ' + val);
  //   console.log('testMe spacing', spacing);
  // }

  // useEffect(() => {
  //   reference && reference(intRef);
  // }, []);

  const spacing = {
    marginTop: topSpacing,
    marginBottom: bottomSpacing
  }

  return (
    <View style={[styles.titleContainer, spacing]}>
      <Text style={styles.title}>{text}</Text>
      <View style={styles.titleUnderline}/>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    //marginVertical: refactorFontSize(34)
    //marginTop: refactorFontSize(34)
  },
  title: {
    ...mrp.styles.baseTitle
  },
  titleUnderline: {
    width: '18%',
    marginTop: refactorFontSize(6),
    height: refactorFontSize(2),
    backgroundColor: mrp.colors.mrPengu.orange
  }
});
