import React from 'react';
import {
  Platform,
  StyleSheet,
  Image,
  Text,
  Linking,
  View,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import firebase from 'react-native-firebase';
import { useDataLiveOrders } from '@data/firebase/UserData';
import { subscribeForUserData } from '@data/firebase/UserData';
import { resetCustomerData } from '@data/gateways/EveryPay';
import { EventRegister } from 'react-native-event-listeners';
import { ScreenIds } from '@screens/Screens';
import { popToRoot, showModal, Drawer } from '@mrplib/rn/helpers/rnn';
import { showAlert, closeAlert } from '@mrplib/rn/components/Alert';
import { finalSignOut } from '@mrplib/rn/utils/Auth';
import { WithStatusBarIOS } from '@mrplib/rn/components/StatusBar';
import { refactorFontSize } from '@mrplib/rn/utils';
import { appendProtocol } from '@mrplib/utils';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';

// import RNLanguages from 'react-native-languages';

export default class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      hasUserLoggedIn: false
    };

    this.onDeliveryPress = this.onDeliveryPress.bind(this);
    this.onSettingsPress = this.onSettingsPress.bind(this);
    this.onUserPress = this.onUserPress.bind(this);
    this.onLoginRegisterPress = this.onLoginRegisterPress.bind(this);
    this.updateUserState = this.updateUserState.bind(this);
    //this.onItemPress = this.onItemPress.bind(this);
    // this.onSysLanguageChange = this.onSysLanguageChange.bind(this);
  }

  componentDidMount() {
    this.authStateChangeSubscription = firebase.auth().onAuthStateChanged(this.updateUserState);
    this.updateUserStateListener = EventRegister.addEventListener(mrp.events.auth.UserUpdate, this.updateUserState);
    this.languageChangeListener = EventRegister.addEventListener(mrp.events.LanguageChange, () => this.setState({}));

    // console.log('SETUP SYS LANG');
    // // Current device language
    // console.log('LANGUAGE', RNLanguages.language);

    // // User preferred languages (in order)
    // console.log('LANGUAGES', RNLanguages.languages);
    // RNLanguages.addEventListener('change', this.onSysLanguageChange);
  }

  componentWillUnmount() {
    if(this.authStateChangeSubscription) {
      this.authStateChangeSubscription();
    }

    if(this.updateUserStateListener) {
      EventRegister.removeEventListener(this.updateUserStateListener);
    }

    if(this.languageChangeListener) {
      EventRegister.removeEventListener(this.languageChangeListener);
    }
  }

  // onSysLanguageChange({ language, languages }) {
  //   console.log('SYS LANG CHANGE', language, languages);
  // }

  updateUserState(authUser) {
    //await authUser.reload();
    console.log('SideMenu::onAuthStateChanged:authUser', authUser && authUser.toJSON());
    //console.log('SideMenu::onAuthStateChanged:currentUser', firebase.auth().currentUser && firebase.auth().currentUser.toJSON());
    //const authUser = firebase.auth().currentUser;

    subscribeForUserData();
    // if(!authUser) {
    //   resetCustomerData();
    //   popToRoot(ScreenIds.Index);
    // }

    this.setState({
      authUser,
      hasUserLoggedIn: !!authUser
    });
  }

  onDeliveryPress() {
    console.log('SideMenu::onDeliveryPress');
  }

  onSettingsPress() {
    console.log('SideMenu::onSettingsPress');
  }

  onUserPress() {
    console.log('SideMenu::onUserPress');
  }

  onLoginRegisterPress() {
    console.log('SideMenu::onLoginRegisterPress');
    showModal(ScreenIds.LoginRegister);
  }

  async onItemPress(itemId) {
    console.log('SideMenu::onItemPress', itemId);
    switch(itemId) {
      case 'Index':
        try {
          popToRoot(ScreenIds.Index).catch(_ => _);
        } catch(error) {}
        Drawer.close('left');
        break;
      case 'Logout':
        showAlert({
          title: Strings.messages.LoggingOut,
          showProgress: true,
          showConfirmButton: false
        }).then(async () => {
          console.log('showAlert promise return');
          await finalSignOut();
          resetCustomerData();
          try {
            popToRoot(ScreenIds.Index).catch(_ => _);
          } catch(error) {}
          Drawer.close('left');
          closeAlert();
        });
        break;
      case 'Orders':
        showModal(ScreenIds.OrdersListing);
        break;
      case 'LiveOrder':
        const liveOrders = useDataLiveOrders();
        if(liveOrders.length == 1) {
          const [order] = liveOrders;
          showModal(ScreenIds.OrderView, {
            order,
            isLive: true
          });
        } else if(liveOrders.length > 1) {
          showModal(ScreenIds.OrdersListing, { loadOnlyLive: true });
        } else {
          showAlert({
            title: Strings.titles.LiveOrder,
            message: Strings.messages.NoLiveOrdersAtTheMoment
          });
        }
        break;
      case 'Addresses':
        showModal(ScreenIds.Addresses, { listingMode: true });
        break;
      case 'PaymentMethods':
        showModal(ScreenIds.CardsListing);
        break;
      case 'Profile':
        const { authUser: user } = this.state;
        if(user) {
          showModal(ScreenIds.ProfileEditor, { user });
        }
        break;
      case 'Contact':
        const link = `mailto:${mrp.info.supportEmail}`;
          Linking.canOpenURL(link)
          .then(supported => {
            if(supported) {
              Linking.openURL(link);
            }
          });
        break;
      case 'About':
        showModal(ScreenIds.InfoListing);
        break;
    }
  }

  renderHeader() {
    const { hasUserLoggedIn } = this.state;
    return hasUserLoggedIn ?
      this.renderHeaderUser() :
      this.renderHeaderNoUser();
  }

  renderHeaderUser() {
    const { authUser } = this.state;
    const { displayName = '<Anonymus?>' } = authUser;

    return (
      <>
        {/* <TouchableOpacity style={styles.iconContainer} onPress={this.onDeliveryPress}>
          <Text style={[styles.fontIcon, styles.sideIcon]}>{mrp.fonts.mrPengu.iconDeliveryBikeLeft.glyph}</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.userContainer} onPress={this.onUserPress}>
          <Text style={[styles.fontIcon, styles.userIcon]}>{mrp.fonts.mrPengu.iconUser.glyph}</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconContainer} onPress={this.onSettingsPress}>
          <Text style={[styles.fontIcon, styles.sideIcon, styles.cogIcon]}>{mrp.fonts.mrPengu.iconCog.glyph}</Text>
        </TouchableOpacity> */}
      </>
    );
  }

  renderHeaderNoUser() {
    return (
      <>
        <TouchableOpacity style={styles.userContainer} onPress={this.onLoginRegisterPress}>
          <Text style={[styles.userName, styles.userLoginRegister]}>{Strings.titles.LoginRegister}</Text>
        </TouchableOpacity>
      </>
    );
  }

  renderTopMenuItemsUser() {
    const topMenuItems = [
      'Index',
      ...mrp.sideMenu.items.top
    ];

    return topMenuItems.map((itemId, index) => (
      <MenuItem key={`top-item-${index}`} itemId={itemId} onPress={this.onItemPress.bind(this, itemId)}/>
    ));
  }

  renderTopMenuItemsNoUser() {
    return <MenuItem key={`top-item-0`} itemId="Index" onPress={this.onItemPress.bind(this, "Index")}/>;
  }

  renderTopMenuItems() {
    const { hasUserLoggedIn } = this.state;
    return hasUserLoggedIn ?
      this.renderTopMenuItemsUser() :
      this.renderTopMenuItemsNoUser();
  }

  render() {
    return (
      <WithStatusBarIOS backgroundColor={mrp.colors.topArcGraphic} barStyle="light-content">
        <ImageBackground source={require('@assets/graphics/cityBackground.png')}
          fadeDuration={0}
          style={styles.container}
          imageStyle={styles.containerImageBackground}
        >
          <ImageBackground source={require('@assets/graphics/headerBackground.png')}
            fadeDuration={0}
            style={styles.headerContainer}
            imageStyle={styles.headerContainerImageBackground}
          >
            {this.renderHeader()}
          </ImageBackground>
          <View style={[styles.itemsContainer, styles.itemsTopContainer]}>
            {this.renderTopMenuItems()}
          </View>
          <View style={[styles.itemsContainer, styles.itemsBottomContainer]}>
          {mrp.sideMenu.items.bottom.map((itemId, index) => (
            <MenuItem key={`bottom-item-${index}`} itemId={itemId} onPress={this.onItemPress.bind(this, itemId)}/>
          ))}
          </View>
        </ImageBackground>
      </WithStatusBarIOS>
    );
  }
}

