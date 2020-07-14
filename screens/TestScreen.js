import React from 'react';
import { StyleSheet, Platform, Image, Text, View, Button } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import ViewBase from '@mrplib/rn/components/ViewBase';

export default class TestScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name || 1
    };
  }

  componentDidMount() {
    console.log('TestScreen did mount');
    SplashScreen.hide();
  }

  render() {
    const { name } = this.state;
    return (
      <ViewBase navigationComponentId={this.props.componentId}>
        <View style={styles.layout}>
          <Text style={styles.text}>{name}</Text>
        </View>
      </ViewBase>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  text: {
    fontSize: 20
  }
});
