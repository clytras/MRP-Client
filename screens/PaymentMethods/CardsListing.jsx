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
import ViewBase from '@mrplib/rn/components/ViewBase';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { showModal } from '@mrplib/rn/helpers/rnn';
import { ScreenIds } from '@screens/Screens';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import DetailsLine from '@mrplib/rn/components/DetailsLine';
import { selectCardIconSource } from '@jsassets/CardIcons'
import { getCardName } from '@mrplib/data/Payments';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { translateFirebaseError } from '@data/firebase/Errors';
import {
  hasCachedCustomer,
  resetCustomerCache,
  setCustomer,
  getCustomer,
  retrieveCustomer,
  deleteCard
} from '@data/gateways/EveryPay';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({ componentId }) {

  const [customer, setCustomer] = useState({});
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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
    if(hasCachedCustomer()) {
      const customer = getCustomer();
      setCustomer(customer);
      setCardsFromCustomer(customer);
      setUpdated(true);
    } else {
      fetchCustomer();
    }
  }, []);

  function fetchCustomer() {
    setLoading(true);
    setUpdated(false);

    retrieveCustomer()
    .then(data => {
      if(data && 'result' in data) {
        const { result, customer } = data;

        if(customer) {
          setCustomer(customer);
          setCardsFromCustomer(customer);
        }
      }
    })
    .catch(error => {
      console.log('fetchCustomer::ERROR', error);
      const { title, message } = translateFirebaseError(error);
      showAlert({ title, message });
    })
    .finally(() => {
      setLoading(false);
      setUpdated(true);
    });
  }

  function setCardsFromCustomer(customer = {}) {
    console.log('setCardsFromCustomer', customer);
    if(customer && 'cards' in customer && customer.cards && 'data' in customer.cards) {
      setCards(customer.cards.data);
    } else {
      setCards([]);
    }
  }

  function onItemPress(card) {
    console.log('onItemPress', card);
    setSelectedCard(card);
  }

  function removeCardFromList({ token }) {
    let newData = [];

    for(let card of cards) {
      if(card.token == token) continue;
      newData.push(card);
    }
    customer.cards.data = newData;
    customer.cards.count = newData.length;
    setCards(newData);
    resetCustomerCache();
  }

  function onItemDeletePress(card) {
    console.log('onItemDeletePress', card);

    if(cards.length == 1) {
      showAlert({
        title: Strings.titles.DeleteCard,
        message: Strings.messages.YouCantDeleteLastCard,
      });
      return false;
    } else {
      return true;
    }

    // const { friendly_name } = card;
    // let doDelete = false;

    // // const message = [`${route} ${streetNumber}`, locality];
    // // area && message.push(area);
    // // postalCode && message.push(postalCode);

    // showAlert({
    //   title: Strings.titles.DeleteCard,
    //   message: friendly_name,
    //   showCancelButton: true,
    //   onConfirmPressed: () => {
    //     // const { uid } = firebase.auth().currentUser;
    //     // firebase.firestore().collection(`users/${uid}/cardes`).doc(docId).delete();
    //     console.log('delete', card);
    //     doDelete = true;
    //   }
    // })
    // .then(() => {
    //   console.log('deleting', doDelete);
    // });
  }

  function onCloseModal() {
    dismissModal(componentId);
  }

  function onAddNewCard() {
    console.log('onAddNewCard');

    showModal(ScreenIds.AddCard, {
      onSuccessAdd: onCardAddSuccess,
      onCancel: onCardAddCancel
    });
  }

  function onCardAddCancel() {
    console.log('onCardAddCancel');
  }

  function onCardAddSuccess({ card, customer }) {
    console.log('onCardAddSuccess', customer, card);

    setCustomer(customer);
    setCardsFromCustomer(customer);
  }

  const itemKeyExtractor = (item, index) => `list-card-item${index}`;

  function renderItem({ item, index }) {
    return (
      <CardListItem
        card={item}
        onItemPress={onItemPress}
        onDeletePress={onItemDeletePress}
        removeItemFromList={removeCardFromList}
      />
    );
  }

  function emptyList() {
    return updated && (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>{Strings.messages.NoCardsFound}</Text>
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
        headerText={Strings.titles.PaymentMethods}
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
            onRefresh={fetchCustomer}
            refreshing={loading}
            //ref={listRef => this.listRef = listRef}
            style={styles.flatList}
            data={cards}
            //extraData={this.state}
            keyExtractor={itemKeyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={emptyList}
            ListFooterComponent={<View style={styles.flatListFooterSpacingComponent}/>}
          />
        </View>
      </ViewBase>
      <TouchableOpacity
        style={styles.cardAddNew}
        onPress={onAddNewCard}
      >
        <Ionicon style={styles.cardAddNewIcon} name={ionicIcon('add')} />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={!!selectedCard}
        onDismiss={() => setSelectedCard(null)}
      >
        <CardDetailsOverlay card={selectedCard} onOverlayPress={() => setSelectedCard(null)}/>
      </Modal>
    </>
  );
}

function CardDetailsOverlay({
  card,
  onOverlayPress
}) {

  const {
    friendly_name,
    expiration_month,
    expiration_year,
    holder_name,
    type
  } = card;

  function _onOverlayPress() {
    onOverlayPress && onOverlayPress();
  }

  return (
    <View style={styles.cardDetailsOverlay}>
      <View style={styles.cardDetailsContainer}>
        <CardListItem card={card}
          showBottomBorder={false}
          showDelete={false}
        />
        <View style={styles.cardLinesContainer}>
          <DetailsLine label={Strings.titles.HoldersName} text={holder_name}/>
          <DetailsLine label={Strings.titles.CardType} text={getCardName({ type })}/>
        </View>
        <View style={styles.cardDetailsBottonContainer}>
          <TouchableOpacity style={styles.cardDetailsBotton} onPress={_onOverlayPress}>
            <Text style={styles.cardDetailsBottonText}>{Strings.titles.Close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

class CardListItem extends React.PureComponent {
  state = {
    isDeleting: false
  }

  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
    this.onDeletePress = this.onDeletePress.bind(this);
    // this.onEditPress = this.onEditPress.bind(this);
  }

  onItemPress() {
    const { card, onItemPress } = this.props;
    onItemPress && onItemPress(card);
  }

  // onEditPress() {
  //   const { card, onEditPress } = this.props;
  //   onEditPress && onEditPress(card);
  // }

  onDeletePress() {
    const { card, onDeletePress, removeItemFromList } = this.props;
    //onDeletePress && onDeletePress(card);

    if(onDeletePress && !onDeletePress()) {
      return;
    }

    console.log('onItemDeletePress', card);

    const { friendly_name } = card;

    // const message = [`${route} ${streetNumber}`, locality];
    // area && message.push(area);
    // postalCode && message.push(postalCode);

    showAlert({
      title: Strings.titles.DeleteCard,
      message: friendly_name,
      showCancelButton: true,
      onConfirmPressed: () => {
        // const { uid } = firebase.auth().currentUser;
        // firebase.firestore().collection(`users/${uid}/cardes`).doc(docId).delete();
        console.log('delete', card);
        this.setState({ isDeleting: true }, async () => {
          let isDeleted = false;
          try {
            const { token: cardId } = card;
            const { result, is_deleted } = await deleteCard({ cardId });
            isDeleted = is_deleted;

            if(!is_deleted) {
              showAlert({
                title: Strings.messages.SomethingWentWrong,
                message: [Strings.messages.CouldNotDeleteCard, Strings.messages.PleaseContactSupport].join("\n")
              });
            }
          } catch(error) {
            console.log('deleteCard::ERROR', error);
            const { title, message } = translateFirebaseError(error);
            showAlert({ title, message });
          }

          this.setState({ isDeleting: false }, () => {
            isDeleted && removeItemFromList(card);
          });
        });
      }
    });

  }

  render() {
    const {
      card: {
        type,
        friendly_name,
        status,
        expiration_year,
        expiration_month
      },
      showDelete = true,
      showBottomBorder = true
    } = this.props;
    const { isDeleting } = this.state;

    let subText = `${expiration_month}/${expiration_year} `;
    let subTextStyle;

    if(status == 'valid') {
      subText = `${subText} (${Strings.titles.Valid})`
    } else {
      subText = `${subText} (${Strings.titles.Invalid})`
      subTextStyle = liStyles.subTextInvalid;
    }

    console.log('card icon', type, selectCardIconSource({ type }));

    return (
      <View style={[liStyles.row, showBottomBorder && liStyles.rowBottomBorder]}>
        <TouchableOpacity style={liStyles.body} onPress={this.onItemPress}>
          <Image source={selectCardIconSource({ type })} style={liStyles.cardIcon}/>
          <View style={liStyles.bodyLines}>
            <Text style={liStyles.text}>{friendly_name}</Text>
            {subText.length > 0 && <Text style={[liStyles.subText, subTextStyle]}>{subText}</Text>}
          </View>
        </TouchableOpacity>
        {showDelete && (
          <View style={liStyles.icons}>
            {/* <TouchableOpacity onPress={this.onEditPress}>
              <EvilIcon style={liStyles.icon} name="pencil"/>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={this.onDeletePress}>
              {isDeleting ? (
                <ActivityIndicator size="small" color={mrp.colors.mrPengu.purple} />
              ) : (
                <EvilIcon style={liStyles.icon} name="trash"/>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: refactorFontSize(15),
    color: 'black'
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
