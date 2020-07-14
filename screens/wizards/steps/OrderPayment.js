import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity
} from 'react-native';
// import AddCardPanel from '@panels/AddCard';
import AnimatedLoader from '@components/AnimatedLoader';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { retrieveCustomer } from '@data/gateways/EveryPay';
import { Strings } from '@mrpi18n';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { showAlert } from '@mrplib/rn/components/Alert';
import { ScreenIds } from '@screens/Screens';
import { validatePhoneNumber } from '@utils/Validators';
import { getCustomerCards, resetCustomerCache } from '@data/gateways/EveryPay';
import { EventRegister } from 'react-native-event-listeners';
import { on } from '@mrplib/packages/events';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getAddressLine } from '@mrplib/data/Orders';
import { Button, ActivityIndicator } from 'react-native-paper';
import firebase from 'react-native-firebase';
import { commitOrder } from '@data/orders';
import { hasTempAddress } from '@data/firebase/UserData';
import Icon from 'react-native-vector-icons/FontAwesome';
import Title from '@components/Title';
import { refactorFontSize } from '@mrplib/rn/utils';
import { genOrderFirebaseStorageFileRef } from '@mrplib/data/Orders';
import { uniqueid } from '@mrplib/rn/utils';
import { untone } from '@mrplib/utils';
import { calculateOrderPrice } from '@mrpbrain/orders/utils';
import { Dropdown } from '@mrplib/rn/packages/react-native-material-dropdown';
import { TextField } from '@mrplib/rn/packages/react-native-material-textfield';
import {
  getServiceDisplayName,
  getServicePriceText,
  getServiceFirstComment
} from '@mrplib/data/Services';
import mrp from '@app/mrp';

// displayName:"Maria Arkouda"
// email:"lampebdubv_1556804380@tfbnw.net"
// emailVerified:false
// isAnonymous:false
// metadata: {
//   phoneNumber:null,
//   photoURL:"https://graph.facebook.com/100252184533264/picture"
//   providerData: {}
// providerId:"firebase"
// uid:"650QYhhGNGakhAXplPCEepNsqgC3"

