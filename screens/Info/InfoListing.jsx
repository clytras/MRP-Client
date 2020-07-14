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
import { getCardName } from '@mrplib/data/Payments';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { showAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export default function({ componentId }) {

  const [items] = useState([
    'AboutMrPengu',
    'MrPenguGo',
    'PrivacyPolicy',
    'TermsOfService'
  ]);

  useEffect(() => {

  }, []);


  function onItemPress(item) {
    console.log('onItemPress', item);
    showModal(ScreenIds.InfoPageView, { mode: item });
  }

  function onCloseModal() {
    dismissModal(componentId);
  }

  const itemKeyExtractor = (item, index) => `list-item${index}`;

  function renderItem({ item, index }) {
    return (
      <ListItem
        item={item}
        onItemPress={onItemPress}
      />
    );
  }

  return (
    <>
      <ViewBase
        navigationComponentId={componentId}
        showDrawerButton={false}
        backCloseIcon={true}
        isModal={true}
        headerText={Strings.titles.About}
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
            //refreshing={loading}
            //ref={listRef => this.listRef = listRef}
            style={styles.flatList}
            data={items}
            //extraData={this.state}
            keyExtractor={itemKeyExtractor}
            renderItem={renderItem}
            // ListEmptyComponent={emptyList}
            // ListFooterComponent={<View style={styles.flatListFooterSpacingComponent}/>}
          />
          <View style={styles.mrPenguLogoContainer}>
            <Image source={require('@assets/graphics/mrPengu-logo-black.png')} style={styles.mrPenguLogo}/>
          </View>
        </View>
      </ViewBase>
      <Modal
        transparent={true}
        visible={false}
        //onDismiss={() => setSelectedCard(null)}
      >
        {/* <CardDetailsOverlay card={selectedCard} onOverlayPress={() => setSelectedCard(null)}/> */}
      </Modal>
    </>
  );
}

// function CardDetailsOverlay({
//   card,
//   onOverlayPress
// }) {

//   const {
//     friendly_name,
//     expiration_month,
//     expiration_year,
//     holder_name,
//     type
//   } = card;

//   function _onOverlayPress() {
//     onOverlayPress && onOverlayPress();
//   }

//   return (
//     <View style={styles.cardDetailsOverlay}>
//       <View style={styles.cardDetailsContainer}>
//         <CardListItem card={card}
//           showBottomBorder={false}
//           showDelete={false}
//         />
//         <View style={styles.cardLinesContainer}>
//           <DetailsLine label={Strings.titles.HoldersName} text={holder_name}/>
//           <DetailsLine label={Strings.titles.CardType} text={getCardName({ type })}/>
//         </View>
//         <View style={styles.cardDetailsBottonContainer}>
//           <TouchableOpacity style={styles.cardDetailsBotton} onPress={_onOverlayPress}>
//             <Text style={styles.cardDetailsBottonText}>{Strings.titles.Close}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

class ListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onItemPress = this.onItemPress.bind(this);
  }

  onItemPress() {
    const { item, onItemPress } = this.props;
    onItemPress && onItemPress(item);
  }

  render() {
    const { item } = this.props;
    console.log('item', item);

    return (
      <View style={[liStyles.row, liStyles.rowBottomBorder]}>
        <TouchableOpacity style={liStyles.body} onPress={this.onItemPress}>
          {/* <Image source={selectCardIconSource({ type })} style={liStyles.cardIcon}/> */}
          <View style={liStyles.bodyLines}>
            <Text style={liStyles.text}>{Strings.titles[item]}</Text>
            {/* {subText.length > 0 && <Text style={[liStyles.subText, subTextStyle]}>{subText}</Text>} */}
          </View>
        </TouchableOpacity>
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
  },
  mrPenguLogoContainer: {
    flex: 0,
    height: '30%',
    width: '100%',
    position: 'absolute',
    bottom: refactorFontSize(50),
    alignItems: 'center'
  },
  mrPenguLogo: {
    opacity: 1,
    width: '50%',
    height: '100%',
    resizeMode: 'contain',
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
