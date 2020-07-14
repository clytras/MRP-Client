import React from 'react';
import PropTypes from 'prop-types';
import {
  ListView,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  View
} from 'react-native';
import { refactorFontSize } from '@mrplib/rn/utils';


const ScreenHeight = Dimensions.get('window').height;
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class ListPopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: ds.cloneWithRows(this.props.list)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list !== this.props.list) {
      this.setState({dataSource: ds.cloneWithRows(nextProps.list)});
    }
  }

  handleClick(data) {
    this.props.onClick(data);
    this.props.onClose();
  }

  renderRow(rowData) {
    const { separatorStyle = DefaultStyles.separator } = this.props;
    const rowTextStyle = this.props.rowText || DefaultStyles.rowText;
    let separator = null, row = null;

    if(!this.isFirstRowDraw) {
      this.isFirstRowDraw = true;
    } else {
      separator = <View style={separatorStyle}/>;
    }

    if(this.props.renderRow) {
      row = this.props.renderRow(rowData);
    } else {
      row = <Text style={rowTextStyle}>{rowData.label}</Text>
    }

    return (
      <View>
        {separator}
        <TouchableOpacity onPress={() => this.handleClick(rowData)}>
        {row}
        </TouchableOpacity>
      </View>
    );
  }

  renderList() {
    this.isFirstRowDraw = false;
    const styles = this.props.style || DefaultStyles;
    let maxHeight = {};
    if(this.props.list.length > 12) {
      maxHeight = {height: ScreenHeight * 3/4};
    }
    return (
      <ListView
        style={maxHeight}
        dataSource={this.state.dataSource}
        renderRow={(rowData) => this.renderRow(rowData)}
      />
    );
  }

  render() {
    const containerStyle = this.props.containerStyle || DefaultStyles.container;
    const popoverStyle = this.props.popoverStyle || DefaultStyles.popover;

    if (this.props.isVisible) {
      return (
        <TouchableOpacity onPress={this.props.onClose} style={containerStyle}>
          <View style={popoverStyle}>
            {this.renderList()}
          </View>
        </TouchableOpacity>
      );
    } else {
      return (<View/>);
    }
  }
}

ListPopover.propTypes = {
  list: PropTypes.array.isRequired,
  isVisible: PropTypes.bool,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
};

ListPopover.defaultProps = {
  list: [""],
  isVisible: false,
  onClick: () => {},
  onClose: () => {}
};

const DefaultStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: ScreenHeight,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,.5)'
  },
  popover: {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 3,
    zIndex: 20,
    width: '96%',
  },
  rowText: {
    padding: 10,
    fontSize: refactorFontSize(19)
  },
  separator: {
    backgroundColor: '#ccc',
    height: 0.7,
    marginLeft: 8,
    marginRight: 8,
  },
});

export default ListPopover;