class OrderPayment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: firebase.auth().currentUser,
      sendingOrder: false,
      hasBeenSent: false,
      paymentCard: null,
      paymentCards: [],
      addingCard: false,
      showLoader: false,
      // contactPhone: '',
      // contactPhoneError: 'You must fill phone'
    }

    this.ordersRef = firebase.firestore().collection('orders');
    this._onMessageChangeText = this._onMessageChangeText.bind(this);
    this.updateUserState = this.updateUserState.bind(this);
    this.commitOrder = this.commitOrder.bind(this);
    this._onOrderSend = this._onOrderSend.bind(this);
    this._onLoginRegisterPress = this._onLoginRegisterPress.bind(this);
    this.onCardSelect = this.onCardSelect.bind(this);
    this.onCardPickerBlur = this.onCardPickerBlur.bind(this);
    this.onCardAddCancel = this.onCardAddCancel.bind(this);
    this.onCardAddSuccess = this.onCardAddSuccess.bind(this);
    this.onOrderPhoneChange = this.onOrderPhoneChange.bind(this);
  }

  // componentDidMount() {
  //   this.authStateChangeSubscription = firebase.auth().onAuthStateChanged(user => {
  //     console.log('OrderSend::onAuthStateChanged', user && user.toJSON());
  //     this.setState({
  //       user
  //     });
  //   });
  // }

  // componentWillUnmount() {
  //   if(this.authStateChangeSubscription) {
  //     this.authStateChangeSubscription();
  //   }
  // }

  componentDidMount() {
    this.authStateChangeSubscription = firebase.auth().onAuthStateChanged(this.updateUserState);
    this.updateUserStateListener = EventRegister.addEventListener(mrp.events.auth.UserUpdate, this.updateUserState);
    this.unregisterPaymentCardsListener = EventRegister.addEventListener('EveryPay_AddNewCard', (card, customer) => {
      this.onCardAddSuccess({ card, customer });
      // console.log('ON(EveryPay_AddNewCard)', card, customer);
      // const { payload } = this.state;
      // const { everypayCustomer } = payload || {};

      // if(everypayCustomer) {
      //   const paymentCards = getCustomerCards({ customer: everypayCustomer });
      //   console.log('ON(EveryPay_AddNewCard):paymentCards', paymentCards);
      //   this.setState({ paymentCards });
      // }
    });

    console.log('OrderPayment.componentDidMount::EventRegister.addEventListener', this.unregisterPaymentCardsListener);
  }

  componentWillUnmount() {
    if(this.authStateChangeSubscription) {
      this.authStateChangeSubscription();
    }

    if(this.updateUserStateListener) {
      EventRegister.removeEventListener(this.updateUserStateListener);
    }

    if(this.unregisterPaymentCardsListener) {
      EventRegister.removeEventListener(this.unregisterPaymentCardsListener);
    }
  }

  updateUserState(user) {
    //await authUser.reload();
    console.log('OrderSend::onAuthStateChanged:authUser', user && user.toJSON());
    //console.log('SideMenu::onAuthStateChanged:currentUser', firebase.auth().currentUser && firebase.auth().currentUser.toJSON());
    //const authUser = firebase.auth().currentUser;
    this.setState({
      user: firebase.auth().currentUser
    });
  }

  _onMessageChangeText(message) {
    this.setState({message});
  }

  _onLoginRegisterPress() {
    console.log('OrdeOrderSendrSend::onLoginRegisterPress');
    showModal(ScreenIds.LoginRegister, {
      onSuccessLogin: () => {
        console.log('OrdeOrderSendrSend::onLoginRegisterPress::onSuccessLogin');
        this.setState({ showLoader: true });

        retrieveCustomer()
        .then(({ result, customer }) => {
          let paymentCards = [];
          let { payload } = this.state;
          if(result == 'success') {
            console.log('GOT login data', customer);
            const { updatePayload } = this.props;
            payload = updatePayload({ everypayCustomer: customer });
            paymentCards = getCustomerCards({ customer });
          }

          this.setState({
            payload,
            paymentCards,
            showLoader: false
          });
        })
        .catch(error => {
          console.log('OrdeOrderSendrSend::onLoginRegisterPress::retrieveCustomer:ERROR', error);
          this.setState({ paymentCards, showLoader: false });
        });

        //const { everypayCustomer: customer } = payload || {};
        //const paymentCards = getCustomerCards({ customer });
      }
    });
  }

  async commitOrder() {
    const { user, payload } = this.state;
    //const user = firebase.auth().currentUser;
    const { uid, displayName } = user;

    if(!uid) {
      showAlert({
        title: Strings.messages.YouHaveBeenLoggedOut,
        message: Strings.messages.YouMustLoginAgain
      });
      return false;
    }

    const { image, audio } = payload;

    let uploadedImageRef = null;

    if(image && 'path' in image) {
      // Uploading image to firebase

      const imageError = _ => (showAlert({
        title: Strings.messages.SomethingWentWrong,
        message: [Strings.messages.FailedToUploadImage, Strings.messages.PleaseTryAgain].join("\n")
      }), false);

      try {
        const fileId = await uniqueid();
        const uploadImageRef = genOrderFirebaseStorageFileRef({ fileId, uid, path: image.path });
        const { ref, state } = await firebase.storage().ref(uploadImageRef).putFile(image.path);

        if(state == 'success' && ref) {
          uploadedImageRef = ref;
        } else {
          return imageError();
        }
      } catch(error) {
        console.log('firebase:uploadImage:ERR', error);
        return imageError();
      }
    }

    let uploadedAudioRef = null;

    if(audio) {
      // Uploading audio to firebase

      const audioError = _ => (showAlert({
        title: Strings.messages.SomethingWentWrong,
        message: [Strings.messages.FailedToUploadAudio, Strings.messages.PleaseTryAgain].join("\n")
      }), false);

      try {
        const fileId = await uniqueid();
        const uploadAudioRef = genOrderFirebaseStorageFileRef({ fileId, uid, path: audio });
        const { ref, state } = await firebase.storage().ref(uploadAudioRef).putFile(audio);
        if(state == 'success' && ref) {
          uploadedAudioRef = ref;
        } else {
          return audioError();
        }
      } catch(error) {
        console.log('firebase:uploadAudio:ERR', error);
        return audioError();
      }
    }

    const {
      paymentCard
    } = this.state;

    const {
      ouid,
      address,
      category,
      selectedService: service,
      locationArea: area,
      message,
      everypayCustomer
    } = payload;

    console.log('async commitOrder', ouid, everypayCustomer, paymentCard);

    try {
      const newOrder = {
        uid,
        ouid,
        address,
        service,
        area,
        message,
        imageRef: uploadedImageRef,
        audioRef: uploadedAudioRef,
        everyPayCustomerId: everypayCustomer.token,
        //everyPayCardId: paymentCard.token,
        everyPayCard: paymentCard
      }

      console.log('BEFORE ORDER COMMIT::hasTempAddress', hasTempAddress());

      const { data: { result, orderId, ...rest }} = await commitOrder({
        order: newOrder,
        saveUserAddress: hasTempAddress()
      });

      console.log('commitOrder::RESP', result, orderId, rest);

      if(result == 'success') {
        this.setState({ hasBeenSent: true }, () => {
          const { setWizardStepCustomParams } = this.props;
          setWizardStepCustomParams && setWizardStepCustomParams({ showBack: false });
        });
        return true;
      } else {
        const { reason } = rest || {};
        if(reason == 'cant-calc-service-worth') {
          showAlert({
            title: Strings.messages.SomethingWentWrong,
            message: Strings.messages.CantCalcService
          });
        } else {
          showAlert({
            title: Strings.messages.SomethingWentWrong,
            message: Strings.messages.NoPaymentInformatgionFound
          });
        }
        return false;
      }
    } catch(error) {
      console.log('commitOrder::ERROR', error, JSON.stringify(error));
      showAlert({
        title: Strings.messages.SomethingWentWrong,
        message: [Strings.messages.ErrorWhileProcessingOrder, Strings.messages.PleaseTryAgain].join("\n")
      });
      return false;
    }
  }

  _onOrderSend() {
    const { paymentCard, sendingOrder, contactPhone } = this.state;

    if(sendingOrder) return;

    // if(contactPhone.replace(/[ \t\r]+/g,"").length == 0) {
    //   this.setState({ contactPhoneError: Strings.messages.InputValidNumber });
    //   return;
    // }

    // if(!validatePhoneNumber({ number: contactPhone })) {
    //   this.setState({ contactPhoneError: Strings.messages.InputValidNumber });
    //   return;
    // }

    if(!paymentCard) {
      showAlert({ title: Strings.messages.YouMustSelectPaymentMethod });
      return;
    }

    this.setState({
      sendingOrder: true
    }, async () => {
      const commitOrderResult = await this.commitOrder();
      console.log('_onOrderSend::commitOrderResult', commitOrderResult);
      this.setState({ sendingOrder: false });
    });
  }

  setPayload(payload) {
    console.log('OrderSend::setPayload', payload);

    const { everypayCustomer } = payload || {};
    const paymentCards = getCustomerCards({ customer: everypayCustomer });

    // if(everypayCustomer && 'cards' in everypayCustomer && everypayCustomer.cards.data.length > 0) {
    //   paymentCards = [...everypayCustomer.cards.data];
    // }

    this.setState({ payload, paymentCards });
  }

  renderPreloading() {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator animating={true} size={160} color={mrp.colors.mrPengu.purple} />
      </View>
    );
  }

  renderError() {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorHeading}>{Strings.messages.SomethingWentWrong}</Text>
        <Text style={styles.errorMessage}>{Strings.messages.PleaseTryAgain}</Text>
      </View>
    )
  }

  onCardSelect(value, index, data) {
    const paymentCard = data[index];

    if(!paymentCard.addNew) {
      this.setState({ paymentCard });
    } else {
      this.openNewCardPicker = true;
    }
  }

  onCardPickerBlur() {
    if(this.openNewCardPicker) {
      this.openNewCardPicker = false;
      //this.setState({ addingCard: true });
      showModal(ScreenIds.AddCard, {
        onCancel: this.onCardAddCancel,
        //onSuccessAdd: this.onCardAddSuccess
      });
      // showModal(ScreenIds.Addresses, { listingMode: false, onAddressSelect: address => {
      //   console.log('got new address', address);
      //   this.setState({ address }, () => this.processSelectedAddress);
      // }});
    }
  }

  onCardAddCancel() {
    console.log('onCardAddCancel');
    this.setState({ addingCard: false });
  }

  onCardAddSuccess({ card: inputCard, customer }) {
    let card;
    if(inputCard) {
      card = inputCard;
    } else if(customer && 'card' in customer) {
      card = customer.card;
    } else {
      return false;
    }

    let { payload } = this.state;
    let { everypayCustomer } = payload;

    console.log('onCardAddSuccess', card, everypayCustomer, payload, paymentCards);

    if(everypayCustomer && 'cards' in everypayCustomer && 'data' in everypayCustomer.cards) {
      everypayCustomer.cards.data.push(card);
    }

    const { updatePayload } = this.props;
    updatePayload && updatePayload({ everypayCustomer });

    const paymentCards = getCustomerCards({ customer: everypayCustomer });
    resetCustomerCache();
    this.setState({
      paymentCard: card,
      paymentCards,
      addingCard: false
    });
  }

  onOrderPhoneChange(contactPhone) {
    this.setState({ contactPhoneError: false, contactPhone });
  }

  renderOrderDetails() {
    const {
      user,
      payload,
      paymentCards,
      // contactPhone,
      // contactPhoneError
    } = this.state;

    if(!payload) return this.renderError();

    const { displayName } = user || {};
    const {
      address,
      category,
      message,
      image,
      audio,
      selectedService: service,
      locationArea: area,
      everypayCustomer
    } = payload || {};

    const addressLine = getAddressLine(address);
    const serviceDisplayName = getServiceDisplayName({ nameId: category });

    let serviceMessage = getServiceFirstComment(service);
    let priceText = getServicePriceText(calculateOrderPrice({ area, service, address }));

    let cardsData = [...paymentCards, { addNew: true }];

    const _renderPaymentMethodsDropdown = ({ title, value, renderAccessory, ...other }) => {
      console.log('_renderPaymentMethodsDropdown', title, value, other);

      const { paymentCard } = this.state;
      let text = paymentCard ? paymentCard.friendly_name : Strings.placeholders.SelectPaymentMethod

      return (
        <View style={styles.payWithControlBase}>
          <Text ellipsizeMode="tail" numberOfLines={1}
            style={styles.payWithControlText}>{text}</Text>{renderAccessory()}
        </View>
      );
    }

    const _paymentMethodsValueExtractor = (item, index) => {
      //console.log('addressValueExtractor', item, index, item.addNew);
      return item.addNew ? Strings.placeholders.AddCreditDebitCard : item.friendly_name;
    }

    const _paymentsPropsExtractor = (item, index) => {
      //console.log('PropsExtractor', item, index);
      return item.addNew ? { color: '#F9F9F9' } : {};
    }

    return (
      <View key="order-details" style={styles.orderDetailsContainer}>
        {user && (<DetailsLine label={Strings.titles.FullName} text={displayName} />)}
        {/* <DetailsLine label={Strings.titles.PayWith} style={styles.messageContainer} component={}/> */}
        <DetailsLine label={Strings.titles.Address} text={addressLine} />
        <View style={{
          flexDirection: 'row'
        }}>
          <DetailsLine style={{ flex: 1 }} label={Strings.titles.Category} text={serviceDisplayName.replace("\n", ' ')}/>
          <DetailsLine style={{ flex: 0, width: '30%' }} label={Strings.titles.Charge} text={priceText} />
        </View>
        {/* {serviceMessage && (
          <View style={{
            marginBottom: refactorFontSize(10)
          }}>
            <Text style={{
              fontSize: refactorFontSize(14),
              color: '#F2AA00'
            }}>{serviceMessage}</Text>
          </View>
        )} */}
        {!!message && <DetailsLine label={Strings.titles.OrderMessage} text={message} style={styles.messageContainer} />}
        {!!image && <DetailsLine label={Strings.titles.ImageAttachment} image={image} style={styles.messageContainer} />}
        {!!audio && <DetailsLine label={Strings.titles.AudioMessage} text={Strings.titles.WithAudioMessage} style={styles.messageContainer} />}
        {/* <DetailsLine label={Strings.titles.ContactPhone} style={styles.messageContainer}/>
        <View style={styles.contactPhoneContainer}>
          <TextInput
            keyboardType="phone-pad"
            style={styles.contactPhoneInput}
            placeholder={Strings.placeholders.FillContactPhoneNumber}
            onChangeText={this.onOrderPhoneChange}
            value={contactPhone}
          />
          {!!contactPhoneError && <Text style={styles.textInputError}>{
            contactPhoneError === true ? Strings.messages.RequiredField : contactPhoneError
          }</Text>}
        </View> */}
        {!!user && (
          <DetailsLine label={Strings.titles.PayWith} style={styles.messageContainer} component={
            <View style={styles.payWithControlContainer}>
              <Dropdown
                itemCount={4}
                onChangeText={this.onCardSelect}
                onBlur={this.onCardPickerBlur}
                propsExtractor={_paymentsPropsExtractor}
                valueExtractor={_paymentMethodsValueExtractor}
                containerStyle={styles.payWithControlDropdown}
                renderBase={_renderPaymentMethodsDropdown}
                data={cardsData}
              />
            </View>
          }/>
        )}
      </View>
    );
  }

  renderSendOrLoginButton() {
    const { user, sendingOrder } = this.state;
    return (
      <View key="send-login-buttons" style={styles.buttonContainer}>
        {user ? (
          <Button style={styles.sendOrderButton}
            contentStyle={styles.buttonContentStyle}
            icon="send"
            dark={false}
            onPress={this._onOrderSend}
            loading={sendingOrder}
            mode="contained">{untone(Strings.titles.SendOrder)}</Button>
        ) : (
          <Button style={styles.loginButton}
            contentStyle={styles.buttonContentStyle}
            dark={false}
            icon="account-circle"
            onPress={this._onLoginRegisterPress}
            mode="contained">{untone(Strings.titles.LoginRegister)}</Button>
        )}
      </View>
    );
  }

  renderOrderSending() {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator animating={true} size={160} color={mrp.colors.mrPengu.purple} />
      </View>
    );
  }


  renderController() {
    const { payload, hasBeenSent } = this.state;

    if(!payload) return this.renderError();

    return (
      <>
        <Title key="header-title" bottomSpacing={20} text={hasBeenSent ?
          Strings.titles.OrderHasBeenSent :
          Strings.titles.OrderCheck}
        />
        {hasBeenSent ? (
          <>
            <View key="soon-there" style={styles.soonThereContainer}>
              <Text style={styles.soonThereText}>{Strings.titles.SoonWeWillBeThere}</Text>
            </View>
            <View key="success-icon" style={styles.checkContainer}>
              <Icon name="check" size={70} color="white" />
            </View>
            <View key="thank-you" style={styles.thankYouContainer}>
              <Text style={styles.thankYouText}>{Strings.titles.ThankYou}</Text>
            </View>
          </>
        ) : (
          <>
            {this.renderOrderDetails()}
            {this.renderSendOrLoginButton()}
          </>
        )}
      </>
    );
  }

  render() {
    const { addingCard, showLoader, hasBeenSent } = this.state;
    const { closeWizard } = this.props;
    return (
      <>
        <KeyboardAwareScrollView style={styles.withFlex}>
          <View style={styles.container}>
            {this.renderController()}
          </View>
        </KeyboardAwareScrollView>
        {/* <Modal
          transparent={true}
          visible={addingCard}
          onDismiss={() => { this.setState({ addingCard: false })}}
        >
          <AddCardPanel onCancel={this.onCardAddCancel} onSuccessAdd={this.onCardAddSuccess}/>
        </Modal> */}
        {hasBeenSent && (
          <View key="close-button" style={styles.closeButtonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              closeWizard && closeWizard();
            }}>
              <Text style={styles.closeButtonText}>{untone(Strings.titles.Close.toUpperCase())}</Text>
            </TouchableOpacity>
          </View>
        )}
        {showLoader && <AnimatedLoader visible={showLoader}/>}
      </>
    );
  }
}

