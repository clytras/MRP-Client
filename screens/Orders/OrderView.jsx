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
  OnFirestoreGotLiveOrders,
  OnFirestoreGotOrdersHistory,
  useDataOrdersHistory,
 } from '@data/firebase/UserData';
 import {
  OrderStatus,
  getOrderStatusColor,
  getOrderStatusForeColor
} from '@mrpbrain/orders/utils';
import { DateTime } from 'luxon';
import Dinero from '@utils/dinero';
import Color from 'color';
import ViewBase from '@mrplib/rn/components/ViewBase';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { ScreenIds } from '@screens/Screens';
import Title from '@components/Title';
import { selectCardIconSource } from '@jsassets/CardIcons'
import { getBottomSpace } from 'react-native-iphone-x-helper';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { getServiceDisplayName } from '@mrplib/data/Services';
import { getAddressLine, getStatusDisplayName, getCancelReasonText } from '@mrplib/data/Orders';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({
  componentId,
  order: inputOrder = null,
  isLive = false
}) {

  const [order, setOrder] = useState(inputOrder);

  console.log('OrderView', order);

  const {
    createdAt,
    code,
    area,
    service,
    address,
    commitServiceWorth = 0,
    isServicePerHour = false,
    servicePaidAmount = 0,
    goodsPaidAmount = 0,
    everyPayCard
  } = order || {};

  const { currency } = area || {};

  useEffect(() => {
    const seekForUpdatedOrder = orders => {
      const { docId: currentOrderId } = order || {};
      console.log('seekForUpdatedOrder::currentOrderId', currentOrderId);
      if(currentOrderId) {
        for(let newOrder of orders) {
          console.log('seekForUpdatedOrder::NO id', newOrder.docId, newOrder);
          if(newOrder.docId == currentOrderId) {
            console.log('seekForUpdatedOrder::found', newOrder.docId, currentOrderId);
            setOrder(newOrder);
            break;
          }
        }
      }
    }

    //if(isLive) {
    //  return OnFirestoreGotLiveOrders(seekForUpdatedOrder);
    //} else {
      return OnFirestoreGotOrdersHistory(seekForUpdatedOrder);
    //}
  }, []);

  function onCloseModal() {
    dismissModal(componentId);
  }

  function renderCategory() {
    let serviceDisplayName = getServiceDisplayName(service).replace(/\n/, ' ');
    let priceText = Dinero({ amount: commitServiceWorth, currency }).toFormat();
    if(isServicePerHour) {
      priceText = `${priceText} / ${Strings.time.tags.hour.toLowerCase()}`
    }

    !serviceDisplayName && (serviceDisplayName = `(${Strings.titles.WithoutCategory})`);
    !priceText && (priceText = '-.-- X');

    return (
      <View style={styles.categoryContainer}>
        <Title text={serviceDisplayName} bottomSpacing={10}/>
        <Text style={styles.categoryPrice}>{priceText}</Text>
      </View>
    );
  }

  function renderStatus() {
    const {
      status,
      cancelReason
    } = order;
    const isCanceled = status == OrderStatus.Canceled;
    const statusColor = Color(getOrderStatusColor(status));

    const statusStyle = {
      backgroundColor: statusColor.alpha(.5).string()
    }

    const statusTextStyle = {
      color: getOrderStatusForeColor(status)
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>{Strings.titles.Status}</Text>
        <View style={[styles.statusBox, statusStyle]}>
          <Text style={[styles.statusText, statusTextStyle]}>{getStatusDisplayName({
            status,
            defaultValue: `(${Strings.order.NoStatus})`
          })}</Text>
        </View>
        {isCanceled && (
          <View style={styles.cancelReasonContainer}>
            <Text style={styles.cancelTitle}>{Strings.titles.CancellationReason}</Text>
            <Text style={styles.cancelReason}>{getCancelReasonText({ cancelReason })}</Text>
          </View>
        )}
      </View>
    );
  }

  function renderCharges() {
    const {
      friendly_name,
      type
    } = everyPayCard || {};

    return (
      <View style={styles.chargesContainer}>
        <Text style={styles.chargesTitle}>{Strings.titles.ChargesNPayments}</Text>
        <View style={styles.paymentsContainer}>
          <View style={[styles.paymentBox, /*!!servicePaidAmount && styles.paymentBoxPaid*/]}>
            <View style={styles.paymentBoxTitle}>
              <Text style={styles.paymentBoxTitleText}>{Strings.titles.Service}</Text>
            </View>
            <View style={styles.paymentBoxAmount}>
              <Text style={styles.paymentBoxAmountText}>{
                Dinero({ amount: servicePaidAmount, currency }).toFormat()
              }</Text>
            </View>
          </View>
          <View style={[
            styles.paymentBox,
            //!!goodsPaidAmount && styles.paymentBoxPaid,
            // styles.paymentBoxNext
          ]}>
            <View style={styles.paymentBoxTitle}>
              <Text style={styles.paymentBoxTitleText}>{Strings.titles.Products}</Text>
            </View>
            <View style={[styles.paymentBoxAmount, styles.paymentBoxNext]}>
              <Text style={styles.paymentBoxAmountText}>{
                Dinero({ amount: goodsPaidAmount, currency }).toFormat()
              }</Text>
            </View>
          </View>
        </View>
        {!!friendly_name && (
          <View style={styles.paymentMethod}>
            {!!type && <Image source={selectCardIconSource({ type })} style={styles.paymentMethodIcon}/>}
            <Text style={styles.paymentMethodText}>{friendly_name}</Text>
          </View>
        )}
      </View>
    );
  }

  function renderAddress() {
    const displayAddress = getAddressLine(address) || Strings.titles.WithoutAddress;

    return (
      <View style={styles.addressContainer}>
        <Text style={styles.adressTitle}>{Strings.titles.Address}</Text>
        <Text style={styles.addressText}>{displayAddress}</Text>
      </View>
    );
  }

  function renderMessage() {
    return null;
  }

  function renderAssets() {
    return null;
  }

  const submittedAt = createdAt && createdAt.toDate();
  const submittedDateTime = submittedAt && DateTime.fromJSDate(submittedAt);
  let commitedDateTimeDisplay;

  if(submittedDateTime) {
    commitedDateTimeDisplay = submittedDateTime
      .setLocale(Strings.getLanguage())
      .toFormat('d MMM yyyy @ h:mm a');
  } else {
    commitedDateTimeDisplay = 'X';
  }

  return order && (
    <>
      <ViewBase
        navigationComponentId={componentId}
        showDrawerButton={false}
        backCloseIcon={true}
        isModal={true}
        headerText={`${isLive ? Strings.titles.LiveOrder : Strings.titles.Order} #${code}`}
        headerSubText={commitedDateTimeDisplay}
        onBackButtonPress={onCloseModal}
      >
        <View style={styles.container}>
          {renderCategory()}
          {renderStatus()}
          {renderCharges()}
          {renderAddress()}
          {renderMessage()}
          {renderAssets()}
        </View>
      </ViewBase>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  categoryContainer: {
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  categoryPrice: {
    color: '#595959'
  },

  statusContainer: {
    marginVertical: 20,
    alignItems: 'center'
  },
  statusTitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: 19
  },
  statusBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,.3)',
    borderRadius: 100
  },
  statusText: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 26,
  },

  cancelReasonContainer: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cancelTitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: refactorFontSize(13),
    color: '#595959'
  },
  cancelReason: {
    fontFamily: 'Comfortaa-Regular',
    marginTop: 10
  },

  chargesContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  chargesTitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: refactorFontSize(16),
  },
  paymentsContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  paymentBox: {
    flex: 1,
    // backgroundColor: 'lightgrey',
    // borderWidth: refactorFontSize(1),
    // borderColor: 'silver',
    // borderRadius: refactorFontSize(100)
  },
  paymentBoxNext: {
    // marginLeft: refactorFontSize(10)
    borderLeftWidth: refactorFontSize(1),
    borderColor: 'silver',
  },
  paymentBoxPaid: {
    backgroundColor: 'lightgreen',
  },
  paymentBoxTitle: {
    // borderBottomWidth: refactorFontSize(1),
    // borderColor: 'silver',
    padding: refactorFontSize(4)
  },
  paymentBoxTitleText: {
    textAlign: 'center',
    color: '#595959'
  },
  paymentBoxAmount: {
    flex: 0,
    backgroundColor: '#F0F0F0',
    // borderWidth: refactorFontSize(1),
    // borderColor: 'silver',
    //borderRadius: refactorFontSize(5),

    padding: refactorFontSize(10),
    //marginHorizontal: 20
  },
  paymentBoxAmountText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: refactorFontSize(20)
  },
  paymentMethod: {
    flexDirection: 'row',
    marginVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: .7
  },
  paymentMethodIcon: {
    width: 60,
    height: 30,
    resizeMode: 'contain'

  },
  paymentMethodText: {

  },

  addressContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  adressTitle: {
    fontFamily: 'Comfortaa-Regular',
    fontSize: refactorFontSize(16),
  },
  addressText: {
    marginTop: 8,
    fontSize: refactorFontSize(15),
    fontWeight: 'bold',
    textAlign: 'center'
  }

});
