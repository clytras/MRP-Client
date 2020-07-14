import React, {
  useState,
  useEffect
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import firebase from 'react-native-firebase';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useDataUserAddresses, OnFirestoreGotUserAddresses } from '@data/firebase/UserData';
import { NavigationEvents } from 'react-navigation';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({ navigation, onPanelChange }) {

  const [addresses, setAddresses] = useState(useDataUserAddresses());
  const [loading, setLoading] = useState(false);

  console.log('AddressListing:in', addresses);

  // useEffect(() => {
  //   const user = firebase.auth().currentUser;
  //   if(user) {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setAddresses(['one', 'two', 'three']);
  //       setLoading(false);
  //       setTimeout(() => {
  //         setAddresses(['one 1', 'two', 'three']);
  //       }, 3000);
  //     }, 2000);
  //   } else {
  //     showAlert({
  //       title: Strings.messages.SomethingWentWrong,
  //       message: Strings.messages.UserNotFound,
  //     }).then(() => {
  //       onPanelChange(null);
  //     });
  //   }
  // }, []);

  useEffect(() => {
    return OnFirestoreGotUserAddresses(data => setAddresses(data));
  }, []);

  function goEdit() {
    console.log('PickAddress:goEdit', navigation);
    navigation.navigate('PickAddress');
  }

  function onWillFocus({ state: { routeName }}) {
    onPanelChange(routeName);
  }

  function onAddNewAddressPress() {
    console.log('onAddNewAddressPress');
    navigation.navigate('PickAddress', { listingMode: true });
  }

  function onItemPress(address) {
    console.log('onItemPress', address);
    onItemEditPress(address);
  }

  function onItemEditPress({ location: { geopoint: { latitude, longitude }}, ...address }) {
    console.log('onItemEditPress', address, latitude, longitude);
    address.location = {
      latitude,
      longitude
    }
    navigation.navigate('EditAddress', {
      address,
      listingMode: true,
      onListingUpdate: () => console.log('finsi address edit')
    });
  }

  function onItemDeletePress({
    docId,
    route,
    streetNumber,
    locality,
    postalCode,
    area
  }) {
    console.log('onItemDeletePress', docId, route, streetNumber, locality, area);

    const message = [`${route} ${streetNumber}`, locality];
    area && message.push(area);
    postalCode && message.push(postalCode);

    showAlert({
      title: Strings.titles.DeleteAddress,
      message: message.join(', '),
      showCancelButton: true,
      onConfirmPressed: () => {
        const { uid } = firebase.auth().currentUser;
        firebase.firestore().collection(`users/${uid}/addresses`).doc(docId).delete();
      }
    })
  }

  const itemKeyExtractor = (item, index) => `list-address-item${index}`;

  function renderItem({ item, index }) {
    return (
      <AddressListItem
        address={item}
        onItemPress={onItemPress}
        onEditPress={onItemEditPress}
        onDeletePress={onItemDeletePress}
      />
    );
  }

  function emptyList() {
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>{Strings.messages.NoAddressesFound}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationEvents onWillFocus={onWillFocus}/>
      <FlatList
        //contentContainerStyle={styles.flatList}
        removeClippedSubviews
        //disableVirtualization
        keyboardShouldPersistTaps="always"
        //maxToRenderPerBatch={10}
        //initialNumToRender={20}
        //updateCellsBatchingPeriod={0}
        refreshing={loading}
        //ref={listRef => this.listRef = listRef}
        style={styles.flatList}
        data={addresses}
        //extraData={this.state}
        keyExtractor={itemKeyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={emptyList}
        ListFooterComponent={<View style={styles.flatListFooterSpacingComponent}/>}
      />
      <TouchableOpacity
        style={styles.addressFetchCurrent}
        onPress={onAddNewAddressPress}
      >
        <Ionicon style={styles.addressFetchCurrentIcon} name={ionicIcon('add')} />
      </TouchableOpacity>
    </View>
  );
}

class AddressListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
    this.onDeletePress = this.onDeletePress.bind(this);
    this.onEditPress = this.onEditPress.bind(this);
  }

  onItemPress() {
    const { address, onItemPress } = this.props;
    onItemPress && onItemPress(address);
  }

  onEditPress() {
    const { address, onEditPress } = this.props;
    onEditPress && onEditPress(address);
  }

  onDeletePress() {
    const { address, onDeletePress } = this.props;
    onDeletePress && onDeletePress(address);
  }

  render() {
    const {
      address: {
        route,
        streetNumber,
        area,
        locality,
        postalCode,
        floor,
        ringBellName
      }
    } = this.props;

    const text = [`${route} ${streetNumber}`, locality];
    area && text.push(area);
    postalCode && text.push(postalCode);

    let subText = [];
    floor && subText.push(`${Strings.titles.HouseFloor}: ${floor >= 1 ? floor : Strings.titles.GroundFloor}`);
    ringBellName && subText.push(`${Strings.titles.RingBellName}: ${ringBellName}`)

    return (
      <View style={liStyles.row}>
        <TouchableOpacity style={liStyles.body} onPress={this.onItemPress}>
          <Text style={liStyles.text}>{text.join(', ')}</Text>
          {subText.length > 0 && <Text style={liStyles.subText}>{subText.join(', ')}</Text>}
        </TouchableOpacity>
        <View style={liStyles.icons}>
          <TouchableOpacity onPress={this.onEditPress}>
            <EvilIcon style={liStyles.icon} name="pencil"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onDeletePress}>
            <EvilIcon style={liStyles.icon} name="trash"/>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: refactorFontSize(1),
    borderBottomColor: 'lightgrey'
  },
  body: {
    flex: 1
  },
  text: {
    fontSize: refactorFontSize(15),
    color: 'black'
  },
  subText: {
    fontSize: refactorFontSize(13),
    color: 'grey'
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: refactorFontSize(30)
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: 'red'
  },
  flatList: {
    //paddingBottom: refactorFontSize(300)
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
  addressFetchCurrent: {
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
  addressFetchCurrentIcon: {
    fontSize:  refactorFontSize(30),
    color: 'black'
  }
});
