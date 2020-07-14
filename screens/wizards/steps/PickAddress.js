import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
  InteractionManager,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Keyboard,
  Dimensions
} from 'react-native';
import firebase from 'react-native-firebase';
import { initOrder } from '@data/orders';
import { resetTempAddress } from '@data/firebase/UserData';
import { translateFirebaseError } from '@data/firebase/Errors';
import { Dropdown } from '@mrplib/rn/packages/react-native-material-dropdown';
import LottieView from 'lottie-react-native';
import { createWizardStep } from '..';
import { EventRegister } from 'react-native-event-listeners';
import Title from '@components/Title';
import MainButton from '@components/MainButton';
import { Strings } from '@mrpi18n';
import AnimatedLoader from '@components/AnimatedLoader';
import { refactorFontSize } from '@mrplib/rn/utils';
import { uniqueid } from '@mrplib/rn/utils';
import { getAddressLine } from '@mrplib/data/Orders';
import { OnFirestoreGotUserAddresses } from '@data/firebase/UserData';
import { ScreenIds } from '@screens/Screens';
import { showModal } from '@mrplib/rn/helpers/rnn';
import mrp from '@app/mrp';


const { width: screenWidth }  = Dimensions.get('window');

class PickAddress extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasKeyboard: false,
      showAnim: true,
      renderAnim: false,
      showLoader: false,
      address: null,
      locationArea: null,
      locationServices: null,
      everypayCustomer: null,
      ouid: null,
      serverError: null,
      // serverError: {
      //   title: "Λυπούμαστε",
      //   message: "Η τοποθεσία σας δεν υποστηρίζεται ακόμα",
      //   subMessage: "Maybe in the future"
      // },
      addresses: [{ addNew: true }],
      error: ''
    }

    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._onAddressChange = this._onAddressChange.bind(this);
    this.addressPropsExtractor = this.addressPropsExtractor.bind(this);
    this.processSelectedAddress = this.processSelectedAddress.bind(this);
    this.onAddressSelect = this.onAddressSelect.bind(this);
    this.onAddressPickerBlur = this.onAddressPickerBlur.bind(this);

    this.renderServerError = this.renderServerError.bind(this);
    this.renderAddressesDropdown = this.renderAddressesDropdown.bind(this);
    this.addressValueExtractor = this.addressValueExtractor.bind(this);
    this.validate = this.validate.bind(this);
    this.payload = this.payload.bind(this);
    this._onGoNext = this._onGoNext.bind(this);
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );

    this.removeAddressesListener = OnFirestoreGotUserAddresses(userAddresses => {
      const addresses = [...userAddresses, { addNew: true }];
      console.log('got addresses', userAddresses, addresses);
      this.setState({ addresses });
    });

    resetTempAddress();

    InteractionManager.runAfterInteractions(() => {
      this.setState({ renderAnim: true });
    });
  }

  componentWillUnmount() {
    //if(this.navDidFocusSubscription) this.navDidFocusSubscription.remove();
    if(this.keyboardDidShowListener) this.keyboardDidShowListener.remove();
    if(this.keyboardDidHideListener) this.keyboardDidHideListener.remove();
    if(this.removeAddressesListener) this.removeAddressesListener();
  }

  _keyboardDidShow() {
    this.setState({ hasKeyboard: false, showAnim: true });
  }

  _keyboardDidHide() {
    this.setState({ hasKeyboard: true, showAnim: false });
  }

  _onGoNext() {
    console.log('_onGoNext');
    if(this.validate()) {
      this.props.goToNextStep(this.payload(), { doNavigate: true });
    }
  }

  validate() {
    const {
      ouid,
      address,
      locationArea,
      locationServices
    } = this.state;

    console.log('Pick Address::validate', ouid, address, locationArea, locationServices);

    //if(!(address && 'docId' in address && address.docId))
    if(!(address && 'location' in address))
    {
      this.setState({
        error: Strings.messages.YouMustFillAnAddress
      });
      return false;
    }

    this.setState({ error: '' });

    return ouid &&
           locationArea && 'docId' in locationArea && locationArea.docId &&
           locationServices && locationServices instanceof Array && locationServices.length > 0;
  }

  payload() {
    const { ouid, address, locationArea, locationServices, everypayCustomer } = this.state;
    return { ouid, address, locationArea, locationServices, everypayCustomer };
  }

  _onAddressChange(address) {
    this.setState({ error: '', address });
  }

  renderAddressesDropdown({ title, value, renderAccessory, ...other }) {
    console.log('renderAddressesDropdown', title, value, other);

    const { address } = this.state;
    let text = address ? getAddressLine(address) : Strings.placeholders.PressToSelectAnAddress

    return (
      <View style={styles.addressControlBase}>
        <Text ellipsizeMode="tail" numberOfLines={1}
          style={styles.addressControlText}>{text}</Text>{renderAccessory()}
      </View>
    );
  }

  addressValueExtractor(item, index) {
    //console.log('addressValueExtractor', item, index, item.addNew);
    return item.addNew ? Strings.titles.AddNewAddress : (item ? getAddressLine(item) : '');

  }

  processSelectedAddress() {
    InteractionManager.runAfterInteractions(() => {
      const { address } = this.state;
      console.log('processSelectedAddress::runAfterInteractions', address);
      this.setState({
        showAnim: false,
        showLoader: true,
        serverError: null,
        locationServices: null,
        locationArea: null,
        everypayCustomer: null
      }, async () => {

        let locationServices = null;
        let locationArea = null;
        let everypayCustomer = null;
        let serverError = {
          title: Strings.messages.SomethingWentWrong,
          message: Strings.messages.ProblemCommunicatingWithMrPengu,
          subMessage: Strings.messages.PleaseTryAgain
        };

        try {
          const { data } = await initOrder({ address });
          console.log('initOrder OK', data);

          if(data && 'area' in data && 'services' in data) {
            const { area, services, everypayCustomer: epCustomer } = data;

            if(area && services) {
              const { status } = area;
              if(status == 'up') {
                locationArea = area;
                locationServices = services;
                everypayCustomer = epCustomer;
                serverError = null;
              } else {
                serverError.title = null;
                serverError.message = Strings.messages.YourLocationIsTemporarilyOutOfOrder;
              }
            }
          }
        } catch(error) {
          console.log('initOrder error', error);
          serverError = translateFirebaseError({ error });
          console.log('initOrder serverError', serverError);
        }

        this.setState({
          showAnim: true,
          showLoader: false,
          locationArea,
          locationServices,
          everypayCustomer,
          serverError
        });


        // setTimeout(() => {
        //   this.setState({
        //     showAnim: true,
        //     showLoader: false
        //   });
        // }, 3000);
      });
    });
  }

  async onAddressSelect(value, index, data) {
    console.log('onAddressSelect', value, index, data);
    const address = data[index];

    if(!address.addNew) {
      this.setState({
        address,
        ouid: await uniqueid(30),
        error: '',
        serverError: null
      });

      this.processSelectedAddress();
    } else {
      this.openNewAddressPicker = true;
    }
  }

  onAddressPickerBlur() {
    console.log('onAddressPickerBlur');

    if(this.openNewAddressPicker) {
      this.openNewAddressPicker = false;
      showModal(ScreenIds.Addresses, { listingMode: false, onAddressSelect: async (address) => {
        console.log('got new address', address);
        let { addresses } = this.state;
        addresses.unshift(address);
        this.setState({
          address,
          addresses,
          ouid: await uniqueid(30),
          error: '',
          serverError: null
        }, this.processSelectedAddress);
      }});
    }
  }

  addressPropsExtractor(item, index) {
    //console.log('PropsExtractor', item, index);
    return item.addNew ? { color: '#F9F9F9' } : {};
  }

  renderServerError() {
    const { serverError } = this.state;

    if(!serverError) return null;

    const { title, message, subMessage } = serverError;

    return (
      <View style={styles.serverErrorContainer}>
        {!!title && (
          <View style={styles.serverErrorTitleContainer}>
            <Text style={styles.serverErrorTitle}>{title}</Text>
          </View>
        )}
        <View style={styles.serverErrorMessageContainer}>
          <Text style={styles.serverErrorMessage}>{message}</Text>
        </View>
        {!!subMessage && (
          <View style={styles.serverErrorSubMessageContainer}>
            <Text style={styles.serverErrorSubMessage}>{subMessage}</Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    const {
      address,
      addresses,
      error,
      serverError,
      renderAnim,
      hasKeyboard,
      showAnim,
      showLoader
    } = this.state;

    const selectedAddress = address && getAddressLine(address);

    return (
      <View style={styles.container}>
        <Title text={Strings.titles.Address}/>
        <View style={styles.addressControlContainer}>
          <Dropdown
            itemCount={6}
            onChangeText={this.onAddressSelect}
            onBlur={this.onAddressPickerBlur}
            propsExtractor={this.addressPropsExtractor}
            valueExtractor={this.addressValueExtractor}
            containerStyle={styles.addressControlDropdown}
            renderBase={this.renderAddressesDropdown}
            //label='Favorite Fruit'
            value={selectedAddress}
            data={addresses}
          />
        </View>
        {!!error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {this.renderServerError()}
        {/* {renderAnim && !serverError && (
          <View style={showAnim ? styles.animContainer : styles.animContainerHidden}>
            <LottieView style={styles.pinAnim}
              source={require('@assets/animations/pin.json')}
              resizeMode={Platform.select({ android: "cover", ios: "contain"})}
              autoSize={true}
              autoPlay
              loop
            />
          </View>
        )} */}
        {!serverError && (
          <View style={styles.penguContainer}>
            <Image style={styles.mrPengu} source={require('@assets/graphics/mrPengu.png')}/>
          </View>
        )}
        <MainButton
          text={Strings.titles.OrderNow}
          normalize
          containerStyle={styles.nextButton}
          onPress={this._onGoNext}
        />
        {showLoader && <AnimatedLoader visible={showLoader}/>}
      </View>
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
    // borderColor: 'red',
    // borderWidth: 1
  },

  // loaderLottie: {
  //   width: screenWidth,
  //   height: screenWidth
  // },

  addressControlContainer: {
    width: '85%',
    flexDirection: 'row',
    borderRadius: refactorFontSize(5),
    backgroundColor: '#F9F9F9',
    borderWidth: refactorFontSize(1),
    borderColor: '#F2F2F2'
  },
  addressControlDropdown: {
    // borderWidth: 1,
    // borderColor: 'blue',
    width: '100%',
    flexDirection: 'column'
  },
  addressControlBase: {
    // borderWidth: 1,
    // borderColor: 'red',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: refactorFontSize(10),
    paddingVertical: refactorFontSize(8),
  },
  addressControlText: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 0,
    fontSize: refactorFontSize(14)
  },

  addressControlAddNew: {
    fontWeight: 'bold'
  },

  geoContainer: {
    //borderWidth: 1,
    //borderColor: 'green',
    flex: 1,
    width: '90%',
    justifyContent: 'center',
  },

  textInputContainer: {
    width: '90%',
    //justifyContent: 'center',
    borderRadius: refactorFontSize(6),
    borderWidth: 0,
    marginHorizontal: refactorFontSize(10)
  },

  textInput: {
    padding: 0,
    margin: 0,
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    //paddingLeft: 0,
    //paddingRight: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    //height: '100%'
    height: refactorFontSize(44),
    borderRadius: refactorFontSize(6),
    borderWidth: 0,
    //borderColor: 'blue',
    backgroundColor: '#EBEBEB'
  },

  errorContainer: {
    width: '80%',
    paddingVertical: refactorFontSize(20),
    //borderWidth: 1,
    //borderColor: 'red'
  },
  errorText: {
    color: '#FB6A40',
    textAlign: 'center',
    fontSize: refactorFontSize(14),
  },
  animContainerHidden: {
    display: 'none'
  },
  animContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    //marginTop: refactorFontSize(80),
    height: refactorFontSize(200),
    position: 'absolute',
    bottom: refactorFontSize(80),
    // borderWidth: 1,
    // borderColor: 'red',
  },

  nextButton: {
    position: 'absolute',
    bottom: refactorFontSize(30)
  },

  pinAnim: {
    //flex: 1,
    //width: 300,
    width: screenWidth,
    height: Platform.select({
      ios: refactorFontSize(300),
      android: refactorFontSize(200)
    }),
    aspectRatio: 1.5,
    // borderWidth: 1,
    // borderColor: 'cyan'
  },

  // Server error styles
  serverErrorContainer: {
    padding: refactorFontSize(30)
  },
  serverErrorTitleContainer: {},
  serverErrorTitle: {
    fontSize: refactorFontSize(18),
    textAlign: 'center'
  },
  serverErrorMessageContainer: {
    marginVertical: refactorFontSize(20),
  },
  serverErrorMessage: {
    fontSize: refactorFontSize(18),
    textAlign: 'center'
  },
  serverErrorSubMessageContainer: {},
  serverErrorSubMessage: {
    fontSize: refactorFontSize(18),
    textAlign: 'center'
  },

  penguContainer: {
    position: 'absolute',
    bottom: refactorFontSize(110),
    alignItems: 'center',
    justifyContent: 'center',
  },

  mrPengu: {
    opacity: .5,
    //width: '30%',
    height: refactorFontSize(180),
    resizeMode: 'contain'
  }

});

export default PickAddress;
