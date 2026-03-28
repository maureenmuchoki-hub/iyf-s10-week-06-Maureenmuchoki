const API_KEY = "abd7816fa314d421f62a10469903329d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");

// POPUP
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");

    popupMessage.textContent = message;
    popup.classList.remove("hidden");

    setTimeout(() => {
        popup.classList.add("hidden");
    }, 3000);
}

// FETCH CURRENT WEATHER
async function getWeather(city) {
    try {
        const res = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        const data = await res.json();
        displayWeather(data);

    } catch (err) {
        showPopup(err.message.includes("not found")
            ? "❌ City not found. Try again."
            : "⚠️ Something went wrong.");
    }
}

// FETCH FORECAST
async function getForecast(city) {
    try {
        const res = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);

        if (!res.ok) {
            throw new Error("Forecast not available");
        }

        const data = await res.json();
        displayForecast(data);

    } catch (err) {
        showPopup("⚠️ Could not load forecast");
    }
}

// DISPLAY WEATHER
function displayWeather(data) {

    document.getElementById("city-name").textContent =
        `${data.name}, ${data.sys.country}`;

    document.getElementById("temperature").textContent =
        `${Math.round(data.main.temp)}°C`;

    document.getElementById("description").textContent =
        data.weather[0].description;

    document.getElementById("wind").textContent =
        data.wind.speed + " m/s";

    document.getElementById("humidity").textContent =
        data.main.humidity + "%";

    document.getElementById("feels-like").textContent =
        Math.round(data.main.feels_like) + "°C";

    document.getElementById("pressure").textContent =
        data.main.pressure + " hPa";

    document.getElementById("weather-icon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // CITY TIME
    function updateCityTime() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityTime = new Date(utc + (data.timezone * 1000));

        document.getElementById("date-time").textContent =
            cityTime.toLocaleString("en-US", {
                weekday: "long",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
    }

    if (window.cityTimeInterval) clearInterval(window.cityTimeInterval);
    updateCityTime();
    window.cityTimeInterval = setInterval(updateCityTime, 1000);

    // SUNRISE / SUNSET
    function formatTime(timestamp, timezone) {
        return new Date((timestamp + timezone) * 1000).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC"
        });
    }

    document.getElementById("sunrise").textContent =
        formatTime(data.sys.sunrise, data.timezone);

    document.getElementById("sunset").textContent =
        formatTime(data.sys.sunset, data.timezone);
}

// DISPLAY FORECAST
function displayForecast(data) {
    const container = document.getElementById("forecast");
    container.innerHTML = "";

    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.forEach(day => {
        const date = new Date(day.dt_txt);

        container.innerHTML += `
            <div class="forecast-card">
                <p>${date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p>${Math.round(day.main.temp)}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    });
}

// FOOTER TIME
function updateFooterTime() {
    document.getElementById("footer-time").textContent =
        "Your Time: " + new Date().toLocaleTimeString("en-US");
}

setInterval(updateFooterTime, 1000);
updateFooterTime();

// SEARCH
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
        getForecast(city);
    }
});

// OTHER CITIES
const cities = ["Nairobi", "London", "Tokyo", "Dubai", "Paris"];

async function loadOtherCities() {
    const container = document.getElementById("other-cities");

    for (let city of cities) {
        const res = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();

        container.innerHTML += `
            <div class="city-card" onclick="searchCity('${city}')">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png">
                <span>${data.name}</span>
                <span>${Math.round(data.main.temp)}°C</span>
            </div>
        `;
    }
}

function searchCity(city) {
    getWeather(city);
    getForecast(city);
}

loadOtherCities();