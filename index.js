const cityInput= document.querySelector(".search-input");
const searchButton= document.querySelector(".search-button");

const weatherContainer=document.querySelector(".weather-container");
const searchCitySection=document.querySelector(".search-city");
const notFoundSection=document.querySelector(".error-message");

const locationElement=document.querySelector(".location-text");
const dateElement=document.querySelector(".date-text");
const weatherTempElement=document.querySelector(".main-temp");
const weatherDescElement=document.querySelector(".main-weather-desc");
const weatherAirElement=document.querySelector(".air-value-txt");
const weatherHumElement=document.querySelector(".humidity-value-txt");
const weatherSummaryImg=document.querySelector(".weather-icon-img");

const API_KEY="74dcc4c2667120c8e4f27d2b7482d232";

// Weather icon mapping
const weatherIcons = {
    200: "thunderstorm",  // thunderstorm with light rain
    300: "drizzle",      // drizzle
    500: "rain",         // rain
    600: "snow",         // snow
    700: "mist",         // mist
    800: "clear",        // clear sky
    801: "clouds",       // few clouds
    802: "clouds",       // scattered clouds
    803: "clouds",       // broken clouds
    804: "clouds"        // overcast clouds
};

searchButton.addEventListener("click",()=>{
    if(cityInput.value.trim() != ''){
        updateweatherinfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown",(event)=>{
    if(event.key === "Enter" && cityInput.value.trim() != ''){
        updateweatherinfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id) {
    if(id<=232) return 'thunderstorm';
    if(id<=321) return 'drizzle';
    if(id<=531) return 'rain';
    if(id<=622) return 'snow';
    if(id<=781) return 'mist';
    if(id===800) return 'clear';
    if(id<=804) return 'clouds';
}

function getCurrentDate() {
    const date = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options).toUpperCase();
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    return `${day} ${month}`;
}

async function updateForecastsInfo(city) {
    try {
        const forecastData = await getFetchData("forecast", city);
        if (forecastData.cod !== "200") return;

        // Get all forecast item containers
        const forecastItems = document.querySelectorAll('.forecast-items');
        
        // Filter the forecast data to get one reading per day at noon
        const dailyForecasts = forecastData.list
            .filter(item => item.dt_txt.includes('12:00:00'))
            .slice(0, 5); // Get next 5 days

        // Update each forecast item
        dailyForecasts.forEach((forecast, index) => {
            if (forecastItems[index]) {
                const dateElement = forecastItems[index].querySelector('.forecast-item-date');
                const tempElement = forecastItems[index].querySelector('.forecast-item-temp');
                const imgElement = forecastItems[index].querySelector('.forecast-item-img');

                const { dt, main: { temp }, weather: [{ id }] } = forecast;

                dateElement.textContent = formatDate(dt);
                tempElement.textContent = `${Math.round(temp)}°C`;
                imgElement.src = `assets/weather/${getWeatherIcon(id)}.svg`;
            }
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

async function updateweatherinfo(city) {
    try {
        const weatherData = await getFetchData("weather", city);
        if(weatherData.cod !== 200) {
            showDisplaySection(notFoundSection);
            return;
        }

        const {
            name: cityName,
            main: { temp, humidity },
            weather: [{ id, description }],
            wind: { speed }
        } = weatherData;

        // Update location and date
        locationElement.textContent = cityName;
        dateElement.textContent = getCurrentDate();

        // Update temperature and description
        weatherTempElement.textContent = `${Math.round(temp)}°C`;
        weatherDescElement.textContent = description.charAt(0).toUpperCase() + description.slice(1);

        // Update wind and humidity
        weatherAirElement.textContent = `${Math.round(speed)} m/s`;
        weatherHumElement.textContent = `${Math.round(humidity)}%`;

        // Update weather icon
        const iconName = getWeatherIcon(id);
        weatherSummaryImg.src = `assets/weather/${iconName}.svg`;

        // Update forecast information
        await updateForecastsInfo(city);
        
        showDisplaySection(weatherContainer);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showDisplaySection(notFoundSection);
    }
}

function showDisplaySection(section) {
    [weatherContainer, searchCitySection, notFoundSection]
    .forEach(element => element.style.display = "none");

    section.style.display = "flex";
}

// Show search city section on initial load
showDisplaySection(searchCitySection);