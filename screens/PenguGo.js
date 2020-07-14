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
//import { showOverlay } from '@mrplib/rn/helpers/rnn';
//import { testLib } from 'mrlib/test';
import CircleIcon from '@components/CircleIcon';
import { showModal } from '@mrplib/rn/helpers/rnn';

export default class PenguGo extends React.Component {
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

    this.onBicyclePress = this.onBicyclePress.bind(this);
    this.onScooterPress = this.onScooterPress.bind(this);
    this.onCarPress = this.onCarPress.bind(this);
  }

  componentDidMount() {
    console.log('Index did mount');

    SplashScreen.hide();

    // Add the NoConnection overlay component
    showOverlay(ScreenIds.NoConnection, {}, {
      overlay: {
        interceptTouchOutside: false
      }
    });
  }

  componentWillUnmount() {
    //this.unsubscribeOrders && this.unsubscribeOrders();
  }

  onCollectionUpdate(querySnapshot) {
    querySnapshot.forEach(doc => {
      console.log('got order id', doc.id);
    });
  }

  onBicyclePress() {
    console.log(`Index::onBicyclePress()`);
    const { componentId } = this.props;
    push(componentId, ScreenIds.Airbnb);
  }

  onScooterPress() {
    console.log(`Index::onPenguGoPress(!)`);
    const { componentId } = this.props;
    push(componentId, ScreenIds.Airbnb);
  }

  onCarPress() {
    console.log(`Index::onCarPress()`, firebase.auth().currentUser);
    const { componentId } = this.props;

    push(componentId, ScreenIds.Airbnb);
  }

  render() {
    const { componentId } = this.props;
    const menu = mrp.menus.penguGo;
    const lang = Strings.menus.client.penguGo;

    return (
      <ViewBase ref={this.viewBaseRef}
        navigationComponentId={componentId}
      >
        <View style={styles.container}>
          <Title text={Strings.titles.PickCategory}/>
          <View style={styles.menuItemsContainer}>
            <View style={styles.menuItemsTop}>
              <CircleIcon icon="Bicycle" text={lang[menu.Bicycle]}
                style={[styles.menuItem, styles.menuItemMarginRight]}
                imageStyle={styles.menuItemIcon} textStyle={styles.menuItemText}
                onPress={this.onBicyclePress}
              />
              <CircleIcon icon="Scooter" text={lang[menu.Scooter]}
                style={styles.menuItem}
                imageStyle={[styles.menuItemIcon, styles.menuItemIconScooter]}
                textStyle={[styles.menuItemText, styles.menuItemScooterText]}
                onPress={this.onScooterPress}
              />
            </View>
            <View style={styles.menuItemsBottom}>
              <CircleIcon icon="Car" text={lang[menu.Car]}
                style={styles.menuItem}
                imageStyle={styles.menuItemIcon} textStyle={styles.menuItemText}
                onPress={this.onCarPress}
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
    width: '100%',
    flex: 0
  },
  menuItemsTop: {
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
    flex: 0,
    width: '30%',
    //height: refactorFontSize(100),
    //height: '60%',
    //height: '30%',
    alignItems: 'center'
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
    marginTop: refactorFontSize(5),
    width: '100%'
  },

  menuItemScooterText: {
    width: '70%'
  }

});
