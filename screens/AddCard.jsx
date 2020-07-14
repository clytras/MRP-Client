import React, { useState } from 'react';
import {
  StyleSheet,
  Keyboard,
  Text,
  Image,
  View,
  TouchableOpacity
} from 'react-native';
import { showAlert, closeAlert } from '@mrplib/rn/components/Alert';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { addCardAndCreateCustomer, createEveryPayCardToken } from '@data/gateways/EveryPay';
import { translateFirebaseError } from '@data/firebase/Errors';
import { emit } from '@mrplib/packages/events';
import { EventRegister } from 'react-native-event-listeners';
import { Button } from 'react-native-paper';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { CreditCardInput, LiteCreditCardInput } from 'react-native-credit-card-input';
import { refactorFontSize } from '@mrplib/rn/utils';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';

const statusBarHeight = getStatusBarHeight(true);

export default function({
  componentId,
  onSuccessAdd,
  onCancel
}) {
  const [inputCard, setInputCard] = useState(null);
  const [validCard, setValidCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);


  function onCardChange(formData) {
    console.log('onCardChange', formData);
    const { valid } = formData;
    setValidCard(valid);
    if(valid) {
      setInputCard(formData);
    }
  }

  async function _onAddCard() {
    console.log('cardadd _onAddCard');
    if(!validCard) return;

    setAddingCard(true);

    let {
      values: {
        number: card_number,
        expiry,
        name: holder_name,
        cvc: cvv
      }
    } = inputCard;

    card_number = card_number.replace(/\s+/g, '');
    let [expiration_month, expiration_year] = expiry.split('/');
    expiration_year = `20${expiration_year}`;
    holder_name = holder_name.toUpperCase().trim();

    console.log('_onAddCard', card_number, expiration_year, expiration_month);

    try {
      const { token: cardTokenId } = await createEveryPayCardToken({
        card_number,
        expiration_year,
        expiration_month,
        holder_name,
        cvv
      });

      const { result, reason, card, customer } = await addCardAndCreateCustomer({ cardTokenId });
      // const { result, reason, card, customer } = await addCardAndCreateCustomer({
      //   card_number,
      //   expiration_year,
      //   expiration_month,
      //   holder_name
      // });

      //createEveryPayCardToken

      console.log('addCardAndCreateCustomer::RESP', result, reason, customer, card);

      if(result == 'success') {
        onSuccessAdd && onSuccessAdd({ card, customer });
        //emit('EveryPay_AddNewCard', card, customer);
        console.log('EventRegister.emit(EveryPay_AddNewCard)');
        EventRegister.emit('EveryPay_AddNewCard', card, customer);
        componentId && dismissModal(componentId);
      } else {
        showAlert({
          title: Strings.messages.CouldNotAddCard
        });
      }
    } catch(error) {
      console.log('addCardAndCreateCustomer::ERROR', error);
      const { title, message } = translateFirebaseError(error);
      showAlert({ title, message });
    }
  }

  function _onCancel() {
    console.log('cardadd _onCancel');
    onCancel && onCancel();
    componentId && dismissModal(componentId);
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardControlContainer}>
        <CreditCardInput
          style={{ marginTop: 20 }}
          onChange={onCardChange}
          cardImageFront={require('@assets/graphics/mrPengu-card-front.png')}
          requiresCVC={true}
          requiresName={true}
        />
      </View>
      <View style={styles.controlsContainer}>
        <Image style={styles.everyPayLogo} source={require('@assets/graphics/everypay-logo.png')} />
      </View>
      <View style={styles.buttonsContainer}>
        <Button style={styles.addCardButton}
          contentStyle={styles.buttonContentStyle}
          //icon="send"
          disabled={!validCard}
          dark={false}
          onPress={_onAddCard}
          loading={addingCard}
          mode="contained"
        >
              {'Add card'}
        </Button>
      </View>
      <TouchableOpacity style={styles.cancelButton} onPress={_onCancel}>
        <MaterialIcon name="clear" style={styles.closeIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: refactorFontSize(30 + statusBarHeight),
    backgroundColor: 'white'
  },
  cardControlContainer: {
    marginTop: 20
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center'
  },
  everyPayLogo: {
    width: 150,
    height: 70,
    opacity: .5,
    marginTop: 15,
    resizeMode: 'contain'
  },

  addCardButton: {
    width: '50%',
    backgroundColor: mrp.colors.mrPengu.orange
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  buttonContentStyle: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },

  cancelButton: {
    position: 'absolute',
    top: 10 + statusBarHeight,
    left: 0
  },

  closeIcon: {
    color: 'black',
    paddingHorizontal: refactorFontSize(10),
    fontSize: mrp.header.iconFontSize + refactorFontSize(5),
  },
});
