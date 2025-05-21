import React from 'react';
import { 
  WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, 
  WiDayCloudy, WiFog, WiNightClear 
} from 'react-icons/wi';

const WeatherCard = ({ weatherData }) => {
  const getWeatherIcon = (main) => {
    const iconSize = 60;
    switch (main) {
      case 'Clear':
        return <WiDaySunny size={iconSize} />;
      case 'Rain':
        return <WiRain size={iconSize} />;
      case 'Clouds':
        return <WiCloudy size={iconSize} />;
      case 'Snow':
        return <WiSnow size={iconSize} />;
      case 'Thunderstorm':
        return <WiThunderstorm size={iconSize} />;
      case 'Drizzle':
        return <WiRain size={iconSize} />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <WiFog size={iconSize} />;
      default:
        return <WiDayCloudy size={iconSize} />;
    }
  };

  return (
    <div className="weather-card">
      <h2>{weatherData.name}, {weatherData.sys.country}</h2>
      <div className="weather-icon">
        {getWeatherIcon(weatherData.weather[0].main)}
      </div>
      <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
      <p className="description">{weatherData.weather[0].description}</p>
      <div className="details">
        <p>Humidity: {weatherData.main.humidity}%</p>
        <p>Wind: {weatherData.wind.speed} m/s</p>
        <p>Pressure: {weatherData.main.pressure} hPa</p>
      </div>
    </div>
  );
};

export default WeatherCard;