import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableOpacity
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import { refactorFontSize } from '@mrplib/rn/utils';
import { Drawer, dismissModal, pop } from '@mrplib/rn/helpers/rnn';
import { Navigation } from "react-native-navigation";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Strings } from '@mrplib/i18n/rn';
import HeaderBackgroundCurved from '@mrplib/assets/svg/HeaderBackgroundCurved';
import mrp from '@app/mrp';


export default class Header extends React.Component {
  constructor(props) {
    super(props);

    // const { text, visible, showBackButton, showDrawerButton } = props;

    // this.state = {
    //   text,
    //   visible,
    //   showBackButton,
    //   showDrawerButton
    // }

    this.onBackPress = this.onBackPress.bind(this);
    this.onDrawerPress = this.onDrawerPress.bind(this);
  }

  // showBackButton(showBackButton = true) {
  //   this.setState({ showBackButton });
  // }

  // setVisible(visible) {
  //   this.setState({ visible });
  // }

  // getVisible() {
  //   return this.state.visible;
  // }

  // setStateProps(stateProps) {
  //   stateProps.text = stateProps.text || '';
  //   stateProps.subText = stateProps.subText || '';
  //   this.setState(prevState => ({
  //     ...prevState,
  //     ...stateProps
  //   }));
  // }

  onBackPress() {
    const { showBackButton, navigationComponentId, onBackButtonPress } = this.props;
    if(!showBackButton) return;
    const onBackButtonResult = onBackButtonPress ? onBackButtonPress() : true;

    console.log('Header::onBackPress', onBackButtonResult, onBackButtonPress);

    if(onBackButtonResult) {
      if(!this.hasPop) {
        this.hasPop = true;
        //NavigationService.pop(this.props.navigationComponentId);
        pop(navigationComponentId);
      }
    }

    return;

    if(this.props.isModal) {
      dismissModal(this.props.navigationComponentId);
    } else {
      if(!this.hasPop) {
        this.hasPop = true;
        pop(this.props.navigationComponentId);
      }
    }
  }

  onDrawerPress() {
    console.log('Header::onDrawerPress', this.props.navigationComponentId);
    //toggleDrawer(this.props.navigationComponentId);
    Drawer.toggle('left');
  }

  render() {
    const {
      showBackButton,
      showDrawerButton,
      text,
      subText,
      backCloseIcon = false
    } = this.props;
    return (
      <View style={styles.container}>
        <HeaderBackgroundCurved style={styles.svgContainerImageBackground} height={90} />
        <TouchableOpacity style={styles.iconContainer} onPress={this.onBackPress}>
          {backCloseIcon ? (
            <MaterialIcon name="clear" style={[styles.icon, styles.closeIcon, !showBackButton && styles.iconHidden]} />
          ) : (
            <EntypoIcon name="chevron-thin-left" style={[styles.icon, !showBackButton && styles.iconHidden]} />
          )}
        </TouchableOpacity>
        <View style={text ? styles.textContainer : styles.logoContainer}>
          {text ? (
            <>
              <Text style={styles.text}>{text}</Text>
              {subText && <Text style={styles.subText} ellipsizeMode="tail" numberOfLines={1}>{subText}</Text>}
            </>
          ) : (
            <Image source={require('../assets/graphics/mrPengu-logo.png')} style={styles.logo} />
          )}
        </View>
        {showDrawerButton ? (
          <TouchableOpacity style={styles.iconContainer} onPress={this.onDrawerPress}>
            <FontAwesomeIcon name="bars" style={styles.icon} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconContainer}>
            <View style={[styles.icon, styles.iconHidden]} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 90,
    zIndex: 100,
    // borderColor: 'red',
    // borderWidth: 1,
    //height: mrp.header.height * 2,
    //backgroundColor: mrp.colors.back,
    //alignItems: 'center',
    //justifyContent: 'center'
  },
  containerImageBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch'
  },
  svgContainerImageBackground: {
    width: '100%',
    height: 90,
    position: 'absolute',
    // borderColor: 'cyan',
    // borderWidth: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: '20%'
  },
  logo: {
    width: '100%',
    height: '60%',
    resizeMode: 'contain'
  },
  text: {
    fontSize: refactorFontSize(17),
    // borderColor: 'red',
    // borderWidth: 1,
    color: 'white',
  },
  subText: {
    fontSize: refactorFontSize(11),
    color: 'white',
  },
  iconContainer: {
    // borderColor: 'red',
    // borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '20%'
  },
  icon: {
    // borderColor: 'blue',
    // borderWidth: 1,
    fontSize: mrp.header.iconFontSize,
    color: mrp.header.foreColor,
    //paddingVertical: 10, //refactorFontSize(20),
    paddingHorizontal: refactorFontSize(10)
  },
  closeIcon: {
    fontSize: mrp.header.iconFontSize + refactorFontSize(5),
  },
  iconHidden: {
    color: 'transparent',
    width: refactorFontSize(40),
  }
});
