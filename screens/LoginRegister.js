import React from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  InteractionManager
} from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import { AfterInteractions } from 'react-native-interactions';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import StatusBar from '@mrplib/rn/components/StatusBar';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';
import { refactorFontSize } from '@mrplib/rn/utils';

import LoginPanel from '@panels/Login';
import RegisterPanel from '@panels/Register';


export default class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTabs: false
    }

    this.onClosePress = this.onClosePress.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const { componentId, onSuccessLogin } = this.props;

      const TabScreen = createMaterialTopTabNavigator({
        Login: {
          screen: props => <LoginPanel {...props}
            onSuccessLogin={onSuccessLogin}
            componentId={componentId} />
        },
        Register: {
          screen: props => <RegisterPanel {...props}
            componentId={componentId} />
        },
      }, {
        tabBarPosition: 'top',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
          activeTintColor: mrp.tabBar.activeColor,
          inactiveTintColor: mrp.tabBar.inactiveColor,
          style: {
            backgroundColor: mrp.colors.mainTopSection.bgColor,
            borderBottomWidth: mrp.tabBar.underlineWidth,
            borderBottomColor: mrp.tabBar.underlineColor
          },
          labelStyle: {
            padding: 0,
            margin: 0,
            fontSize: 19,
            fontWeight: 'bold',
            textAlign: 'center',
          },
          indicatorStyle: {
            borderBottomColor: mrp.colors.mrPengu.orange,
            borderBottomWidth: mrp.tabBar.indicatorWidth,
          }
        }
      });

      this.TabsContainer = createAppContainer(TabScreen);
      this.setState({
        showTabs: true
      })
    });
  }

  onClosePress() {
    const { componentId } = this.props;
    dismissModal(componentId);
  }

  render() {
    const { TabsContainer } = this;
    const { showTabs } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={mrp.colors.mrPengu.black} barStyle="light-content" />
        <ImageBackground
          style={styles.header}
          imageStyle={styles.headerImage}
          source={require('@assets/graphics/mrPengu-logo.png')}
        >
          <TouchableOpacity style={styles.closeButton} onPress={this.onClosePress}>
            <Icon name="clear" color="white" size={40} />
          </TouchableOpacity>
        </ImageBackground>
        {/*<TabView
          navigationState={this.state}
          renderTabBar={() => {}}
          renderPager={(props) => <PagerScroll {...props}/>}
          renderScene={SceneMap({
            login: LoginPanel,
            register: RegisterPanel,
          })}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get('window').width }}
        />*/}
        <ImageBackground source={require('@assets/graphics/cityBackground.png')}
          fadeDuration={0}
          style={styles.bodyContainter}
          imageStyle={styles.containerImageBackground}
        >
          {showTabs && <TabsContainer/>}
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'green',
    //alignItems: 'center',
    //justifyContent: 'center',
    backgroundColor: 'black'
  },
  header: {
    flexDirection: 'row',
    height: refactorFontSize(60),
    alignItems: 'center',
    //backgroundColor: 'red'
  },
  headerImage: {
    //marginVertical: refactorFontSize(10),
    marginTop: refactorFontSize(20),
    //alignItems: 'center',
    //justifyContent: 'center',
    height: refactorFontSize(40),
    resizeMode: 'contain',
    //backgroundColor: 'blue'
  },
  closeButton: {
    height: '100%',
    paddingHorizontal: refactorFontSize(10),
    justifyContent: 'center',
    //backgroundColor: 'green'
  },

  bodyContainter: {
    flex: 1
  },
  containerImageBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
});
