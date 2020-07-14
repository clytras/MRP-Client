import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  InteractionManager
} from 'react-native';
import { translateTimeRange, timeRangeInUtcDate } from '@mrpbrain/utils/time';
import { formatTimeCode_HMToHM } from '@mrplib/utils/time';
import { Strings } from '@mrplib/i18n/rn';
// import mrp from '../mrp';
import { createWizardStep } from '..';
import Title from '@components/Title';
import CircleIcon from '@components/CircleIcon';
import { refactorFontSize } from '@mrplib/rn/utils';


class PickDeliveryCategory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      category: {},
      selectedItem: '',
      selectedService: null,
      messageTitle: '',
      message: '',
      services: {
        'Food': {},
        'Pharmacy': {},
        'Kiosk': {},
        'Misc': {},
        'Gifts': {},
        'SuperMarket': {},
        'Courier': {}
      }
    }

    this.validate = this.validate.bind(this);
    this.payload = this.payload.bind(this);
  }

  _onCategorySelect(catId) {
    const service = this.state.services[catId];
    const { status, inTime, availableTimeline } = service;
    const messageTitle = `${Strings.titles.Category} “${Strings.services.delivery.categories[catId].replace(/\n/g, ' ')}”`

    // console.log('_onCategorySelect', catId, status, inTime, availableTimeline);

    if(status != 'up') {
      this.setState({
        messageTitle,
        message: Strings.messages.ServiceNotAvailableToArea
      });
    } else if(!inTime) {
      const rangesMessage = availableTimeline.map(timeLine => formatTimeCode_HMToHM({
        timeCode: translateTimeRange(timeLine),
        meridiemTexts: Strings.time.meridiem,
        glue: ` ${Strings.titles.To.toLowerCase()} `
      })).join(', ');

      this.setState({
        messageTitle,
        message: `${Strings.messages.ServiceOperates} ${rangesMessage}`
      });
    } else {
      this.setState({
        messageTitle: '',
        message: '',
        selectedService: service,
        selectedItem: catId,
        category: catId
      }, () => {
        InteractionManager.runAfterInteractions(() => {
          if(this.validate()) {
            this.props.goToNextStep(this.payload(), { doNavigate: true });
          }
        });

        // setTimeout(() => {
        //   this.props.goToNextStep(this.payload(), { doNavigate: true })
        // }, 200);
      });
    }
  }

  _selectSelectedStyle(cur, sel) {
    if(sel == cur) {
      return [styles.imageContainer, styles.itemSelected];
    }

    return [styles.imageContainer];
  }

  setPayload(payload) {
    console.log('PickDeliveryCategory::setPayload', payload);

    const { locationServices = [], address: { utcOffset } } = payload;
    const { services } = this.state;

    for(let nameId in services) {
      const service = locationServices.find(s => s.nameId == nameId);
      if(service) {
        const { status, availableTimeline } = service;
        services[nameId] = service;
        services[nameId].enabled = status == 'up';
        let inTime = true;

        if(availableTimeline) {
          let { inRange: inTimeline } = timeRangeInUtcDate({
            utcOffset,
            ranges: availableTimeline
          });
          inTime = !!inTimeline;
          services[nameId].inTimeline = inTimeline;
        }
        services[nameId].inTime = inTime;
      } else {
        services[nameId].enabled = false;
      }

      //services[nameId].enabled = false;
    }

    this.setState({ payload, services });
  }

  payload() {
    const { category, selectedService } = this.state;
    return { category, selectedService };
  }

  validate() {
    const { category, selectedService } = this.state;

    console.log('Pick Delivery Category::validate', category, selectedService);

    return category.length > 0 && !!selectedService;
  }

  render() {
    const { selectedItem, services, message, messageTitle } = this.state;
    const { _selectSelectedStyle } = this;
    const { categories } = Strings.services.delivery;
    const imgStyle = (n, s = null) => [styles.image, services[n].enabled && services[n].inTime && styles.enabledServiceImage, s];

    return (
      <View style={styles.container}>
        <Title text={Strings.titles.PickCategory}/>
        <View style={styles.row}>
          <CircleIcon icon="Food" text={categories.Food}
            style={styles.imageContainer}
            imageStyle={imgStyle('Food', styles.imageFood)} textStyle={styles.imageText}
            onPress={this._onCategorySelect.bind(this, 'Food')}
          />
          <CircleIcon icon="Pharmacy" text={categories.Pharmacy}
            style={styles.imageContainer}
            imageStyle={imgStyle('Pharmacy')} textStyle={[styles.imageText, styles.itemPharmacy]}
            onPress={this._onCategorySelect.bind(this, 'Pharmacy')}
          />
        </View>
        <View style={styles.row}>
          <CircleIcon icon="Kiosk" text={categories.Kiosk}
            style={styles.imageContainer}
            imageStyle={imgStyle('Kiosk', styles.imageKiosk)} textStyle={[styles.imageText, styles.itemKiosk]}
            onPress={this._onCategorySelect.bind(this, 'Kiosk')}
          />
          <CircleIcon icon="Misc" text={categories.Misc}
            style={[styles.imageContainer, styles.imageContainerKiosk]}
            imageStyle={imgStyle('Misc', styles.imageBig)} textStyle={[styles.imageText, styles.itemMisc]}
            onPress={this._onCategorySelect.bind(this, 'Misc')}
          />
          <CircleIcon icon="Gifts" text={categories.Gifts}
            style={styles.imageContainer}
            imageStyle={imgStyle('Gifts')} textStyle={[styles.imageText, styles.itemGifts]}
            onPress={this._onCategorySelect.bind(this, 'Gifts')}
          />
        </View>
        <View style={styles.row}>
          <CircleIcon icon="SuperMarket" text={categories.SuperMarket}
            style={styles.imageContainer}
            imageStyle={imgStyle('SuperMarket')} textStyle={[styles.imageText, styles.itemSuperMarket]}
            onPress={this._onCategorySelect.bind(this, 'SuperMarket')}
          />
          <CircleIcon icon="Courier" text={categories.Courier}
            style={styles.imageContainer}
            imageStyle={imgStyle('Courier')} textStyle={[styles.imageText, styles.itemCourier]}
            onPress={this._onCategorySelect.bind(this, 'Courier')}
          />
        </View>
        {!!message && (
        <View style={styles.messageContainer}>
          {!!messageTitle && <Text style={styles.messageTitle}>{messageTitle}</Text>}
          <Text style={styles.messageText}>{message}</Text>
        </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    //backgroundColor: 'white'
    //borderColor: 'blue',
    //borderWidth: 1
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  imageContainer: {
    padding: 6,
    alignItems: 'center'
  },
  imageContainerKiosk: {

  },

  imageText: {
    color: 'white',
    position: 'absolute',
    bottom: refactorFontSize(9),
    fontSize: refactorFontSize(11),
    width: '50%',
    textAlign: 'center'
  },

  itemPharmacy: {
    width: '100%',
    bottom: refactorFontSize(20),
    fontSize: refactorFontSize(12),
  },
  itemKiosk: {
    width: '100%',
    bottom: refactorFontSize(18),
    fontSize: refactorFontSize(11),
  },
  itemMisc: {
    width: '100%',
    bottom: refactorFontSize(20),
    fontSize: refactorFontSize(13),
  },
  itemGifts: {
    bottom: refactorFontSize(12),
    fontSize: refactorFontSize(10),
  },
  itemCourier: {
    width: '100%',
    bottom: refactorFontSize(18),
    fontSize: refactorFontSize(13),
  },

  itemSelected: {
    backgroundColor: '#FF00005F',
    borderRadius: 100
  },

  image: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    opacity: .6
  },

  enabledServiceImage: {
    opacity: 1
  },

  imageBig: {
    height: 110,
    width: 110,
  },

  imageFood: {
    height: 103,
    width: 103,
  },
  imageKiosk: {
    height: 101,
    width: 101,
  },

  messageContainer: {
    flexDirection: 'column',
    marginTop: refactorFontSize(20)
  },
  messageTitle: {
    textAlign: 'center',
    fontSize: refactorFontSize(14),
    color: 'black'
  },
  messageText: {
    textAlign: 'center',
    fontSize: refactorFontSize(14)
  }


});

export default PickDeliveryCategory;
