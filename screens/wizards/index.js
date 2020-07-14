
import React from 'react';
import { BackHandler } from 'react-native';
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';

import WizardStep from './WizardStep';
import { pop } from '@mrplib/rn/helpers/rnn';

export function createWizardStack(steps, options) {

  console.log('createWizardStack in');

  if(!('params' in options)) {
    options.params = {};
  }

  if(!('navigationOptions' in options)) {
    options.navigationOptions = {
      headerMode: 'none'
    };
  }

  let stack = {};
  let counter = 0;
  let allSteps = [];

  for(let screenName in steps) {
    allSteps.push(screenName);
  }

  const stepsCount = allSteps.length;

  for(let screenName in steps) {
    const step = steps[screenName];
    //const StepComponent = createWizardStep(step.screen);
    const StepComponent = step.screen;
    const isLastStep = counter == (stepsCount - 1);

    if(!('params' in step)) {
      step.params = {};
    }

    let params = {
      ...options.params,
      ...step.params
    }

    if(!isLastStep) {
      params.nextStep = allSteps[counter + 1];
    }

    if(!('showCancel' in params)) {
      params.showCancel = false;
    }

    if(!('showNext' in params) && !isLastStep) {
      params.showNext = true;
    }

    stack[screenName] = {
      screen: props => (<StepComponent {...props} {...params} />)
    }

    counter++;
  }

  if(!('initialRouteName' in options.navigationOptions)) {
    if('firstStep' in options) {
      options.navigationOptions.initialRouteName = options.firstStep;
    } else {
      options.navigationOptions.initialRouteName = allSteps[0];
    }
  }

  //return createBottomTabNavigator(stack, {
  return createMaterialTopTabNavigator(stack, {
    //initialRouteName: `H${this.floorMapSelected}`,
    //backBehavior: 'none',
    tabBarComponent: () => null,
    ...options.navigationOptions
  });


  // const panels = createStackNavigator(stack, {
  //   tabBarComponent: () => null,
  //   backBehavior: 'order',
  //   swipeEnabled: false,
  //   animationEnabled: true,
  //   headerMode: 'null',
  //   ...options.navigationOptions
  // });


  // return createStackNavigator(stack, {
  //   //initialRouteName: 'PickAddress',
  //   /* The header config from HomeScreen is now here */
  //   // defaultNavigationOptions: ({navigation}) => ({
  //   //   params: {
  //   //     test1: () => console.log('Test 1!!!')
  //   //   }
  //   // }),
  //   headerMode: 'none',
  //   ...options.navigationOptions
  // });
}

