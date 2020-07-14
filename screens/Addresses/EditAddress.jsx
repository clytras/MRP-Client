import React, {
  useState,
  useEffect,
  useLayoutEffect
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import firebase from 'react-native-firebase';
import * as geofirex from 'geofirex';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import ListPopup from '@mrplib/rn/components/ListPopup';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Ionicons';
import { setTempAddress } from '@data/firebase/UserData';
import { showAlert } from '@mrplib/rn/components/Alert';
import { TextField } from '@mrplib/rn/packages/react-native-material-textfield';
import { Button } from 'react-native-material-ui';
import { refactorFontSize, ionicIcon } from '@mrplib/rn/utils';
import { googleMapsGeocode, googleMapsApiComponentsToFirebase } from '@mrplib/utils/geoloc';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationEvents } from 'react-navigation';
import { Strings } from '@mrplib/i18n/rn';
import { normalizeGreek } from '@mrplib/utils';
import AllCitiesData from '@data/all-cities.json';
import mrp from '@app/mrp';


export default function({
  navigation,
  onPanelChange,
  onAddressSuccess,
}) {
  const language = mrp.geolocation.googleMaps.api.resultsLanguage;
  const onListingUpdate = navigation.getParam('onListingUpdate', undefined);
  const listingMode = navigation.getParam('listingMode', false);

  const googleAddress = navigation.getParam('googleAddress');
  const dataAddress = navigation.getParam('address', {});
  const address = googleAddress ? googleMapsApiComponentsToFirebase(googleAddress) : dataAddress;

  const { docId } = address;
  const isNew = !docId;

  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  const [mapPos, setMapPos] = useState(address.location);
  const [mapMarkerPos, setMapMarkerPos] = useState(address.location);
  const [addressErrors, setAddressErrors] = useState({});
  const [googleApiError, setGoogleApiError] = useState('');
  const [hasValidAddress, setHasValidAddress] = useState(false);

  const [route, setRoute] = useState(address.route || '');
  const [streetNumber, setStreetNumber] = useState(address.streetNumber || '');
  const [locality, setLocality] = useState(address.locality || '');
  const [country, setCountry] = useState(address.country || '');
  const [postalCode, setPostalCode] = useState(address.postalCode || '');
  const [area, setArea] = useState(address.area || '');
  const [utcOffset, setUTCOffset] = useState(address.utcOffset || 0);
  const [ringBellName, setRingBellName] = useState(address.ringBellName || '');
  const [floor, setFloor] = useState(address.floor || '');
  const [alternativePhoneNumber, setAlternativePhoneNumber] = useState(address.alternativePhoneNumber || '');
  const [additionalInfo, setAdditionalInfo] = useState(address.additionalInfo || '');

  useLayoutEffect(() => {
    resetErrors();
    checkValidAddress({
      route,
      streetNumber,
      locality,
      location: mapMarkerPos
    });
  }, []);

  useEffect(() => {
    let keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setHasKeyboard(true));
    let keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setHasKeyboard(false));
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    }
  }, []);

  useEffect(() => {
    if(initializing) {
      setInitializing(false);
      return;
    }

    if(searchTimer) {
      clearTimeout(searchTimer);
    }

    if(!validateAddress()) {
      setSearchingLocation(false);
      return;
    }

    setSearchingLocation(true);

    setSearchTimer(setTimeout(async () => {
      const googleApiSearchTerm = `${route} ${streetNumber} ${locality} ${postalCode}`;
      const {
        ok,
        data,
        error
      } = await googleMapsGeocode({
        key: mrp.apiKeys.GoogleMrPengu,
        address: googleApiSearchTerm,
        language
      });

      console.log('googleMapsGeocode', googleApiSearchTerm, ok, data, error);

      if(ok && data) {
        const { results: [ result = {} ]} = data;
        const {
          route,
          streetNumber,
          locality,
          country,
          postalCode,
          location = {},
          utcOffset,
        } = googleMapsApiComponentsToFirebase(result);

        console.log('setSearchTimer', location);

        // setAddressError({
        //   routeError: route ? '' : Strings.messages.NotFound,
        //   numberError: streetNumber ? '' : Strings.messages.NotFound,
        //   localityError: locality ? '' : Strings.messages.NotFound,
        //   postalCodeError: postalCode ? '' : Strings.messages.NotFound
        // });

        const validAddress = checkValidAddress({
          route,
          streetNumber,
          locality,
          location
        });
        const { latitude, longitude } = location;

        if(latitude && longitude && validAddress) {
          setStreetNumber(streetNumber);
          setCountry(country);
          setPostalCode(postalCode);
          setUTCOffset(utcOffset);
          setMapMarkerPos(location);
          setMapPos(location);
          setGoogleApiError('');
        } else {
          // setMapMarkerPos({
          //   latitude: 0,
          //   longitude: 0
          // });
          setHasValidAddress(true);
          setGoogleApiError(Strings.messages.AddressCannotBeLocated);
        }
      } else {
        setGoogleApiError([
          Strings.messages.SomethingWentWrong,
          Strings.messages.PleaseTryAgain
        ].join("\n"));
      }

      setSearchTimer(null);
      setSearchingLocation(false);
    }, 200));
  }, [route, streetNumber, locality, postalCode]);

  function checkValidAddress({
    route,
    streetNumber,
    locality,
    location: {
      latitude,
      longitude
    } = {}
  }) {
    const validAddress = !!(route && streetNumber && locality && latitude && longitude);
    console.log('checkValidAddress', validAddress, route, streetNumber, locality, latitude, longitude);

    setHasValidAddress(validAddress);
    return validAddress;
  }

  function resetErrors() {
    setAddressErrors({
      routeError: '',
      numberError: '',
      localityError: '',
      postalCodeError: '',
    });
  }

  function setAddressError(errors) {
    setAddressErrors({
      ...addressErrors,
      ...errors
    });
  }

  function validateAddress() {
    let errors = 0;
    let {
      routeError,
      numberError,
      localityError,
      postalCodeError,
    } = addressErrors;

    if(!route.length) {
      errors++;
      routeError = Strings.formatString(
        Strings.messages.Fields.MustNotBeEmpty, {
          field: Strings.titles.Address.toLowerCase()
        }
      );
    } else {
      routeError = '';
    }

    if(!streetNumber.length) {
      errors++;
      numberError = Strings.formatString(
        Strings.messages.Fields.EmptyH, {
          field: Strings.titles.Number.toLowerCase()
        }
      );
    } else {
      numberError = '';
    }

    if(!locality.length) {
      errors++;
      localityError = Strings.formatString(
        Strings.messages.Fields.MustNotBeEmpty, {
          field: Strings.titles.City.toLowerCase()
        }
      );
    } else {
      localityError = '';
    }

    if(!postalCode.length) {
      errors++;
      postalCodeError = Strings.formatString(
        Strings.messages.Fields.EmptyH, {
          field: Strings.titles.PostalCode.toLowerCase()
        }
      );
    } else {
      postalCodeError = '';
    }

    setAddressErrors({
      routeError,
      numberError,
      localityError,
      postalCodeError,
    });

    return errors == 0;
  }

  function onConfirm() {
    if(hasValidAddress) {
      const user = firebase.auth().currentUser;
      const geox = geofirex.init(firebase);
      const { latitude, longitude } = mapMarkerPos;
      const point = geox.point(latitude, longitude);
      const data = {
        route,
        streetNumber,
        locality,
        country,
        area,
        postalCode,
        ringBellName,
        floor,
        alternativePhoneNumber,
        additionalInfo,
        location: point.data,
        utcOffset
      };

      setSearchingLocation(true);

      if(user) {
        const { uid } = user;
        const addressesRef = geox.collection(`users/${uid}/addresses`);

        if(docId) {
          addressesRef.setDoc(docId, data);
        } else {
          addressesRef.add(data);
        }

        if(listingMode) {
          onListingUpdate && onListingUpdate(data);
          navigation.popToTop();
        } else if(onAddressSuccess) {
          onAddressSuccess(data)
        }
      } else if(!docId) {
        setTempAddress(data);
        onAddressSuccess && onAddressSuccess(data);
      } else {
        showAlert({
          title: Strings.messages.SomethingWentWrong,
          message: Strings.messages.UserNotFound,
        });
      }

      setSearchingLocation(false);
    } else {
      validateAddress();
    }
  }

  function onWillFocus({ state: { routeName }}) {
    onPanelChange(routeName, !isNew);
  }

  function onDismissAreaPicker() {
    setShowAreaPicker(false);
  }

  function onAreaSelect(area) {
    setArea(area);
    setShowAreaPicker(false);
  }

  function textClearButtonRender() {
    return !!area && (
      <TouchableOpacity style={styles.clearButtonContainer} onPress={() => setArea('')}>
        <Icon style={styles.clearIcon} name={mrp.searchBox.clearIcon} />
      </TouchableOpacity>
    );
  }

  const addressDeltas = 0.002;
  const { latitude, longitude } = mapPos || {
    latitude: mrp.geolocation.initialMapSpot.gr.lat,
    longitude: mrp.geolocation.initialMapSpot.gr.lon
  };
  const mapRegion = {
    latitude,
    longitude,
    latitudeDelta: addressDeltas,
    longitudeDelta: addressDeltas,
  };
  const hasMarkerPos = mapMarkerPos && !!(mapMarkerPos.latitude && mapMarkerPos.longitude);
  const {
    routeError,
    numberError,
    localityError,
    postalCodeError,
  } = addressErrors;

  function renderTextAddress() {
    const addressText = [
      `${route} ${streetNumber}`,
      locality,
      area,
      postalCode
    ]
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .join(', ');

    return (
      <View style={styles.textAddressContainer}>
        <View style={styles.textAddressIconContainer}>
          <Icon style={styles.pinIcon} name={ionicIcon('pin')} />
        </View>
        <View style={styles.textAddressDataContainer}>
          <Text style={styles.textAddressText}>{addressText}</Text>
        </View>
      </View>
    );
  }

  function renderEditableAddress() {
    return (
      <>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldRoute}>
            <TextField
              label={`* ${Strings.titles.Street}`}
              multiline={false}
              autoCapitalize="none"
              value={route}
              editable={!route}
              error={routeError}
              onChangeText={value => setRoute(value)}
            />
          </View>
          <View style={styles.fieldNumber}>
            <TextField
              label={`* ${Strings.titles.Number}`}
              multiline={false}
              value={streetNumber}
              error={numberError}
              onChangeText={value => setStreetNumber(value)}
            />
          </View>
        </View>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldLocality}>
            <TextField
              label={`* ${Strings.titles.City}`}
              autoCorrect={false}
              value={locality}
              error={localityError}
              editable={!address.locality}
              onChangeText={value => setLocality(value)}
            />
          </View>
          <View style={styles.fieldPC}>
            <TextField
              label={`* ${Strings.titles.PC}`}
              autoCorrect={false}
              value={postalCode}
              error={postalCodeError}
              onChangeText={value => setPostalCode(value)}
            />
          </View>
        </View>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldArea}>
            <TextField
              onLockedPress={() => setShowAreaPicker(true)}
              label={Strings.titles.Area}
              autoCorrect={false}
              value={area}
              editable={false}
              renderAccessory={textClearButtonRender}
            />
          </View>
        </View>
      </>
    );
  }

  function renderAdditionalAddressFields() {
    return (
      <>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldRingBellName}>
            <TextField
              label={Strings.titles.RingBellName}
              autoCorrect={false}
              value={ringBellName}
              onChangeText={value => setRingBellName(value)}
            />
          </View>
          <View style={styles.fieldHouseFloor}>
            <TextField
              label={Strings.titles.HouseFloor}
              autoCapitalize="none"
              keyboardType="numeric"
              autoCorrect={false}
              value={floor}
              onChangeText={value => setFloor(value)}
            />
          </View>
        </View>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldFull}>
            <TextField
              label={Strings.placeholders.AlternativePhoneNumber}
              autoCorrect={false}
              value={alternativePhoneNumber}
              onChangeText={value => setAlternativePhoneNumber(value)}
            />
          </View>
        </View>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldFull}>
            <TextField
              label={Strings.placeholders.AdditionalInfo}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              value={additionalInfo}
              onChangeText={value => setAdditionalInfo(value)}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <NavigationEvents onWillFocus={onWillFocus}/>
      <KeyboardAwareScrollView style={styles.withFlex}>
        <View style={styles.container}>
          {isNew ? renderEditableAddress() : renderTextAddress()}
          {renderAdditionalAddressFields()}
        </View>
      </KeyboardAwareScrollView>
      {!hasKeyboard && (
        <>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={mapRegion}
              region={mapRegion}
            >
              {hasMarkerPos && <Marker coordinate={mapMarkerPos}/>}
            </MapView>
            {/*!hasMarkerPos && (
              <View style={styles.hasNoLocationContainer}>
                <Text style={styles.hasNoLocationText}>
                  {googleApiError}
                </Text>
              </View>
            )*/}
          </View>
          <View style={styles.addressConfirmContainer}>
            <Button raised
              style={{
                container: styles.addressConfirmButtonContainer
              }}
              icon={
                searchingLocation ? <ActivityIndicator size="small" color="black"/> : "done"
              }
              text=""
              onPress={onConfirm}
            />
          </View>
        </>
      )}
      <ListPopup
        show={showAreaPicker}
        showSearch
        showCancel
        fullHeight
        data={AllCitiesData}
        minSearchTermResult={2}
        searchTerm={area}
        searchTextFilter={s => normalizeGreek(s.toLowerCase())}
        searchPlaceHolder={Strings.placeholders.SearchArea}
        emptyListPlaceholder={Strings.placeholders.UseSearchToFindYourArea}
        fields={{
          text: 'n',
          search: 's',
          return: 'n'
        }}
        onRequestClose={onDismissAreaPicker}
        onDismiss={onDismissAreaPicker}
        onItemSelect={onAreaSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  withFlex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    margin: refactorFontSize(14),
    marginTop: 0,
    paddingBottom: refactorFontSize(20)
  },
  fieldsRow: {
    flexDirection: 'row',
  },
  fieldFull: {
    flex: 1
  },
  fieldRoute: {
    flex: 4,
    marginRight: refactorFontSize(14)
  },
  fieldNumber: {
    flex: 2
  },
  fieldLocality: {
    flex: 4,
    marginRight: refactorFontSize(14)
  },
  fieldPC: {
    flex: 2
  },
  fieldArea: {
    flex: 4
  },
  fieldRingBellName: {
    flex: 4,
    marginRight: refactorFontSize(14)
  },
  fieldHouseFloor: {
    flex: 2
  },
  addressConfirmContainer: {
    marginBottom: refactorFontSize(getBottomSpace())
  },
  addressConfirmButtonContainer: {
    backgroundColor: mrp.colors.mrPengu.orange
  },
  mapContainer: {
    zIndex: 1000,
    overflow: 'visible',
    flex: 0,
    height: '25%',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey'
  },
  map: {
    flex: 1,
  },
  hasNoLocationContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  hasNoLocationText: {
    color: 'white',
    fontSize: refactorFontSize(16),
    textShadowColor: 'rgba(0,0,0,.85)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  clearButtonContainer: {
    zIndex: 100000,
    justifyContent: 'center',
    paddingRight: refactorFontSize(8)
  },
  clearIcon: {
    fontSize: refactorFontSize(20)
  },
  textAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: refactorFontSize(10),
    paddingTop: refactorFontSize(20),
  },
  textAddressIconContainer: {
    marginRight: refactorFontSize(10)
  },
  pinIcon: {
    fontSize: refactorFontSize(35),
    color: '#EA3535'
  },
  textAddressDataContainer: {
    flex: 1
  },
  textAddressText: {
    fontSize: refactorFontSize(15),
    color: 'black'
  }
});
