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
import { getLanguageFromLocale } from '@mrplib/i18n/utils';
import RNLanguages from 'react-native-languages';
//import { loadLanguageLocale } from '@data/AppData';
import { EventRegister } from 'react-native-event-listeners';
import { translateTimeCode, timeRangeInUtcDate } from '@mrpbrain/utils/time';
import mrp from '@app/mrp';
import { ScreenIds } from '@screens/Screens';
import { refactorFontSize } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
//import { showOverlay } from '@mrplib/rn/helpers/rnn';
//import { testLib } from 'mrlib/test';
import CircleIcon from '@components/CircleIcon';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { uniqueid } from '@mrplib/rn/utils';

import { NativeModules } from 'react-native'

export default class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }

    this.viewBaseRef = React.createRef();
    //this.ordersRef = firebase.firestore().collection('orders');

    // const types = firebase.firestore().collection('orders2').where('type', '==', 'product');
    // types.get().then(function (querySnapshot) {
    //   console.log('found ')
    //   querySnapshot.forEach(function (doc) {
    //       console.log(doc.id, ' => ', doc.data());
    //   });
    // });

    this.onDeliveryPress = this.onDeliveryPress.bind(this);
    this.onPenguGoPress = this.onPenguGoPress.bind(this);
    this.onAirBnbPress = this.onAirBnbPress.bind(this);
  }

  async componentDidMount() {
    //console.log('Index did mount', Strings.getLanguage(), Strings.getInterfaceLanguage(), Strings.getDeviceLocaleId(), NativeModules.SettingsManager.settings.AppleLocale);

    console.log('lang', Strings.getDeviceLocaleId(), RNLanguages.language, getLanguageFromLocale(RNLanguages.language));
    this.languageChangeListener = EventRegister.addEventListener(mrp.events.LanguageChange, () => this.setState({}));
    const deviceLanguage = getLanguageFromLocale(RNLanguages.language);
    Strings.setSafeLanguage(deviceLanguage);
    this.setState({ deviceLanguage });

    //try {
      //await loadLanguageLocale();
    //} catch(e) {
    //} finally {
      //this.setState({});
      SplashScreen.hide();

      // Add the NoConnection overlay component
      showOverlay(ScreenIds.NoConnection, {}, {
        overlay: {
          interceptTouchOutside: false
        }
      });
    //}
  }

  componentWillUnmount() {
    if(this.languageChangeListener) {
      EventRegister.removeEventListener(this.languageChangeListener);
    }
  }

  onCollectionUpdate(querySnapshot) {
    querySnapshot.forEach(doc => {
      console.log('got order id', doc.id);
    });
  }

  onDeliveryPress() {
    console.log(`Index::onDeliveryPress()`);
    //this.viewBaseRef.current.setHeaderBackButtonVisible(true);

    const { componentId } = this.props;
    push(componentId, ScreenIds.Delivery);
  }

  async onPenguGoPress() {

    console.log(`Index::onPenguGoPress()`, firebase.auth().currentUser);
    const { componentId } = this.props;

    // console.log(timeRangeInUtcDate({
    //   utcOffset: 180,
    //   ranges: [
    //     '0700-0143'
    //   ]
    // }));
    // return;

    push(componentId, ScreenIds.PenguGo);

    // const alphabet = "0123456789ABCDEFGHIJKLNQRTUVWXYZabcdefghijklmnpqrstuvwxyz";

    // uniqueid(30).then(uid => console.log('got uid 1', uid));
    // uniqueid(30, alphabet).then(uid => console.log('got uid 2', uid));


    return;


    try {
      const docRef = firebase.firestore().collection('system').doc('counters');

      const result = await docRef.update({ orderCode: firebase.firestore.FieldValue.increment(1) });

      console.log('after ordersCode update', result);
    } catch(error) {
      console.log('after ordersCode error', error);
    }

    return;



    //const helloWorld = firebase.functions('europe-west1').httpsCallable('helloWorld');
    //const httpsCallable = firebase.functions('europe-west1').httpsCallable('myFooBarFn');
    const systemStatus = firebase.functions('europe-west1').httpsCallable('systemStatus');
    const everyPayRetreiveCustomer = firebase.functions('europe-west1').httpsCallable('everyPay-retreiveCustomer');
    const everyPayPublicAuth = firebase.functions('europe-west1').httpsCallable('everyPay-publicAuth');




    // httpsCallable({ some: 'args' })
    // .then(({ data }) => {
    //     console.log(data.someResponse); // hello world
    // })
    // .catch(httpsError => {
    //     console.log(httpsError.code); // invalid-argument
    //     console.log(httpsError.message); // Your error message goes here
    //     console.log(httpsError.details.foo); // bar
    // });

    everyPayPublicAuth()
    .then(data => console.log('everyPayPublicAuth:RESP', data))
    .catch(error => console.log('everyPayPublicAuth:ERROR', error));

    // everyPayRetreiveCustomer()
    // .then(data => console.log('everyPayRetreiveCustomer:RESP', data))
    // .catch(error => console.log('everyPayRetreiveCustomer:ERROR', error));

    systemStatus({
      testParam: 'Test Param!!!'
    })
    .then(({ data }) => {
        console.log('Got systemStatus response', data); // hello world
    })
    .catch(httpsError => {
      console.log(httpsError);
      console.log(httpsError.code); // invalid-argument
      console.log(httpsError.message); // Your error message goes here
      console.log(httpsError.details);
      //console.log(httpsError.details.foo); // bar
    })
    .finally(() => console.log('systemStatus finally!'));
  }

  onAirBnbPress() {
    console.log(`Index::onAirBnbPress()`, firebase.auth().currentUser);
    const { componentId } = this.props;

    // console.log(`Index::onAirBnbPress(this.titleRef)`, this.titleRef);
    // this.titleRef.testMe((new Date).getTime());

    push(componentId, ScreenIds.Airbnb);
  }

  render() {
    const { componentId } = this.props;
    const menu = mrp.menus.index;
    const lang = Strings.menus.client.index;

    console.log('index render', Strings.getLanguage());

    return (
      <ViewBase ref={this.viewBaseRef}
        navigationComponentId={componentId}
        showBackButton={false}
      >
        <View style={styles.container}>
          <Title text={Strings.titles.PickCategory}/>
          <View style={styles.menuItemsContainer}>
            <View style={styles.menuItemsTop}>
              <CircleIcon icon="Delivery" text={lang[menu.Delivery]}
                style={[styles.menuItem, styles.menuItemMarginRight]}
                imageStyle={styles.menuItemIcon} textStyle={styles.menuItemText}
                onPress={this.onDeliveryPress}
              />
              <CircleIcon icon="Scooter" text={lang[menu.PenguGo]}
                style={styles.menuItem}
                imageStyle={[styles.menuItemIcon, styles.menuItemIconScooter]} textStyle={styles.menuItemText}
                onPress={this.onPenguGoPress}
              />
            </View>
            <View style={styles.menuItemsBottom}>
              <CircleIcon icon="Airbnb" text={lang[menu.Airbnd]}
                style={styles.menuItem}
                imageStyle={styles.menuItemIcon} textStyle={styles.menuItemText}
                onPress={this.onAirBnbPress}
              />
            </View>
          </View>
        </View>
      </ViewBase>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    //backgroundColor: 'white'
  },
  // titleContainer: {
  //   width: '100%',
  //   alignItems: 'center',
  //   marginVertical: refactorFontSize(34)
  // },
  // title: {
  //   ...mrp.styles.baseTitle
  // },
  // titleUnderline: {
  //   width: '18%',
  //   marginTop: refactorFontSize(6),
  //   height: refactorFontSize(2),
  //   backgroundColor: mrp.colors.mrPengu.orange
  // },
  menuItemsContainer: {
    // borderWidth: 1,
    // borderColor: 'red',
    //backgroundColor: 'yellow',
    width: '100%',
    flex: 0
  },
  menuItemsTop: {
    zIndex: 1,
    // borderWidth: 1,
    // borderColor: 'blue',

    //display: 'flex',
    //flex: 0,
    flexDirection: 'row',
    //flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: refactorFontSize(20)
  },
  menuItemsBottom: {
    //flex: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  menuItem: {
    // borderWidth: 1,
    // borderColor: 'green',

    flex: 0,
    width: '30%',
    //height: refactorFontSize(100),
    //height: '60%',
    //height: '30%',
    alignItems: 'center',
    //zIndex: 10,
    //backgroundColor: 'cyan'
  },
  menuItemMarginRight: {
    marginRight: refactorFontSize(50)
  },
  menuItemIcon: {
    //width: '100%',
    //height: 130,
    height: refactorFontSize(110),
    resizeMode: 'contain'
  },
  menuItemIconScooter: {
    top: refactorFontSize(-8),
    marginBottom: refactorFontSize(-8),
    height: refactorFontSize(118),
  },
  menuItemText: {
    ...mrp.styles.menuItemTitle,
    textAlign: 'center',
    marginTop: refactorFontSize(5)
  }

});
