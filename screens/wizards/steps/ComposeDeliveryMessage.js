import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
  InteractionManager,
  TouchableOpacity,
  Platform
} from 'react-native';
import firebase from 'react-native-firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-crop-picker';
import RNTooltips from 'react-native-tooltips';
import * as Progress from 'react-native-progress';
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Title from '@components/Title';
import {
  SCLAlert,
  SCLAlertButton
} from '@mrplib/rn/packages/react-native-scl-alert';
import {
  getServicePriceText,
  getServiceFirstComment
} from '@mrplib/data/Services';
import { showOverlay } from '@mrplib/rn/helpers/rnn';
import { calculateOrderPrice } from '@mrpbrain/orders/utils';
import { refactorFontSize } from '@mrplib/rn/utils';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';

import { getFileExtension } from '@mrplib/utils';
// import nanoid from 'nanoid';


class ComposeDeliveryMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      showPicker: false,
      image: null,
      //audio: false,
      audioProgressbar: 0,
      isRecording: false,
      isPlaying: false,
      isRecButtonPressed: false,

      hasRecording: false,

      totalAudioTime: 0,
      currentAudioTime: 0,

      currentTime: 0.0,
      //recording: false,
      //paused: false,
      //stoppedRecording: false,
      //finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/mrpengu_order_recording.aac',
      hasPermission: undefined
    }

    this.audioPlayer = null;
    this.audioPlayTimer = null;
    this.requestingAudioPermission = false;

    this.showAudioTooltip = this.showAudioTooltip.bind(this);
    this._onRecordSoundStart = this._onRecordSoundStart.bind(this);
    this._onRecordSoundEnd = this._onRecordSoundEnd.bind(this);
    this._stopRecording = this._stopRecording.bind(this);
    this._playStopAudio = this._playStopAudio.bind(this);
    this.formatCategoryText = this.formatCategoryText.bind(this);
    this.formatCategoryTitle = this.formatCategoryTitle.bind(this);

    this._onMessageChangeText = this._onMessageChangeText.bind(this);
    this._onRecordSoundPress = this._onRecordSoundPress.bind(this);
    this._onUploadPhotoPress = this._onUploadPhotoPress.bind(this);
    this._onUploadPhotoCameraPress = this._onUploadPhotoCameraPress.bind(this);
    this._onUploadPhotoFilePress = this._onUploadPhotoFilePress.bind(this);
    this._onClosePicker = this._onClosePicker.bind(this);
    this._onAssetClearImage = this._onAssetClearImage.bind(this);
    this._onAssetClearAudio = this._onAssetClearAudio.bind(this);
    this._onPickerNext = this._onPickerNext.bind(this);

    this.showFileModal = this.showFileModal.bind(this);
    this.showCameraModal = this.showCameraModal.bind(this);

    this.renderCourierView = this.renderCourierView.bind(this);
    this.renderCommonView = this.renderCommonView.bind(this);

    this.setPayload = this.setPayload.bind(this);
    this.payload = this.payload.bind(this);

    //console.log('ComposeDeliveryMessage::nanoid', nanoid(), nanoid(), nanoid());

  }

  prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  showAudioTooltip(text, duration = 3000) {
    RNTooltips.Show(
      this.target,
      this.parent,
      {
        text,
        ...mrp.tooltip,
        position: 3,
        align: 2,
        gravity: 2,
        duration,
        autoHide: false
      }
    );

    setTimeout(() => {
      RNTooltips.Dismiss(this.target);
    }, duration);
  }


  _onMessageChangeText(message) {
    this.setState({message});
  }

  _onRecordSoundPress() {
    console.log('_onRecordSoundPress');
    this.showAudioTooltip(Strings.tooltips.AudioHoldToRecord);
  }

  _onRecordSoundStart() {
    console.log('_onRecordSoundStart');

    const { isPlaying } = this.state;

    if(this.audioPlayTimer) {
      clearInterval(this.audioPlayTimer);
      this.audioPlayTimer = null;
    }

    if(this.audioPlayer && isPlaying) {
      try {
        this.audioPlayer.stop();
      } catch(error) {}
    }

    this.setState({
      isRecButtonPressed: true,
      isPlaying: false,
      hasRecording: false,
      audioProgressbar: 0,
      totalAudioTime: 0,
      currentAudioTime: 0
    });

    this.requestingAudioPermission = true;

    AudioRecorder.requestAuthorization()
    .then(async (isAuthorised) => {
      console.log('AudioRecorder.requestAuthorization', isAuthorised)
      this.setState({ hasPermission: isAuthorised });

      if (!isAuthorised) {
        console.log('NO isAuthorised');
        return this.showAudioTooltip(Strings.messages.AudioHoldToRecord);
      }

      const { isRecButtonPressed } = this.state;

      if(!isRecButtonPressed) {
        console.log('NO isRecButtonPressed');
        return this.showAudioTooltip(Strings.tooltips.AudioHoldToRecord);
      }

      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        console.log('AudioRecorder.onProgress', data);
        const currentTime = Math.floor(data.currentTime);
        const audioProgressbar = Math.min(
          currentTime / mrp.delivery.audio.maxRecordingTime, 1
        );

        this.setState({
          totalAudioTime: currentTime,
          audioProgressbar,
          currentTime
        });

        if(currentTime >= mrp.delivery.audio.maxRecordingTime) {
          this._stopRecording();
        }
      }

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        console.log('AudioRecorder.onFinished', data);
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
        }
      }

      this.setState({ isRecording: true });

      try {
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    })
    .catch(error => console.log('AudioRecorder.checkAuthorizationStatus', error))
    .finally(() => {
      this.requestingAudioPermission = false;
    })

  }

  _onRecordSoundEnd() {
    console.log('_onRecordSoundEnd');
    this.setState({ isRecButtonPressed: false });
    this._stopRecording();
  }

  _playStopAudio() {
    if(this.audioPlayer) {
      const { isPlaying } = this.state;

      if(isPlaying) {
        try {
          if(this.audioPlayTimer) {
            clearInterval(this.audioPlayTimer);
            this.audioPlayTimer = null;
          }
          this.audioPlayer.stop();
        } catch(error) {}

        this.setState({
          isPlaying: false,
          audioProgressbar: 0,
          currentAudioTime: 0
        });
      } else {
        try {
          this.setState({
            audioProgressbar: 0,
            currentAudioTime: 0
          });
          this.audioPlayer.play(success => {
            if(this.audioPlayTimer) {
              clearInterval(this.audioPlayTimer);
              this.audioPlayTimer = null;
            }

            this.setState({
              isPlaying: false,
              audioProgressbar: 0,
              currentAudioTime: 0
            });
          });

          this.setState({
            isPlaying: true,
          });

          if(this.audioPlayTimer) {
            clearInterval(this.audioPlayTimer);
          }
          this.audioPlayTimer = setInterval(() => {
            this.audioPlayer.getCurrentTime(seconds => {
              const { totalAudioTime } = this.state;
              const audioProgressbar = (seconds && totalAudioTime) ?
                Math.min(seconds / totalAudioTime, 1) :
                0;

              if(this.audioPlayer.isPlaying()) {
                this.setState({ audioProgressbar });
              } else {
                this.setState({ audioProgressbar: 0 });
              }
            });
          }, 300);

        } catch(error) {
          console.log('Could not play audio', error);
        }
      }
    }
  }

  async _stopRecording() {
    const { isRecording } = this.state;

    console.log('_stopRecording', isRecording);

    if(isRecording) {
      try {
        const filePath = await AudioRecorder.stopRecording();

        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
        return filePath;
      } catch (error) {
        console.error('_stopRecording', error);
      }
    }
  }

  _finishRecording(didSucceed, filePath, fileSize) {
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`, didSucceed);

    if(didSucceed) {
      if(this.audioPlayer) {
        try {
          this.audioPlayer.stop();
        } catch(error) {}
        try {
          this.audioPlayer.release();
        } catch(error) {}
      }

      try {
        this.audioPlayer = new Sound(filePath, '', error => {
          if(error) {
            console.log(`Failed to load the sound '${filePath}'`, error);
            this.audioPlayer = null;
          }
        });
        this.audioPlayer.setNumberOfLoops(1);
      } catch(error) {
        console.log(`Failed to init sound '${filePath}'`, error);
      }
    }

    this.setState({
      isRecording: false,
      hasRecording: didSucceed,
      audioProgressbar: 0
    });
  }

  _onUploadPhotoPress() {
    this.setState({
      showPicker: true,
      pickerAction: null
    }, () => {
      //this.imagesPickerRef.show();
    });

    console.log('this.imagesPickerRef', this.imagesPickerRef);

    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 400,
    //   cropping: true
    // }).then(image => {
    //   console.log(image);
    //   this.setState({ image });
    // }).catch(e => {
    //   console.log('ImagePicker.openCamera::error', e);
    //   this.setState({ message: 'Err:' + e.toString() });
    // });
  }

  _onUploadPhotoCameraPress() {
    console.log('_onUploadPhotoCameraPress', 'camera');
    this.setState({ showPicker: false, pickerAction: 'camera' }, () => {
      setTimeout(() => {
        this._onPickerNext();
      }, 1000);
    });

    // this.setState({ pickerAction: 'camera' }, () => {
    //   this.imagesPickerRef.hide().then(() => {
    //     //InteractionManager.runAfterInteractions(() => {
    //       this._onPickerNext();
    //     //});
    //   }).catch(error => {});
    // });
  }

  _onUploadPhotoFilePress() {
    console.log('_onUploadPhotoFilePress', 'file');
    this.setState({ showPicker: false, pickerAction: 'file' }, () => {
      setTimeout(() => {
        this._onPickerNext();
      }, 1000);
    });

    // this.setState({ pickerAction: 'file' }, () => {
    //   this.imagesPickerRef.hide().then(() => {
    //     //InteractionManager.runAfterInteractions(() => {
    //       this._onPickerNext();
    //     //});
    //   }).catch(error => {});
    // });
  }

  _onPickerNext() {
    const { pickerAction } = this.state;
    console.log('_onPickerNext', pickerAction);

    switch(pickerAction) {
      case 'camera':
        this.showCameraModal();
        break;
      case 'file':
        this.showFileModal();
        break;
    }
  }

  showCameraModal() {
    ImagePicker.openCamera({
      ...mrp.delivery.image,
      // width: 1200,
      // height: 1400,
      // compressImageQuality: .8,
      cropping: true
    }).then(image => {
      // let uploadFilename = nanoid();
      // let ext = getFileExtension(image.path);
      // if(ext) uploadFilename += `.${ext}`;

      // console.log('Got camera image; Uploading to firebase', uploadFilename, image);

      // firebase.storage()
      // .ref(`/orders/userId/${uploadFilename}`)
      // .putFile(image.path)
      // .then((arg1) => {
      //   console.log('firebase.storage.upload:SUCCESS', arg1);
      // })
      // .catch(error => console.log('firebase.storage.upload:ERR', error));

      this.setState({ image });
    }).catch(e => console.log('ImagePicker.openCamera::error', e));
  }

  showFileModal() {
    ImagePicker.openPicker({
      ...mrp.delivery.image,
      // width: 1200,
      // height: 1400,
      // compressImageQuality: .8,
      cropping: true
    })
    .then(image => {
      console.log('ImagePicker.openPicker::OK', image);
      // let uploadFilename = nanoid();
      // let ext = getFileExtension(image.path);
      // if(ext) uploadFilename += `.${ext}`;

      // console.log('Got picker image; Uploading to firebase', uploadFilename, image);

      // firebase.storage()
      // .ref(`/orders/userId/${uploadFilename}`)
      // .putFile(image.path)
      // .then((arg1) => {
      //   console.log('firebase.storage.upload:SUCCESS', arg1);
      // })
      // .catch(error => console.log('firebase.storage.upload:ERR', error));

      this.setState({ image });
    })
    .catch(e => console.log('ImagePicker.openPicker::error', e))
    .finally(() => console.log('ImagePicker.openPicker::finally'));
  }

  setPayload(payload) {
    console.log('ComposeDeliveryMessage::setPayload', payload);

    if(this.audioPlayer) {
      try {
        this.audioPlayer.stop();
      } catch(error) {}
      try {
        this.audioPlayer.release();
      } catch(error) {}
    }

    this.audioPlayer = null;

    const { locationArea, selectedService, category, address } = payload;
    this.setState({
      locationArea,
      selectedService,
      category,
      address,
      message: '',
      image: null,
      audioProgressbar: 0,
      hasRecording: false
    });
  }

  payload() {
    const { message, image, hasRecording, audioPath } = this.state;
    let result = { message, image };

    hasRecording && (result.audio = audioPath);
    return result;
  }

  validate() {
    const {
      message,
      hasRecording, selectedService:
      service
    } = this.state;

    console.log('Compose Delivery Message::validate', message);

    const isCourier = service && service.nameId == 'Courier';

    if(message.length == 0 && !hasRecording && !isCourier) {
      showOverlay('Alert', {
        title: Strings.messages.PlaseWriteMessage,
        //customView: <MessageLines messages={check.messages}/>
      });
      return false;
    }
    return true;
  }

  _onClosePicker() {
    // this.setState({
    //   //showPicker: false,
    //   pickerAction: 'cancel'
    // }).then(() => this.imagesPickerRef.hide());
    this.imagesPickerRef.hide();
  }

  _onAssetClearAudio() {
    if(this.audioPlayTimer) {
      clearInterval(this.audioPlayTimer);
      this.audioPlayTimer = null;
    }

    if(this.audioPlayer) {
      try {
        this.audioPlayer.stop();
      } catch(error) {}
      try {
        this.audioPlayer.release();
      } catch(error) {}
      this.audioPlayer = null;
    }

    this.setState({
      hasRecording: false,
      audioProgressbar: 0,
      isRecording: false,
      isPlaying: false,
      totalAudioTime: 0,
      currentAudioTime: 0,
    });
  }

  _onAssetClearImage() {
    this.setState({
      image: null
    });
  }

  formatCategoryTitle() {
    const { category } = this.state;
    return category ? Strings.services.delivery.categories[category].replace(/\n/g, ' ') : '';
  }

  formatCategoryText() {
    const {
      selectedService: service,
      address,
      locationArea: area
    } = this.state;

    if(!service) return '';
    let { estTime } = service;

    if(estTime && 'type' in estTime && 'value' in estTime) {
      const { type, value } = estTime;
      estTime = `${value} ${Strings.time.tags[type]}`;
    }

    let priceText = getServicePriceText(calculateOrderPrice({ area, service, address }));
    priceText = `${priceText} Delivery`;
    return estTime ? `${priceText} • ${estTime}` : priceText;
  }

  renderCourierView() {
    return (
      <>
        <View style={styles.courierContentContainer}>
          <Text style={styles.courierContentMessage}>{Strings.views.CourierViewText}</Text>
        </View>
        <View style={styles.penguContainer}>
          <Image style={styles.mrPengu} source={require('@assets/graphics/mrPengu.png')}/>
        </View>
      </>
    );
  }

  renderCommonView() {
    let {
      message,
      image,
      audioProgressbar,
      showPicker,
      isRecording,
      isPlaying,
      hasRecording
    } = this.state;
    const { audioPlayer } = this;

    return (
      <>
        <View style={styles.textInputContainer}>
          <Icon name="input" color="#B6B6B6" size={35} style={styles.textInputIcon} />
          <TextInput style={styles.textInput}
            placeholder={Strings.titles.WriteYourOrder}
            value={message}
            multiline={true}
            maxLength={300} // Also check brain commit hardcoded !
            onChangeText={this._onMessageChangeText}
          />
        </View>
        <View style={[styles.assetsContainer, !!image && styles.assetsContainerWithImage]}>
          {image && (
            <View style={styles.assetImageContainer}>
              <Image source={{ uri: image.path }} style={styles.assetImage} resizeMode='contain'/>
              <TouchableOpacity style={styles.assetRemoveButton} onPress={this._onAssetClearImage}>
                <Icon name="clear" color="#9F0000" size={40} />
              </TouchableOpacity>
            </View>
          )}
          {(audioPlayer || isRecording) && (
            <View style={styles.audioContainer}>
              {audioPlayer && !isRecording && (
              <TouchableOpacity style={styles.assetRemoveButton} onPress={this._playStopAudio}>
                {isPlaying ? (
                  <Icon name="stop" color="#E16B00" size={40} />
                ) : (
                  <Icon name="play-arrow" color="#289F00" size={40} />
                )}
              </TouchableOpacity>
              )}
              <View style={styles.audioProgressbarContainer}>
                <Progress.Bar style={styles.audioProgressbar}
                  progress={audioProgressbar}
                  width={null}
                  height={6}
                  borderWidth={0}
                  useNativeDriver={true}
                  animated={audioProgressbar != 0}
                />
              </View>
              {hasRecording && !isRecording && (
              <TouchableOpacity style={styles.assetRemoveButton} onPress={this._onAssetClearAudio}>
                <Icon name="clear" color="#9F0000" size={40} />
              </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles.menuItemsTop}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemMarginRight]} onPress={this._onUploadPhotoPress}>
            <Image source={require('@assets/icons/iconMenuCamera.png')} style={styles.menuItemIcon}/>
            <Text style={styles.menuItemText}>{Strings.titles.UploadPhoto}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}
            ref={target => this.target = target}
            delayLongPress={700}
            onPress={this._onRecordSoundPress}
            onLongPress={this._onRecordSoundStart}
            onPressOut={this._onRecordSoundEnd}
          >
            <Image source={require('@assets/icons/iconMenuMic.png')} style={styles.menuItemIcon}/>
            <Text numberOfLines={1} style={styles.menuItemText}>{Strings.titles.RecordSound}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  render() {
    let {
      message,
      image,
      audio,
      audioProgressbar,
      showPicker,
      isRecording,
      isPlaying,
      hasRecording
    } = this.state;
    const { audioPlayer } = this;
    const hasAssets = true; // && !!image || !!audio || !!isRecording;
    const { selectedService: service } = this.state;
    let serviceMessage = getServiceFirstComment(service);

    const isCourier = service && service.nameId == 'Courier';

    console.log('showPicker', showPicker);

    return (
      <>
        <KeyboardAwareScrollView style={styles.withFlex}>
          <View style={styles.container} ref={parent => this.parent = parent}>
            <Title text={this.formatCategoryTitle()} bottomSpacing={0}/>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryText}>{this.formatCategoryText()}</Text>
            </View>
            {serviceMessage && (
              <View style={styles.serviceMessageContainer}>
                <Text style={styles.serviceMessageText}>{serviceMessage}</Text>
              </View>
            )}
            {isCourier ? this.renderCourierView() : this.renderCommonView()}
          </View>
        </KeyboardAwareScrollView>
        <SCLAlert
          theme="info"
          show={showPicker}
          ref={ref => this.imagesPickerRef = ref}
          //title="Lorem"
          //headerContainerStyles={{display: 'none'}}
          onRequestClose={this._onClosePicker}
          //onDismiss={this._onPickerNext}
          subtitle={Strings.titles.UploadPhoto}
        >
          <SCLAlertButton theme="info" onPress={this._onUploadPhotoFilePress}>{Strings.titles.FromFile}</SCLAlertButton>
          <SCLAlertButton theme="info" onPress={this._onUploadPhotoCameraPress}>{Strings.titles.Camera}</SCLAlertButton>
          <SCLAlertButton theme="default" onPress={this._onClosePicker}>{Strings.titles.Cancel}</SCLAlertButton>
        </SCLAlert>
      </>
    );
  }
}

const styles = StyleSheet.create({
  withFlex: {
    flex: 1
  },
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    //backgroundColor: 'white'
    //borderColor: 'green',
    //borderWidth: 1
  },
  textInputContainer: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: refactorFontSize(1),
    borderColor: '#E2E2E2',
    backgroundColor: '#FBFBFB',
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0
  },
  textInputIcon: {
    marginTop: 3,
    marginHorizontal: 5,
  },
  textInput: {
    // width: '90%',
    // height: refactorFontSize(120),
    // borderWidth: 1,
    // borderColor: '#CACACA',
    // backgroundColor: '#FBFBFB',
    // borderRadius: 10,
    // textAlignVertical: 'top',

    flex: 1,
    //backgroundColor: 'red',
    height: refactorFontSize(120),
    textAlignVertical: 'top',
    fontSize: refactorFontSize(13)
  },

  serviceMessageContainer: {
    marginBottom: refactorFontSize(10),
    width: '80%'
  },
  serviceMessageText: {
    fontSize: refactorFontSize(14),
    color: '#F2AA00',
    textAlign: 'center'
  },

  menuItemsContainer: {
    width: '100%',
    flex: 0
  },
  menuItemsTop: {
    //display: 'flex',
    //flex: 0,
    flexDirection: 'row',
    //flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: refactorFontSize(20)
  },
  menuItemsBottom: {
    //flex: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  menuItem: {
    flex: 0,
    width: '25%',
    // borderWidth: 1,
    // borderColor: 'red',
    //height: refactorFontSize(100),
    //height: '60%',
    //height: '30%',
    alignItems: 'center'
  },
  menuItemMarginRight: {
    marginRight: refactorFontSize(40)
  },
  menuItemIcon: {
    // borderWidth: 1,
    // borderColor: '#CACACA',
    width: '100%',
    height: refactorFontSize(80),
    //marginTop: refactorFontSize(10),
    resizeMode: 'contain',
    overflow: 'visible'
  },
  menuItemText: {
    // borderWidth: 1,
    // borderColor: '#CACACA',
    ...mrp.styles.menuItemTitle,
    textAlign: 'center',
    //marginTop: refactorFontSize(2)
  },

  assetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    //height: refactorFontSize(65),
    height: refactorFontSize(35),
    flex: 0,
    width: '90%',
    //marginTop: refactorFontSize(5),
    // borderWidth: 1,
    // borderStyle: 'dashed',
    // borderColor: '#D8D8D8',
    // backgroundColor: '#FCFCFC',
    // borderRadius: 10,
  },
  assetsContainerWithImage: {
    height: refactorFontSize(65),
  },

  assetImageContainer: {
    // borderWidth: 1,
    // borderColor: 'red',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 0
  },
  assetImage: {
    width: refactorFontSize(70),
    height: '90%',
    //height: refactorFontSize(60),
    borderRadius: 5,
    //marginHorizontal: 5,
    //resizeMode: 'contain',
    //borderWidth: 1,
    //borderColor: 'red',
  },
  assetRemoveButton: {
    //flex: 1,
    height: '100%',
    width: null,
    //color: 'red',
    //paddingHorizontal: refactorFontSize(10),
    justifyContent: 'center',
    //backgroundColor: 'green'
  },

  audioContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //height: refactorFontSize(30),
    //width: '90%',
    //marginTop: refactorFontSize(5),
    // borderWidth: 1,
    // borderStyle: 'dashed',
    // borderColor: '#D8D8D8',
    // backgroundColor: '#FCFCFC',
    // borderRadius: 10,
  },
  audioProgressbarContainer: {
    height: 6,
    flex: 1
  },
  audioProgressbar: {
    flex: 0
  },

  categoryDetails: {
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10
  },
  categoryText: {
    fontSize: 14,
  },

  courierContentContainer: {
    marginVertical: 20,
    marginHorizontal: 30
  },
  courierContentMessage: {
    lineHeight: 24,
    fontSize: 16
  },
  penguContainer: {
    // borderWidth: 1,
    // borderColor: 'red',
    // position: 'absolute',
    // bottom: refactorFontSize(-110),
    // marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mrPengu: {
    opacity: .5,
    //width: '30%',
    height: refactorFontSize(120),
    resizeMode: 'contain'
  }
});

export default ComposeDeliveryMessage;
