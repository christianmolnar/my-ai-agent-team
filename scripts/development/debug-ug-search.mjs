#!/usr/bin/env node

import axios from 'axios';
import * as cheerio from 'cheerio';

async function debugUltimateGuitarSearch() {
  try {
    const searchUrl = 'https://www.ultimate-guitar.com/search.php?search_type=title&value=wonderwall';
    
    console.log('Fetching:', searchUrl);
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Status:', response.status);
    console.log('Content-Length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    
    // Look for script tags
    const scripts = $('script').toArray();
    console.log('Found scripts:', scripts.length);
    
    let found = false;
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = $(scripts[i]).html();
      if (scriptContent && (scriptContent.includes('store.page') || scriptContent.includes('_UGAPP'))) {
        console.log(`Script ${i} contains store data:`, scriptContent.substring(0, 200) + '...');
        found = true;
        
        // Try to extract JSON
        const jsonMatches = [
          /window\._UGAPP\.store\.page = ({.*?});/s,
          /_UGAPP\.store = ({.*?});/s,
          /store\.page = ({.*?});/s
        ];
        
        for (const regex of jsonMatches) {
          const match = scriptContent.match(regex);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              console.log('Parsed data keys:', Object.keys(data));
              if (data.data) {
                console.log('data.data keys:', Object.keys(data.data));
                if (data.data.results) {
                  console.log('Found results:', data.data.results.length);
                  console.log('First result:', JSON.stringify(data.data.results[0], null, 2));
                }
              }
            } catch (e) {
              console.log('JSON parse error:', e.message);
            }
          }
        }
        break;
      }
    }
    
    if (!found) {
      console.log('No store data found. Checking for other patterns...');
      // Look for any JSON-like data
      for (let i = 0; i < Math.min(scripts.length, 5); i++) {
        const scriptContent = $(scripts[i]).html();
        if (scriptContent && scriptContent.length > 100) {
          console.log(`Script ${i} preview:`, scriptContent.substring(0, 300));
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugUltimateGuitarSearch();