export function createWizard(steps, options) {

  if(!('params' in options)) options.params = {};
  if(!('navigationOptions' in options)) options.navigationOptions = {};

  return class Wizard extends React.Component {
    constructor(props) {
      super(props);

      this._stepsContainerRef = React.createRef();
      this._wizardStepRef = React.createRef();
      this.onStepBack = this.onStepBack.bind(this);
      this.onStepCancel = this.onStepCancel.bind(this);
      this.onStepNext = this.onStepNext.bind(this);
      this.updatePayload = this.updatePayload.bind(this);
      this.setWizardStepCustomParams = this.setWizardStepCustomParams.bind(this);

      //let _steps = [];
      let _steps = {};
      let _stepsStack = {};
      let _allSteps = [];

      for(let screenName in steps) {
        _allSteps.push(screenName);
      }

      const stepsCount = _allSteps.length;
      let counter = 0;

      for(let screenName in steps) {
        const isFirstStep = counter == 0;
        const isLastStep = counter == (stepsCount - 1);

        let step = {
          ...steps[screenName],
          routeName: screenName,
          ref: React.createRef(),
          isFirstStep,
          isLastStep
        };

        //const StepComponent = createWizardStep(step.screen);
        const StepComponent = step.screen;

        if(!('params' in step)) {
          step.params = {};
        }

        let params = {
          ...options.params,
          ...step.params,
          currentStep: step.routeName,
          closeWizard: this.onStepCancel,
          goToNextStep: this.onStepNext,
          updatePayload: this.updatePayload,
          setWizardStepCustomParams: this.setWizardStepCustomParams
        }

        if(!isLastStep) {
          params.nextStep = _allSteps[counter + 1];
        }

        if(!isFirstStep) {
          params.backStep = _allSteps[counter - 1];
        }

        if(!('showCancel' in params)) {
          params.showCancel = false;
        }

        if(!('showNext' in params) && !isLastStep) {
          params.showNext = true;
        }

        if(!('showBack' in params) && !isFirstStep && !isLastStep) {
          params.showBack = true;
        }

        _stepsStack[screenName] = {
          screen: props => (<StepComponent ref={step.ref} {...props} {...params} />)
        }

        step.params = params;

        //_steps.push(step);

        _steps[screenName] = step;

        counter++;
      }

      if(!('initialRouteName' in options.navigationOptions)) {
        if('firstStep' in options) {
          options.navigationOptions.initialRouteName = options.firstStep;
        } else {
          options.navigationOptions.initialRouteName = _allSteps[0];
        }
      }

      //this.StepsNavigator = createBottomTabNavigator(_stepsStack, {
      this.StepsNavigator = createMaterialTopTabNavigator(_stepsStack, {
        //initialRouteName: `H${this.floorMapSelected}`,
        //backBehavior: 'none',
        headerMode: 'none',
        swipeEnabled: false,
        animationEnabled: true,
        tabBarComponent: () => null,
        backBehavior: 'order',
        ...options.navigationOptions
      });

      // this.StepsNavigator = createStackNavigator(_stepsStack, {
      //   tabBarComponent: () => null,
      //   backBehavior: 'order',
      //   swipeEnabled: false,
      //   animationEnabled: true,
      //   headerMode: 'none',
      //   ...options.navigationOptions
      // });


      // this.StepsStackNavigator = createStackNavigator(_stepsStack, {
      //   //initialRouteName: 'PickAddress',
      //   /* The header config from HomeScreen is now here */
      //   // defaultNavigationOptions: ({navigation}) => ({
      //   //   params: {
      //   //     test1: () => console.log('Test 1!!!')
      //   //   }
      //   // }),
      //   headerMode: 'none',
      //   ...options.navigationOptions
      // });

      this.StepsContainer = createAppContainer(this.StepsNavigator);
      this._steps = _steps;
      this._allSteps = _allSteps;
      this._currentStepRoute = options.navigationOptions.initialRouteName;

      // this.state = {
      //   currentStepRoute: options.navigationOptions.initialRouteName
      // };

      this.state = {
        currentStepRoute: null,
        currentStep: null,
        payload: {},
        wizardStepCustomParams: {}
      };

      //this.onBackHandler = this.onBackHandler.bind(this);
      this._handleNavigationStateChange = this._handleNavigationStateChange.bind(this);

      this.getPayload = this.getPayload.bind(this);
    }

    componentDidMount() {

      console.log('createWizard::componentDidMount',
        this._currentStepRoute,
        this._steps[this._currentStepRoute]
      );

      this.setState({
        currentStepRoute: this._currentStepRoute,
        currentStep: this._currentStepRoute ? this._steps[this._currentStepRoute] : null
      });

      //BackHandler.addEventListener('hardwareBackPress', this.onBackHandler);

      // setTimeout(() => {
      //   const step = this._steps[0];
      //   console.log('this._steps 1 red', this._steps, step.current);

      //   step.ref.current.validate(); // working !!
      // }, 1000);
    }

    componentWillUnmount() {
      //BackHandler.removeEventListener('hardwareBackPress', this.onBackHandler);
    }

    // onBackHandler() {
    //   const { StepsContainer } = this;

    //   console.log('onBackHandler', StepsContainer.current);
    // }

    onStepBack() {
      console.log('createWizard::onStepBack');

      let { currentStepRoute, currentStep } = this.state;

      if(currentStep.params.backStep) {
        this._currentStepRoute = currentStepRoute = currentStep.params.backStep;
        currentStep = this._steps[this._currentStepRoute]

        this.setState({
          currentStep,
          currentStepRoute,
          wizardStepCustomParams: {}
        }, () => {
          currentStep.ref.current &&
          currentStep.ref.current.onStepShow &&
          currentStep.ref.current.onStepShow();
        });
      }
    }

    onStepNext(addPayload = {}, { doNavigate = false } = {}) {
      let { currentStepRoute, currentStep } = this.state;

      console.log('createWizard::onStepNext', currentStep.params.nextStep, doNavigate);

      if(currentStep.params.nextStep) {
        this._currentStepRoute = currentStepRoute = currentStep.params.nextStep;
        currentStep = this._steps[this._currentStepRoute];

        const currentPayload = this.state.payload;
        const payload = {
          ...currentPayload,
          ...addPayload
        }

        currentStep.ref.current &&
        currentStep.ref.current.setPayload &&
        currentStep.ref.current.setPayload(payload);

        this.setState({
          currentStep,
          currentStepRoute,
          payload,
          wizardStepCustomParams: {}
        }, () => {
          if(doNavigate) {
            console.log('cur step screenName', currentStep, this._stepsContainerRef.current);
            this._stepsContainerRef.current._navigation.navigate(currentStep.routeName);
          }
          currentStep.ref.current &&
          currentStep.ref.current.onStepShow &&
          currentStep.ref.current.onStepShow();
        });
      } else {
        console.log('no next step');
      }
    }

    onStepCancel() {
      const { navigationComponentId } = this.props;
      console.log('createWizard::onStepCancel', navigationComponentId);

      pop(navigationComponentId);
    }

    updatePayload(newPayload) {
      const { payload } = this.state;
      const newPayloadData = { ...payload, ...newPayload };
      this.setState(newPayloadData);
      return newPayloadData;
    }

    backOrCancel() {
      const { currentStep } = this.state;

      if(currentStep.isFirstStep) {
        this.onStepCancel();
      } else {
        this.onStepBack();
      }
    }

    _handleNavigationStateChange(prevState, { routes, index } /* currentState*/ , { type = '' } /* action */) {
      console.log('_handleNavigationStateChange', prevState, type);

      if(type == 'Navigation/BACK') {
        const currentStepRoute = routes[index].routeName;
        this._currentStepRoute = currentStepRoute;
        currentStep = this._steps[currentStepRoute];

        this.setState({
          currentStep,
          currentStepRoute
        });
      }
    }

    setWizardStepCustomParams(wizardStepCustomParams) {
      this.setState({
        wizardStepCustomParams
      });
    }

    getPayload() {
      const { payload } = this.state;
      return payload;
    }

    render() {
      const { currentStepRoute, currentStep, wizardStepCustomParams } = this.state;
      if(!currentStepRoute) return null;
      const { StepsContainer, props } = this;
      console.log('this._stepsContainerRef', this._stepsContainerRef, currentStep);
      return (
        <>
          <StepsContainer ref={this._stepsContainerRef} {...props}
            onNavigationStateChange={this._handleNavigationStateChange}
          />
          <WizardStep ref={this._wizardStepRef}
            {...currentStep.params} {...wizardStepCustomParams}
            stepComponentRef={currentStep.ref}
            navigationRef={this._stepsContainerRef}
            onCancel={this.onStepCancel}
            onBack={this.onStepBack}
            onNext={this.onStepNext}
          />
        </>)
    }
  }
}

// export function stepComponent(StepComponent) {
//   class StepComponentBase extends React.Component {
//     render() {
//       const {forwardedRef, ...rest} = this.props;
//       return (<StepComponent ref={forwardedRef} {...rest}/>)
//     }
//   }

//   return React.forwardRef((props, ref) => {
//     return <StepComponentBase {...props} forwardedRef={ref} />;
//   });
// }

export function createWizardStep(StepComponent) {
  class WizardStepHOC extends React.Component {
    render() {
      const {forwardedRef, ...rest} = this.props;
      return (<WizardStep stepComponentRef={forwardedRef} {...rest}><StepComponent ref={forwardedRef} {...rest}/></WizardStep>)
    }
  }

  return React.forwardRef((props, ref) => {
    return <WizardStepHOC {...props} forwardedRef={ref} />;
  });
}
