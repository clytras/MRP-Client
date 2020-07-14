import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from '@react-native-community/netinfo';
import mrp from '@app/mrp';
import { refactorFontSize } from '@mrplib/rn/utils';
import { Strings } from '@mrplib/i18n/rn';


export default class ConnectionStatusOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      animatedValue: new Animated.Value(0),
      isConnected: true
    };

    this.slideDuration = this.props.slideDuration || 350;
    this.useNativeDriver = true;
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
  }

  componentDidMount() {
    //NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);

    // this.setState({
    //   hasConnection: false
    // });

    // setTimeout(() => {
    //   let { hasConnection, animatedValue } = this.state;
    //   hasConnection = !hasConnection;

    //   let toValue = 1;

    //   if(!hasConnection) {
    //     animatedValue = new Animated.Value(1);
    //     toValue = 0;
    //   }

    //   //const toValue = hasConnection ? 1 : 0;

    //   console.log('toggle connection', hasConnection, animatedValue, toValue);

    //   this.setState({ hasConnection, animatedValue });

    //   Animated
    //   .timing(animatedValue, {
    //       toValue,
    //       duration: 350,
    //       useNativeDriver: true
    //   })
    //   .start();

    // }, 2000);
  }

  componentWillUnmount() {
    //NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    const { netInfoUnsubscribe } = this;
    if(netInfoUnsubscribe) {
      netInfoUnsubscribe();
    }
  }

  handleConnectivityChange({ isConnected, ...args }) {
    console.log('ConnectionStatusOverlay::handleConnectivityChange', isConnected, args);

    let { animatedValue } = this.state;
    let toValue = 0;

    if(!isConnected) {
      animatedValue = new Animated.Value(0);
      toValue = 1;
      this.setState({ isConnected, animatedValue });
    } else {
      this.setState({ animatedValue });
    }

    //console.log('toggle connection', hasConnection, animatedValue, toValue);

    Animated
    .timing(animatedValue, {
      toValue,
      duration: 350,
      useNativeDriver: true
    })
    .start(() => {
      this.setState({ isConnected });
    });
  }

  render() {
    const { isConnected, animatedValue } = this.state;
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [60, 0]
    });

    let syule = [styles.container, ]

    return (
      <Animated.View style={[
        styles.container,
        isConnected && styles.hidden,
        {
          transform: [{
            translateY
          }]
        }]
      }>
        <Icon name="exclamation-triangle" style={styles.noConnectionIcon} />
        <Text style={styles.noConnectionText}>{Strings.messages.NoPenguConnection}</Text>
      </Animated.View>
    );
  }
}


const styles = StyleSheet.create({
  hidden: {
    opacity: 0
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    // borderWidth: 1,
    // borderColor: 'red',
    display: 'flex',
    //width: 100,
    width: '100%',
    //height: 100
    //flex: 1
    padding: refactorFontSize(5),
    paddingHorizontal: refactorFontSize(14),
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.8)',
  },
  noConnectionText: {
    fontFamily: 'Roboto',
    fontSize: refactorFontSize(15),
    //letterSpacing: refactorFontSize(.5),
    color: 'white',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  noConnectionIcon: {
    fontSize: refactorFontSize(15),
    marginRight: 8,
    color: '#FFEF95'
    // borderWidth: 1,
    // borderColor: 'red',
  }
});
