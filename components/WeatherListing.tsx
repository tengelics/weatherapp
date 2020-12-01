import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import styles from './../styles/styles';
import axios from 'axios';
import icons from './../icons/icons';
import Geolocation from '@react-native-community/geolocation';
import Config from 'react-native-config';

interface ForecastItem {
  temp: {
    min: number,
    max: number
  };
  weather: [{
    icon: string,
    main: string
  }];
  dt: number
}

type Props = {}

type State = {
  initialLoading: boolean;
  refreshing: boolean;
  latitude: number;
  longitude: number;
  currentWeather: {
    weather: [
      {
        icon: string,
        main: string
      }
    ],
    temp: number
  };
  forecastedWeather: Array<ForecastItem>;
  timezone: string;
  lastUpdated: number;
  initialLoadingMessage: string
}

export default class WeatherListing extends React.Component<Props,State> {

  state: State = {
    initialLoading: true,
    refreshing: false,
    latitude: 0,
    longitude: 0,
    currentWeather: {
      weather: [
        {
          icon: '',
          main: ''
        }
      ],
      temp: 0
    },
    forecastedWeather: [],
    timezone: '',
    lastUpdated: 0,
    initialLoadingMessage: 'Downloading weather info',
  };

  componentDidMount() {
    Geolocation.getCurrentPosition((info) => {
      if (info) {
        this.setState(
          {
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
          },
          () => {
            this.getWeatherInfo();
          },
        );
      } else {
        this.setState({initialLoadingMessage: 'Geolocation unsuccessful'});
      }
    });
  }

  getWeatherInfo = () => {
    axios
      .post(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${this.state.latitude}&lon=${this.state.longitude}&exclude=minutely,hourly,alerts&appid=${Config.OPENWEATHER_API_KEY}&units=metric`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      )
      .then((res) => {
        this.setState({
          initialLoading: false,
          refreshing: false,
          currentWeather: res.data.current,
          forecastedWeather: res.data.daily,
          timezone: res.data.timezone,
          lastUpdated: Date.now(),
        });
      })
      .catch((err) => {
        this.setState({
          initialLoadingMessage: 'Could not download weather info',
        });
      });
  };

  initialLoadingComponent = () => {
    return (
      <View style={{alignSelf: 'center', flexDirection: 'row'}}>
        <ActivityIndicator animating color="black" />
        <Text style={{marginLeft: 10, alignItems: 'center'}}>
          {this.state.initialLoadingMessage}
        </Text>
      </View>
    );
  };

  currentWeatherComponent = () => {
    //Extraction of current city name from time zone / city response
    const city = this.state.timezone
      .substr(this.state.timezone.indexOf('/') + 1, this.state.timezone.length)
      .replace('_', ' ');
    //lastUpdated to display last updated time
    const lastUpdated = new Date(this.state.lastUpdated);
    //iconExport to dynamically load weather icons from imported loader
    const iconExport = 'img_' + this.state.currentWeather.weather[0].icon as keyof typeof icons;
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.textBoldXXL}>{city}</Text>
          <Text>
            Last updated: {lastUpdated.getHours()}:{lastUpdated.getMinutes()}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={icons[iconExport]}
              style={{width: 60, height: 60, marginTop: -15}}></Image>
            <Text style={{fontWeight: 'bold'}}>
              {this.state.currentWeather.temp.toFixed(0)} °C
            </Text>
          </View>
          <Text style={{marginTop: -10}}>
            Min: {this.state.forecastedWeather[0].temp.min.toFixed(0)} °C | Max:{' '}
            {this.state.forecastedWeather[0].temp.max.toFixed(0)} °C
          </Text>
          <Text style={{marginTop: 5}}>
            {this.state.currentWeather.weather[0].main}
          </Text>
        </View>
      </View>
    );
  };

  forecastComponent = (day: ForecastItem, id: number) => {
    //dayId technical variable to calculate day of week string
    const dayId = new Date(day.dt * 1000).getDay();
    //iconExport to dynamically load weather icons from imported loader
    const iconExport = 'img_' + day.weather[0].icon as keyof typeof icons;
    let dayOfWeek = '';
    switch (dayId) {
      case 0:
        dayOfWeek = 'Sunday';
        break;
      case 1:
        dayOfWeek = 'Monday';
        break;
      case 2:
        dayOfWeek = 'Tuesday';
        break;
      case 3:
        dayOfWeek = 'Wednesday';
        break;
      case 4:
        dayOfWeek = 'Thursday';
        break;
      case 5:
        dayOfWeek = 'Friday';
        break;
      case 6:
        dayOfWeek = 'Saturday';
        break;
    }
    return (
      <View
        style={{
          paddingVertical: 8,
          borderBottomWidth: 0.5,
          borderColor: '#212121',
          flexDirection: 'row',
          alignItems: 'center',
        }}
        key={id}>
        <Image
          source={icons[iconExport]}
          style={{width: 60, height: 60}}></Image>
        <View>
          <Text style={{...styles.text, fontWeight: 'bold'}}>{dayOfWeek}</Text>
          <Text style={styles.text}>
            Min: {day.temp.min.toFixed(0)} °C | Max: {day.temp.max.toFixed(0)}{' '}
            °C
          </Text>
          <Text style={styles.text}>{day.weather[0].main}</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={{
          ...styles.container,
        }}
        refreshControl={
          <RefreshControl
            tintColor="black"
            refreshing={this.state.refreshing}
            onRefresh={() => this.getWeatherInfo()}
          />
        }>
        {this.state.initialLoading ? (
          this.initialLoadingComponent()
        ) : (
          <View
            style={{
              ...styles.container,
              justifyContent: 'flex-start',
              paddingHorizontal: 5,
              paddingVertical: 10,
            }}>
            {this.currentWeatherComponent()}
            {this.state.forecastedWeather.map((daily, id) => {
              if (id > 0) return this.forecastComponent(daily, id);
            })}
          </View>
        )}
      </ScrollView>
    );
  }
}
