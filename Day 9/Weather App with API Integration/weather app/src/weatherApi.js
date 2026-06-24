const WEATHER_API_KEY = '1ed93036f9924a7e804140834261701';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

export const formatDate = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatTime = (value) => value || '—';

export const formatAQI = (value) => {
  if (value === undefined || value === null) return 'N/A';
  if (value <= 50) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 150) return 'Unhealthy for sensitive groups';
  if (value <= 200) return 'Unhealthy';
  if (value <= 300) return 'Very unhealthy';
  return 'Hazardous';
};

export const getMapUrl = (location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

export const getMapEmbedUrl = (latitude, longitude) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.05}%2C${longitude + 0.05}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`;

export const getWeatherTheme = (condition = '') => {
  const text = condition.toLowerCase();
  if (/thunder|storm/.test(text)) return 'stormy';
  if (/snow|blizzard|sleet|ice/.test(text)) return 'snowy';
  if (/rain|drizzle|showers|mist/.test(text)) return 'rainy';
  if (/cloud|overcast|haze|fog/.test(text)) return 'cloudy';
  if (/sun|clear|fair/.test(text)) return 'sunny';
  return 'misty';
};

export const fetchForecast = async (location) => {
  const response = await fetch(
    `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=7&aqi=yes&alerts=yes`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Unable to fetch weather data right now.');
  }

  return data;
};

export const fetchSuggestions = async (query) => {
  const response = await fetch(
    `${WEATHER_API_BASE}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`
  );

  return response.json();
};

export const fetchLocationWeather = async (latitude, longitude) => {
  const response = await fetch(
    `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7&aqi=yes&alerts=yes`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Unable to fetch your current location weather.');
  }

  return data;
};

export { WEATHER_API_KEY, WEATHER_API_BASE };
