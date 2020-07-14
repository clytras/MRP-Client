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
import { addTempAddress } from '@data/firebase/UserData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import isEmail from 'validator/lib/isEmail';
import { dismissModal, Drawer } from '@mrplib/rn/helpers/rnn';
import { showAlert, closeAlert } from '@mrplib/rn/components/Alert';
import MessageLines from '@mrplib/rn/components/MessageLines';
import { Strings } from '@mrplib/i18n/rn';
import { refactorFontSize } from '@mrplib/rn/utils';
import { untone } from '@mrplib/utils';
import { validateLogin } from '@utils/Validators';
import { facebookLogin, googleLogin, emailLogin, rnfAuthErrorMessage } from '@mrplib/rn/utils/Auth';
import mrp from '@app/mrp';

export const styles = StyleSheet.create({
  withFlex: {
    flex: 1
  },
  container: {
    flex: 1,
    //backgroundColor: 'red',
    //borderWidth: 1,
    //borderColor: 'red',
    alignItems: 'center',
    //justifyContent: 'center',
    //flexDirection: 'row',
    paddingBottom: refactorFontSize(20)
  },

  errorPlaceHolder: {
    // borderWidth: 1,
    // borderColor: 'red',
    width: '90%',
    marginTop: refactorFontSize(5)
  },
  errorText: {
    color: 'red',
    fontSize: refactorFontSize(12)
  },
  inputWithError: {
    marginTop: refactorFontSize(0)
  },
  inputTextField: {
    // borderWidth: 1,
    // borderColor: 'red',
    marginTop: refactorFontSize(0),
    //borderWidth: 1,
    //borderColor: 'green',
    width: '90%',
    //color: 'yellow'
    //flex: 1
  },
  textInputStyle: {
    color: 'white'
  },
  buttonsContainer: {
    //borderWidth: 1,
    //borderColor: 'red',
    width: '100%',
    alignItems: 'center',
    marginBottom: refactorFontSize(30),
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
    flexDirection: 'row',
    height: refactorFontSize(40),
    justifyContent: 'flex-end',
    marginBottom: refactorFontSize(getBottomSpace()),
    alignItems: 'center',
    paddingRight: refactorFontSize(10),
    backgroundColor: mrp.colors.mrPengu.orange
  },
  loginButtonText: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: refactorFontSize(15),
    color: 'black'
  }
});

export const errorColorIf = (error, color = 'white') => error ? mrp.colors.errorOnDark : color;
export function TextFieldError({ error = '' }) {
  return (
    <View style={styles.errorPlaceHolder}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

export const CustomTextField = MKTextField.textfieldWithFloatingLabel() // mdl.Textfield.textfieldWithFloatingLabel()
  //.withPlaceholder("e-Mail 2")
  .withPlaceholderTextColor('white')
  .withStyle(styles.inputTextField)
  .withTintColor(MKColor.Grey)
  .withHighlightColor('white')
  .withTextInputStyle(styles.textInputStyle)
  .build();

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      showLoginButton: false
    }

    this._onFacebookLogin = handleFacebookLogin.bind(this);
    this._onGoogleLogin = handleGoogleLogin.bind(this);
    this._onDoLogin = this._onDoLogin.bind(this);
    this._onSuccessLogin = this._onSuccessLogin.bind(this);
  }

  _onTextChange(fieldName, value) {
    this.setState({
      [fieldName]: value
    });
  }

  _onDoLogin() {
    const check = validateLogin(this.state);

    if(!check.valid) {
      showAlert({
        title: Strings.messages.IssuesFound,
        customView: <MessageLines messages={check.messages}/>
      });
    } else {
      Keyboard.dismiss();
      showAlert({
        title: Strings.titles.Login,
        showProgress: true,
        showConfirmButton: false
      }).then(() => {
        emailLogin(this.state).then(result => {
          console.log('emailLogin::result', result, onSuccessLogin, this.props);
          const { ok, error } = result;
          if(!ok) throw error;
          const { componentId, onSuccessLogin } = this.props;
          //console.log('emailLogin::addTempAddress', addTempAddress());
          closeAlert();
          Drawer.close('left');
          dismissModal(componentId);
          onSuccessLogin && onSuccessLogin();
        }).catch(async error => {
          console.log('emailLogin::ERROR', error.code, JSON.stringify(error));
          await closeAlert();
          const { code } = error || {};
          const message = rnfAuthErrorMessage({
            code,
            defaultMessage: Strings.messages.SomethingWentWrong
          });
          showAlert({
            title: Strings.messages.CouldNotConnect,
            message
          });
        });
      });
    }
  }

  _onSuccessLogin() {
    //addTempAddress();
    const { componentId, onSuccessLogin } = this.props;
    onSuccessLogin && onSuccessLogin();
  }

  render() {
    let { email, password } = this.state;
    return (
      <>
        <KeyboardAwareScrollView style={styles.withFlex}>
          <View style={styles.container}>
            <View style={styles.buttonsContainer}>
              <Text style={styles.connectWithText}>{Strings.titles.ConnectWith}</Text>
              <SocialButton text="FACEBOOK"
                iconName="facebook-box"
                style={styles.connectWithButton}
                onPress={this._onFacebookLogin}
              />
              <SocialButton text="GOOGLE"
                iconName="google"
                style={styles.connectWithButton}
                onPress={this._onGoogleLogin}
              />
            </View>
            <CustomTextField placeholder={Strings.titles.EMail}
              keyboardType='email-address'
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onTextChange={this._onTextChange.bind(this, 'email')}
            />
            <TextFieldError/>
            <CustomTextField placeholder={Strings.titles.Password}
              password
              value={password}
              onTextChange={this._onTextChange.bind(this, 'password')}
            />
            <TextFieldError/>
          </View>
        </KeyboardAwareScrollView>
        <TouchableOpacity style={styles.loginButton} onPress={this._onDoLogin}>
          <Text style={styles.loginButtonText}>{untone(Strings.titles.Login.toUpperCase())}</Text>
        </TouchableOpacity>
      </>
    );
  }
}


