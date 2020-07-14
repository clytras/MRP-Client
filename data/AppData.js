import AsyncStorage from '@react-native-community/async-storage';
import { EventRegister } from 'react-native-event-listeners';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';


export async function loadLanguageLocale() {
  let value;

  try {
    value = await AsyncStorage.getItem('@mrp_user_locale');
  } catch(e) {
  }

  if(!value) {
    value = Strings.getDeviceLocaleId();
    AsyncStorage.setItem('@mrp_user_locale', value);
  }

  Strings.setSafeLanguage(value);
  EventRegister.emit(mrp.events.LanguageChange);
}

export async function saveLanguageLocale({ locale } = {}) {
  let value = locale ? locale : Strings.getLanguage();

  try {
    value = await AsyncStorage.setItem('@mrp_user_locale', value);
    return true;
  } catch(e) {
    return false;
  }
}
