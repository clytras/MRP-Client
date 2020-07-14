import React from 'react';
import {
    StyleSheet,
    Modal
} from 'react-native';
import ListPopover from './ListPopover';


class ActionPicker extends React.Component {
  constructor(props) {
    super(props);

    const { visible = false, options } = props;
    this.state = {
      visible,
      options
    }

    this._onRequestClose = this._onRequestClose.bind(this);
    this._onOptionSelect = this._onOptionSelect.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.visible !== state.visible) {
      return {
        visible: props.visible
      }
    }
    return null;
  }

  _onRequestClose() {
    this.setState({ visible: false });
  }

  _onClose() {
    const { onClose } = this.props;
    this.setState({ visible: false }, () => {
      onClose && onClose();
    });
  }

  _onOptionSelect() {

  }

  render() {
    const { visible, options } = this.state;
    return (
      <Modal
        onRequestClose={this._onRequestClose}
        animationType="slide"
        transparent={true}
        visible={visible}
      >
        <ListPopover
          list={options}
          isVisible={visible}
          onClick={this._onOptionSelect}
          onClose={this._onClose}
        />
      </Modal>
    );
  }
}

export default ActionPicker;