class MenuItem extends React.PureComponent {
  render() {
    const { itemId, onPress } = this.props;
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <Text style={styles.itemText}>{Strings.titles[itemId]}</Text>
      </TouchableOpacity>
    );
  }
}

// https://github.com/wix/react-native-navigation/issues/3977#issuecomment-434590704
const DefaultIOSDrawerWidth = Platform.select({ios: 280, default: null});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    //width: DefaultIOSDrawerWidth
  },
  containerImageBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '15%'
  },
  headerContainerImageBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch'
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  sideIcon: {
    paddingVertical: refactorFontSize(20),
    paddingHorizontal: refactorFontSize(18)
  },
  cogIcon: {
    fontSize: mrp.header.userIconFontSize - refactorFontSize(16)
  },
  userIcon: {
    fontSize: mrp.header.userIconFontSize,
    marginRight: refactorFontSize(12)
  },
  fontIcon: {
    fontFamily: 'MrPengu',
    fontSize: mrp.header.iconFontSize,
    color: mrp.header.foreColor
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: refactorFontSize(20)
  },
  userName: {
    fontFamily: 'Roboto-Light',
    fontSize: mrp.header.userFontSize,
    color: mrp.header.foreColor
  },
  userLoginRegister: {
    flex: 1,
    marginHorizontal: refactorFontSize(30),
    textAlign: 'center',
    padding: refactorFontSize(5),
    borderColor: 'grey',
    borderWidth: refactorFontSize(1),
    borderRadius: refactorFontSize(5)
  },
  itemsContainer: {
    justifyContent: 'center'
  },
  itemsTopContainer: {
    //flex: 1
    marginTop: refactorFontSize(10),
    marginBottom: refactorFontSize(44)
  },
  itemsBottomContainer: {
    height: '30%',
    borderTopWidth: refactorFontSize(1),
    borderTopColor: 'white'
  },
  itemContainer: {
    paddingLeft: refactorFontSize(40),
    paddingVertical: refactorFontSize(6)
  },
  itemText: {
    fontFamily: 'Roboto-Black',
    fontSize: mrp.sideMenu.itemsFontSize,
    letterSpacing: refactorFontSize(.5),
    color: mrp.sideMenu.itemsColor
  }
});
