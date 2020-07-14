import Dinero from 'dinero.js';
import { Strings } from '@mrplib/i18n/rn';

export default function(...args) {
  return Dinero(...args).setLocale(Strings.getLanguage());
}