// function DetailsLine({
//   label,
//   text,
//   message,
//   image,
//   component,
//   style,
//   messageStyle
// }) {
//   return (
//     <View style={[styles.lineContainer, style]}>
//       <Text style={styles.lineLabel}>{label}</Text>
//       {!!image && <Image source={{ uri: image.path }} style={styles.assetImage} resizeMode='contain'/>}
//       {!!text && <Text style={styles.lineText}>{text}</Text>}
//       {!!message && <Text style={[styles.lineMessage, messageStyle]}>{message}</Text>}
//       {component}
//     </View>
//   );
// }

const styles = StyleSheet.create({
  withFlex: {
    flex: 1
  },
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    //backgroundColor: 'white'
    // borderColor: 'green',
    // borderWidth: 1
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: refactorFontSize(120),
    height: refactorFontSize(120),
    backgroundColor: 'green',
    borderRadius: refactorFontSize(100),
    marginBottom: refactorFontSize(20),
    marginTop: refactorFontSize(50)
  },
  thankYouContainer: {
    marginTop: refactorFontSize(40)
  },
  thankYouText: {
    ...mrp.styles.baseTitle,
  },

  soonThereContainer: {

  },
  soonThereText: {
    ...mrp.styles.baseTitle,
    fontSize: refactorFontSize(14),
  },

  activityIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  orderDetailsContainer: {
    width: '80%'
  },

  contactPhoneContainer: {
    marginBottom: refactorFontSize(10)
  },
  contactPhoneInput: {
    height: 'auto',
    borderColor: 'lightgrey',
    borderWidth: refactorFontSize(1),
    padding: refactorFontSize(10),
    borderRadius: refactorFontSize(4),
    marginBottom: refactorFontSize(4)
  },

  textInputError: {
    color: 'firebrick',
    fontSize: refactorFontSize(12)
  },

  // lineContainer: {
  //   marginBottom: 10
  // },
  // lineLabel: {
  //   fontSize: refactorFontSize(14)
  // },
  // lineText: {
  //   fontSize: refactorFontSize(15),
  //   color: '#222222'
  // },
  // lineMessage: {
  //   fontSize: refactorFontSize(14),
  //   color: '#F2AA00'
  // },

  assetImage: {
    // borderWidth: 1,
    // borderColor: 'red',
    height: refactorFontSize(70),
    // flex: 1,
    width: refactorFontSize(70),
    // height: null,
    // height: refactorFontSize(70),
    // width: refactorFontSize(35),
    //borderRadius: refactorFontSize(5)
  },

  buttonContainer: {
    marginTop: 20
  },
  buttonContentStyle: {
    paddingVertical: 15,
    paddingHorizontal: 10
  },

  buttonCloseContentStyle: {
    paddingVertical: 15,
    paddingHorizontal: 10
  },

  loginButton: {
    backgroundColor: mrp.colors.mrPengu.orange
  },
  sendOrderButton: {
    backgroundColor: mrp.colors.mrPengu.orange
  },

  closeButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: mrp.colors.mrPengu.orange,
    borderRadius: refactorFontSize(5)
  },

  closeButtonText: {
    color: 'black',
    fontSize: refactorFontSize(15)
  },

  payWithControlContainer: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: refactorFontSize(5),
    backgroundColor: '#F9F9F9',
    borderWidth: refactorFontSize(1),
    borderColor: '#F2F2F2',
    marginTop: refactorFontSize(5),
  },
  payWithControlDropdown: {
    // borderWidth: 1,
    // borderColor: 'blue',
    width: '100%',
    flexDirection: 'column'
  },

  payWithControlBase: {
    // borderWidth: 1,
    // borderColor: 'red',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: refactorFontSize(10),
    paddingVertical: refactorFontSize(8),
  },
  payWithControlText: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 0,
    fontSize: refactorFontSize(14),
    fontWeight: 'bold'
  },

  payWithControlAddNew: {
    fontWeight: 'bold'
  },
});

export default OrderPayment;
