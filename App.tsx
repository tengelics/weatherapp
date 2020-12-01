import React from 'react';
import {
  View,
} from 'react-native';
import Layout from './components/layout/Layout';
import styles from './styles/styles';

const App = () => {
  return (
    <View style={styles.container}>
      <Layout></Layout>
    </View>
  );
};

export default App;
