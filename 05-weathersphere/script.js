/*
    WeatherSphere Configuration
    -----------------------------------------------------------
    1. Create a free account at https://www.weatherapi.com/
    2. Copy your API key.
    3. Paste it below.
*/

const WEATHER_API_KEY = "41e937df34cd43038d191438260709";
const API_BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const retryBtn = document.getElementById("retryBtn");

const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const errorState = document.getElementById("errorState");
const errorText = document.getElementById("errorText");
const statusMessage = document.getElementById("statusMessage");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");
const hourlyPrev = document.getElementById("hourlyPrev");
const hourlyNext = document.getElementById("hourlyNext");

function setLoading(isLoading) {
    loading.classList.toggle("hidden", !isLoading);

    if (isLoading) {
        weatherContent.classList.add("hidden");
        errorState.classList.add("hidden");
    }
}

function showError(message) {
    loading.classList.add("hidden");
    weatherContent.classList.add("hidden");
    errorState.classList.remove("hidden");
    errorText.textContent = message;
}

function showStatus(message = "") {
    statusMessage.textContent = message;
}

function validateApiKey() {
    return WEATHER_API_KEY && !WEATHER_API_KEY.includes("PASTE_YOUR");
}

async function getWeather(query) {
    if (!validateApiKey()) {
        showError(
            "Add your WeatherAPI key in script.js before running the application."
        );
        return;
    }

    setLoading(true);
    showStatus("");

    try {
        const url =
            `${API_BASE_URL}?key=${encodeURIComponent(WEATHER_API_KEY)}` +
            `&q=${encodeURIComponent(query)}` +
            "&days=7&aqi=no&alerts=no";

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data?.error?.message || "Unable to fetch weather data.");
        }

        updateWeatherUI(data);

        loading.classList.add("hidden");
        weatherContent.classList.remove("hidden");
        errorState.classList.add("hidden");

        cityInput.value = "";
    } catch (error) {
        console.error(error);
        showError(error.message || "Something went wrong while loading weather data.");
    }
}

function updateWeatherUI(data) {
    const { location, current, forecast } = data;
    const today = forecast.forecastday[0];

    document.getElementById("locationName").textContent =
        `${location.name}, ${location.country}`;

    document.getElementById("localTime").textContent =
        `Local time · ${formatLocalDateTime(location.localtime)}`;

    document.getElementById("temperature").textContent =
        Math.round(current.temp_c);

    document.getElementById("conditionText").textContent =
        current.condition.text;

    document.getElementById("conditionBadge").textContent =
        current.is_day ? "DAYTIME" : "NIGHT";

    document.getElementById("feelsLike").textContent =
        `Feels like ${Math.round(current.feelslike_c)}°C`;

    document.getElementById("humidity").textContent = `${current.humidity}%`;
    document.getElementById("windSpeed").textContent =
        `${Math.round(current.wind_kph)} km/h`;
    document.getElementById("visibility").textContent =
        `${current.vis_km} km`;
    document.getElementById("pressure").textContent =
        `${current.pressure_mb} mb`;

    document.getElementById("sunrise").textContent = today.astro.sunrise;
    document.getElementById("sunset").textContent = today.astro.sunset;

    document.getElementById("todayRange").textContent =
        `${Math.round(today.day.mintemp_c)}° / ${Math.round(today.day.maxtemp_c)}°`;

    document.getElementById("uvIndex").textContent =
        current.uv;

    document.getElementById("rainChance").textContent =
        `${today.day.daily_chance_of_rain}%`;

    updateRangeFill(today.day.mintemp_c, today.day.maxtemp_c, current.temp_c);
    updateWeatherImage(current.condition.text);
    updateTheme(current.condition.text, current.is_day);
    renderHourlyForecast(forecast.forecastday, location.localtime_epoch);
    renderDailyForecast(forecast.forecastday);

    showStatus(
        `Updated weather for ${location.name} · Last updated ${formatTime(current.last_updated)}`
    );
}

function updateRangeFill(min, max, current) {
    const range = Math.max(max - min, 1);
    const position = Math.min(
        Math.max(((current - min) / range) * 100, 18),
        92
    );

    document.getElementById("rangeFill").style.width = `${position}%`;
}

