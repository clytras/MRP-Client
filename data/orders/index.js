import firebase from 'react-native-firebase';
import { DateTime } from 'luxon';
import mrp from '@app/mrp';

const { googleCloud: { functions: { region }}} = mrp;

export function initOrder(params) {
  return firebase.functions(region).httpsCallable('initOrder')(params);
}

export function commitOrder(params) {
  return firebase.functions(region).httpsCallable('commitOrder')(params);
}
