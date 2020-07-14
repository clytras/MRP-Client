import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect
} from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import firebase from 'react-native-firebase';
import FastImage from 'react-native-fast-image';
import PhoneInput from 'react-native-phone-input';
import ViewBase from '@mrplib/rn/components/ViewBase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextField } from '@mrplib/rn/packages/react-native-material-textfield';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { removeAllWhitespaces } from '@mrplib/utils';
import MainButton from '@components/MainButton';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { ScreenIds } from '@screens/Screens';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { validatePhoneNumber } from '@utils/Validators';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { getCardName } from '@mrplib/data/Payments';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({
  componentId,
  // user: {
  //   displayName:inputDisplayName = '',
  //   phoneNumber:inputPhoneNumber = ''
  // }
  ...props
}) {

  // const user = firebase.auth().currentUser;
  // const

  console.log('Profile Editor', props);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState('30');
  //const [phoneCountryFieldRef] = useRef(null);
  const [phoneCountryFieldRef, setPhoneCountryFieldRef] = useState(null);

  const [photoSource, setPhotoSource] = useState(null);
  const [providerId, setProviderId] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useLayoutEffect(() => {
    const user = firebase.auth().currentUser;
    const {
      email,
      displayName,
      phoneNumber: profilePhoneNumber,
      photoURL,
      //providerId,
      providerData
    } = user;

    console.log('Profile user', user, providerId);

    setEmail(email);
    setDisplayName(displayName);

    // const [{ providerId } = {}] = providerData || [];
    // setProviderId(providerId);

    let finalProviderId;
    // let hasPasswordProvider = false;
    for(let provider of providerData) {
      const { providerId } = provider;
      if(/password/i.test(providerId)) {
        finalProviderId = providerId;
        break;
      } else if(/facebook|google/i.test(providerId)) {
        finalProviderId = providerId;
      }
    }

    setProviderId(finalProviderId);

    if(photoURL) {
      setPhotoSource({ uri: photoURL });
    }

    if(profilePhoneNumber) {
      const parsePhoneNumber = parsePhoneNumberFromString(profilePhoneNumber);

      if(parsePhoneNumber) {
        const { countryCallingCode, nationalNumber } = parsePhoneNumber;
        if(countryCallingCode) {
          setPhoneNumberCountryCode(countryCallingCode);
        }

        if(nationalNumber) {
          setPhoneNumber(nationalNumber);
        }
      }
    }
  }, []);


  async function onSaveProfile() {
    if(updatingProfile) return;

    console.log('onSaveProfile', phoneCountryFieldRef.getCountryCode(), phoneCountryFieldRef.getValue());

    let newDisplayName = displayName ? displayName.trim() : '';

    if(newDisplayName.length == 0) {
      setDisplayNameError(Strings.formatString(
        Strings.messages.Fields.MustNotBeEmpty, {
          field: Strings.titles.Name.toLowerCase()
        }
      ));
      return;
    }

    setDisplayNameError('');

    if(!validatePhoneNumber({
      number: phoneNumber,
      minLength: 10,
      maxLength: 10
    })) {
      setPhoneNumberError(Strings.titles.WrongPhoneNumber);
      return;
    }

    setPhoneNumberError('');
    setUpdatingProfile(true);

    const selectedCountryCode = phoneCountryFieldRef.getValue();
    let newPhoneNumber = `${selectedCountryCode} ${phoneNumber}`;

    console.log('NEW PHONE NUM', newPhoneNumber);

    const usersUpdateMyProfile = firebase.functions('europe-west1')
      .httpsCallable('users-updateMyProfile');

    try {
      const response = await usersUpdateMyProfile({
        displayName: newDisplayName,
        phoneNumber: newPhoneNumber
      });

      const {
        data: {
          result,
          error: {
            errorInfo: {
              code
            } = {}
          } = {}
        } = {}
      } = response || {};

      console.log('onSaveProfile::SUCCESS', response, code);

      if(result != 'success') {
        if(code == 'auth/phone-number-already-exists') {
          showAlert({
            title: Strings.messages.DataNotSaved,
            message: Strings.messages.PhoneNumberInUse
          });
        } else {
          showAlert({
            title: Strings.messages.DataNotSaved,
            message: Strings.messages.CheckDataAndTryAgain
          });
        }
      } else {
        firebase.auth().currentUser.reload()
        .then(() => {
            console.log(firebase.auth().currentUser);
        }).catch(error => console.log('Error reloading user'));
      }
    } catch(error) {
      console.log('onSaveProfile::ERROR', error);
    } finally {
      setUpdatingProfile(false);
    }
  }

  function onCloseModal() {
    dismissModal(componentId);
  }

  function onChangePhoneNumberCountryCode(value) {
    console.log('onChangePhoneNumberCountryCode', value);
    //setPhoneNumberCountryCode(value);
    setIsDirty(true);
  }

  function onChangePhoneNumberCountryCodeCountry(value) {
    console.log('onChangePhoneNumberCountryCodeCountry', value);
    //phoneCountryFieldRef.selectCountry(value);
    setIsDirty(true);
  }

  function onChangeDisplayName(value) {
    setDisplayName(value)
    setIsDirty(true);
  }

  function onChangePhoneNumber(value) {
    setPhoneNumber(value);
    setPhoneNumberError('');
    setIsDirty(true);
  }

  function onChangePasswordPress() {
    showModal(ScreenIds.ChangePassword);
  }

  function renderSelectAuthProvider() {
    if(providerId == 'password') {
      return (
        <TouchableOpacity style={styles.fieldButton} onPress={onChangePasswordPress}>
          <View style={[styles.fieldDecorator, styles.fieldDecoratorNoPadding]}>
            <Ionicon style={styles.fieldIcon} name={ionicIcon('lock')} />
          </View>
          <Text>{Strings.titles.ChangePassword}</Text>
        </TouchableOpacity>
      );
    }

    let provider, icon;

    if(/facebook/i.test(providerId)) {
      provider = 'Facebook';
      icon = 'facebook';
    } else if(/google/i.test(providerId)) {
      provider = 'Google';
      icon = 'google';
    } else {
      return null;
    }

    return (
      <View style={styles.fieldButton}>
        <View style={[styles.fieldDecorator, styles.fieldDecoratorNoPadding]}>
          <MaterialCommunityIcon style={styles.fieldIcon} name={icon}/>
        </View>
        <Text>{`${Strings.titles.YouHaveConnectedThrough} ${provider}`}</Text>
      </View>
    );
  }

  return (
    <ViewBase
      navigationComponentId={componentId}
      showDrawerButton={false}
      backCloseIcon={true}
      isModal={true}
      headerText={Strings.titles.EditProfile}
      onBackButtonPress={onCloseModal}
    >
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            {photoSource ? (
              <FastImage
                // onLoad={onImageLoad}
                style={styles.avatarImage}
                source={photoSource}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <Text style={[styles.fontIcon, styles.userIcon]}>{mrp.fonts.mrPengu.iconUser.glyph}</Text>
            )}
            <Text style={styles.avatarEmail}>{email}</Text>
          </View>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldDecorator}>
              <Ionicon style={styles.fieldIcon} name={ionicIcon('person')} />
            </View>
            <View style={styles.fieldName}>
              <TextField
                label={`* ${Strings.titles.Name}`}
                multiline={false}
                autoCapitalize="none"
                value={displayName}
                error={displayNameError}
                onChangeText={onChangeDisplayName}
              />
            </View>
          </View>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldDecorator}>
              <Ionicon style={styles.fieldIcon} name={ionicIcon('call')} />
            </View>
            <PhoneInput ref={ref => setPhoneCountryFieldRef(ref)}
              //initialCountry="gr"
              //value={phoneNumberCountryCode}
              value="+30"
              style={{
                marginBottom: 17,
                alignItems: 'flex-end',
                width: 80
              }}
              textStyle={{
                fontSize: 15
              }}
              onChangePhoneNumber={onChangePhoneNumberCountryCode}
              onSelectCountry={onChangePhoneNumberCountryCodeCountry}

            />
            <View style={styles.fieldNumber}>
              <TextField
                label={`${Strings.titles.PhoneNumber}`}
                multiline={false}
                maxLength={10}
                value={phoneNumber}
                error={phoneNumberError}
                onChangeText={onChangePhoneNumber}
              />
            </View>
          </View>
          <View style={[styles.fieldsRow, styles.buttonsContainer]}>
            {renderSelectAuthProvider()}
          </View>
        </View>
      </KeyboardAwareScrollView>
      {isDirty && (
        <MainButton
          loading={updatingProfile}
          text={Strings.titles.Save}
          normalize
          containerStyle={styles.saveButton}
          onPress={onSaveProfile}
        />
      )}
    </ViewBase>
  );
}


