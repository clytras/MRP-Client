import { Navigation } from "react-native-navigation";
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { rnPaperHOC } from '@mrplib/rn/helpers/rn-paper';

import { initNavigation } from '@mrplib/rn/helpers/rnn';
import SideMenu from '@components/SideMenu';
import ConnectionStatusOverlay from '@components/ConnectionStatusOverlay';
//import Alert from '@components/Alert';
import Alert from '@mrplib/rn/components/Alert';
import Index from '@screens/Index';
import Airbnb from '@screens/Airbnb';
import PenguGo from '@screens/PenguGo';
import TestScreen from '@screens/TestScreen';
import Delivery from '@screens/Delivery';
import LoginRegister from '@screens/LoginRegister';
import Addresses from '@screens/Addresses';
import CardsListing from '@screens/PaymentMethods/CardsListing';
import InfoListing from '@screens/Info/InfoListing';
import InfoPageView from '@screens/Info/PageView';
import ProfileEditor from '@screens/Profile/ProfileEditor';
import ChangePassword from '@screens/Profile/ChangePassword';
import OrdersListing from '@screens/Orders/OrdersListing';
import OrderView from '@screens/Orders/OrderView';
import AddCard from '@screens/AddCard';

export const AppStack = 'stacks.NavStack';

Navigation.registerComponent(`app.Index`, () => gestureHandlerRootHOC(rnPaperHOC(Index)));
Navigation.registerComponent(`app.Airbnb`, () => gestureHandlerRootHOC(rnPaperHOC(Airbnb)));
Navigation.registerComponent(`app.PenguGo`, () => gestureHandlerRootHOC(rnPaperHOC(PenguGo)));

Navigation.registerComponent(`app.LoginRegister`, () => gestureHandlerRootHOC(rnPaperHOC(LoginRegister)));
Navigation.registerComponent(`app.Addresses`, () => gestureHandlerRootHOC(rnPaperHOC(Addresses)));
Navigation.registerComponent(`app.CardsListing`, () => gestureHandlerRootHOC(rnPaperHOC(CardsListing)));
Navigation.registerComponent(`app.InfoListing`, () => gestureHandlerRootHOC(rnPaperHOC(InfoListing)));
Navigation.registerComponent(`app.InfoPageView`, () => gestureHandlerRootHOC(rnPaperHOC(InfoPageView)));
Navigation.registerComponent(`app.AddCard`, () => gestureHandlerRootHOC(rnPaperHOC(AddCard)));
Navigation.registerComponent(`app.wizards.Delivery`, () => gestureHandlerRootHOC(rnPaperHOC(Delivery)));
Navigation.registerComponent(`app.TestScreen`, () => gestureHandlerRootHOC(rnPaperHOC(TestScreen)));
Navigation.registerComponent(`app.drawer.Drawer`, () => gestureHandlerRootHOC(rnPaperHOC(SideMenu)));
Navigation.registerComponent(`app.ProfileEditor`, () => gestureHandlerRootHOC(rnPaperHOC(ProfileEditor)));
Navigation.registerComponent(`app.ChangePassword`, () => gestureHandlerRootHOC(rnPaperHOC(ChangePassword)));
Navigation.registerComponent(`app.OrdersListing`, () => gestureHandlerRootHOC(rnPaperHOC(OrdersListing)));
Navigation.registerComponent(`app.OrderView`, () => gestureHandlerRootHOC(rnPaperHOC(OrderView)));

Navigation.registerComponent(`app.Alert`, () => gestureHandlerRootHOC(Alert));

Navigation.registerComponent(`app.NoConnection`, () => ConnectionStatusOverlay);

let ScreenIds = {
  'Alert': 'app.Alert',
  'Index': 'app.Index',
  'Airbnb': 'app.Airbnb',
  'PenguGo': 'app.PenguGo',
  'LoginRegister': 'app.LoginRegister',
  'Addresses': 'app.Addresses',
  'CardsListing': 'app.CardsListing',
  'InfoListing': 'app.InfoListing',
  'InfoPageView': 'app.InfoPageView',
  'AddCard': 'app.AddCard',
  'Delivery': 'app.wizards.Delivery',
  'TestScreen': 'app.TestScreen',
  'Drawer': 'app.drawer.Drawer',
  'ProfileEditor': 'app.ProfileEditor',
  'ChangePassword': 'app.ChangePassword',
  'NoConnection': 'app.NoConnection',
  'OrdersListing': 'app.OrdersListing',
  'OrderView': 'app.OrderView'
};

initNavigation({ ScreenIds });

export {
  //Screens,
  ScreenIds,
  //registerScreens
}
