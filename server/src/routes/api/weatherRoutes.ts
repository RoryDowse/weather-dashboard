import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import historyService from '../../service/historyService.js';

// import WeatherService from '../../service/weatherService.js';
import weatherService from '../../service/weatherService.js';


// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }
  // TODO: GET weather data from city name
  try {
    const data = await weatherService.getWeatherForCity(cityName);
   
  
  
  // TODO: save city to search history
  const savedCity = await historyService.addCity(cityName);

  return res.status(200).json({ data, savedCity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }

});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const searchHistory = await historyService.getCities();
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
