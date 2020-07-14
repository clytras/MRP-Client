import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import mrp from '../mrp';
import { refactorFontSize } from '@mrplib/rn/utils';


class TabBar extends React.Component {

  constructor(props) {
    super(props);

    const { activeTab = 0 } = props;

    this.state = {
      activeTab
    }
  }

  onTabPress(index) {
    this.props.onPress(index);
    this.setState({ activeTab: index });
  }

  render() {
    const { style, items } = this.props;
    const { activeTab } = this.state;

    return (
      <View style={[styles.tabsContainer, style]}>
        {items.map(({ title, imageSource }, index) =>
        <TouchableOpacity
          style={[
            styles.tabContainer,
            index == activeTab ? styles.tabContainerActive : []
          ]}
          onPress={this.onTabPress.bind(this, index)}
          key={index}
        >
          <Image source={imageSource} style={styles.tabImage} fadeDuration={0} />
          <Text style={styles.tabText}>{title}</Text>
        </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    //alignItems: 'center',
    //justifyContent: 'center',
    height: refactorFontSize(80),
    backgroundColor: mrp.colors.topTabs.back,
    borderBottomColor: mrp.colors.topTabs.borderBottom,
    borderBottomWidth: 1
  },
  tabContainer: {
    flex: 1,
    paddingTop: refactorFontSize(10),
    height: refactorFontSize(80),
    //alignItems: 'center',
    //flexDirection: 'column',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    //backgroundColor: 'green', // mrp.colors.back
  },
  tabContainerActive: {
    borderBottomColor: mrp.colors.foodExpo.foreBlue,
  },
  tabText: {
    color: mrp.colors.greyText,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: refactorFontSize(14)
    //backgroundColor: 'orange'
  },
  tabImage: {
    height: refactorFontSize(44),
    width: null,
    resizeMode: 'contain',
    //backgroundColor: 'blue',
  },
  contentContainer: {
    flex: 1
  }
});

export default TabBar;
