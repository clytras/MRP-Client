import React from 'react';
import {
  StyleSheet,
  Keyboard,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import {
  MKTextField,
  MKColor
} from 'react-native-material-kit';
import firebase from 'react-native-firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EventRegister } from 'react-native-event-listeners';
import { addTempAddress } from '@data/firebase/UserData';
import { validateRegister } from '@utils/Validators';
import { showAlert, closeAlert } from '@mrplib/rn/components/Alert';
import { dismissModal, Drawer } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import { refactorFontSize } from '@mrplib/rn/utils';
import { untone } from '@mrplib/utils';
import { registerUser } from '@mrplib/rn/utils/Auth';
import mrp from '@app/mrp';

import {
  CustomTextField,
  TextFieldError,
  SocialButton,
  errorColorIf,
  handleFacebookLogin,
  handleGoogleLogin,
  styles as commonStyles
} from '@panels/Login';


export default class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      surname: '',
      email: '',
      password: '',
      passwordConfirm: '',
      validation: {
        messages: [],
        errors: [],
        err: {}
      }
    }

    this._onFacebookLogin = handleFacebookLogin.bind(this);
    this._onGoogleLogin = handleGoogleLogin.bind(this);
    this._onDoRegister = this._onDoRegister.bind(this);
    this._onSuccessLogin = this._onSuccessLogin.bind(this);
  }

  _onDoRegister() {
    const validation = validateRegister(this.state);

    console.log('_onDoRegister', validation);

    if(validation.valid) {
      // showAlert({
      //   title: Strings.messages.IssuesFound,
      //   customView: <MessageLines messages={check.messages}/>
      // });
      Keyboard.dismiss();
      console.log('registering');

      // registerUser(this.state, () => {
      //   showAlert({
      //     title: Strings.titles.Registration,
      //     showProgress: true,
      //     showConfirmButton: false
      //   });
      // }, () => closeAlert())

      showAlert({
        title: Strings.titles.Registration,
        showProgress: true,
        showConfirmButton: false
      }).then(async () => {
        try {
          const { ok, error } = await registerUser(this.state);
          if(ok) {
            console.log('Register:registerUser:success');
            //addTempAddress();
            EventRegister.emit(mrp.events.auth.UserUpdate, firebase.auth().currentUser);
            closeAlert();
            const { componentId, onSuccessRegister } = this.props;
            dismissModal(componentId);
            onSuccessRegister && onSuccessRegister();
          } else {
            // error.code == auth/email-already-in-use
            console.log('Register:registerUser:error', error.code, error.message);
            await closeAlert();
            showAlert({
              title: 'Registration error',
              message: error.message
            });
          }
          //closeAlert();
        } catch(error) {
          console.log('Register:registerUser:error', error.code);
          await closeAlert();
          const message = rnfAuthErrorMessage({
            error,
            defaultMessage: Strings.messages.SomethingWentWrong
          });
          showAlert({
            title: Strings.messages.RegistrationFailure,
            message
          });
        }
      });

    } else {
      // showOverlay('Alert', {
      //   title: Strings.messages.IssuesFound,
      //   message: 'There are no errors!'
      // });
      this.setState({ validation });
    }
  }

  _onTextChange(fieldName, value) {
    const { validation } = this.state;

    if(fieldName in validation.err) {
      delete validation.err[fieldName];
    }

    this.setState({
      [fieldName]: value,
      validation
    });
  }

  _onSuccessLogin() {
    //addTempAddress();
    const { componentId, onSuccessLogin } = this.props;
    onSuccessLogin && onSuccessLogin();
  }

  render() {
    let {
      name,
      surname,
      email,
      password,
      passwordConfirm,
      validation: {
        errors,
        err
      }
    } = this.state;

    const nameError = 'name' in err && err.name.error;
    const surnameError = 'surname' in err && err.surname.error;
    const emailError = 'email' in err && err.email.error;
    const passwordError = 'password' in err && err.password.error;
    const passwordConfirmError = 'passwordConfirm' in err && err.passwordConfirm.error;

    return (
      <>
        <KeyboardAwareScrollView style={commonStyles.withFlex}>
          <View style={commonStyles.container}>
            <View style={commonStyles.buttonsContainer}>
              <Text style={commonStyles.connectWithText}>{Strings.titles.RegisterWith}</Text>
              <SocialButton text="FACEBOOK"
                iconName="facebook-box"
                style={commonStyles.connectWithButton}
                onPress={this._onFacebookLogin}
              />
              <SocialButton text="GOOGLE"
                iconName="google"
                style={commonStyles.connectWithButton}
                onPress={this._onGoogleLogin}
              />
            </View>
            <CustomTextField placeholder={Strings.titles.Name}
              style={[commonStyles.inputTextField, commonStyles.inputWithError]}
              autoCapitalize="none"
              autoCorrect={false}
              value={name}
              tintColor={errorColorIf(nameError)}
              highlightColor={errorColorIf(nameError)}
              onTextChange={this._onTextChange.bind(this, 'name')}
            />
            <TextFieldError error={nameError}/>
            <CustomTextField placeholder={Strings.titles.Surname}
              autoCapitalize="none"
              autoCorrect={false}
              value={surname}
              tintColor={errorColorIf(surnameError)}
              highlightColor={errorColorIf(surnameError)}
              onTextChange={this._onTextChange.bind(this, 'surname')}
            />
            <TextFieldError error={surnameError}/>
            <CustomTextField placeholder={Strings.titles.EMail}
              keyboardType='email-address'
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              tintColor={errorColorIf(emailError)}
              highlightColor={errorColorIf(emailError)}
              onTextChange={this._onTextChange.bind(this, 'email')}
            />
            <TextFieldError error={emailError}/>
            <CustomTextField placeholder={Strings.titles.Password}
              password
              value={password}
              tintColor={errorColorIf(passwordError)}
              highlightColor={errorColorIf(passwordError)}
              onTextChange={this._onTextChange.bind(this, 'password')}
            />
            <TextFieldError error={passwordError}/>
            <CustomTextField placeholder={Strings.titles.PasswordConfirmation}
              password
              value={passwordConfirm}
              tintColor={errorColorIf(passwordConfirmError)}
              highlightColor={errorColorIf(passwordConfirmError)}
              onTextChange={this._onTextChange.bind(this, 'passwordConfirm')}
            />
            <TextFieldError error={passwordConfirmError}/>
          </View>
        </KeyboardAwareScrollView>
        <TouchableOpacity style={commonStyles.loginButton} onPress={this._onDoRegister}>
          <Text style={commonStyles.loginButtonText}>{untone(Strings.titles.Register.toUpperCase())}</Text>
        </TouchableOpacity>
      </>
    );
  }
}


const styles = StyleSheet.create({
  errorPlaceHolder: {
    width: '90%',
    marginTop: refactorFontSize(5)
  },
  errorText: {
    color: 'red'
  },


  container: {
    flex: 1,
    //backgroundColor: 'red',
    // borderWidth: 1,
    // borderColor: 'green',
    alignItems: 'center',
    //justifyContent: 'center',
    //flexDirection: 'row',
  },
  textInputStyle: {
    color: 'white'
  },
  buttonsContainer: {
    //borderWidth: 1,
    //borderColor: 'red',
    width: '100%',
    alignItems: 'center'
  },
  connectWithText: {
    fontSize: refactorFontSize(18),
    marginTop: refactorFontSize(24),
    color: 'white'
  },
  connectWithButton: {
    width: '70%'
  },
  loginButton: {
    width: '100%',
    //position: 'absolute',
    //bottom: 0,
    height: refactorFontSize(30),
    backgroundColor: mrp.colors.mrPengu.orange
  },
  loginButtonText: {
    fontSize: refactorFontSize(20),
    color: mrp.colors.mrPengu.black
  }
});