function updateWeatherImage(condition) {
    const image = document.getElementById("weatherImage");
    const normalized = condition.toLowerCase();

    let file = "cloud.png";

    if (
        normalized.includes("rain") ||
        normalized.includes("drizzle") ||
        normalized.includes("shower")
    ) {
        file = "rain.png";
    } else if (
        normalized.includes("snow") ||
        normalized.includes("blizzard") ||
        normalized.includes("ice")
    ) {
        file = "snow.png";
    } else if (
        normalized.includes("mist") ||
        normalized.includes("fog") ||
        normalized.includes("haze")
    ) {
        file = "mist.png";
    } else if (
        normalized.includes("cloud") ||
        normalized.includes("overcast")
    ) {
        file = "cloud.png";
    } else if (
        normalized.includes("sun") ||
        normalized.includes("clear")
    ) {
        file = "clear.png";
    }

    image.src = `assets/${file}`;
    image.alt = condition;
}

function updateTheme(condition, isDay) {
    const normalized = condition.toLowerCase();

    document.body.className = "";

    if (!isDay) {
        document.body.classList.add("weather-night");
        return;
    }

    if (
        normalized.includes("rain") ||
        normalized.includes("drizzle") ||
        normalized.includes("shower") ||
        normalized.includes("thunder")
    ) {
        document.body.classList.add("weather-rain");
    } else if (
        normalized.includes("snow") ||
        normalized.includes("blizzard") ||
        normalized.includes("ice")
    ) {
        document.body.classList.add("weather-snow");
    } else if (
        normalized.includes("mist") ||
        normalized.includes("fog") ||
        normalized.includes("haze")
    ) {
        document.body.classList.add("weather-mist");
    } else if (
        normalized.includes("cloud") ||
        normalized.includes("overcast")
    ) {
        document.body.classList.add("weather-clouds");
    } else {
        document.body.classList.add("weather-clear");
    }
}

function renderHourlyForecast(forecastDays, localEpoch) {
    const nowEpoch = localEpoch;
    const allHours = forecastDays.flatMap((day) => day.hour);

    const upcomingHours = allHours
        .filter((hour) => hour.time_epoch >= nowEpoch - 1800)
        .slice(0, 24);

    hourlyForecast.innerHTML = upcomingHours.map((hour, index) => `
        <article class="hour-card ${index === 0 ? "current-hour" : ""}">
            <span class="time">${index === 0 ? "Now" : formatHour(hour.time)}</span>
            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
            <strong>${Math.round(hour.temp_c)}°</strong>
            <small>${hour.chance_of_rain}% rain</small>
        </article>
    `).join("");
}

function renderDailyForecast(days) {
    dailyForecast.innerHTML = days.map((day, index) => `
        <article class="day-card ${index === 0 ? "today" : ""}">
            <p class="day">${index === 0 ? "Today" : formatDay(day.date)}</p>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p class="condition">${day.day.condition.text}</p>
            <p class="temps">
                ${Math.round(day.day.maxtemp_c)}°
                <span>${Math.round(day.day.mintemp_c)}°</span>
            </p>
        </article>
    `).join("");
}

function formatLocalDateTime(dateTime) {
    const date = new Date(dateTime.replace(" ", "T"));

    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

function formatTime(dateTime) {
    const date = new Date(dateTime.replace(" ", "T"));

    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

function formatHour(dateTime) {
    const date = new Date(dateTime.replace(" ", "T"));

    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        hour12: true
    }).format(date);
}

function formatDay(dateString) {
    const date = new Date(`${dateString}T12:00:00`);

    return new Intl.DateTimeFormat(undefined, {
        weekday: "short"
    }).format(date);
}

function useCurrentLocation() {
    if (!navigator.geolocation) {
        showError("Your browser does not support geolocation.");
        return;
    }

    setLoading(true);
    showStatus("Requesting your current location...");

    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            getWeather(`${coords.latitude},${coords.longitude}`);
        },
        (error) => {
            console.error(error);

            const messages = {
                1: "Location permission was denied. Search for a city or allow location access.",
                2: "Your current location could not be determined.",
                3: "Location request timed out. Please try again."
            };

            showError(messages[error.code] || "Unable to access your current location.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (!city) {
        showStatus("Please enter a city name first.");
        cityInput.focus();
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

locationBtn.addEventListener("click", useCurrentLocation);
retryBtn.addEventListener("click", useCurrentLocation);

hourlyPrev.addEventListener("click", () => {
    hourlyForecast.scrollBy({ left: -420, behavior: "smooth" });
});

hourlyNext.addEventListener("click", () => {
    hourlyForecast.scrollBy({ left: 420, behavior: "smooth" });
});

// Automatically request the user's weather when the app opens.
window.addEventListener("DOMContentLoaded", useCurrentLocation);
