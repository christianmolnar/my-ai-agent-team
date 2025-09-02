import axios from 'axios';

// Google Custom Search API Integration
export async function queryGoogleNews(query: string, apiKey: string, cx: string) {
  const url = `https://www.googleapis.com/customsearch/v1`;
  try {
    const response = await axios.get(url, {
      params: {
        q: query,
        key: apiKey,
        cx: cx,
      },
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error querying Google News:', error);
    return [];
  }
}

// Wikipedia API Integration
export async function queryWikipedia(query: string) {
  const url = `https://en.wikipedia.org/w/api.php`;
  try {
    const response = await axios.get(url, {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
      },
    });
    return response.data.query.search || [];
  } catch (error) {
    console.error('Error querying Wikipedia:', error);
    return [];
  }
}

// Example Usage
(async () => {
  const googleApiKey = 'YOUR_GOOGLE_API_KEY';
  const googleCx = 'YOUR_CUSTOM_SEARCH_ENGINE_ID';
  const query = 'Chris Inglis CIA Director';

  const googleResults = await queryGoogleNews(query, googleApiKey, googleCx);
  console.log('Google News Results:', googleResults);

  const wikipediaResults = await queryWikipedia(query);
  console.log('Wikipedia Results:', wikipediaResults);
})();
