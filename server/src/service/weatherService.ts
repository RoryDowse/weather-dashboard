import dotenv from 'dotenv';
dotenv.config();

const baseURL: string = process.env.API_BASE_URL || '';
const apiKey: string = process.env.API_KEY || '';
const name: string = " ";

interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  humidity: number;
  windSpeed: number;
}

class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  humidity: number;
  windSpeed: number;

  constructor(weatherData: WeatherData) {
    this.city = weatherData.city;
    this.date = weatherData.date;
    this.icon = weatherData.icon;
    this.iconDescription = weatherData.iconDescription;
    this.tempF = weatherData.tempF;
    this.humidity = weatherData.humidity;
    this.windSpeed = weatherData.windSpeed;
  }
}

interface WeatherApiResponse {
  city: {
    name: string;
  };
  list: Array<{
    dt: number;
    dt_txt: string;
    weather: Array<{
      icon: string;
      description: string;
    }>;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
  }>;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  name: string;

  constructor(baseURL: string, apiKey: string, name: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.name = name;
  }

  private async fetchLocationData(query: string): Promise<Coordinates> {
    console.log('Query:', query);
    const response = await fetch(query);
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('No location found');
    }

    const locationData = data[0];
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  private buildGeocodeQuery(): string {
    console.log('baseURL:', this.baseURL);
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.name}&limit=1&appid=${this.apiKey}`;
    console.log('Geocode query:', query);
    return query;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    console.log('coordinates:', coordinates);
    const { lat, lon } = coordinates;
    return `lat=${lat}&lon=${lon}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    console.log('this.name:', this.name);
    if (!this.name) {
      throw new Error("City name is undefined");
    }
    const geocodeQuery = this.buildGeocodeQuery();
    return this.fetchLocationData(geocodeQuery);
  }

  async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse> {
    const query = this.buildWeatherQuery(coordinates);
    const response = await fetch(`${this.baseURL}/data/2.5/forecast?${query}&appid=${this.apiKey}`);
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error(`Weather data fetch failed: ${response.statusText}`);
    }
    return response.json();
  }

  private parseCurrentWeather(response: WeatherApiResponse): WeatherData {
    console.log('city:', response.city.name);
    return {
      city: response.city.name,
      date: new Date(response.list[0].dt * 1000).toLocaleString(),
      icon: response.list[0].weather[0].icon,
      iconDescription: response.list[0].weather[0].description,
      tempF: response.list[0].main.temp,
      humidity: response.list[0].main.humidity,
      windSpeed: response.list[0].wind.speed
    };
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    console.log('currentWeather:', currentWeather);
    const forecastArray = weatherData.map((entry) => {
      return new Weather({
        city: currentWeather.city, // Use the city value from the currentWeather object
        date: entry.dt_txt,
        icon: entry.weather[0].icon,
        iconDescription: entry.weather[0].description,
        tempF: entry.main.temp,
        humidity: entry.main.humidity,
        windSpeed: entry.wind.speed,
      });
    });
    console.log('Forecast Array:', forecastArray);
    return forecastArray;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.name = city;

    try {
      console.log('Fetching weather for city:', city);
      const coordinates = await this.fetchAndDestructureLocationData();
      console.log('Coordinates fetched:', coordinates);
      
      const weatherData = await this.fetchWeatherData(coordinates);
      console.log('Weather data fetched:', weatherData);

      const currentWeather = this.parseCurrentWeather(weatherData);
      console.log('Current weather parsed:', currentWeather);

      const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
      console.log('Forecast array built:', forecastArray);

      return [new Weather(currentWeather), ...forecastArray];
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

export default new WeatherService(baseURL, apiKey, name);
