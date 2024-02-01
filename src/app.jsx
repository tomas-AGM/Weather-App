import { useState, useEffect } from 'preact/hooks';
import axios from 'axios'
import sunny from './images/sunny.png'
import sunnyCloudy from './images/sunnyCloudy.png'
import cloudy from './images/cloudy.png'
import raining from './images/raining.png'
import arrowDown from './images/arrowDown.png'
import arrowUp from './images/arrowUp.png'
import settings from './images/dotMenu.png'
import pin from './images/pin.png'
import sunrise from './images/sunrise.png'
import './index.css'

export function App() {

  // Define state variables using the useState hook
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [weather, setWeather] = useState({});
  const [forecastData, setForecastData] = useState([]);

  // Defining a helper function to get the day of the week from a UNIX timestamp
  const getDayOfWeek = (timestamp, index) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(timestamp * 1000);
    if (index !== undefined) {
      const dayIndex = (date.getDay() + index) % 7;
      return daysOfWeek[dayIndex];
    }
    return daysOfWeek[date.getDay()];
  };

  // Defining a helper function to get the time of day from a UNIX timestamp  
  const getTimeOfDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Defining a helper function to get the appropriate weather icon for a given weather description
  const getWeatherIcon = (weatherDescription) => {
    switch (weatherDescription) {
      case 'Clear':
        return sunny;
      case 'Clouds':
        return cloudy;
      case 'Rain':
        return raining;
      default:
        return sunnyCloudy;
    }
  };  
  
  let dayOfWeek;
  let sunriseTime;
  let sunsetTime;
  
  // Calculating the day of the week and sunrise/sunset times if the necessary data is available
  if (data && data.sys) {
    dayOfWeek = getDayOfWeek(data.dt);
    sunriseTime = getTimeOfDay(data.sys.sunrise);
    sunsetTime = getTimeOfDay(data.sys.sunset);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=3d067fbedd78696e43db64ebdf7b667b&units=metric`;

  // Defining a function to fetch the current weather data using the OpenWeatherMap API and update the state variables
  const currentWeather = () => {
    axios.get(url).then((response) => {
      setData(response.data);
      if (response.data.weather[0].main === 'Rain'){
        setWeather(raining)
      }else if (response.data.weather[0].main === 'Clouds'){
        setWeather(cloudy)
      }else if (response.data.weather[0].main === 'Clear'){
        setWeather(sunny)
      }else{
        setWeather(sunnyCloudy)
      }
    });
  }

  // Use the useEffect hook to get the user's current location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const apiKey = 'b527bf91ab614ec7b9f13eb6b6978ddc';
          axios
            .get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`)
            .then((response) => {
              const cityName = response.data.results[0].components.city;
              console.log(cityName);
              setLocation(cityName);
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.log('User denied permission to access location');
          }
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser');
    }
  }, []);

  // Use the useEffect hook to update the current weather data whenever the location changes
  useEffect(() => {
    currentWeather();
  }, [location]);

  // Construct the URL for the OpenWeatherMap API based on the current location that is stored in a variable.
  useEffect(() => {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=3d067fbedd78696e43db64ebdf7b667b&units=metric`;
  
    axios.get(forecastUrl).then((response) => {
      setForecastData(response.data.list);
      console.log(location);
    });
  }, [location]);

  // Handle user input for searching a location
  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      setLocation(event.target.value);
      setShowInput(false);
    }
  };

  // Handle scrolling down on the page
  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Handle scrolling up on the page
  const handleScrollUp = () => {
    window.scrollBy({
      top: -window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Toggle the visibility of the location search input box
  const toggleInput = () => {
    setShowInput(!showInput);
  };

    // Get the wind direction from the API response, defaulting to 0 if not present
  const windDirection = data.wind?.deg ?? 0;

  // Set the transform property of the arrow to the angle of the wind direction
  const arrow = document.querySelector('.arrow');
  if (arrow !== null) {
    arrow.style.transform = `rotate(${180 + windDirection}deg)`;
  }

  return(
    <>
      <div className="app">
        <div className="search">
          {showInput && (
            <div className="input-box">
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyDown={searchLocation}
                placeholder="Enter your location"
                type="text"
              />            
            </div>
          )}        
        </div>
        <div className="container">
          <div className="today">
            <div className="day">
              <h1>{dayOfWeek}</h1>
            </div>
            <div className="dotMenu">
              <img src={settings} alt="menu" onClick={toggleInput}/>
            </div>
            <div className="weather">
              <img src={weather} alt="weather" />
            </div>
            <div className="description">
              {data.weather ? <p>{data.weather[0].main}</p> : null}
            </div>
            <div className="location">
              <p>{data.name} <img src={pin} alt="locationIcon" /></p>
            </div>
            <div className="wind">
              <div className="circle">
                <span className="speed">{Math.round(data.wind?.speed ?? 0)}</span>
              </div>
                <div className="arrow"></div>
            </div>
            <div className="sunriseSunset">
              <img src = {sunrise}/>
              <p>sunrise : {sunriseTime}</p>
              <p>sunset : {sunsetTime}</p>
            </div>
            <div className="temp">
              {data.main ? <p>{Math.round(data.main.temp)}°C</p> : null}
            </div>
          </div>
          <div className="forecast">
            {forecastData.slice(2, 7).map((data, index) => (
              <div className="forecast-item" key={index}>
                <h2 className="day">{getDayOfWeek(data.dt, index)}</h2>
                <img src={getWeatherIcon(data.weather[0].main)} alt="weather icon" />
                <div className="temperature">
                  {Math.round(data.main.temp)}&deg;C
                </div>
              </div>
            ))}
          </div>
          <div className="scrollDown">
              <img src={arrowDown} alt="scroll down" onClick={handleScrollDown}  />
          </div>
          <div className="scrollUp">
              <img src={arrowUp} alt="scroll up" onClick={handleScrollUp}  />
          </div>
          <div className="separator"></div>
        </div>
      </div>
    </>
  );
}