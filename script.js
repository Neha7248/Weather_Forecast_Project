document.addEventListener('DOMContentLoaded', () => {
    // Clear recent searches from local storage on page load
    localStorage.removeItem('recentSearches');

    const searchBtn = document.getElementById('searchBtn');
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const cityInput = document.getElementById('cityInput');
    const recentSearches = document.getElementById('recentSearches');
    const weatherBody = document.querySelector('.weather-body');
    const locationNotFound = document.querySelector('.location-not-found');
    const recentSearchesContainer = document.querySelector('.recent-searches');
    const fiveHourForecast = document.querySelector('.five-hour-forecast');
    const forecastGrid = document.querySelector('.forecast-grid');

    const apiKey = '4383e323cb5c2829da3c5d66d652a62c';

    const saveRecentSearch = (city) => {
        let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        if (!searches.includes(city)) {
            searches.push(city);
            if (searches.length > 5) searches.shift(); // Keep only the last 5 searches
            localStorage.setItem('recentSearches', JSON.stringify(searches));
        }
        populateRecentSearches();
    };

    const populateRecentSearches = () => {
        let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        if (searches.length > 0) {
            recentSearchesContainer.classList.remove('hidden');
            recentSearches.innerHTML = searches.map(city => `<option value="${city}">${city}</option>`).join('');
        } else {
            recentSearchesContainer.classList.add('hidden');
        }
    };

    const fetchWeather = (url) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === '404') {
                    weatherBody.classList.add('hidden');
                    locationNotFound.classList.remove('hidden');
                } else {
                    displayWeather(data);
                    saveRecentSearch(data.name);
                    fetchFiveHourForecast(data.coord.lat, data.coord.lon);
                }
            })
            .catch(error => handleError(error));
    };

    const fetchWeatherByCity = (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        fetchWeather(url);
    };

    const fetchWeatherByLocation = (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetchWeather(url);
    };

    const fetchFiveHourForecast = (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetch(url)
            .then(response => response.json())
            .then(data => displayFiveHourForecast(data))
            .catch(error => handleError(error));
    };

    const displayWeather = (data) => {
        weatherBody.querySelector('.temp').innerHTML = `${data.main.temp} <sup>°C</sup>`;
        weatherBody.querySelector('.description').textContent = data.weather[0].description;
        weatherBody.querySelector('#humidity').textContent = `${data.main.humidity}%`;
        weatherBody.querySelector('#wind-speed').textContent = `${data.wind.speed} m/s`;
        weatherBody.classList.remove('hidden');
        locationNotFound.classList.add('hidden');
    };

    const displayFiveHourForecast = (data) => {
        const hours = data.list.slice(0, 5); // Get the next 5 hours
        forecastGrid.innerHTML = hours.map(hour => {
            const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = hour.main.temp;
            const description = hour.weather[0].description;
            const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;

            return `
                <div class="forecast-hour p-4 bg-white bg-opacity-10 rounded-lg shadow-lg">
                    <p class="time font-bold">${time}</p>
                    <img src="${icon}" alt="${description}" class="forecast-img mx-auto mb-2 w-1/2">
                    <p class="temp text-xl font-bold">${temp} <sup>°C</sup></p>
                    <p class="description">${description}</p>
                </div>
            `;
        }).join('');
        fiveHourForecast.classList.remove('hidden');
    };

    const handleError = (error) => {
        console.error('Error fetching weather data:', error);
    };

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value;
        if (city) {
            fetchWeatherByCity(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    recentSearches.addEventListener('change', (event) => {
        const city = event.target.value;
        if (city) {
            fetchWeatherByCity(city);
        }
    });

    populateRecentSearches();
});
