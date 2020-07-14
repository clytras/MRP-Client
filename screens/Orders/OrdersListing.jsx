import React, {
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {
  subscribeForOrdersHistory,
  OnFirestoreGotOrdersHistory,
  useDataOrdersHistory,
 } from '@data/firebase/UserData';
 import {
  OrderStatus,
  getOrderStatusColor,
  getOrderStatusForeColor
} from '@mrpbrain/orders/utils';
import { DateTime } from 'luxon';

import ViewBase from '@mrplib/rn/components/ViewBase';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { ScreenIds } from '@screens/Screens';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { getServiceDisplayName } from '@mrplib/data/Services';
import { getAddressLine, getStatusDisplayName } from '@mrplib/data/Orders';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({
  componentId,
  loadOnlyLive = false
}) {

  const [orders, setOrders] = useState(useDataOrdersHistory());
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if(loadOnlyLive) {
      return OnFirestoreGotLiveOrders(orders => setOrders(orders));
    } else {
      subscribeForOrdersHistory();
      return OnFirestoreGotOrdersHistory(orders => setOrders(orders));
    }
  }, []);

  function onItemPress(order) {
    console.log('onItemPress', order);
    showModal(ScreenIds.OrderView, { order });
  }

  function onCloseModal() {
    dismissModal(componentId);
  }

  const itemKeyExtractor = (item, index) => `list-order-item${index}`;

  function renderItem({ item, index }) {
    return (
      <OrderListItem
        order={item}
        onItemPress={onItemPress}
      />
    );
  }

  function emptyList() {
    return updated && (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>{
          `${Strings.messages.NoOrdersFound}\n${Strings.messages.CheckOrdersConnection}`
        }</Text>
      </View>
    );
  }

  return (
    <>
      <ViewBase
        navigationComponentId={componentId}
        showDrawerButton={false}
        backCloseIcon={true}
        isModal={true}
        headerText={Strings.titles.Orders}
        onBackButtonPress={onCloseModal}
      >
        <View style={styles.container}>
          <FlatList
            //contentContainerStyle={styles.flatList}
            removeClippedSubviews
            //disableVirtualization
            keyboardShouldPersistTaps="always"
            //maxToRenderPerBatch={10}
            //initialNumToRender={20}
            //updateCellsBatchingPeriod={0}
            //onRefresh={fetchCustomer}
            refreshing={loading}
            //ref={listRef => this.listRef = listRef}
            style={styles.flatList}
            data={orders}
            //extraData={this.state}
            keyExtractor={itemKeyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={emptyList}
            // ListFooterComponent={<View style={styles.flatListFooterSpacingComponent}/>}
          />
        </View>
      </ViewBase>
    </>
  );
}

class OrderListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
  }

  onItemPress() {
    const { order, onItemPress } = this.props;
    onItemPress && onItemPress(order);
  }

  render() {
    let {
      code,
      createdAt,
      imageRef,
      audioRef,
      address,
      service,
      status,
      area,
      message,
      servicePaidAmount,
      goodsPaidAmmount
    } = this.props.order;

    const statusStyle = {
      backgroundColor: getOrderStatusColor(status)
    }

    const statusTextStyle = {
      color: getOrderStatusForeColor(status)
    }

    const serviceDisplayName = getServiceDisplayName(service);
    const submittedAt = createdAt && createdAt.toDate();
    const submittedDateTime = submittedAt && DateTime.fromJSDate(submittedAt);
    let commitedDateTimeDisplay;

    if(submittedDateTime) {
      commitedDateTimeDisplay = submittedDateTime
        .setLocale(Strings.getLanguage())
        .toFormat('d MMM yy @ h:mm a');
    } else {
      commitedDateTimeDisplay = 'X';
    }

    return (
      <View style={[liStyles.row, liStyles.rowBottomBorder]}>
        <TouchableOpacity style={liStyles.body} onPress={this.onItemPress}>
          {/* <View style={liStyles.iconContainer}>
            <Image source={require('@assets/graphics/mrPengu.png')} style={liStyles.penguIcon}/>
          </View> */}
          <View style={liStyles.bodyLines}>
            <View style={liStyles.textContainer}>
              <Text style={liStyles.textCategory}>{serviceDisplayName.replace(/\n/, ' ')}</Text>
            </View>
            <View style={liStyles.textContainer}>
              <Text style={liStyles.text}>{commitedDateTimeDisplay}</Text>
            </View>
            <View style={liStyles.detailsContainer}>
              <View style={liStyles.codeContainer}>
                <Text style={liStyles.codeText}>{`# `}</Text>
                <Text style={[liStyles.codeText, liStyles.codeNumText]}>{code}</Text>
              </View>
              <View style={[liStyles.statusContainer, statusStyle]}>
                <Text style={[liStyles.statusText, statusTextStyle]}>{getStatusDisplayName({
                  status,
                  defaultValue: `[${Strings.order.NoStatus}]`
                })}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {/* {showDelete && (
          <View style={liStyles.icons}>
            {/* <TouchableOpacity onPress={this.onEditPress}>
              <EvilIcon style={liStyles.icon} name="pencil"/>
            </TouchableOpacity> * /}
            <TouchableOpacity onPress={this.onDeletePress}>
              {isDeleting ? (
                <ActivityIndicator size="small" color={mrp.colors.mrPengu.purple} />
              ) : (
                <EvilIcon style={liStyles.icon} name="trash"/>
              )}
            </TouchableOpacity>
          </View>
        )} */}
      </View>
    );
  }
}

const liStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: refactorFontSize(10),
    paddingVertical: refactorFontSize(14),
  },
  rowBottomBorder: {
    borderBottomWidth: refactorFontSize(1),
    borderBottomColor: 'lightgrey'
  },
  iconContainer: {
    flex: 0,
    width: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    // height: 60,
    // borderColor: 'green',
    // borderWidth: 1,
    marginRight: 6
  },
  penguIcon: {
    //flex: 0,
    height:40, // refactorFontSize(30),
    width: null, // refactorFontSize(60),
    alignSelf: 'stretch',
    // borderWidth: 1,
    // borderColor: 'red',
    resizeMode: 'contain',
    opacity: .7
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodyLines: {
    flex: 1
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  text: {
    flex: 0,
    fontSize: refactorFontSize(14),
    color: 'black'
  },
  textCategory: {
    flex: 1,
    fontWeight: 'bold',
    //textAlign: 'right',
  },
  subText: {
    fontSize: refactorFontSize(13),
    color: 'grey'
  },
  subTextInvalid: {
    color: '#AD1616'
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: refactorFontSize(30)
  },
  cardIcon: {
    height: refactorFontSize(30),
    width: refactorFontSize(60),
    resizeMode: 'contain'
  },

  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3
  },

  statusContainer: {
    flex: 0,
    backgroundColor: 'cyan',
    borderRadius: 4,
    borderWidth: refactorFontSize(1),
    borderColor: 'lightgrey',
    //marginHorizontal: 10,
    //marginLeft: 10,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusText: {
    textAlign: 'center'
  },

  codeContainer: {
    flexDirection: 'row',
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: refactorFontSize(16),
  },
  codeNumText: {
    fontWeight: 'bold',
    color: '#408080'
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'red'
  },
  flatList: {
    flex: 1
  },
  flatListFooterSpacingComponent: {
    height: refactorFontSize(90)
  },
  emptyListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    paddingTop: '10%',
    textAlign: 'center',
    lineHeight: refactorFontSize(18)
  },

  cardDetailsOverlay: {
    backgroundColor: 'rgba(0,0,0,.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardDetailsContainer: {
    width: '80%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: refactorFontSize(10)
  },
  cardLinesContainer: {
    marginHorizontal: refactorFontSize(20),
    color: 'red'
  },
  cardDetailsBottonContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row'
  },
  cardDetailsBotton: {
    flex: 1,
    borderRadius: refactorFontSize(5),
    height: refactorFontSize(40),
    margin: refactorFontSize(20),
    justifyContent: 'center',
    //padding: refactorFontSize(20),
    backgroundColor: mrp.colors.mrPengu.orange
  },
  cardDetailsBottonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: refactorFontSize(15),
  },

  cardAddNew: {
    position: 'absolute',
    zIndex: 1000,
    width: refactorFontSize(50),
    height: refactorFontSize(50),
    bottom: refactorFontSize(16),
    right: refactorFontSize(16),
    backgroundColor: mrp.colors.mrPengu.orange,
    borderRadius:  refactorFontSize(100),
    borderWidth: 1,
    borderColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: refactorFontSize(getBottomSpace()),

    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
  cardAddNewIcon: {
    fontSize:  refactorFontSize(30),
    color: 'black'
  }
});
