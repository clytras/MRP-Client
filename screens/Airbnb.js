import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Navigation } from 'react-native-navigation';
import { push, showOverlay } from '@mrplib/rn/helpers/rnn';
import firebase from 'react-native-firebase';
import ViewBase from '@mrplib/rn/components/ViewBase';
import Title from '@components/Title';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';
import { ScreenIds } from '@screens/Screens';
import { refactorFontSize } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import CircleIcon from '@components/CircleIcon';
import { showModal } from '@mrplib/rn/helpers/rnn';

export default function({ componentId }) {

  return (
    <ViewBase ref={this.viewBaseRef}
      navigationComponentId={componentId}
    >
      <View style={styles.container}>
        <Image style={styles.mrPengu} source={require('@assets/graphics/mrPengu.png')}/>
        <Title text={Strings.messages.ServiceWillSoonBeAvailable}/>
      </View>
    </ViewBase>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'white'
  },

  mrPengu: {
    //width: '30%',
    height: 220,
    resizeMode: 'contain'
  }
});