const socialButtonStyles = StyleSheet.create({
  container: {
    //flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical:  refactorFontSize(8),
    paddingHorizontal:  refactorFontSize(10),
    marginTop: refactorFontSize(15),
    borderRadius: refactorFontSize(3)
  },
  icon: {
    paddingRight: refactorFontSize(20),
    paddingLeft: refactorFontSize(30),
    fontSize: refactorFontSize(24),
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: refactorFontSize(17),
  }
});

export class SocialButton extends React.PureComponent {
  constructor(props) {
    super(props);

    const { text, iconName } = props;

    this.state = {
      text,
      iconName
    }
  }

  render() {
    const { onPress, style } = this.props;
    const { text, iconName } = this.state;
    const containerStyle = [socialButtonStyles.container, style];
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        {iconName && <Icon
          name={iconName}
          style={[socialButtonStyles.text, socialButtonStyles.icon]}/>}
        <Text style={socialButtonStyles.text}>{text}</Text>
      </TouchableOpacity>
    );
  }
}

// To be bound on component
export async function handleFacebookLogin() {
  let loginData;
  try {
    // await showAlert({
    //   title: Strings.messages.LoggingIn,
    //   showProgress: true,
    //   showConfirmButton: false
    // });
    loginData = await facebookLogin();
    // await closeAlert();

    //const { success, messageId } = loginData;

    const { ok, error, ...rest } = loginData;
    const { code } = error || {};

    console.log('Got loginData', loginData, error, code);

    // if(success) {
    //   const { componentId } = this.props;
    //   dismissModal(componentId);
    //   this._onSuccessLogin && this._onSuccessLogin();
    // } else if(messageId != 'CanceledByUser') {
    //   throw { messageId };
    // }

    if(ok) {
      const { componentId } = this.props;
      dismissModal(componentId);
      this._onSuccessLogin && this._onSuccessLogin();
    } else if(code != 'auth/facebook-canceled') {
      console.log('throw { code, ...rest }', code, rest);
      throw { error, ...rest };
    }
  } catch(error) {
    const { error: { code } = {}} = error || {};

    console.log('handleFacebookLogin::error', code, loginData);

    showAlert({
      title: Strings.messages.SomethingWentWrong,
      message: rnfAuthErrorMessage({
        code,
        defaultMessage: Strings.messages.PleaseTryAgain
      })
    });
  }
}

// To be bound on component
export async function handleGoogleLogin() {
  let loginData;
  try {
    // await showAlert({
    //   title: Strings.messages.LoggingIn,
    //   showProgress: true,
    //   showConfirmButton: false
    // });
    loginData = await googleLogin();
    // await closeAlert();

    const { ok, error, ...rest } = loginData;
    const { code } = error || {};

    console.log('Got loginData', loginData, ok, error, code);

    if(ok) {
      const { componentId } = this.props;
      dismissModal(componentId);
      this._onSuccessLogin && this._onSuccessLogin();
    } else if(code != 'CanceledByUser') {
      // console.log('handleGoogleLogin::error', loginData);
      // showAlert({
      //   title: Strings.messages.SomethingWentWrong,
      //   message: Strings.messages.PleaseTryAgain
      // });
      console.log('throw { code, ...rest }', code, rest);
      throw { error, ...rest };
    }
  } catch(error) {
    const { error: { code } = {}} = error || {};

    console.log('handleGoogleLogin::error', loginData, error);

    showAlert({
      title: Strings.messages.SomethingWentWrong,
      message: rnfAuthErrorMessage({
        code,
        defaultMessage: Strings.messages.PleaseTryAgain
      })
    });
  }

}
