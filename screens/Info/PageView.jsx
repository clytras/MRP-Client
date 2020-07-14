import React, {
  useState,
  useEffect,
} from 'react';
import {
  ScrollView,
  StyleSheet
} from 'react-native';
import ViewBase from '@mrplib/rn/components/ViewBase';
import HTML from 'react-native-render-html';
import { dismissModal } from '@mrplib/rn/helpers/rnn';
import { Strings } from '@mrplib/i18n/rn';
import mrp from '@app/mrp';

import AboutMrPengu from '@jsassets/html/AboutMrPengu';
import MrPenguGo from '@jsassets/html/MrPenguGo';
import PrivacyPolicy from '@jsassets/html/PrivacyPolicy';
import TermsOfService from '@jsassets/html/TermsOfService';


export default function({
  componentId,
  mode // privacy | terms | go | about
}) {
  function onCloseModal() {
    dismissModal(componentId);
  }

  function selectTitle() {
    switch(mode) {
      case 'PrivacyPolicy': return Strings.titles.PrivacyPolicy;
      case 'TermsOfService': return Strings.titles.TermsOfService;
      case 'AboutMrPengu': return Strings.titles.AboutMrPengu;
      case 'MrPenguGo': return Strings.titles.MrPenguGo;
    }
  }

  function selectContent() {
    const lang = Strings.getSafeCurrentLocale();
    switch(mode) {
      case 'PrivacyPolicy': return PrivacyPolicy;
      case 'TermsOfService': return TermsOfService;
      case 'AboutMrPengu': return AboutMrPengu[lang];
      case 'MrPenguGo': return MrPenguGo[lang];
    }
  }

  return (
    <ViewBase
      navigationComponentId={componentId}
      showDrawerButton={false}
      backCloseIcon={true}
      isModal={true}
      headerText={selectTitle()}
      onBackButtonPress={onCloseModal}
    >
      <ScrollView style={styles.container}>
        <HTML html={selectContent()}
          classesStyles={{
            'the_content_wrapper': {
              margin: 40,
              color: 'black',
              fontSize: 16,
              lineHeight: 20
            },
            'title': {
              fontSize: 22
            }
          }}
          tagsStyles={{
          }}
          onLinkPress={(event, href) => console.log('Link', href)}
        />
      </ScrollView>
    </ViewBase>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
