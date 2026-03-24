const API_KEY = "abd7816fa314d421f62a10469903329d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");

// Popup
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");

    popupMessage.textContent = message;
    popup.classList.remove("hidden");

    setTimeout(() => {
        popup.classList.add("hidden");
    }, 3000);
}

// Fetch weather
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

// Display weather
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

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    document.getElementById("sunrise").textContent =
        sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.getElementById("sunset").textContent =
        sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Date & time
function updateDateTime() {
    const now = new Date();

    const formatted =
        now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }) + " • " +
        now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

    document.getElementById("date-time").textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Footer time
function updateFooterTime() {
    document.getElementById("footer-time").textContent =
        "Local Time: " + new Date().toLocaleTimeString();
}

setInterval(updateFooterTime, 1000);
updateFooterTime();

// Search
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

// Other cities
const cities = ["Nairobi", "London", "Tokyo", "Dubai", "Paris"];

async function loadOtherCities() {
    const container = document.getElementById("other-cities");

    for (let city of cities) {
        const res = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();

        container.innerHTML += `
            <div class="city-card" onclick="getWeather('${city}')">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png">
                <span>${data.name}</span>
                <span>${Math.round(data.main.temp)}°C</span>
            </div>
        `;
    }
}

loadOtherCities();