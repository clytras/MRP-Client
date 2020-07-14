/** @format */

import { Navigation } from "react-native-navigation";
import { YellowBox } from 'react-native';
// import { name as appName } from './app.json';
import { AppStack, ScreenIds, registerScreens } from '@screens/Screens';
import mrp from '@app/mrp';

YellowBox.ignoreWarnings(['RTCBridge', 'RCTAppState', 'Require cycle:', 'UIManager via UIManager']);

console.log('Screens', ScreenIds);

Navigation.events().registerAppLaunchedListener(() => {

  Navigation.setDefaultOptions({
    statusBar: {
      visible: true,
      style: "light",
      backgroundColor: mrp.colors.mrPengu.black
    },
    topBar: {
      visible: false,
      animate: false,
    },
    topTabs:{
      visible: false,
      animate: false,
    },
    sideMenu: {
      left: {
        width: mrp.sideMenu.width
      }
    },
    layout: {
      orientation: ['portrait']
    }
  });

  Navigation.setRoot({
    root: {
      sideMenu: {
        left: {
          component: {
            //id: 'app.drawer.Main',
            //name: 'app.drawer.Main'
            id: ScreenIds.Drawer,
            name: ScreenIds.Drawer
          }
        },
        center: {
          stack: {
            id: AppStack, // "stacks.NavStack",
            options: {
              topBar: {
                visible: false,
                animate: false,
              },
              topTabs:{
                visible: false,
                animate: false,
              }
            },
            children: [{
              component: {
                //id: 'app.Index',
                //name: 'app.Index',
                id: ScreenIds.Index,
                name: ScreenIds.Index,
                options: {
                  topBar: {
                    visible: false,
                    animate: false,
                    drawBehind: true
                  }
                },
                passProps: {
                  name: 'Comp 1'
                }
              }
            }]
          }
        }
      }
    },


  });
});

// if (true || __DEV__) {
//   const IGNORED_WARNINGS = [
//     'Remote debugger is in a background tab which may cause apps to perform slowly',
//     'Require cycle:',
//   ]
//   const oldConsoleWarn = console.warn

//   console.warn = (...args) => {
//     if (
//       typeof args[0] === 'string' &&
//       IGNORED_WARNINGS.some(ignoredWarning =>
//         args[0].startsWith(ignoredWarning),
//       )
//     ) {
//       return
//     }
//     console.log('WARN: '+ args[0]);

//     return oldConsoleWarn.apply(console, args)
//   }
// }

//AppRegistry.registerComponent(appName, () => App);
