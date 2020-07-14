// import React from 'react';
// import {
//   StyleSheet,
//   Platform,
//   Image,
//   Text,
//   View,
//   TouchableOpacity
// } from 'react-native';
// import {
//   Colors,
//   Appbar,
//   FAB,
//   Switch,
//   Paragraph,
//   withTheme,
// } from 'react-native-paper';

// import ViewBase from '@mrplib/rn/components/ViewBase';
// import { Strings } from '@mrplib/i18n/rn';
// import mrp from '@app/mrp';
// import { refactorFontSize } from '@mrplib/rn/utils';
// import { pop } from '@mrplib/rn/helpers/rnn';





// // const WizardScreen = createMaterialTopTabNavigator(
// //   {
// //     PickAddressSimple: { screen: StepPickAddressSimple },
// //     PickDeliveryCategory: { screen: StepPickDeliveryCategory },
// //     ComposeDeliveryMessage: { screen: StepComposeDeliveryMessage }
// //   },
// //   {
// //     tabBarPosition: 'top',
// //     swipeEnabled: true,
// //     tabBarComponent: null,
// //     animationEnabled: true,
// //     tabBarOptions: {
// //       activeTintColor: mrp.tabBar.activeColor,
// //       inactiveTintColor: mrp.tabBar.inactiveColor,
// //       style: {
// //         backgroundColor: mrp.colors.mainTopSection.bgColor,
// //         borderBottomWidth: mrp.tabBar.underlineWidth,
// //         borderBottomColor: mrp.tabBar.underlineColor
// //       },
// //       labelStyle: {
// //         padding: 0,
// //         margin: 0,
// //         fontSize: 19,
// //         fontWeight: 'bold',
// //         textAlign: 'center',
// //       },
// //       indicatorStyle: {
// //         borderBottomColor: mrp.colors.mrPengu.orange,
// //         borderBottomWidth: mrp.tabBar.indicatorWidth,
// //       },
// //     },
// //   }
// // );

// // const WizardContainer = createAppContainer(WizardScreen);

// export default class Delivery extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//     }

//     this.viewBaseRef = React.createRef();
//     this.wizardRef = React.createRef();

//     this.onBackButtonPress = this.onBackButtonPress.bind(this);
//     this.onUpdateCurrentStep = this.onUpdateCurrentStep.bind(this);

//     const params = {
//       onUpdateCurrentStep: this.onUpdateCurrentStep
//     }

//     // WizardStack = createStackNavigator({
//     //   PickAddress: {
//     //     // screen: props => (<StepPickAddress {...props} showCancel showNext
//     //     // nextStep="PickDeliveryCategory" />),
//     //     screen: StepPickAddress,
//     //     params
//     //   },
//     //   PickDeliveryCategory: {
//     //     screen: StepPickDeliveryCategory,
//     //     params
//     //   },
//     //   ComposeDeliveryMessage: {
//     //     screen: StepComposeDeliveryMessage,
//     //     params
//     //   }
//     // }, {
//     //   initialRouteName: 'PickAddress',
//     //   /* The header config from HomeScreen is now here */
//     //   defaultNavigationOptions: ({navigation}) => ({
//     //     // params: {
//     //     //   //test1: () => console.log('Test 1!!!')
//     //     //   test1: 'Test 1!!!'
//     //     // }
//     //   }),
//     //   headerMode: 'none'
//     // });

//     //WizardStack = createWizardStack({
//     Wizard = createWizard({
//       PickAddress: {
//         screen: StepPickAddressSimple/*,
//         params: {
//           showCancel: true,
//           showNext: true
//         }*/
//       },
//       PickDeliveryCategory: {
//         screen: StepPickDeliveryCategory
//       },
//       ComposeDeliveryMessage: {
//         screen: StepComposeDeliveryMessage
//       },
//       OrderSent: {
//         screen: StepOrderSent
//       }
//     }, {
//       params: {
//         onUpdateCurrentStep: this.onUpdateCurrentStep,
//         test1: 'Test 11 !!!!'
//       }
//     });

//     //Wizard = createAppContainer(WizardStack);
//   }

//   onUpdateCurrentStep(stepScreen) {
//     console.log('Delivery::onUpdateCurrentStep', stepScreen);
//   }

//   onBackButtonPress() {
//     //console.log('Wizard', this.wizardRef, this.wizardRef.dispatch, this.wizardRef.current, WizardContainer.router, WizardScreen.router);
//     //let comp = WizardScreen.router.getComponentForRouteName('PickAddressSimple');
//     //console.log('Comp', comp);
//     //console.log('Comp valid', comp.validate());

//     console.log('onBackButtonPress');

//     this.wizardRef.current.backOrCancel();
//     return false;
//   }

//   render() {
//     const { componentId } = this.props;
//     return (
//       <ViewBase ref={this.viewBaseRef}
//         navigationComponentId={componentId}
//         //onBackButtonPress={this.onBackButtonPress}
//         showBackButton
//       >
//         <Wizard ref={this.wizardRef} navigationComponentId={componentId} test1="Test 111"/>
//         {/*<WizardContainer ref={this.wizardRef}/>*/}
//       </ViewBase>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     display: 'flex',
//     flex: 1,
//     //alignItems: 'center',
//     //justifyContent: 'center',
//     //backgroundColor: 'white'
//   },

// });
