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
import { validateChangePassword } from '@utils/Validators';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { getCardName } from '@mrplib/data/Payments';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({
  componentId
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  // const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  // const [validation, setValidation] = useState({
  //   messages: [],
  //   errors: [],
  //   err: {}
  // });
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);


  console.log('Change password');

  useLayoutEffect(() => {
  }, []);

  const handleCurrentChange = v => {
    setCurrentPassword(v);
    // setCurrentPasswordError('');
    setIsDirty(v.length > 0);
  }

  const handleNewChange = v => {
    setNewPassword(v);
    setNewPasswordError('');
    //setIsDirty(true);
  }

  const handleConfirmChange = v => {
    setConfirmPassword(v);
    setConfirmPasswordError('');
    //setIsDirty(true);
  }

  async function onChangePassword() {
    if(loading) return;

    // console.log('onSaveProfile', phoneCountryFieldRef.getCountryCode(), phoneCountryFieldRef.getValue());

    const validation = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword
    });

    console.log('onChangePassword', validation);

    // setValidation(validation);

    if(!validation.valid) {
      const { err } = validation;
      console.log('CHANGE ERRORS', 'confirm' in err && err.confirm.error);

      // setCurrentPasswordError('current' in err && err.current.error);
      setNewPasswordError('new' in err && err.new.error);
      setConfirmPasswordError('confirm' in err && err.confirm.error);
      return;
    }

    console.log('Chaning PASSWORD');

    // setCurrentPasswordError('');
    setLoading(true);
    setNewPasswordError('');
    setConfirmPasswordError('');

    const user = firebase.auth().currentUser;
    const { email } = user;

    console.log('Got user email', email, currentPassword, newPassword);

    firebase.auth()
    .signInWithEmailAndPassword(email, currentPassword)
    .then(function(user) {
      firebase.auth().currentUser.updatePassword(newPassword)
      .then(function(){
        setLoading(false);
        dismissModal(componentId);
      }).catch(function(err){
        setLoading(false);
        showAlert({
          title: Strings.messages.SomethingWentWrong,
          message: Strings.messages.CouldNotChangePassword
        });
      });
    }).catch(function(err){
      setLoading(false);
      showAlert({
        title: Strings.messages.SomethingWentWrong,
        message: Strings.messages.CouldNotConfirmCurrentPassword
      });
    });
  }

  function onCloseModal() {
    dismissModal(componentId);
  }

  return (
    <ViewBase
      navigationComponentId={componentId}
      showDrawerButton={false}
      backCloseIcon={true}
      isModal={true}
      headerText={Strings.titles.ChangePassword}
      onBackButtonPress={onCloseModal}
    >
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldDecorator}>
              <Ionicon style={styles.fieldIcon} name={ionicIcon('lock')} />
            </View>
            <View style={styles.fieldName}>
              <TextField
                label={Strings.titles.CurrentPassword}
                multiline={false}
                secureTextEntry={true}
                autoCapitalize="none"
                value={currentPassword}
                // error={currentPasswordError}
                onChangeText={handleCurrentChange}
              />
            </View>
          </View>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldDecorator}>
              <Ionicon style={styles.fieldIcon} name={ionicIcon('key')} />
            </View>
            <View style={styles.fieldName}>
              <TextField
                label={Strings.titles.NewPassword}
                multiline={false}
                secureTextEntry={true}
                autoCapitalize="none"
                value={newPassword}
                error={newPasswordError}
                onChangeText={handleNewChange}
              />
            </View>
          </View>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldDecorator}>
              <Ionicon style={styles.fieldIcon} name={ionicIcon('key')} />
            </View>
            <View style={styles.fieldName}>
              <TextField
                label={Strings.titles.PasswordConfirmation}
                multiline={false}
                secureTextEntry={true}
                autoCapitalize="none"
                value={confirmPassword}
                error={confirmPasswordError}
                onChangeText={handleConfirmChange}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      {isDirty && (
        <MainButton
          loading={loading}
          text={Strings.titles.ChangePassword}
          normalize
          containerStyle={styles.saveButton}
          onPress={onChangePassword}
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