const styles = StyleSheet.create({
  withFlex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    margin: refactorFontSize(14),
    marginTop: 0,
    paddingBottom: refactorFontSize(20)
  },

  avatarContainer: {
    marginTop: refactorFontSize(20),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: refactorFontSize(70),
    height: refactorFontSize(70),
    borderRadius: refactorFontSize(100),
  },
  avatarEmail: {
    marginTop: refactorFontSize(16),
    fontWeight: 'bold',
    textAlign: 'center'
  },
  userIcon: {
    fontSize: refactorFontSize(50),
    marginRight: refactorFontSize(12)
  },
  fontIcon: {
    fontFamily: 'MrPengu',
    color: 'black'
  },

  fieldsRow: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  fieldFull: {
    flex: 1
  },
  fieldDecorator: {
    flex: 0,
    paddingRight: 10,
    justifyContent: 'flex-end',
    // borderWidth: 1,
    // borderColor: 'red',
    paddingBottom: refactorFontSize(10)
  },
  fieldDecoratorNoPadding: {
    paddingBottom: 0,
    // borderWidth: 1,
    // borderColor: 'blue',
    alignItems: 'center'
  },
  fieldIcon: {
    fontSize: 24,
    color: 'grey'
  },
  fieldName: {
    flex: 1,
  },
  fieldNumber: {
    flex: 1
  },

  buttonsContainer: {
    marginTop: 30
  },
  fieldButton: {
    //     borderWidth: 1,
    // borderColor: 'red',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },


  saveButton: {
    position: 'absolute',
    bottom: refactorFontSize(30 + getBottomSpace())
  },
});
