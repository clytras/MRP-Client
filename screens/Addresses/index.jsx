import React from 'react';
import { InteractionManager, View } from 'react-native';
import {
  NavigationActions,
  createAppContainer,
  createStackNavigator
} from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import ViewBase from '@mrplib/rn/components/ViewBase';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';

import PickAddressPanel from './PickAddress';
import EditAddressPanel from './EditAddress';
import AddressListingPanel from './AddressListing';


export default class extends React.Component {
  constructor(props) {
    super(props);

    this.panelsRef = React.createRef();

    this.state = {
      headerText: this.selectHeaderText({
        editingAddress: false
      }),
      showPanels: false,
      currentPanel: '',
      editingAddress: null
    }

    this.onBackButtonPress = this.onBackButtonPress.bind(this);
    this.onPanelChange = this.onPanelChange.bind(this);
    this.onAddressSuccess = this.onAddressSuccess.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const { componentId, listingMode } = this.props;
      const defaultPanelParams = {
        componentId,
        onPanelChange: this.onPanelChange
      }

      const screens = {};

      listingMode && (screens.AddressListing = {
        screen: props => <AddressListingPanel {...props} {...defaultPanelParams} />
      });

      screens.PickAddress = {
        screen: props => <PickAddressPanel {...props} {...defaultPanelParams} />
      }

      screens.EditAddress = {
        screen: props => (
          <EditAddressPanel
            onAddressSuccess={this.onAddressSuccess}
            {...props}
            {...defaultPanelParams}
          />
        )
      }

      //const panels = createMaterialTopTabNavigator(screens, {
      const panels = createStackNavigator(screens, {
        tabBarComponent: () => null,
        backBehavior: 'order',
        swipeEnabled: false,
        animationEnabled: true,
        headerMode: 'null'
      });

      this.panels = panels;
      this.PanelsContainer = createAppContainer(panels);
      this.setState({
        showPanels: true
      });
    });
  }

  onPanelChange(currentPanel, editingAddress = null) {
    if(currentPanel === null) { // close modal on null
      const { componentId } = this.props;
      dismissModal(componentId);
    } else {
      this.setState({
        currentPanel,
        headerText: this.selectHeaderText({
          currentPanel,
          editingAddress
        })
      });
    }
  }

  onBackButtonPress() {
    const { listingMode } = this.props;
    const { currentPanel } = this.state;
    let dismiss = true;

    switch(currentPanel) {
      case 'AddressListing': break;
      case 'PickAddress': dismiss = !listingMode; break;
      case 'EditAddress': dismiss = false; break;
    }

    if(dismiss) {
      const { componentId } = this.props;
      dismissModal(componentId);
    } else {
      this.panelsRef.current.dispatch(
        NavigationActions.back()
      );
    }
  }

  onAddressSuccess(address) {
    const { componentId, onAddressSelect } = this.props;
    onAddressSelect && onAddressSelect(address);
    dismissModal(componentId);
  }

  selectHeaderText({
    currentPanel,
    setState = false,
    editingAddress = null
  }) {
    const { listingMode } = this.props;

    if(!currentPanel) {
      currentPanel = listingMode ? 'AddressListing' : 'PickAddress';
    }

    editingAddress === null && (editingAddress = this.state.editingAddress);
    let headerText = '';

    switch(currentPanel) {
      case 'AddressListing':
        headerText = Strings.titles.Addresses;
        break;
      default:
        headerText = editingAddress ? Strings.titles.EditAddress : Strings.titles.AddAddress;
        break;
    }

    if(setState) {
      this.setState({ headerText });
    }

    return headerText;
  }

  render() {
    const { PanelsContainer } = this;
    const { showPanels, headerText } = this.state;
    const { componentId, listingMode, onDismiss, onNewAddress } = this.props;

    // return (
    //   <View style={{
    //     flex: 1,
    //     backgroundColor: 'yellow'
    //   }}>
    //     {showPanels && <PanelsContainer ref={this.panelsRef}/>}
    //   </View>
    // );

    return (
      <ViewBase
        navigationComponentId={componentId}
        onBackButtonPress={this.onBackButtonPress}
        showDrawerButton={false}
        showBackButton
        headerText={headerText}
      >
        {showPanels && <PanelsContainer ref={this.panelsRef}/>}
      </ViewBase>
    );
  }
}
