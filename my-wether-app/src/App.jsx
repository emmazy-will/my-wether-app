import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets, 
  Eye, 
  Sunrise, 
  Sunset,
  MapPin,
  RefreshCw,
  ChevronDown,
  Search,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Compass,
  BarChart2,
  Calendar,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Settings,
  Moon,
  AlertCircle,
  Info
} from 'lucide-react';
import './App.css'

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });
  const [tempUnit, setTempUnit] = useState('C');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get user's current location on initial load
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({ 
          name: 'Lagos', 
          capital: 'Ikeja', 
          code: 'NG-LA' 
        });
      },
      (error) => {
        console.log("Geolocation error:", error);
        // Default to Lagos if geolocation fails
        fetchWeather({ 
          name: 'Lagos', 
          capital: 'Ikeja', 
          code: 'NG-LA' 
        });
      }
    );
  } else {
    // Default to Lagos if geolocation not supported
    fetchWeather({ 
      name: 'Lagos', 
      capital: 'Ikeja', 
      code: 'NG-LA' 
    });
  }
}, []);
  
  const API_KEY = '7551e9639078e5487f77a5313159da2d';

  const fetchWeather = async (country) => {
    if (!country) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First fetch coordinates for the capital city
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${country.capital},${country.code}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found');
      }
      
      const { lat, lon } = geoData[0];
      
      // Then fetch weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const weatherData = await weatherResponse.json();
      
      if (weatherData.cod !== 200) {
        throw new Error(weatherData.message || 'Failed to fetch weather data');
      }
      
      // Format the data to match your existing structure
      const formattedData = {
        ...weatherData,
        country: country.name,
        flag: country.code.toLowerCase()
      };
      
      setWeatherData(formattedData);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Update search history
      setSearchHistory(prev => {
        const newHistory = prev.filter(item => item.code !== country.code);
        return [country, ...newHistory].slice(0, 5);
      });
      
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Convert temperature based on selected unit
  const convertTemp = (temp) => {
    if (tempUnit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };
  
  // Enhanced mock forecast data with hourly forecast
  const generateForecastData = () => {
    if (!weatherData) return { daily: [], hourly: [] };
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const dayIndex = today.getDay();
    
    // Daily forecast
    const dailyForecast = [];
    for (let i = 0; i < 5; i++) {
      const dayName = i === 0 ? 'Today' : days[(dayIndex + i) % 7];
      const baseTemp = weatherData.main.temp;
      const randomVariation = Math.random() * 4 - 2; // -2 to +2 variation
      
      const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Drizzle'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      dailyForecast.push({
        day: dayName,
        high: baseTemp + randomVariation + 3,
        low: baseTemp + randomVariation - 5,
        condition: randomCondition,
        precipitation: Math.round(Math.random() * 30),
        date: new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      });
    }
    
    // Hourly forecast
    const hourlyForecast = [];
    const currentHour = today.getHours();
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const isNight = hour < 6 || hour > 18;
      const baseTemp = weatherData.main.temp;
      const randomVariation = Math.random() * 3 - 1.5; // -1.5 to +1.5 variation
      
      // Time-dependent temperatures (cooler at night, warmer midday)
      let tempAdjustment = 0;
      if (hour < 6) tempAdjustment = -3; // Early morning
      else if (hour < 12) tempAdjustment = 1; // Morning
      else if (hour < 17) tempAdjustment = 3; // Afternoon
      else tempAdjustment = -1; // Evening
      
      const conditions = ['Clear', 'Clouds', 'Rain'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      hourlyForecast.push({
        hour: hour === currentHour ? 'Now' : `${hour}:00`,
        temp: baseTemp + randomVariation + tempAdjustment,
        condition: isNight && randomCondition === 'Clear' ? 'Clear Night' : randomCondition,
        precipitation: Math.round(Math.random() * 30)
      });
    }
    
    return { daily: dailyForecast, hourly: hourlyForecast };
  };
  
  const forecastData = generateForecastData();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleTempUnit = () => {
    setTempUnit(tempUnit === 'C' ? 'F' : 'C');
  };

 const CountrySelector = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [states] = useState([
    { name: 'Abia', capital: 'Umuahia', code: 'NG-AB' },
    { name: 'Adamawa', capital: 'Yola', code: 'NG-AD' },
    { name: 'Akwa Ibom', capital: 'Uyo', code: 'NG-AK' },
    { name: 'Anambra', capital: 'Awka', code: 'NG-AN' },
    { name: 'Bauchi', capital: 'Bauchi', code: 'NG-BA' },
    { name: 'Bayelsa', capital: 'Yenagoa', code: 'NG-BY' },
    { name: 'Benue', capital: 'Makurdi', code: 'NG-BE' },
    { name: 'Borno', capital: 'Maiduguri', code: 'NG-BO' },
    { name: 'Cross River', capital: 'Calabar', code: 'NG-CR' },
    { name: 'Delta', capital: 'Asaba', code: 'NG-DE' },
    { name: 'Ebonyi', capital: 'Abakaliki', code: 'NG-EB' },
    { name: 'Edo', capital: 'Benin City', code: 'NG-ED' },
    { name: 'Ekiti', capital: 'Ado Ekiti', code: 'NG-EK' },
    { name: 'Enugu', capital: 'Enugu', code: 'NG-EN' },
    { name: 'Gombe', capital: 'Gombe', code: 'NG-GO' },
    { name: 'Imo', capital: 'Owerri', code: 'NG-IM' },
    { name: 'Jigawa', capital: 'Dutse', code: 'NG-JI' },
    { name: 'Kaduna', capital: 'Kaduna', code: 'NG-KD' },
    { name: 'Kano', capital: 'Kano', code: 'NG-KN' },
    { name: 'Katsina', capital: 'Katsina', code: 'NG-KT' },
    { name: 'Kebbi', capital: 'Birnin Kebbi', code: 'NG-KE' },
    { name: 'Kogi', capital: 'Lokoja', code: 'NG-KO' },
    { name: 'Kwara', capital: 'Ilorin', code: 'NG-KW' },
    { name: 'Lagos', capital: 'Ikeja', code: 'NG-LA' },
    { name: 'Nasarawa', capital: 'Lafia', code: 'NG-NA' },
    { name: 'Niger', capital: 'Minna', code: 'NG-NI' },
    { name: 'Ogun', capital: 'Abeokuta', code: 'NG-OG' },
    { name: 'Ondo', capital: 'Akure', code: 'NG-ON' },
    { name: 'Osun', capital: 'Oshogbo', code: 'NG-OS' },
    { name: 'Oyo', capital: 'Ibadan', code: 'NG-OY' },
    { name: 'Plateau', capital: 'Jos', code: 'NG-PL' },
    { name: 'Rivers', capital: 'Port Harcourt', code: 'NG-RI' },
    { name: 'Sokoto', capital: 'Sokoto', code: 'NG-SO' },
    { name: 'Taraba', capital: 'Jalingo', code: 'NG-TA' },
    { name: 'Yobe', capital: 'Damaturu', code: 'NG-YO' },
    { name: 'Zamfara', capital: 'Gusau', code: 'NG-ZA' },
    { name: 'Federal Capital Territory', capital: 'Abuja', code: 'NG-FC' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStates = states.filter(state => 
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.capital.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="relative w-full">
      <div 
        className={`flex items-center justify-between p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {weatherData ? `${weatherData.name}, ${weatherData.country}` : 'Select state or city'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>
      
      {isOpen && (
        <div className={`absolute z-10 mt-1 w-full rounded-lg border shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-2">
            <div className={`flex items-center gap-2 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Search className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                className={`w-full bg-transparent border-none focus:outline-none ${theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}`}
                placeholder="Search states or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {searchHistory.length > 0 && !searchTerm && (
            <div className="px-2">
              <div className={`text-xs font-semibold px-2 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recently searched</div>
              {searchHistory.map((state) => (
                <div
                  key={`history-${state.code}`}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  onClick={() => {
                    onSelect(state);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {state.capital}, {state.name}
                    </span>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {state.code}
                  </span>
                </div>
              ))}
              <div className="border-b my-1 border-gray-200 dark:border-gray-700"></div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto">
            {filteredStates.map((state) => (
              <div
                key={state.code}
                className={`flex items-center justify-between p-2 cursor-pointer hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                onClick={() => {
                  onSelect(state);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {state.capital}, {state.name}
                  </span>
                </div>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {state.code}
                </span>
              </div>
            ))}
            
            {filteredStates.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No locations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
  
  
  // Settings panel component
  const SettingsPanel = () => {
    return (
      <div className={`absolute right-0 top-16 z-20 w-64 p-4 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        
        <div className="mb-4">
          <p className="text-sm mb-2">Temperature Unit</p>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-sm ${tempUnit === 'C' 
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => setTempUnit('C')}
            >
              °C
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${tempUnit === 'F' 
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => setTempUnit('F')}
            >
              °F
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm mb-2">Theme</p>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${theme === 'light' 
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-3 w-3" /> Light
            </button>
            <button
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${theme === 'dark' 
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-3 w-3" /> Dark
            </button>
          </div>
        </div>
        
        <button
          className={`w-full py-2 rounded text-sm ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setShowSettings(false)}
        >
          Close
        </button>
      </div>
    );
  };

  // Helper functions
  const getWeatherIcon = (condition, size = "medium") => {
    const sizeMap = {
      small: "h-5 w-5",
      medium: "h-8 w-8",
      large: "h-12 w-12",
      xlarge: "h-20 w-20"
    };
    
    const iconClass = `${sizeMap[size]} ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`;
    
    // Add more weather conditions
    switch(condition?.toLowerCase()) {
      case 'clear':
        return <Sun className={iconClass} />;
      case 'clear night':
        return <Moon className={iconClass} />;
      case 'rain':
        return <CloudRain className={iconClass} />;
      case 'clouds':
        return <Cloud className={iconClass} />;
      case 'snow':
        return <CloudSnow className={iconClass} />;
      case 'drizzle':
        return <CloudDrizzle className={iconClass} />;
      case 'thunderstorm':
        return <CloudLightning className={iconClass} />;
      case 'mist':
      case 'fog':
        return <CloudFog className={iconClass} />;
      default:
        return <Sun className={iconClass} />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getWindDirection = (degrees) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };
  
  const getPrecipitationText = (weather) => {
    if (!weather) return "0%";
    if (weather.rain) return `${Math.round(weather.rain['1h'] * 20)}%`;
    if (weather.weather[0].main === 'Rain') return `${Math.round(Math.random() * 50 + 50)}%`;
    if (weather.weather[0].main === 'Drizzle') return `${Math.round(Math.random() * 30 + 20)}%`;
    if (weather.weather[0].main === 'Snow') return `${Math.round(Math.random() * 40 + 40)}%`;
    if (weather.weather[0].main === 'Thunderstorm') return `${Math.round(Math.random() * 30 + 70)}%`;
    return "0%";
  };

  // UV Index calculation (mock)
  const getUVIndex = () => {
    if (!weatherData) return { value: 0, level: "Low" };
    
    // Simplified UV calculation based on weather
    let uvValue = 0;
    
    if (weatherData.weather[0].main === 'Clear') {
      uvValue = Math.floor(Math.random() * 5) + 5; // 5-10 for clear days
    }
    else if (weatherData.weather[0].main === 'Clouds') {
      uvValue = Math.floor(Math.random() * 4) + 2; // 2-5 for cloudy days
    }
    else {
      uvValue = Math.floor(Math.random() * 2) + 1; // 1-2 for rainy/snowy days
    }
    
    // UV level based on value
    let level = "Low";
    if (uvValue > 7) level = "High";
    else if (uvValue > 3) level = "Moderate";
    
    return { value: uvValue, level };
  };
  
  // Air quality calculation (mock)
  const getAirQuality = () => {
    if (!weatherData) return { index: 0, level: "Unknown" };
    
    // Mock AQI based on weather conditions
    let aqi = 0;
    
    if (['Rain', 'Drizzle'].includes(weatherData.weather[0].main)) {
      aqi = Math.floor(Math.random() * 30) + 10; // 10-40 (Good) after rain
    }
    else if (weatherData.weather[0].main === 'Clear') {
      aqi = Math.floor(Math.random() * 40) + 20; // 20-60 (Good-Moderate) on clear days
    }
    else {
      aqi = Math.floor(Math.random() * 50) + 40; // 40-90 (Moderate-Unhealthy) on cloudy/foggy days
    }
    
    // AQI level
    let level = "Good";
    if (aqi > 100) level = "Unhealthy";
    else if (aqi > 50) level = "Moderate";
    
    return { index: aqi, level };
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
          <Cloud className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
          <h1 className="text-xl font-bold">Weather Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {lastUpdated}
            </div>
          )}
          
          <button 
            onClick={() => weatherData && fetchWeather({
              capital: weatherData.name,
              code: weatherData.sys.country,
              name: weatherData.country
            })}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {showSettings && <SettingsPanel />}
          </div>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row">
            <aside
            className="md:w-80 lg:w-96 p-4 md:h-screen md:sticky md:top-16 overflow-y-auto no-scrollbar"
          >
            {/* Location selector */}
            <div className="mb-6">
              <label
                className={`block mb-2 text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
              </label>
              <CountrySelector onSelect={fetchWeather} />
            </div>

            {/* Weather Summary */}
            {weatherData && (
              <div
                className={`rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
                    : 'bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 text-white'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{weatherData.name}</h2>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                        }`}
                      >
                        {weatherData.country}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-4xl font-bold">
                        {convertTemp(weatherData.main.temp)}°{tempUnit}
                      </span>
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                        }`}
                      >
                        Feels like {convertTemp(weatherData.main.feels_like)}°
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getWeatherIcon(weatherData.weather[0].main, 'large')}
                    <div>
                      <p className="text-lg font-medium">
                        {weatherData.weather[0].main}
                      </p>
                      <p
                        className={`text-sm capitalize ${
                          theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                        }`}
                      >
                        {weatherData.weather[0].description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <div
                      className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                      }`}
                    >
                      <ArrowDown className="h-3 w-3" />
                      {convertTemp(weatherData.main.temp_min)}°
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                      }`}
                    >
                      <ArrowUp className="h-3 w-3" />
                      {convertTemp(weatherData.main.temp_max)}°
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
                      }`}
                    >
                      <Droplets className="h-3 w-3" />
                      {getPrecipitationText(weatherData)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <nav className="mt-6 flex flex-col gap-2">
              {[
                { id: 'current', icon: <Sun />, label: 'Current' },
                { id: 'forecast', icon: <Calendar />, label: 'Forecast' },
                { id: 'details', icon: <BarChart2 />, label: 'Details' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? theme === 'dark'
                        ? 'bg-blue-900/40 text-blue-400'
                        : 'bg-blue-100 text-blue-700'
                      : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="h-5 w-5">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Extra Info */}
            {weatherData && (
              <div className="mt-6 space-y-4">
                {/* Sunrise / Sunset */}
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Sunrise & Sunset</h3>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Sunrise
                        className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Sunrise
                        </p>
                        <p className="font-medium">
                          {formatTime(weatherData.sys.sunrise)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sunset
                        className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Sunset
                        </p>
                        <p className="font-medium">
                          {formatTime(weatherData.sys.sunset)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Air Quality */}
                <div
                  className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } border ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm font-medium">Air Quality</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        getAirQuality().level === 'Good'
                          ? 'bg-green-100 text-green-600'
                          : getAirQuality().level === 'Moderate'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {getAirQuality().level}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        getAirQuality().level === 'Good'
                          ? 'bg-green-500'
                          : getAirQuality().level === 'Moderate'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(getAirQuality().index, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span
                      className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                    >
                      0
                    </span>
                    <span
                      className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                    >
                      50
                    </span>
                    <span
                      className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                    >
                      100
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className={`h-12 w-12 rounded-full border-4 border-t-transparent border-blue-500 animate-spin`}></div>
              <p className="mt-4 text-gray-500">Loading weather data...</p>
            </div>
          ) : error ? (
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex gap-3 items-center">
                <AlertCircle className={`h-6 w-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                <p className={theme === 'dark' ? 'text-red-300' : 'text-red-600'}>{error}</p>
              </div>
              <button 
                className={`mt-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                }`}
                onClick={() => weatherData && fetchWeather({
                  capital: weatherData.name,
                  code: weatherData.sys.country,
                  name: weatherData.country
                })}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : !weatherData ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className={`p-6 rounded-full ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} mb-6`}>
                <Cloud className={`h-16 w-16 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Weather Dashboard</h2>
              <p className={`max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a location from the sidebar to view detailed weather information and forecasts.
              </p>
            </div>
          ) : (
            <>
              {/* Current Weather View */}
              {activeTab === 'current' && (
                <div className="space-y-6">
                  {/* Main weather card */}
                  <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-bold">Current Weather</h2>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {weatherData.name}, {weatherData.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          {getWeatherIcon(weatherData.weather[0].main, "xlarge")}
                          <div className="text-right">
                            <div className="text-4xl font-bold">
                              {convertTemp(weatherData.main.temp)}°{tempUnit}
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {weatherData.weather[0].description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Feels Like</span>
                          </div>
                          <p className="text-xl font-semibold">{convertTemp(weatherData.main.feels_like)}°{tempUnit}</p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Humidity</span>
                          </div>
                          <p className="text-xl font-semibold">{weatherData.main.humidity}%</p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Wind className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Wind</span>
                          </div>
                          <p className="text-xl font-semibold">
                            {Math.round(weatherData.wind.speed)} km/h
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getWindDirection(weatherData.wind.deg)}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Visibility</span>
                          </div>
                          <p className="text-xl font-semibold">
                            {(weatherData.visibility/1000).toFixed(1)} km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hourly forecast */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-4">Hourly Forecast</h3>
                      <div className="flex overflow-x-auto pb-4 gap-3">
                        {forecastData.hourly.slice(0, 12).map((hour, idx) => (
                          <div 
                            key={idx} 
                            className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg ${
                              idx === 0 
                                ? (theme === 'dark' ? 'bg-blue-900/30 border border-blue-800/30' : 'bg-blue-50 border border-blue-100') 
                                : ''
                            }`}
                          >
                            <span className={`text-sm mb-1 ${idx === 0 ? 'font-semibold' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>
                              {hour.hour}
                            </span>
                            <div className="my-1">
                              {getWeatherIcon(hour.condition, "small")}
                            </div>
                            <span className={`text-sm font-medium ${idx === 0 ? 'font-semibold' : ''}`}>
                              {convertTemp(hour.temp)}°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* UV Index card */}
                    <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="p-6">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-sm font-medium">UV Index</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            getUVIndex().level === 'Low' 
                              ? 'bg-green-100 text-green-600' 
                              : getUVIndex().level === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {getUVIndex().level}
                          </span>
                        </div>
                        <div className="text-3xl font-bold mt-2 mb-3">{getUVIndex().value}</div>
                        <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <div 
                            className={`absolute top-0 left-0 h-full ${
                              getUVIndex().level === 'Low' 
                                ? 'bg-green-500' 
                                : getUVIndex().level === 'Moderate'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(getUVIndex().value / 10) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0</span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>5</span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>10</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Precipitation card */}
                    <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="p-6">
                        <h3 className="text-sm font-medium mb-4">Precipitation</h3>
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            <CloudRain className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                          </div>
                          <div>
                            <p className="text-xl font-bold">{getPrecipitationText(weatherData)}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Chance of precipitation
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {weatherData.weather[0].main === 'Rain' || weatherData.weather[0].main === 'Drizzle' 
                              ? 'Light rain expected throughout the day.'
                              : weatherData.weather[0].main === 'Snow'
                              ? 'Light snow expected in the morning.'
                              : 'No precipitation expected today.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Forecast View */}
              {activeTab === 'forecast' && (
                <div className="space-y-6">
                  {/* 5-Day Forecast */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">5-Day Forecast</h2>
                      <div className="space-y-2">
                        {forecastData.daily.map((day, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              idx === 0 
                                ? (theme === 'dark' ? 'bg-blue-900/30 border border-blue-800/30' : 'bg-blue-50 border border-blue-100') 
                                : (theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-28 font-medium ${idx === 0 ? 'font-semibold' : ''}`}>
                                {day.day}
                                {idx === 0 && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    Today
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getWeatherIcon(day.condition, "small")}
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {day.condition}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-1">
                                <Droplets className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {day.precipitation}%
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <ArrowDown className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                  <span className="font-medium">{convertTemp(day.low)}°</span>
                                </div>
                                <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-1">
                                  <ArrowUp className={`h-4 w-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                  <span className="font-medium">{convertTemp(day.high)}°</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Daily details forecast */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Today's Details</h3>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Sun className={`h-5 w-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`} />
                              <span>UV Index</span>
                            </div>
                            <span className="font-medium">{getUVIndex().value} ({getUVIndex().level})</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Wind className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                              <span>Wind</span>
                            </div>
                            <span className="font-medium">{Math.round(weatherData.wind.speed)} km/h ({getWindDirection(weatherData.wind.deg)})</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Sunrise className={`h-5 w-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`} />
                              <span>Sunrise</span>
                            </div>
                            <span className="font-medium">{formatTime(weatherData.sys.sunrise)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <CloudRain className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                              <span>Precipitation</span>
                            </div>
                            <span className="font-medium">{getPrecipitationText(weatherData)}</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Droplets className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                              <span>Humidity</span>
                            </div>
                            <span className="font-medium">{weatherData.main.humidity}%</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}>
                            <div className="flex items-center gap-2">
                              <Sunset className={`h-5 w-5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                              <span>Sunset</span>
                            </div>
                            <span className="font-medium">{formatTime(weatherData.sys.sunset)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Details View */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Main weather details */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Weather Details</h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Feels Like</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            {convertTemp(weatherData.main.feels_like)}°{tempUnit}
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            How warm or cold it actually feels to the human body
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Humidity</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{weatherData.main.humidity}%</p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Amount of water vapor present in the air
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Wind className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Wind Speed</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            {Math.round(weatherData.wind.speed)} km/h
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Current wind speed with direction {getWindDirection(weatherData.wind.deg)}
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Compass className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Wind Direction</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            {getWindDirection(weatherData.wind.deg)}
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Direction from which the wind originates
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Visibility</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            {(weatherData.visibility/1000).toFixed(1)} km
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Distance at which objects can be clearly seen
                          </p>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart2 className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pressure</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            {weatherData.main.pressure} hPa
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Atmospheric pressure at sea level
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional weather charts */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">Temperature & Humidity Trends</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Temperature chart (mock) */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">24-Hour Temperature</h3>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <div className={`h-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 flex items-end gap-1`}>
                            {forecastData.hourly.slice(0, 24).map((hour, idx) => (
                              <div 
                                key={idx} 
                                className="flex-1 flex flex-col items-center"
                                style={{ height: `${((hour.temp - 10) / 30) * 100}%` }} // Scale for 10-40°C range
                              >
                                <div 
                                  className={`w-full rounded-t-sm ${
                                    hour.temp > 25 
                                      ? 'bg-orange-500' 
                                      : hour.temp > 15 
                                      ? 'bg-yellow-500' 
                                      : 'bg-blue-500'
                                  }`}
                                ></div>
                                <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {idx % 4 === 0 ? hour.hour : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>10°</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>20°</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>30°</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>40°</span>
                          </div>
                        </div>
                        
                        {/* Humidity chart (mock) */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">24-Hour Humidity</h3>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <div className={`h-48 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 flex items-end gap-1`}>
                            {forecastData.hourly.slice(0, 24).map((hour, idx) => {
                              // Mock humidity variations
                              const humidity = weatherData.main.humidity + (Math.random() * 20 - 10);
                              return (
                                <div 
                                  key={idx} 
                                  className="flex-1 flex flex-col items-center"
                                  style={{ height: `${humidity}%` }}
                                >
                                  <div 
                                    className={`w-full rounded-t-sm ${
                                      humidity > 70 
                                        ? 'bg-blue-500' 
                                        : humidity > 40 
                                        ? 'bg-blue-400' 
                                        : 'bg-blue-300'
                                    }`}
                                  ></div>
                                  <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {idx % 4 === 0 ? hour.hour : ''}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>0%</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>50%</span>
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weather alerts */}
                  <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className={`h-6 w-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <h2 className="text-xl font-bold">Weather Alerts</h2>
                      </div>
                      
                      {['Rain', 'Snow', 'Thunderstorm'].includes(weatherData.weather[0].main) ? (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-100'}`}>
                          <div className="flex gap-3">
                            <div>
                              <h3 className="font-medium mb-1">Weather Advisory</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                {weatherData.weather[0].main === 'Rain' 
                                  ? 'Heavy rain expected in your area. Potential for localized flooding.'
                                  : weatherData.weather[0].main === 'Snow'
                                  ? 'Winter weather advisory in effect. Snow accumulation expected.'
                                  : 'Thunderstorm warning. Seek shelter if outdoors.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-100'}`}>
                          <div className="flex gap-3">
                            <Info className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                            <div>
                              <h3 className="font-medium mb-1">No Active Alerts</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                                There are no active weather alerts for your location.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default WeatherDashboard;