import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Strings } from '@mrplib/i18n/rn';


let audioPlayer = null;
let audioPlayTimer = null;

export default function({
  reference,
  imagePath: inputImagePath = '',
  audioPath: inputAudioPath = '',

  showAudioDelete = true,
  showPlayStop = true,
  showImageDelete = true


  onPlayStop,
  onDelete,
  onNoAuthorised
}) {
  const [imagePath, setImagePath] = useState(inputImagePath);
  const [audioPath, setAudioPath] = useState(inputImagePath);
  const [imagaudioProgressbarePath, setAudioProgressbar] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(undefined);
  const [totalAudioTime, setTotalAudioTime] = useState(0);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);

  const _interfaceRef = useRef({
    startRecording
  });


  useEffect(() => {
    reference && reference(_interfaceRef);
  }, []);
  useEffect(() => {setImagePath(inputImagePath); }, [inputImagePath]);
  useEffect(() => {
    setAudioPath(inputAudioPath || AudioUtils.DocumentDirectoryPath + '/mrpengu_order_recording.aac');
  }, [inputAudioPath]);

  function startRecording() {
    if(audioPlayTimer) {
      clearInterval(audioPlayTimer);
      audioPlayTimer = null;
    }

    if(audioPlayer && isPlaying) {
      try {
        audioPlayer.stop();
      } catch(error) {}
    }

    setIsPlaying(false);
    setHasRecording(false);
    setAudioProgressbar(0);
    setTotalAudioTime(0);
    setCurrentAudioTime(0);

    AudioRecorder.requestAuthorization()
    .then(async (isAuthorised) => {
      console.log('AudioRecorder.requestAuthorization', isAuthorised)
      setHasPermission(isAuthorised);

      if (!isAuthorised) {
        console.log('NO isAuthorised');
        //return this.showAudioTooltip(Strings.messages.AudioHoldToRecord);
        onNoAuthorised && onNoAuthorised();
        return;
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
        const audioProgressbar = Math.min(currentTime * 0.1, 1);

        this.setState({
          totalAudioTime: currentTime,
          audioProgressbar,
          currentTime
        });

        if(currentTime >= 10) {
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
    });
  }



  function _prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  return (
    <View style={styles.audioContainer}>
      {showPlayStop && (
      <TouchableOpacity style={styles.assetRemoveButton} onPress={onPlayStop}>
        {isPlaying ? (
          <Icon name="stop" color="#E16B00" size={40} />
        ) : (
          <Icon name="play-arrow" color="#289F00" size={40} />
        )}
      </TouchableOpacity>
      )}
      <View style={styles.audioProgressbarContainer}>
        <Progress.Bar style={styles.audioProgressbar}
          progress={timeProgress}
          width={null}
          height={6}
          borderWidth={0}
          useNativeDriver={true}
          animated={timeProgress != 0}
        />
      </View>
      {showDelete && (
      <TouchableOpacity style={styles.assetRemoveButton} onPress={onDelete}>
        <Icon name="clear" color="#9F0000" size={40} />
      </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
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
});
