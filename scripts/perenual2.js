import axios from 'axios';

export const fetchPlantInfoByID = async (speciesId) => {
  const apiKey = 'sk-YxpI671ae294179607417'; // Your API key
  const url = `https://perenual.com/api/species/details/${speciesId}?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data; // Return the full response data
  } catch (error) {
    console.error("Error fetching data from Perenual API:", error);
    throw error; // Re-throw error for handling in caller function
  }
};

