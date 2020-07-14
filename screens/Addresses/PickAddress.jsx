import React, {
  useEffect,
  useState
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import TargetIcon from 'react-native-vector-icons/Ionicons';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Button } from 'react-native-material-ui';
import { GooglePlacesAutocomplete } from '@components/GooglePlacesAutocomplete';
import { showAlert } from '@mrplib/rn/components/Alert';
import Geolocation from 'react-native-geolocation-service';
import { googleMapsGeocode, googleMapsPlaceDetails } from '@mrplib/utils/geoloc';
import { Strings } from '@mrplib/i18n/rn';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { refactorFontSize } from '@mrplib/rn/utils';
import { makeLines, normalizeGreek } from '@mrplib/utils';
import mrp from '@app/mrp';


export default function({ navigation, onPanelChange }) {
  //const language = mrp.geolocation.googleMaps.api.resultsLanguage;
  const language = Strings.getSafeCurrentLocale();
  const listingMode = navigation.getParam('listingMode', false);
  const pickerMode = navigation.getParam('listingMode', false);

  const [addressText, setAddressText] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [mapMarkerPos, setMapMarkerPos] = useState(/*{
    latitude: mrp.geolocation.initialMapSpot.gr.lat,
    longitude: mrp.geolocation.initialMapSpot.gr.lon
  }*/ false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);

  useEffect(() => {
    let keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setHasKeyboard(true));
    let keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setHasKeyboard(false));
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    }
  }, []);

  function goEdit() {
    if(selectedAddress) {
      navigation.navigate('EditAddress', {
        googleAddress: selectedAddress,
        listingMode
      });
    }
  }

  function onWillFocus({ state: { routeName }}) {
    onPanelChange(routeName);
  }

  function onCurrentLocationSeek() {
    setLoadingCurrentLocation(true);

    function checkPermission() {
      return new Promise(async (resolve) => {
        if(Platform.OS == 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          resolve(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          resolve(true);
        }
      });
    }

    checkPermission().then(permission => {
      // console.log('permission ok');
      if(permission) {
        Geolocation.getCurrentPosition(async (position = {}) => {
          const { coords } = position;
          // console.log('getCurrentPosition', coords);

          if(coords && 'latitude' in coords && 'longitude' in coords) {
            try {
              let result_type = 'street_address';
              let gresult;

              for(;;) {
                const gparams = {
                  key: mrp.apiKeys.GoogleMrPengu,
                  latlng: `${coords.latitude},${coords.longitude}`,
                  language
                }

                if(result_type) gparams.result_type = result_type;
                gresult = await googleMapsGeocode(gparams);

                const {
                  ok,
                  data: {
                    results: [result = {}]
                  }
                } = gresult;
                const { place_id } = result;
                if(ok && place_id || !result_type) break;
                result_type = null;
              }

              // console.log('googleMapsGeocode result', gresult);

              const {
                ok,
                data: {
                  results: [
                    result = {}
                  ]
                },
                error: {
                  message
                } = {}
              } = gresult;

              const { place_id } = result;

              // console.log('googleMapsGeocode ok, place_id', ok, place_id);

              if(ok && place_id) {
                const {
                  ok,
                  data: {
                    result
                  } = {},
                  error: {
                    message
                  } = {}
                } = await googleMapsPlaceDetails({
                  key: mrp.apiKeys.GoogleMrPengu,
                  placeid: place_id,
                  language
                });

                if(ok && result) {
                  //const { latitude, longitude } = coords;
                  //setMapMarkerPos({ latitude, longitude });

                  setSelectedAddress(result);
                  if('formatted_address' in result) {
                    setAddressText(result.formatted_address);
                  }

                  if('geometry' in result && 'location' in result.geometry) {
                    setMapMarkerPos({
                      latitude: result.geometry.location.lat,
                      longitude: result.geometry.location.lng
                    });
                  }
                } else {
                  showAlert({
                    title: Strings.messages.SomethingWentWrong,
                    message: makeLines({ lines: [message, Strings.messages.PleaseTryAgain] })
                  });
                }
              } else {
                showAlert({
                  title: Strings.messages.SomethingWentWrong,
                  message: makeLines({ lines: [message, Strings.messages.PleaseTryAgain] })
                });
              }
            } catch({ message = null }) {
              showAlert({
                title: Strings.messages.SomethingWentWrong,
                message: makeLines({ lines: [message, Strings.messages.PleaseTryAgain] })
              });
            } finally {
              setLoadingCurrentLocation(false);
            }
          } else {
            showAlert({
              title: Strings.messages.SomethingWentWrong,
              message: Strings.messages.LocationNotDetected,
            });
          }
        }, error => {
          setLoadingCurrentLocation(false);
          showAlert({
            title: Strings.messages.SomethingWentWrong,
            message: Strings.messages.LocationNotDetected,
          });
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000
        });
      }
    });
  }

  function onPickerAddressPress(data, details = {}) {
    if('formatted_address' in details) {
      setAddressText(details.formatted_address);
      setSelectedAddress(details);
    } else {
      setSelectedAddress(null);
    }

    if('geometry' in details && 'location' in details.geometry) {
      setMapMarkerPos({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      });
    }
  }

  function onPickerAddressChange(address, data) {
    setAddressText(address);
  }

  function renderSearchIcon() {
    return (
      <View style={styles.searchIconContainer}>
        <Icon style={styles.searchIcon} name={mrp.searchBox.searchIcon} />
      </View>
    );
  }

  function renderClearButton() {
    return (
      <TouchableOpacity style={styles.clearButtonContainer} onPress={clearAddressSeachText}>
        <Icon style={styles.clearIcon} name={mrp.searchBox.clearIcon} />
      </TouchableOpacity>
    );
  }

  function clearAddressSeachText() {
    setAddressText('');
  }

  const mapRad = mrp.geolocation.countryRadius.gr;
  const { latitude, longitude } = mapMarkerPos || {
    latitude: mrp.geolocation.initialMapSpot.gr.lat,
    longitude: mrp.geolocation.initialMapSpot.gr.lon
  };
  const { addressDeltas } = mrp.geolocation;

  return (
    <View style={styles.container}>
      <NavigationEvents onWillFocus={onWillFocus}/>
      <GooglePlacesAutocomplete
        placeholder={Strings.placeholders.SearchAddress}
        minLength={2} // minimum length of text to search
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        //keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
        listViewDisplayed='auto'   // true/false/undefined/auto
        fetchDetails={true}
        enablePoweredByContainer={true}
        renderDescription={row => row.description} // custom description render
        onPress={onPickerAddressPress}
        text={addressText}
        getDefaultValue={() => ''}

        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: mrp.apiKeys.GoogleMrPengu,
          language, // language of the results
          //types: '(cities)' // default: 'geocode'
          //types: '(regions)'
          types: 'address',
          location: `${mapRad.lon},${mapRad.lat}`,
          radius: mapRad.radius
        }}

        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: {
            //flex: 2,
            // borderColor: 'red',
            // borderWidth: 1,
            // height: '100%'
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          },
          container: hasKeyboard ? null : styles.autocompleteContainer
        }}

        textInputProps={{
          onChangeText: onPickerAddressChange
        }}

        currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
        //predefinedPlaces={[homePlace, workPlace]}
        currentLocationLabel="Current location"
        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          language,
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          language,
          rankby: 'distance',
          //type: 'cafe'
          fields: 'formatted_address,geometry,id,name,photos,place_id,scope,types'
        }}

        GooglePlacesDetailsQuery={{
          // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
          fields: 'formatted_address,geometry',
        }}

        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        renderLeftButton={renderSearchIcon}
        renderRightButton={renderClearButton}
      />
      {!hasKeyboard && (
        <>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              //mapType="satellite"
              style={styles.map}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: addressDeltas,
                longitudeDelta: addressDeltas,
              }}
              region={{
                latitude,
                longitude,
                latitudeDelta: addressDeltas,
                longitudeDelta: addressDeltas,
              }}
            >
              {mapMarkerPos && <Marker coordinate={mapMarkerPos}/>}
            </MapView>
          </View>
          {selectedAddress && (
            <View style={styles.addressDetailsContainer}>
              <View style={styles.addressDetails}>
                <Text style={styles.addressDetailsText}>{
                  selectedAddress && 'formatted_address' in selectedAddress ?
                    selectedAddress.formatted_address : ''
                }</Text>
              </View>
              <View style={styles.addressConfirmContainer}>
                <Button raised
                  disabled={!selectedAddress}
                  style={{
                    container: styles.addressConfirmButtonContainer
                  }}
                  text={normalizeGreek(Strings.titles.Next)}
                  onPress={goEdit}
                />
              </View>
            </View>
          )}
          <TouchableOpacity style={[
              styles.addressFetchCurrent,
              !selectedAddress && styles.addressFetchCurrentOnMap
            ]}
            onPress={onCurrentLocationSeek}
          >
            {loadingCurrentLocation ? (
              <ActivityIndicator size="small" color={mrp.colors.mrPengu.purple} />
            ) : (
              <TargetIcon style={styles.addressFetchCurrentIcon} name={mrp.targetIcon} />
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInputContainer: {
    marginTop: refactorFontSize(10)
  },
  textInput: {
  },
  searchIconContainer: {
    justifyContent: 'center',
    paddingLeft: refactorFontSize(8)
  },
  searchIcon: {
    fontSize: refactorFontSize(20),
  },
  clearButtonContainer: {
    justifyContent: 'center',
    paddingRight: refactorFontSize(8)
  },
  clearIcon: {
    fontSize: refactorFontSize(24)
  },
  mapContainer: {
    zIndex: 1000,
    overflow: 'visible',
    flex: 1,
  },
  map: {
    flex: 1,
  },
  addressDetailsContainer: {
    zIndex: 1,
    height: '26%',
    backgroundColor: 'white',
    borderTopWidth: refactorFontSize(1),
    borderTopColor: 'lightgrey'
  },
  addressDetails: {
    flex: 1,
    zIndex: 1,
    padding: refactorFontSize(10),
    paddingTop: refactorFontSize(24),
    paddingBottom: refactorFontSize(10),
    justifyContent: 'center'
  },
  addressDetailsText: {
    fontSize: refactorFontSize(14),
    color: 'black'
  },
  addressConfirmButtonContainer: {
    backgroundColor: mrp.colors.mrPengu.orange,
    marginBottom: refactorFontSize(getBottomSpace()),
  },
  addressFetchCurrent: {
    position: 'absolute',
    zIndex: 1000,
    width: refactorFontSize(50),
    height: refactorFontSize(50),
    bottom: '22%',
    right: refactorFontSize(16),
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: refactorFontSize(getBottomSpace()),
    borderColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',

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
  addressFetchCurrentOnMap: {
    bottom: refactorFontSize(16)
  },
  addressFetchCurrentIcon: {
    paddingTop: Platform.OS === 'ios' ? refactorFontSize(4) : 0,
    //lineHeight: refactorFontSize(30),
    fontSize: refactorFontSize(30),
    color: mrp.colors.mrPengu.purple
  }
});
