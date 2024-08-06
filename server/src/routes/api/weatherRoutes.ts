import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import HistoryService from '../../service/historyService.js';
const historyService = new HistoryService();
// import WeatherService from '../../service/weatherService.js';
import WeatherService from '../../service/weatherService.js';
const weatherService = new WeatherService();

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }
  // TODO: GET weather data from city name
  try {
    const locationData = await weatherService.fetchLocationData(city);
    const weatherData = await weatherService.fetchWeatherData(locationData);
    const currentWeather = weatherService.parseCurrentWeather(weatherData);
    const forecastArray = weatherService.buildForecastArray(currentWeather, weatherData.list);
   
  
  
  // TODO: save city to search history
  const savedCity = await historyService.saveCity(city);

  return res.status(200).json({ currentWeather, forecastArray, savedCity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }

});

// TODO: GET search history
router.get('/history', async (req, res) => {
  try {
    const searchHistory = await historyService.getSearchHistory();
    res.status(200).json({ searchHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCity = await historyService.deleteCity(id);
    res.status(200).json({ deletedCity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
