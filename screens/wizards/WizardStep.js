import React from 'react';
import {
    StyleSheet,
    View,
    Button,
    Image,
    ImageBackground,
    TouchableOpacity,
    Text,
    Dimensions,
    Keyboard
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { refactorFontSize } from '@mrplib/rn/utils';
import { NavigationActions } from 'react-navigation';
import mrp from '@app/mrp';

const iconSize = mrp.wizards.nav.icon.size;

class WizardStep extends React.Component {

  constructor(props) {
    super(props);

    const { showCancel, showBack, showNext } = props;
    this.state = {
      visible: true,
      showCancel,
      showBack,
      showNext
    }

    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showCancel != state.showCancel ||
       props.showBack != state.showBack ||
       props.showNext != state.showNext)
    {
      return {
        showCancel: props.showCancel,
        showBack: props.showBack,
        showNext: props.showNext
      }
    }

    return null;
  }

  componentDidMount() {
    let { stepComponentRef, onUpdateCurrentStep, navigation, navigationRef } = this.props;

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );

    console.log('WizardBase::componentDidMount', this.props);

    if(!navigation && navigationRef) {
      navigation = navigationRef.current._navigation;
      //navigation = stepComponentRef.current.props.navigation;
    }

    if(navigation) {
      console.log('WizardStep::componentDidMount, has nav');
      // this.navDidFocusSubscription = navigation.addListener(
      //   'willBlur ',
      //   payload => {
      //     console.debug('willBlur', payload);
      //   }
      // );

      if(onUpdateCurrentStep) {
        const { state } = navigation;
        if(state) {
          const { routeName } = state;
          onUpdateCurrentStep(routeName);
        }
      }
    } else {
      console.log('WizardStep::componentDidMount, has NO nav');
    }
  }

  componentWillUnmount() {
    //if(this.navDidFocusSubscription) this.navDidFocusSubscription.remove();
    if(this.keyboardDidShowListener) this.keyboardDidShowListener.remove();
    if(this.keyboardDidHideListener) this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ visible: false });
  }

  _keyboardDidHide() {
    this.setState({ visible: true });
  }

  onCancel() {
    console.log('WizardBase::onCancel', this.props);
    const { onCancel } = this.props;
    if(onCancel) onCancel();
  }

  onBack() {
    console.log('WizardBase::onBack', this.props);

    let {
      navigation,
      navigationRef,
      currentStep,
      backStep,
      onUpdateCurrentStep,
      onBack
    } = this.props;

    if(!navigation && navigationRef) {
      navigation = navigationRef.current._navigation;
    }

    if(backStep && navigation) {
      //navigation.push(backStep);
      navigation.navigate(backStep);
      onBack && onBack();
    }

    //const { onBack } = this.props;
    //if(onBack) onBack();
  }

  onNext() {
    console.log('WizardBase::onNext', this.props);

    let {
      stepComponentRef,
      navigation,
      navigationRef,
      currentStep,
      nextStep,
      onUpdateCurrentStep,
      onNext
    } = this.props;

    console.log('WizardStep::onNext', navigation, navigationRef);

    if(!navigation && navigationRef) {
      navigation = navigationRef.current._navigation
    }

    if(nextStep && stepComponentRef && navigation) {
      if(stepComponentRef.current.validate) {
        //console.log('WizardBase::onNext; stepComponentRef has validate', stepComponentRef.current.validate());
        if(stepComponentRef.current.validate()) {
          console.log(`WizardBase::onNext; ${currentStep} validated and next`, nextStep, navigation);
          // if(onUpdateCurrentStep) {
          //   this.props.onUpdateCurrentStep = onUpdateCurrentStep;
          // }
          const payload = stepComponentRef.current.payload ?
            stepComponentRef.current.payload() : {};

          navigation.navigate(nextStep);

          // navigation.dispatch(
          //   NavigationActions.navigate({ routeName: nextStep })
          // );

          // navigationRef.current._navigation.dispatch(
          //   NavigationActions.navigate({
          //     routeName: "PickDeliveryCategory"
          //   })
          // );

          onNext && onNext(payload);
        } else {
          console.log(`WizardBase::onNext; ${currentStep} DID NOT validate`);
        }
      } else {
        console.log(`WizardBase::onNext; ${currentStep} has NO validate`);
        navigation.navigate(nextStep);
        onNext && onNext();
      }
    }



    //const { onNext } = this.props;
    //if(onNext) onNext();
  }

  render() {
    const {
      children,
      style
    } = this.props;
    const {
      visible,
      showCancel,
      showBack,
      showNext
    } = this.state;
    const showNavButtons = showCancel || showBack || showNext;
    const { navigation } = this.props;
    //console.log('Wizard nav', navigation);
    return (
      <View style={visible ? styles.container : styles.hidden}>
        <View style={[styles.content, style]}>{children}</View>
        {showNavButtons && (
          <View style={styles.navButtons}>
            {showBack && (
              <TouchableOpacity style={styles.icon} onPress={this.onBack}>
                <IoniconsIcon name="ios-arrow-dropleft-circle" style={styles.iconArrow} size={iconSize}/>
              </TouchableOpacity>
            )}
            {showCancel && (
              <TouchableOpacity style={styles.icon} onPress={this.onCancel}>
                <IoniconsIcon name="ios-close-circle" style={styles.iconArrow} size={iconSize}/>
              </TouchableOpacity>
            )}
            {showNext && (
              <TouchableOpacity style={styles.icon} onPress={this.onNext}>
                <IoniconsIcon name="ios-arrow-dropright-circle" style={styles.iconArrow} size={iconSize}/>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    //borderWidth: 1,
    //borderColor: 'cyan'
    paddingBottom: refactorFontSize(getBottomSpace())
  },
  hidden: {
    display: 'none'
  },
  content: {
    //flex: 1
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    //height: '15%',
    paddingVertical: refactorFontSize(5),
    // borderWidth: 1,
    // borderColor: 'green'
  },

  iconContainer: {
    // borderWidth: 1,
    // borderColor: 'green',
    // justifyContent: 'center',
    // alignItems: 'center',
    width: refactorFontSize(iconSize),
    height: refactorFontSize(iconSize),
    //borderRadius: refactorFontSize(50) / 2,
    //backgroundColor: 'black'
  },
  iconArrow: {
    color: mrp.wizards.nav.icon.color
  },
  icon: {
    //backgroundColor: 'yellow',
    // borderWidth: 1,
    // borderColor: 'green',
    //width: 50,
    //height: 50,
    flex: 0,

    // borderWidth: 1,
    // borderColor: 'red',
    textAlign: 'center',
    //fontSize: refactorFontSize(50),
    // padding: 0,
    // margin: 0,
    color: mrp.wizards.nav.icon.color
  },
});

export default WizardStep;
