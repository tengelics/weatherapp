import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import WeatherListing from './../WeatherListing';
import styles from './../../styles/styles';

export default function Layout() {
  return (
    <SafeAreaView style={{...styles.container}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.container.backgroundColor}></StatusBar>
      <WeatherListing />
    </SafeAreaView>
  );
}
