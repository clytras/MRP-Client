
export function selectCardIconSource({ type }) {
  if(/mastercard/i.test(type)) return require('@assets/icons/mastercard.png');
  if(/visa/i.test(type)) return require('@assets/icons/visa.png');
  if(/maestro/i.test(type)) return require('@assets/icons/maestro.png');
  if(/(american|express|amex)/i.test(type)) return require('@assets/icons/visa.png');
  if(/diners/i.test(type)) return require('@assets/icons/dinersclub.png');
  return null;
}
