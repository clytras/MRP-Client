import firebase from 'react-native-firebase';
import { uts } from '@mrplib/utils/time';
import { createToken } from '@lytrax/everypay/Tokens';

// import btoa from 'btoa';
// import qs from 'qs';
// import formURLEncoded from 'form-urlencoded';
import mrp from '@app/mrp';

const { googleCloud: { functions: { region }}} = mrp;

!global.mrp.data._everypay_customer && (
  global.mrp.data._everypay_customer = {
    customer: {},
    ts: 0
  }
);

export function retrieveCustomer() {
  return new Promise((resolve, reject) => Promise.resolve().then(async () => {
    try {
      const customerResult = await firebase.functions(region).httpsCallable('everyPay-retreiveCustomer')();
      const { data: { result, customer = {}, reason, ...fail }} = customerResult;

      if(result == 'success') {
        global.mrp.data._everypay_customer.customer = customer;
        global.mrp.data._everypay_customer.ts = uts();
        resolve({ result, customer });
      } else {
        if(reason != 'endpoint-internal-error') {
          global.mrp.data._everypay_customer.customer = {};
          resolve({ result, reason, ...fail, customer: {}});
        } else {
          resolve({ result, reason, ...fail });
        }
      }
    } catch(error) {
      reject(error);
    }
  }));
}

export const hasCachedCustomer = () => uts() - global.mrp.data._everypay_customer.ts < 3600;
export const resetCustomerCache = () => global.mrp.data._everypay_customer.ts = 0;
export const resetCustomerData = () => {
  global.mrp.data._everypay_customer.customer = {};
  global.mrp.data._everypay_customer.ts = 0;
}
export const getCustomer = () => global.mrp.data._everypay_customer.customer;
export const getCustomerCards = ({ customer }) => {
  const cus = customer || global.mrp.data._everypay_customer.customer;
  if(cus && 'cards' in cus && 'data' in cus.cards) {
    return cus.cards.data;
  }
  return [];
}
export const setCustomer = customer => {
  global.mrp.data._everypay_customer.customer = customer;
  global.mrp.data._everypay_customer.ts = uts();
}

export function deleteCard({
  cardId
}) {
  return new Promise((resolve, reject) => Promise.resolve().then(async () => {
    try {
      const deleteCardResult = await firebase.functions(region)
        .httpsCallable('everyPay-deleteCard')({ cardId });
      const { data: { result, reason, token, is_deleted, ...fail }} = deleteCardResult;

      if(result == 'success') {
        resolve({ result, token, is_deleted });
      } else {
        resolve({ result, reason, is_deleted: false, ...fail });
      }
    } catch(error) {
      reject(error);
    }
  }));
}

export function addCardAndCreateCustomer({ cardTokenId }) {
  return new Promise((resolve, reject) => Promise.resolve().then(async () => {
    try {
      const addCardResult = await firebase.functions(region)
        .httpsCallable('everyPay-addCardAndCreateCustomer')({
          cardTokenId
        });
      const { data: { result, reason, card, customer, ...fail }} = addCardResult;

      if(result == 'success') {
        resolve({ result, card, customer });
      } else {
        resolve({ result, reason, card, customer, ...fail });
      }
    } catch(error) {
      reject(error);
    }
  }));
}

export function everyPayPublicAuth() {
  return new Promise((resolve, reject) => Promise.resolve().then(async () => {
    try {
      const result = await firebase.functions(region)
        .httpsCallable('everyPay-publicAuth')();

        console.log('everyPayPublicAuth::RES', result);

        const { data: { endPointURL, endPointKey }} = result;
      resolve({ endPointURL, endPointKey });
    } catch(error) {
      reject({ reason: 'no-endpoint-auth', error });
    }
  }));
}

export function createEveryPayCardToken(cardData) {
  return new Promise((resolve, reject) => Promise.resolve().then(async () => {
    try {
      const { endPointURL, endPointKey } = await everyPayPublicAuth();

      if(endPointURL && endPointKey) {
        const result = await createToken({
          endPointURL,
          endPointKey,
          ...cardData
        });

        console.log('createEveryPayCardToken::RES', result);
        resolve(result);
      } else {
        reject({ reason: 'endpoint-error' });
      }
    } catch(error) {
      console.error('createEveryPayCardToken::ERR', error);
      reject(error);
    }
  }));
}

// export function createEveryPayCardToken(cardData) {
//   return new Promise((resolve, reject) => Promise.resolve().then(async () => {
//     try {
//       const { apiEndPoint, epk } = await everyPayPublicAuth();

//       if(apiEndPoint && epk) {
//         const resp = await everyPayEndPointCall({
//           apiEndPointUrl: apiEndPoint,
//           endPointKey: epk,
//           method: 'POST',
//           entity: 'tokens',
//           data: cardData
//         });

//         console.log('createEveryPayCardToken::RES', resp);

//         resolve(resp);
//       } else {
//         reject({ reason: 'endpoint-error' });
//       }
//     } catch(error) {
//       console.error('createEveryPayCardToken::ERR', error);
//       reject(error);
//     }
//   }));
// }

// export function everyPayEndPointCall({
//   apiEndPointUrl,
//   endPointKey, // public key or private key (never send/use private key on clients)
//   method = 'GET',
//   entity,
//   data
// }) {
//   return new Promise((resolve, reject) => Promise.resolve().then(() => {
//     let uri = apiEndPointUrl;
//     const endPointAuth = btoa(`${endPointKey}:`);
//     const params = {
//       method,
//       headers: {
//         'Authorization': `Basic ${endPointAuth}`
//       }
//     }

//     if(entity) {
//       uri = `${uri}/${entity}`;
//     }

//     if(data) {
//       if(method == 'GET') {
//         uri = `${uri}?${qs.stringify(data)}`;
//       } else { // POST PUT DELETE
//         params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
//         let dataCound = 0;

//         for(let prop in data) {
//           const value = data[prop];
//           if(value === undefined) {
//             delete data[prop];
//           } else {
//             dataCound++;
//           }
//         }

//         if(dataCound > 0) {
//           params.body = formURLEncoded(data);
//         }
//       }
//     }

//     fetch(uri, params)
//     .then(res => res.json())
//     .then(resData => {
//       console.log('everyPayEndPointCall:RESP', resData);
//       if(resData && 'error' in resData) {
//         reject({ endPointError: resData.error});
//       } else {
//         resolve(resData);
//       }
//     })
//     .catch(error => {
//       console.error('everyPayEndPointCall:ERROR', error);
//       reject(error);
//     });
//   }));
// }

// export function translateEveryPayError({
//   code,
//   endPointError,
//   error
// }) {
//   switch(code) {
//     // case 'no-user-profile':
//     // case 'no-user-everypay-info':
//     case 'no-user-everypay-account':
//     case 'endpoint-error':
//     case 'endpoint-internal-error':
//   }
// }
