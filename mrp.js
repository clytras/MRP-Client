import merge from 'deepmerge';
import { Dimensions } from 'react-native';
import { refactorFontSize } from '@mrplib/rn/utils';
import mrplib from '@mrplib/mrp';
import mrpbrain from '@mrpbrain/mrp';
import mrprn from '@mrplib/rn/mrp';

const screenSize = Dimensions.get('screen');

console.log('mrp',merge.all([
  mrplib,
  mrpbrain.default,
  mrprn
]));

export default merge.all([
  mrplib,
  mrpbrain.default,
  mrprn,
  {
    app: {
        versionName: '1.0'
    },
    apiKeys: {
      // it also needs to be changed in AppDelegate.m for iOS and AndroidManifest.xml for Android
      GoogleMrPengu: ''
    },
    initialRouteName: 'Index',
    header: {
      iconFontSize: refactorFontSize(24),
      userIconFontSize: refactorFontSize(36),
      userFontSize: refactorFontSize(18),
      foreColor: 'white'
    },
    wizards: {
      nav: {
        icon: {
          size: refactorFontSize(55),
          color: 'black'
        }
      }
    },
    menus: {
      index: {
        Delivery: 'Delivery',
        PenguGo: 'PenguGo',
        Airbnd: 'Airbnd'
      },
      penguGo: {
        Bicycle: 'Bicycle',
        Scooter: 'Scooter',
        Car: 'Car'
      }
    },
    sideMenu: {
      itemsFontSize: refactorFontSize(17),
      itemsColor: 'white',
      items: {
        top: [
          'LiveOrder',
          'Orders',
          //'Favorites',
          //'Ratings',
          'PaymentMethods',
          'Addresses',
          'Profile',
          'Logout'
        ],
        bottom: [
          'About',
          'Contact',
          //'Language'
        ]
      },
      width: screenSize.width * 0.85
    },
    tabBar: {
      activeColor: '#FFFFFF',
      inactiveColor: '#F8F8F8',
      indicatorColor: '',
      indicatorWidth: refactorFontSize(3),
      underlineColor: '#C0C0C0',
      underlineWidth: refactorFontSize(1)
    },
    tooltip: {
      tintColor: '#FFFFFF',
      textColor: '#222222',
      clickToHide: false,
      shadow: true,
      //duration: 2000,
      //corner: 0,
    },
    styles: {
      baseTitle: {
        fontFamily: 'Comfortaa-Regular',
        fontSize: refactorFontSize(16),
        color: '#7A7A7A',
        textAlign: 'center'
      },
      menuItemTitle: {
        fontFamily: 'Comfortaa-Regular',
        fontSize: refactorFontSize(12),
        color: '#000000'
      }
    },
    colors: {
      viewVoid: 'white',
      mainTopSection: {
        bgColor: 'black'
      },
      topArcGraphic: '#10110D',
      mrPengu: {
        purple: '#844F9A',
        black: '#000000',
        orange: '#FBBC04', //'#DF9700', // '#FBBC04'
        blue: '#001DCA'
      },
      errorOnDark: '#FF0000'
    },
  }
]);

!global.mrp && (global.mrp = {
  data: {}
});
