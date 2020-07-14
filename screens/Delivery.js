import React from 'react';
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  TouchableOpacity,
  InteractionManager
} from 'react-native';
import {
  createStackNavigator,
  createAppContainer,
  createMaterialTopTabNavigator
} from 'react-navigation';
import ViewBase from '@mrplib/rn/components/ViewBase';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';
import { refactorFontSize } from '@mrplib/rn/utils';
import { pop } from '@mrplib/rn/helpers/rnn';

import { createWizardStack, createWizard } from './wizards';
import StepPickAddress from './wizards/steps/PickAddress';
//import StepPickAddressSimple from './wizards/steps/PickAddressSimple';
import StepPickDeliveryCategory from './wizards/steps/PickDeliveryCategory';
import StepComposeDeliveryMessage from './wizards/steps/ComposeDeliveryMessage';
import StepOrderPayment from './wizards/steps/OrderPayment';

let WizardStack = null;
let Wizard = null;

export default class Delivery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showWizard: false
    }

    this.viewBaseRef = React.createRef();
    this.wizardRef = React.createRef();

    this.onBackButtonPress = this.onBackButtonPress.bind(this);
    this.onUpdateCurrentStep = this.onUpdateCurrentStep.bind(this);

    const params = {
      onUpdateCurrentStep: this.onUpdateCurrentStep
    }

    // WizardStack = createStackNavigator({
    //   PickAddress: {
    //     // screen: props => (<StepPickAddress {...props} showCancel showNext
    //     // nextStep="PickDeliveryCategory" />),
    //     screen: StepPickAddress,
    //     params
    //   },
    //   PickDeliveryCategory: {
    //     screen: StepPickDeliveryCategory,
    //     params
    //   },
    //   ComposeDeliveryMessage: {
    //     screen: StepComposeDeliveryMessage,
    //     params
    //   }
    // }, {
    //   initialRouteName: 'PickAddress',
    //   /* The header config from HomeScreen is now here */
    //   defaultNavigationOptions: ({navigation}) => ({
    //     // params: {
    //     //   //test1: () => console.log('Test 1!!!')
    //     //   test1: 'Test 1!!!'
    //     // }
    //   }),
    //   headerMode: 'none'
    // });

    //WizardStack = createWizardStack({
    Wizard = createWizard({
      PickAddress: {
        screen: StepPickAddress,
        params: {
          showCancel: false,
          showNext: false
        }
      },
      PickDeliveryCategory: {
        screen: StepPickDeliveryCategory,
        params: {
          showNext: false,
          showBack: false
        }
      },
      ComposeDeliveryMessage: {
        screen: StepComposeDeliveryMessage
      },
      OrderPayment: {
        screen: StepOrderPayment,
        params: {
          showBack: true
        }
      }
    }, {
      params: {
        onUpdateCurrentStep: this.onUpdateCurrentStep,
        test1: 'Test 11 !!!!'
      }
    });

    //Wizard = createAppContainer(WizardStack);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({
        showWizard: true
      })
    });
  }

  onUpdateCurrentStep(stepScreen) {
    console.log('Delivery::onUpdateCurrentStep', stepScreen);
  }

  onBackButtonPress() {
    //console.log('Wizard', this.wizardRef, this.wizardRef.dispatch, this.wizardRef.current, WizardContainer.router, WizardScreen.router);
    //let comp = WizardScreen.router.getComponentForRouteName('PickAddressSimple');
    //console.log('Comp', comp);
    //console.log('Comp valid', comp.validate());

    console.log('onBackButtonPress');

    this.wizardRef.current.backOrCancel();
    return false;
  }

  render() {
    const { componentId } = this.props;
    const { showWizard } = this.state;

    return (
      <ViewBase ref={this.viewBaseRef}
        navigationComponentId={componentId}
        //onBackButtonPress={this.onBackButtonPress}
        showBackButton
        backCloseIcon
      >
        {showWizard && <Wizard ref={this.wizardRef} navigationComponentId={componentId} test1="Test 111"/>}
        {/*<WizardContainer ref={this.wizardRef}/>*/}
      </ViewBase>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    //alignItems: 'center',
    //justifyContent: 'center',
    //backgroundColor: 'white'
  },

});
