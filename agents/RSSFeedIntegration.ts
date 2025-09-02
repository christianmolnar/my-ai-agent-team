/**
 * RSSFeedIntegration.ts
 * 
 * This module provides functionality to fetch, filter, and analyze RSS feed content
 * for fact checking purposes. It includes tools for semantic analysis, entity extraction,
 * and decision-making based on article content.
 */

import Parser from 'rss-parser';
import natural from 'natural';
import axios from 'axios'; // Import axios for fetching URL content
import { OpenAI } from 'openai';

// Initialize the RSS parser for fetching and parsing feed content
const parser = new Parser();

// Initialize Natural Language Processing tools from the natural library
// These tools are used for text analysis, tokenization, and semantic similarity
const tokenizer = new natural.WordTokenizer();    // Splits text into individual words
const TfIdf = natural.TfIdf;                      // Term Frequency-Inverse Document Frequency for semantic analysis
const PorterStemmer = natural.PorterStemmer;      // Reduces words to their root form

/**
 * Simple in-memory caching system for RSS feeds to reduce redundant API calls
 * Each cache entry contains a timestamp and the fetched RSS data
 */
type CacheEntry = {
  timestamp: number;   // When the data was cached
  data: Parser.Item[]; // The actual RSS feed items
};

// Global cache object storing feed data by URL
const RSS_CACHE: Record<string, CacheEntry> = {};
const CACHE_DURATION = 10 * 60 * 1000; // Cache validity period: 10 minutes in milliseconds

/**
 * Creates a simple text similarity function that serves as a fallback
 * when the more complex natural library methods encounter issues
 * 
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns A similarity score between 0 and 1 (higher means more similar)
 */
function simpleSimilarity(str1: string, str2: string): number {
  // Normalize strings to lowercase for case-insensitive comparison
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  
  // Split into words and filter out short words (less than 4 characters)
  const words1 = str1.split(/\s+/).filter(w => w.length > 3);
  const words2 = str2.split(/\s+/).filter(w => w.length > 3);
  
  // Count words that appear in both strings (including partial matches)
  let commonWords = 0;
  words1.forEach(w1 => {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      commonWords++;
    }
  });
  
  // Calculate similarity as ratio of common words to total words
  // Returns 0 if either string has no words to avoid division by zero
  if (words1.length === 0 || words2.length === 0) return 0;
  return commonWords / Math.max(words1.length, words2.length);
}

/**
 * Creates an advanced semantic similarity function using TF-IDF (Term Frequency-Inverse Document Frequency)
 * This provides more sophisticated text comparison than simple word matching
 * 
 * @param text1 - First text to compare
 * @param text2 - Second text to compare
 * @returns A similarity score between 0 and 1 based on cosine similarity of TF-IDF vectors
 */
function calculateSemanticSimilarity(text1: string, text2: string): number {
  try {
    // Helper function to clean and normalize text for better comparison
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
        .replace(/\s+/g, ' ')      // Remove extra spaces
        .trim();
    };
    
    const normalizedText1 = normalizeText(text1);
    const normalizedText2 = normalizeText(text2);
    
    // Helper function to tokenize text into words and apply stemming
    // Stemming reduces words to their root form (e.g., "running" -> "run")
    const tokenizeAndStem = (text: string) => {
      const tokens = tokenizer.tokenize(text) || [];
      return tokens
        .filter(token => token.length > 2)  // Remove very short words
        .map(token => PorterStemmer.stem(token));
    };
    
    const tokens1 = tokenizeAndStem(normalizedText1);
    const tokens2 = tokenizeAndStem(normalizedText2);
    
    // Create a TF-IDF model and add both texts as documents
    // TF-IDF weighs terms based on their importance in the document and rarity across documents
    const tfidf = new TfIdf();
    tfidf.addDocument(tokens1.join(' '));
    tfidf.addDocument(tokens2.join(' '));
    
    // Get the term vectors for each document
    // Each vector contains terms with their TF-IDF weights
    const vector1 = tfidf.listTerms(0);
    const vector2 = tfidf.listTerms(1);
    
    // Combine all terms from both documents for vector space
    const terms = new Set([...vector1.map(v => v.term), ...vector2.map(v => v.term)]);
    
    // Create term-weight vectors for both documents
    const v1: Record<string, number> = {};
    const v2: Record<string, number> = {};
    
    vector1.forEach(item => v1[item.term] = item.tfidf);
    vector2.forEach(item => v2[item.term] = item.tfidf);
    
    // Calculate cosine similarity using dot product and vector magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    terms.forEach(term => {
      const w1 = v1[term] || 0;  // Weight in first document (0 if term not present)
      const w2 = v2[term] || 0;  // Weight in second document (0 if term not present)
      
      dotProduct += w1 * w2;     // Sum of weight products for dot product
      magnitude1 += w1 * w1;     // Sum of squared weights for first document magnitude
      magnitude2 += w2 * w2;     // Sum of squared weights for second document magnitude
    });
    
    // Calculate final magnitudes (vector lengths)
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Calculate cosine similarity (dot product divided by product of magnitudes)
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;  // Return 0 if either document has no valid terms
    }
    
    const similarity = dotProduct / (magnitude1 * magnitude2);
    return similarity;  // Returns a value between 0 and 1
  } catch (error) {
    console.error('Error calculating semantic similarity:', error);
    // If TF-IDF calculation fails, fall back to simpler similarity function
    return simpleSimilarity(text1, text2);
  }
}

/**
 * An expanded list of RSS feeds from diverse sources for comprehensive news coverage
 * Sources are grouped by mainstream, right-leaning, left-leaning, and specialized fact-checking sites
 * This diversity helps ensure balanced fact-checking by capturing multiple perspectives
 */
const rssFeeds = [
  // Mainstream news sources
  'https://feeds.bbci.co.uk/news/rss.xml',              // BBC News
  'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',  // New York Times
  'https://feeds.npr.org/1001/rss.xml',                 // NPR
  'https://abcnews.go.com/abcnews/topstories',          // ABC News
  'https://www.cbsnews.com/latest/rss/main',            // CBS News
  'https://feeds.skynews.com/feeds/rss/home.xml',       // Sky News
  'https://www.ft.com/rss/home',                        // Financial Times
  'https://rss.csmonitor.com/feeds/csm',                // Christian Science Monitor
  'https://www.latimes.com/rss2.0.xml',                 // Los Angeles Times
  
  // Right-leaning sources
  'https://moxie.foxnews.com/google-publisher/politics.xml',  // Fox News
  'https://nypost.com/feed/',                           // New York Post
  'https://www.washingtontimes.com/rss/headlines/news/politics/',  // Washington Times
  'https://www.dailywire.com/feeds/rss.xml',            // Daily Wire
  'https://www.newsmax.com/rss/Politics/1/',            // Newsmax
  'https://www.breitbart.com/feed/',                    // Breitbart
  'https://www.theblaze.com/feeds/feed.rss',            // The Blaze
  'https://www.nationalreview.com/feed/',               // National Review
  
  // Left-leaning sources
  'https://www.theguardian.com/uk/rss',                 // The Guardian
  'https://www.aljazeera.com/xml/rss/all.xml',          // Al Jazeera
  'https://www.independent.co.uk/news/world/rss',       // The Independent
  'https://www.huffpost.com/section/front-page/feed',   // HuffPost
  'https://www.motherjones.com/feed/',                  // Mother Jones
  'https://www.vox.com/rss/index.xml',                  // Vox
  
  // News aggregators and specific fact-checking sites
  'https://thehill.com/rss/syndicator/19110',           // The Hill
  'https://www.newsweek.com/rss',                       // Newsweek
  'https://www.economist.com/the-world-this-week/rss.xml',  // The Economist
  'https://rss.politico.com/politics-news.xml',         // Politico
  'https://feeds.reuters.com/reuters/politicsNews',     // Reuters Politics
  'https://feeds.reuters.com/reuters/topNews',          // Reuters Top News
  'https://rss.cnn.com/rss/cnn_allpolitics.rss',        // CNN Politics
  'https://www.factcheck.org/feed/',                    // FactCheck.org
  'https://www.politifact.com/rss/articles/',           // PolitiFact
  'https://www.snopes.com/feed/'                        // Snopes
];

/**
 * Extracts and processes the actual content from a URL
 * Uses multiple methods to obtain the most relevant textual content from web pages
 * Includes fallback mechanisms when the primary extraction fails
 * 
 * @param url - The URL to extract content from
 * @returns A string containing the extracted content
 */
export async function extractContentFromUrl(url: string): Promise<string> {
  try {
    console.log(`Attempting to fetch content from URL: ${url}`);
    
    // Extract publication name from URL domain for additional context
    const urlObj = new URL(url);
    const domainParts = urlObj.hostname.split('.');
    // Filter out common domain suffixes and prefixes to get the actual publication name
    const publication = domainParts.filter(part => 
      !['www', 'com', 'org', 'net', 'gov', 'co', 'uk'].includes(part)
    ).join(' ');
    
    // Set browser-like headers to avoid being blocked by anti-bot measures
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      timeout: 15000,                   // 15 seconds timeout for the request
      maxContentLength: 5 * 1024 * 1024 // Limit response size to 5MB
    });
    
    // Get HTML content and begin extracting useful text
    let html = response.data.toString();
    
    // Clean HTML by removing non-content elements that might interfere with extraction
    html = html
      // Remove scripts to avoid JavaScript code in the content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      // Remove styles to avoid CSS in the content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      // Remove navigation elements which typically don't contain article content
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      // Remove footer elements which typically contain site-wide links
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      // Remove header elements which typically contain site navigation
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      // Remove sidebar elements
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
      // Remove HTML comments
      .replace(/<comment\b[^<]*(?:(?!<\/comment>)<[^<]*)*<\/comment>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');
    
    // Extract the page title which often contains the article headline
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract meta description which often contains a summary of the page
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDescription = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Extract Open Graph metadata which is specifically designed for sharing content
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';
    
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i);
    const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : '';
    
    // Try multiple patterns to locate the main article content
    // This uses common HTML patterns found in news and blog websites
    let mainContent = '';
    const bodyMatches = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,                             // <article> tag
      /<main[^>]*>([\s\S]*?)<\/main>/i,                                   // <main> tag
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,       // divs with "content" in class
      /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,       // divs with "article" in class
      /<div[^>]*class="[^"]*story[^"]*"[^>]*>([\s\S]*?)<\/div>/i,         // divs with "story" in class
      /<div[^>]*class="[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,          // divs with "body" in class
      /<div[^>]*class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,          // divs with "text" in class
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,          // divs with "content" in id
      /<div[^>]*id="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/i,             // divs with "main" in id
      /<div[^>]*id="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i           // divs with "article" in id
    ];
    
    // Try each pattern until we find a substantial chunk of content
    for (const pattern of bodyMatches) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > 200) { // Only use if substantial (>200 chars)
        mainContent = match[1];
        break;
      }
    }
    
    // Fallback: If no specific content area was found, use the entire body
    if (!mainContent) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      mainContent = bodyMatch ? bodyMatch[1] : html;
    }
    
    // Combine all metadata extracted from different sources
    const metaContent = [title, metaDescription, ogTitle, ogDescription].filter(Boolean).join(' ');
    
    // Clean the final text by removing all HTML tags and normalizing spaces
    let text = (metaContent + ' ' + mainContent)
      .replace(/<[^>]*>/g, ' ')         // Remove all HTML tags
      .replace(/&[a-z]+;/gi, ' ')       // Remove HTML entities (like &nbsp;, &amp;, etc.)
      .replace(/\s+/g, ' ')             // Replace multiple spaces with a single space
      .trim();                          // Remove leading/trailing whitespace
    
    // Get additional context from the URL structure itself
    const urlInfo = extractKeywordsFromUrl(url);
    
    // Create the final enhanced text by combining all sources of information
    const enhancedText = [
      publication ? `Source: ${publication}` : '',   // Publication name if available
      text,                                          // Main extracted content
      urlInfo                                        // Keywords from URL
    ].filter(Boolean).join(' ');
    
    console.log(`Successfully extracted ${enhancedText.length} characters from URL`);
    return enhancedText;
  
  } catch (error: any) {
    console.error(`Error fetching URL content: ${error.message || 'Unknown error'}`);
    // Fallback: If we can't fetch the page content, try to extract meaningful info from URL
    return extractKeywordsFromUrl(url);
  }
}

/**
 * Helper function to extract meaningful keywords from a URL when the actual content can't be fetched
 * This provides a fallback method to get some context about the article
 * 
 * @param url - The URL to extract keywords from
 * @returns A string containing keywords and information derived from the URL structure
 */
function extractKeywordsFromUrl(url: string): string {
  try {
    console.log('Extracting keywords from URL structure');
    const urlObj = new URL(url);
    
    // Extract the domain name to identify the publication source
    const domainParts = urlObj.hostname.split('.');
    const publication = domainParts.filter(part => 
      // Filter out common domain parts that aren't meaningful
      !['www', 'com', 'org', 'net', 'gov', 'co', 'uk'].includes(part)
    ).join(' ');
    
    // Extract path components which often contain article categories and titles
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Clean path parts to make them more readable
    const cleanedPathParts = pathParts
      .map(part => part
        .replace(/-/g, ' ')           // Convert kebab-case to spaces
        .replace(/_/g, ' ')           // Convert snake_case to spaces
        .replace(/\d{4}\/\d{2}\/\d{2}/, '')  // Remove date patterns
        .replace(/^\d+$/, '')         // Remove numeric IDs
        .trim()
      )
      .filter(part => part.length > 0);  // Remove empty parts
    
    // Extract search parameters which might contain additional keywords
    const searchParams = Array.from(urlObj.searchParams.entries())
      .map(([key, value]) => {
        // Only include values that look like keywords, not numeric IDs
        if (value.length > 3 && !/^\d+$/.test(value)) {
          return value.replace(/-/g, ' ').replace(/_/g, ' ');
        }
        return '';
      })
      .filter(Boolean);  // Remove empty values
    
    // Combine all extracted components into a single string
    const urlKeywords = [
      publication ? `Publication: ${publication}` : '',
      cleanedPathParts.length > 0 ? `Topic: ${cleanedPathParts.join(' ')}` : '',
      searchParams.length > 0 ? `Additional: ${searchParams.join(' ')}` : ''
    ].filter(Boolean).join(', ');
    
    console.log(`Extracted URL keywords: ${urlKeywords}`);
    return urlKeywords;
  } catch (e) {
    console.error('Error extracting keywords from URL:', e);
    return url; // Return the raw URL as a last resort if parsing fails
  }
}

/**
 * Processes user input to handle both text claims and URLs
 * If the input is a URL, it extracts the content from that URL
 * Otherwise, it treats the input as a direct claim or statement
 * 
 * @param input - The user input string (either a claim or URL)
 * @returns Processed text content ready for fact checking
 */
export async function processInput(input: string): Promise<string> {
  // Regular expression to detect if the input is a URL
  const urlPattern = /^(https?:\/\/)[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-_./?=&%]*)?$/;
  
  // If input is a URL, extract its content
  if (urlPattern.test(input)) {
    console.log('Input appears to be a URL, attempting to extract content');
    const extractedContent = await extractContentFromUrl(input);
    
    // Only use the extracted content if we got something substantial
    if (extractedContent && extractedContent.length > 50) {
      // Limit content length to avoid overwhelming subsequent processing
      // First 2000 characters should capture the main points of most articles
      return extractedContent.substring(0, 2000);
    }
  }
  
  // If not a URL or URL extraction failed, use the original input as is
  return input;
}

/**
 * Fetches and parses content from all configured RSS feeds
 * Includes caching, parallel fetching, timeout handling, and error recovery
 * 
 * @returns A consolidated array of all articles from all feeds
 */
export async function fetchAllRSSFeeds(): Promise<Parser.Item[]> {
  const allArticles: Parser.Item[] = [];
  
  console.log(`Starting to fetch articles from ${rssFeeds.length} RSS feeds...`);
  
  // Use Promise.allSettled to fetch all feeds in parallel
  // This allows some feeds to fail without affecting others
  const feedPromises = rssFeeds.map((url, index) => {
    return new Promise<Parser.Item[]>(async (resolve) => {
      try {
        console.log(`Attempting to fetch from RSS feed #${index+1}: ${url}`);
        
        // Check cache first to avoid unnecessary network requests
        const cached = RSS_CACHE[url];
        const now = Date.now();
        
        // If we have fresh cached data, use it instead of fetching again
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          console.log(`Using cached data for ${url}`);
          resolve(cached.data);
          return;
        }
        
        // Create a timeout promise to prevent hanging on slow feeds
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
        });
        
        // Create the actual fetch promise
        const fetchPromise = parser.parseURL(url);
        
        // Race the fetch against the timeout - whichever resolves first wins
        const feed = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        // Process successful feed data
        if (feed && feed.items && Array.isArray(feed.items)) {
          console.log(`Successfully fetched ${feed.items.length} articles from ${url}`);
          
          // Update the cache with fresh data
          RSS_CACHE[url] = {
            timestamp: Date.now(),
            data: feed.items
          };
          
          resolve(feed.items);
        } else {
          console.log(`Feed from ${url} was empty or invalid`);
          resolve([]);
        }
      } catch (error) {
        console.error(`Error fetching RSS feed from ${url}:`, error);
        resolve([]); // Return empty array on error to continue processing
      }
    });
  });
  
  // Wait for all feed promises to settle (either resolve or reject)
  const results = await Promise.allSettled(feedPromises);
  
  // Process the results and collect statistics
  let successCount = 0;
  let articleCount = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const items = result.value;
      if (items && items.length > 0) {
        successCount++;
        articleCount += items.length;
        allArticles.push(...items);  // Add these articles to our master list
      }
    } else {
      console.error(`Failed to fetch from ${rssFeeds[index]}:`, result.reason);
    }
  });
  
  // Log summary statistics for monitoring and debugging
  console.log(`Results summary: ${successCount}/${rssFeeds.length} feeds successful, ${articleCount} total articles fetched`);
  console.log(`Final result: ${allArticles.length} valid articles available for fact checking`);
  
  // Warn if no articles were fetched at all
  if (allArticles.length === 0) {
    console.warn("WARNING: No articles were fetched from any RSS feeds! This will cause fact checking to fail.");
  }
  
  return allArticles;
}

/**
 * Filters articles from RSS feeds to find those most relevant to a given query
 * Uses a sophisticated scoring system that incorporates entity matching, phrase/word matching,
 * semantic similarity, and recency to determine relevance
 * 
 * @param articles - The array of articles to filter
 * @param query - The query text to filter articles against
 * @returns An array of articles deemed relevant to the query
 */
export function filterRelevantArticles(articles: Parser.Item[], query: string): Parser.Item[] {
  // Log initial stats for debugging
  console.log(`Filtering ${articles.length} articles for relevance to query: "${query}"`);
  
  // Handle empty input case
  if (articles.length === 0) {
    console.warn("WARNING: No articles available to filter!");
    return [];
  }
  
  // STEP 1: Query Analysis - Extract key information from the query
  // ---------------------------------------------------------------
  
  // Normalize the query text for consistent comparison
  const normalizedQuery = query.toLowerCase().trim();
  
  // Extract main keywords by splitting on punctuation and filtering out common stopwords
  const queryKeywords = normalizedQuery.split(/[.,;!?]/)
    .flatMap(phrase => phrase.split(/\s+/))
    .filter(word => 
      // Keep words longer than 2 chars and filter out common stopwords
      word.length > 2 && !['the', 'and', 'for', 'but', 'not', 'with', 'that', 'this', 'was', 'were', 'has', 'have', 'had'].includes(word)
    );
  
  // Extract key phrases (2-3 word sequences that might contain important concepts)
  const queryPhrases: string[] = [];
  const words = normalizedQuery.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    // Create bigrams (2-word phrases)
    queryPhrases.push(`${words[i]} ${words[i+1]}`);
    if (i < words.length - 2) {
      // Create trigrams (3-word phrases)
      queryPhrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
    }
  }
  
  // STEP 2: Entity Recognition - Identify potential named entities in the query
  // -------------------------------------------------------------------------
  const namedEntities: string[] = [];
  
  // Look for capitalized words that might be proper nouns
  const capitalizedWords = normalizedQuery.match(/(?:^|\s|\.)([A-Z][a-z]{1,})/g) || [];
  if (capitalizedWords.length > 0) {
    namedEntities.push(...capitalizedWords.map(w => w.trim().toLowerCase()));
  }
  
  // Check for common political figures that might be mentioned
  const politicalFigures = [
    'trump', 'biden', 'harris', 'obama', 'clinton', 'mcconnell', 'schumer', 
    'pelosi', 'mccarthy', 'desantis', 'newsom', 'sanders', 'ratcliffe'
  ];
  
  politicalFigures.forEach(figure => {
    if (normalizedQuery.includes(figure)) {
      namedEntities.push(figure);
    }
  });
  
  // Check for country/region mentions which are often important in news articles
  const countries = [
    'us', 'usa', 'america', 'american', 'china', 'chinese', 'russia', 'russian',
    'iran', 'iranian', 'israel', 'israeli', 'ukraine', 'ukrainian', 'north korea', 
    'south korea', 'europe', 'european'
  ];
  
  countries.forEach(country => {
    if (normalizedQuery.includes(country)) {
      namedEntities.push(country);
    }
  });
  
  // Check for important political/social topics
  const keyTopics = [
    'election', 'vote', 'pandemic', 'covid', 'vaccine', 'climate', 'economy', 
    'inflation', 'war', 'military', 'immigration', 'border', 'tax', 'healthcare'
  ];
  
  keyTopics.forEach(topic => {
    if (normalizedQuery.includes(topic)) {
      namedEntities.push(topic);
    }
  });
  
  // Log extracted information for debugging
  console.log('Query keywords:', queryKeywords);
  console.log('Query phrases:', queryPhrases);
  console.log('Named entities:', namedEntities);
  console.log(`Starting with ${articles.length} total articles...`);
  
  // Flag for short queries which may need more lenient matching
  const isShortQuery = queryKeywords.length <= 3;
  
  // Expand query words by splitting compound words to improve matching
  const allQueryWords = new Set<string>();
  queryKeywords.forEach(keyword => {
    // Split compound words (e.g., "majority-back" to ["majority", "back"])
    keyword.split(/[-_\s]/).forEach(word => {
      if (word.length > 2) allQueryWords.add(word.toLowerCase());
    });
  });
  
  console.log(`Expanded query words:`, Array.from(allQueryWords));
  
  // Simple tokenization of query for basic word matching
  const simpleWords = normalizedQuery
    .split(/\s+/)
    .filter(w => w.length >= 3)
    .map(w => w.toLowerCase());
  console.log('Simple words:', simpleWords);
  
  // Log a sample of available articles to understand what we're working with
  console.log('Sample article titles:');
  for (let i = 0; i < Math.min(5, articles.length); i++) {
    console.log(`- ${articles[i].title || 'Untitled'}`);
  }
  
  // STEP 3: Article Scoring - Score each article for relevance
  // ---------------------------------------------------------
  const scoredArticles = articles.map(article => {
    // Skip articles with no content
    if (!article.title && !article.contentSnippet && !article.content) {
      return { article, score: 0, matches: [] };
    }
    
    // Extract and combine all text content from the article
    const title = article.title?.toLowerCase() || '';
    const description = article.contentSnippet?.toLowerCase() || '';
    const content = article.content?.toLowerCase() || '';
    const combined = title + ' ' + description + ' ' + content;
    
    let score = 0;
    const matches: string[] = [];
    
    // Score 1: Entity matching (highest priority - named entities are strong indicators)
    if (namedEntities.length > 0) {
      for (const entity of namedEntities) {
        if (combined.includes(entity)) {
          score += 5; // Highest weight for entity matches
          matches.push(`entity:${entity}`);
        }
      }
    }
    
    // Score 2: Phrase matching (multi-word matches are stronger than single words)
    for (const phrase of queryPhrases) {
      if (combined.includes(phrase)) {
        score += 3; // Good weight for phrase matches
        matches.push(`phrase:${phrase}`);
      }
    }
    
    // Score 3: Word matching (basic matching for individual words)
    for (const word of simpleWords) {
      if (combined.includes(word)) {
        score += 1; // Lowest weight for single word matches
        matches.push(`word:${word}`);
      }
    }
    
    // Score 4: Semantic similarity (more sophisticated but computationally expensive)
    try {
      // Only compute similarity if the article already has some relevance
      // This saves computation time for clearly irrelevant articles
      if (score > 0 || matches.length > 0) {
        // Trim content to maximum 1000 chars for performance
        const trimmedQuery = normalizedQuery.substring(0, 1000);
        const trimmedContent = (title + ' ' + description).substring(0, 1000);
        
        // Get semantic similarity using TF-IDF and cosine similarity
        const similarity = calculateSemanticSimilarity(trimmedQuery, trimmedContent);
        const similarityScore = similarity * 10; // Scale up from 0-1 to 0-10 range
        
        score += similarityScore;
        if (similarityScore > 3) {
          matches.push(`semantic:${similarityScore.toFixed(2)}`);
        }
      }
    } catch (e) {
      console.error('Error calculating semantic similarity:', e);
    }
    
    // Score 5: Recency bonus (fresher news is typically more relevant)
    if (article.isoDate) {
      const pubDate = new Date(article.isoDate);
      const now = new Date();
      const hoursSincePub = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
      
      // Apply bonus for articles published within the last 24 hours
      if (hoursSincePub < 24) {
        const recencyBonus = Math.max(0, (24 - hoursSincePub) / 24); // 0 to 1 scale
        score += recencyBonus;
        if (recencyBonus > 0.5) {
          matches.push(`recent:${recencyBonus.toFixed(2)}`);
        }
      }
    }
    
    // Debug logging for high-scoring articles and a random sample
    if (score > 5 || Math.random() < 0.02) {
      console.log(`Article: "${title}" | Score: ${score.toFixed(2)} | Matches: ${matches.join(', ')}`);
    }
    
    return { article, score, matches };
  });
  
  // STEP 4: Threshold Determination and Filtering
  // --------------------------------------------
  
  // Sort articles by score (highest first)
  scoredArticles.sort((a, b) => b.score - a.score);
  
  // Get positive scores for threshold calculation
  const scores = scoredArticles.map(a => a.score).filter(s => s > 0);
  
  // Apply adaptive thresholding based on score distribution
  let threshold = 0;
  if (scores.length >= 10) {
    // More sophisticated approach - use lower quartile as threshold
    scores.sort((a, b) => a - b);
    const lowerQuartileIndex = Math.floor(scores.length / 4);
    threshold = scores[lowerQuartileIndex];
    console.log(`Setting threshold at lower quartile: ${threshold.toFixed(2)}`);
  } else if (scores.length > 0) {
    // With fewer articles, be more lenient (70% of lowest positive score)
    threshold = scores[scores.length - 1] * 0.7;
    console.log(`Setting lenient threshold: ${threshold.toFixed(2)}`);
  }
  
  // Filter by threshold and extract the actual articles
  let filteredArticles = scoredArticles
    .filter(item => item.score > threshold)
    .map(item => item.article);
  
  console.log(`Filtered to ${filteredArticles.length} relevant articles using adaptive threshold of ${threshold.toFixed(2)}`);
  
  // Limit the number of articles if we have too many
  if (filteredArticles.length > 20) {
    console.log(`Too many articles (${filteredArticles.length}), keeping top 20`);
    filteredArticles = filteredArticles.slice(0, 20);
  }
  
  // STEP 5: Fallback Mechanism - Always return some articles if available
  // -------------------------------------------------------------------
  if (filteredArticles.length === 0 && articles.length > 0) {
    console.log("No articles matched filtering criteria. Using fallback strategy...");
    
    // Sort by date (newest first) as a fallback
    const sortedArticles = [...articles].sort((a, b) => {
      if (!a.isoDate) return 1;
      if (!b.isoDate) return -1;
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });
    
    // Return the 10 most recent articles
    filteredArticles = sortedArticles.slice(0, 10);
    console.log(`Fallback: Using ${filteredArticles.length} most recent articles`);
    
    // Log the fallback articles we're returning
    filteredArticles.forEach((article, i) => {
      console.log(`Fallback article ${i+1}: "${article.title || 'Untitled'}"`);
    });
  }
  
  return filteredArticles;
}

/**
 * Extracts named entities and key concepts from text using NLP techniques
 * This helps identify the important people, places, organizations, and topics in the text
 * 
 * @param text - The input text to analyze
 * @returns An object containing arrays of extracted entities and concepts
 */
function extractEntitiesFromText(text: string): { entities: string[], concepts: string[] } {
  const entities: string[] = [];   // Will hold named entities (people, places, organizations)
  const concepts: string[] = [];   // Will hold key concepts and topics
  
  try {
    // Normalize text for processing
    const normalizedText = text.toLowerCase();
    
    // PART 1: NAMED ENTITY EXTRACTION
    // ------------------------------
    
    // Look for consecutive capitalized words (potential multi-word entities)
    // Examples: "Joe Biden", "United States", "Democratic Party"
    const entityRegex = /(?:^|\.\s+|\n)([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)+)/g;
    const potentialEntities: string[] = [];
    let match;
    
    // Create a new RegExp instance to avoid regex state issues
    const regex1 = new RegExp(entityRegex);
    while ((match = regex1.exec(text)) !== null) {
      if (match[1] && match[1].length > 3) {
        // Convert to lowercase for consistent comparison
        potentialEntities.push(match[1].toLowerCase());
      }
    }
    
    // Look for standalone capitalized words not at sentence starts
    // These are likely proper nouns like names, places, or organizations
    const standaloneRegex = /(?:[^.!?]\s+)([A-Z][a-zA-Z]{3,})/g;
    const regex2 = new RegExp(standaloneRegex);
    while ((match = regex2.exec(text)) !== null) {
      if (match[1]) {
        potentialEntities.push(match[1].toLowerCase());
      }
    }
    
    // Remove duplicates and add to entities array
    const uniqueEntities = new Set(potentialEntities);
    entities.push(...Array.from(uniqueEntities));
    
    // PART 2: CONCEPT EXTRACTION
    // -------------------------
    
    // Split into individual words and filter out short words
    const words = normalizedText.split(/\s+/).filter(w => w.length > 3);
    
    // Count word frequencies to find important single-word concepts
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Find important n-grams (phrases of 2-3 words)
    // These often capture concepts better than single words
    const ngramFreq: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      // Create bigrams (2-word phrases)
      const bigram = `${words[i]} ${words[i + 1]}`;
      ngramFreq[bigram] = (ngramFreq[bigram] || 0) + 1;
      
      // Create trigrams (3-word phrases)
      if (i < words.length - 2) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        ngramFreq[trigram] = (ngramFreq[trigram] || 0) + 1;
      }
    }
    
    // Define stopwords to filter out common words that don't carry much meaning
    const stopwords = new Set([
      'this', 'that', 'these', 'those', 'they', 'their', 'there', 'here', 
      'where', 'when', 'what', 'which', 'who', 'whom', 'whose', 'have', 'has',
      'had', 'having', 'with', 'from', 'into', 'during', 'including', 'until',
      'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'about'
    ]);
    
    // Get the most frequent single words (excluding stopwords)
    const wordEntries = Object.entries(wordFreq)
      .filter(([word]) => !stopwords.has(word) && word.length > 3)
      .sort((a, b) => b[1] - a[1])  // Sort by frequency (descending)
      .slice(0, 10);                // Take top 10
    
    // Get the most frequent n-grams (excluding those containing stopwords)
    const ngramEntries = Object.entries(ngramFreq)
      .filter(([ngram]) => !ngram.split(' ').some(w => stopwords.has(w)))
      .sort((a, b) => b[1] - a[1])  // Sort by frequency (descending)
      .slice(0, 10);                // Take top 10
    
    // Add the extracted concepts to the concepts array
    concepts.push(...wordEntries.map(e => e[0]));
    concepts.push(...ngramEntries.map(e => e[0]));
    
    // PART 3: DOMAIN-SPECIFIC PATTERN MATCHING
    // --------------------------------------
    
    // Extract dates (important for news articles and fact-checking)
    const datePatterns = [
      // Month name + day + year pattern (e.g., "January 20, 2021")
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/gi,
      // Numeric date pattern (e.g., "1/20/2021")
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    ];
    
    // Add extracted dates to concepts
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach((m: string) => concepts.push(m.toLowerCase()));
    });
    
    // Extract percentage statistics (important for fact claims)
    // Pattern matches things like "25% increase" or "3.5% of voters"
    const percentageMatches = text.match(/\b\d+(?:\.\d+)?%\s+(?:of|in|increase|decrease|growth|decline)\b/gi) || [];
    percentageMatches.forEach((m: string) => concepts.push(m.toLowerCase()));
    
  } catch (error) {
    console.error('Error extracting entities:', error);
  }
  
  // Return deduplicated arrays of entities and concepts
  return { 
    entities: [...new Set(entities)],  // Remove any duplicates
    concepts: [...new Set(concepts)]   // Remove any duplicates
  };
}

/**
 * Makes a fact-checking decision based on the collection of relevant articles
 * Analyzes articles for supporting or opposing evidence and generates a reasoned decision
 * 
 * @param relevantArticles - The array of articles to analyze
 * @param query - The original claim being fact-checked
 * @returns An object containing the decision, supporting/opposing sources, claim summary, and reasoning
 */
export function makeFactCheckDecision(relevantArticles: Parser.Item[], query: string = ''): {
  decision: string;
  sources: {
    for: { title: string; link: string }[];
    against: { title: string; link: string }[];
    inconclusive: { title: string; link: string }[];
  };
  claimSummary: string;
  reason: string;
} {
  // Initialize arrays to categorize articles
  const forArticles: { title: string; link: string }[] = [];        // Articles supporting the claim
  const againstArticles: { title: string; link: string }[] = [];    // Articles opposing the claim
  const inconclusiveArticles: { title: string; link: string }[] = []; // Articles with unclear stance
  
  // Store content from most relevant articles for deeper analysis
  const keyArticleContent: string[] = [];

  console.log(`Making fact check decision based on ${relevantArticles.length} articles`);

  // Generate a summary of what the claim is about using the articles and query
  const claimSummary = extractClaimSummary(relevantArticles, query);
  console.log('Generated claim summary:', claimSummary);

  // Handle the case where we have no articles
  if (relevantArticles.length === 0) {
    console.warn("No articles to make a decision from!");
    return { 
      decision: 'inconclusive', 
      sources: { 
        for: [], 
        against: [], 
        inconclusive: [] 
      },
      claimSummary: query ? `Unable to find any relevant information about: "${query}"` : 'No claim provided',
      reason: 'No relevant articles were found to make a determination'
    };
  }
  
  // STEP 1: Define sentiment indicator keywords
  // -------------------------------------------
  
  // Keywords that typically indicate support for a claim
  const supportKeywords = [
    'confirm', 'support', 'true', 'correct', 'accurate', 'valid', 'verify', 'evidence', 'proof',
    'studies show', 'research indicates', 'evidence suggests', 'according to', 'factual', 'legitimate',
    'confirmed by', 'verified by', 'substantiated', 'authenticated', 'validated', 'proves', 
    'demonstrated', 'established', 'corroborated', 'affirmed', 'endorsed', 'backed', 'upheld',
    'legitimate', 'real', 'genuine', 'official', 'authentic', 'documented', 'proven', 'verifiable',
    'ratified', 'authorized', 'certified', 'affirmed'
  ];
  
  // Keywords that typically indicate opposition to a claim
  const againstKeywords = [
    'false', 'incorrect', 'wrong', 'debunk', 'deny', 'refute', 'fake', 'mislead', 'inaccurate',
    'misinformation', 'disinformation', 'baseless', 'unfounded', 'conspiracy', 'no evidence',
    'disputed', 'fabricated', 'unverified', 'contested', 'dubious', 'unsubstantiated',
    'misleading', 'hoax', 'rumor', 'falsehood', 'lie', 'deceit', 'deception', 'fraud', 'bogus',
    'phony', 'sham', 'forgery', 'counterfeit', 'not true', 'never happened', 'didn\'t happen', 
    'untrue', 'mistaken', 'erroneous', 'fallacious', 'specious', 'spurious', 'fake news'
  ];

  // Track overall scores for later analysis
  let totalSupportScore = 0;
  let totalAgainstScore = 0;
  let totalRelevanceScore = 0;
  
  // STEP 2: Score and categorize each article
  // ----------------------------------------
  
  // Array to store article analysis results
  const articleScores: {article: Parser.Item; supportScore: number; againstScore: number; relevance: number}[] = [];
  
  // Analyze each article for supporting or opposing evidence
  relevantArticles.forEach(article => {
    // Extract and combine all text content from the article
    const title = article.title?.toLowerCase() || '';
    const content = article.content?.toLowerCase() || article.contentSnippet?.toLowerCase() || '';
    const articleText = title + ' ' + content;
    
    // Calculate basic article relevance based on content length
    let relevance = 1;  // Base relevance score
    if (title.length > 20) {
      relevance = 1.5;  // Boost for articles with substantial titles
    }
    if (content.length > 500) {
      relevance += 0.5;  // Additional boost for articles with substantial content
    }
    
    totalRelevanceScore += relevance;
    
    // Initialize sentiment scores
    let supportScore = 0;
    let againstScore = 0;
    
    // Analyze support keywords
    supportKeywords.forEach(keyword => {
      // Simple substring matching (faster but less precise)
      if (articleText.includes(keyword)) {
        supportScore += 1;
      }
      
      // Word boundary matching (more precise but can miss variations)
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (articleText.match(regex) || []).length;
      supportScore += matches * 0.5;  // Weight exact matches less to avoid overwhelming the score
    });
    
    // Analyze opposition keywords
    againstKeywords.forEach(keyword => {
      // Simple substring matching
      if (articleText.includes(keyword)) {
        againstScore += 1;
      }
      
      // Word boundary matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (articleText.match(regex) || []).length;
      againstScore += matches * 0.5;
    });
    
    // Look for specific negation phrases that strongly indicate the claim is false
    // These get extra weight since they're more definitive
    const negationPhrases = ['not true', 'isn\'t true', 'is false', 'no evidence', 'lacks evidence'];
    negationPhrases.forEach(phrase => {
      if (articleText.includes(phrase)) {
        againstScore += 1.5;  // Higher weight for clear negations
      }
    });
    
    // Weight scores by relevance to prioritize more substantial articles
    supportScore *= relevance;
    againstScore *= relevance;
    
    // Add to totals for overall analysis
    totalSupportScore += supportScore;
    totalAgainstScore += againstScore;
    
    // Save individual article scores for later categorization
    articleScores.push({
      article,
      supportScore,
      againstScore,
      relevance
    });
    
    // Save content from highly relevant articles for deeper analysis
    if (relevance >= 1.5) {
      keyArticleContent.push(`Title: ${article.title || 'Untitled'}\nContent: ${article.contentSnippet || ''}`);
    }
  });
  
  // STEP 3: Categorize articles based on scores
  // ------------------------------------------
  
  // Sort supporting articles by support score (highest first)
  const forSorted = articleScores
    .filter(item => item.supportScore > item.againstScore)  // Only include articles with net positive support
    .sort((a, b) => b.supportScore - a.supportScore)        // Sort by support score
    .slice(0, 10)  // Limit to 10 most relevant supporting articles to avoid overwhelming
    .map(item => ({
      title: item.article.title || 'Untitled',
      link: item.article.link || '#'
    }));
  
  // Sort opposing articles by against score (highest first)
  const againstSorted = articleScores
    .filter(item => item.againstScore > item.supportScore)  // Only include articles with net opposition
    .sort((a, b) => b.againstScore - a.againstScore)        // Sort by opposition score
    .slice(0, 10)  // Limit to 10 most relevant opposing articles
    .map(item => ({
      title: item.article.title || 'Untitled',
      link: item.article.link || '#'
    }));
  
  // Count inconclusive articles (equal support and opposition scores)
  const inconclusiveCount = articleScores.filter(
    item => item.supportScore === item.againstScore
  ).length;
    
  // Add sorted articles to their respective categories
  forArticles.push(...forSorted);
  againstArticles.push(...againstSorted);
  
  // Log categorization results for debugging
  console.log(`Categorized ${forArticles.length} supporting articles, ${againstArticles.length} opposing articles`);
  console.log(`${inconclusiveCount} inconclusive articles ignored`);

  // Log overall distribution
  console.log(`Article distribution: FOR=${forArticles.length}, AGAINST=${againstArticles.length}, INCONCLUSIVE=${inconclusiveArticles.length}`);
  
  // STEP 4: Handle edge case - no clear categorization
  // ------------------------------------------------
  
  // If no articles could be categorized either way, mark all as inconclusive
  if (forArticles.length === 0 && againstArticles.length === 0 && inconclusiveArticles.length === 0) {
    console.log("No articles were categorized! Putting all in inconclusive category.");
    
    // Add all articles to inconclusive category as fallback
    relevantArticles.forEach(article => {
      inconclusiveArticles.push({
        title: article.title || 'Untitled',
        link: article.link || '#'
      });
    });
    
    return { 
      decision: 'inconclusive', 
      sources: { 
        for: [], 
        against: [], 
        inconclusive: inconclusiveArticles 
      },
      claimSummary: query ? `Unable to find any conclusive information about: "${query}"` : 'No claim provided',
      reason: 'No reliable sources were found that take a clear position on this claim'
    };
  }
  
  // STEP 5: Make final decision based on article distribution
  // -------------------------------------------------------
  
  let reason = '';
  let decision = 'inconclusive';
  
  // Empty array for inconclusive sources since we're not including them in results
  const emptyInconclusive: { title: string; link: string }[] = []; 
  
  // Decision making logic based on numerical comparison of supporting vs opposing articles
  if (forArticles.length > againstArticles.length * 1.5) {
    // Strong support (at least 50% more supporting articles than opposing)
    decision = 'true';
    reason = `There are ${forArticles.length} reliable sources supporting this claim compared to only ${againstArticles.length} opposing sources. The evidence strongly suggests this claim is accurate.`;
  } else if (againstArticles.length > forArticles.length * 1.5) {
    // Strong opposition (at least 50% more opposing articles than supporting)
    decision = 'false';
    reason = `There are ${againstArticles.length} reliable sources refuting this claim compared to only ${forArticles.length} supporting sources. The evidence strongly suggests this claim is false.`;
  } else if (forArticles.length > againstArticles.length) {
    // Mild support (more supporting than opposing, but not by a large margin)
    decision = 'true';
    reason = `While the evidence is mixed, there are more sources (${forArticles.length}) supporting the claim than opposing it (${againstArticles.length}).`;
  } else if (againstArticles.length > forArticles.length) {
    // Mild opposition (more opposing than supporting, but not by a large margin)
    decision = 'false';
    reason = `While the evidence is mixed, there are more sources (${againstArticles.length}) opposing the claim than supporting it (${forArticles.length}).`;
  } else if (forArticles.length === 0 && againstArticles.length === 0) {
    // No clear sentiment either way
    decision = 'inconclusive';
    reason = 'No reliable sources were found that either support or oppose this claim, making it impossible to verify.';
  } else {
    // Equal number of supporting and opposing articles
    decision = 'inconclusive';
    reason = `The evidence is evenly split, with ${forArticles.length} sources supporting and ${againstArticles.length} sources opposing the claim, making it difficult to determine its accuracy.`;
  }
  
  // Return the final decision with all supporting information
  return { 
    decision,  // 'true', 'false', or 'inconclusive'
    sources: { 
      for: forArticles,         // Articles supporting the claim
      against: againstArticles, // Articles opposing the claim
      inconclusive: emptyInconclusive // Empty array as we're removing inconclusive sources
    },
    claimSummary,  // Generated summary of what the claim is about
    reason         // Explanation for the decision
  };
}

/**
 * OpenAI Integration
 * 
 * The following code adds advanced AI capabilities to the fact-checking system
 * using the OpenAI API. This allows for more nuanced analysis of claims and evidence.
 */

// Initialize OpenAI client if the API key is available in environment variables
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    // Create the OpenAI client with the API key
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.log('OpenAI API key not found in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

/**
 * Enhances the fact-checking decision using OpenAI's language models
 * This provides a more nuanced analysis by having the AI evaluate the evidence
 * 
 * @param claimSummary - Summary of the claim being fact-checked
 * @param decision - Initial decision from the rule-based system ('true', 'false', 'inconclusive')
 * @param reason - Explanation for the initial decision
 * @param supportingEvidence - Text summarizing evidence supporting the claim
 * @param opposingEvidence - Text summarizing evidence opposing the claim
 * @returns An enhanced decision with confidence score and explanation
 */
export async function enhanceFactCheckWithAI(
  claimSummary: string,
  decision: string,
  reason: string,
  supportingEvidence: string,
  opposingEvidence: string
): Promise<{
  enhancedDecision: string;
  confidence: number;
  explanation: string;
}> {
  // If OpenAI client is not available, return the original decision
  if (!openai) {
    console.log('OpenAI not available for enhanced fact-checking');
    return {
      enhancedDecision: decision,
      confidence: decision === 'inconclusive' ? 0.5 : 0.8, // Default confidence levels
      explanation: reason
    };
  }

  try {
    // Construct a detailed prompt that instructs the AI on how to analyze the claim
    const prompt = `
      You are a factchecking specialist who analyzes news articles and claims to determine accuracy.
      
      CLAIM TO CHECK: "${claimSummary}"
      
      INITIAL DECISION FROM NEWS SOURCES: ${decision}
      
      REASON FOR INITIAL DECISION: ${reason}
      
      SUPPORTING EVIDENCE: ${supportingEvidence}
      
      OPPOSING EVIDENCE: ${opposingEvidence}
      
      Your job is to analyze this data and provide:
      1. A final factcheck decision (TRUE, FALSE, or INCONCLUSIVE)
      2. A confidence score from 0.0 to 1.0
      3. A clear explanation of your reasoning
      
      Respond in JSON format as follows:
      {
        "decision": "TRUE|FALSE|INCONCLUSIVE",
        "confidence": 0.XX,
        "explanation": "Your explanation here"
      }
      
      Base your decision on the actual evidence provided, not on preexisting knowledge.
    `;

    // Call the OpenAI API with the prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',        // Using a balanced model for efficiency and accuracy
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,              // Low temperature for more consistent, factual responses
      max_tokens: 500                // Limit response length
    });

    // Extract the content from the API response
    const content = response.choices[0]?.message?.content || '';
    console.log('OpenAI Response:', content);
    
    // Parse the JSON response
    try {
      // Look for a JSON object in the response (handles cases where there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        // Return the enhanced decision with confidence and explanation
        return {
          enhancedDecision: jsonResponse.decision.toLowerCase(),  // Normalize to lowercase
          confidence: jsonResponse.confidence || 0.5,             // Default to 0.5 if missing
          explanation: jsonResponse.explanation || reason         // Fall back to original reason if missing
        };
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fall back to original decision if parsing fails
      return {
        enhancedDecision: decision,
        confidence: decision === 'inconclusive' ? 0.5 : 0.8,
        explanation: reason
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI for fact-checking:', error);
    // Return the original decision if API call fails
    return {
      enhancedDecision: decision,
      confidence: decision === 'inconclusive' ? 0.5 : 0.8,
      explanation: reason
    };
  }
}

/**
 * Extracts key information from articles to generate a concise claim summary
 * This function helps identify what the claim is actually about based on retrieved articles
 * 
 * @param relevantArticles - The array of articles to analyze
 * @param query - The original search query or claim text
 * @returns A summarized version of the claim based on article content
 */
function extractClaimSummary(relevantArticles: Parser.Item[], query: string): string {
  // Handle the case where no articles are available
  if (relevantArticles.length === 0) {
    return `No relevant information found about: "${query}"`;
  }
  
  // STEP 1: Combine all text from articles for analysis
  // --------------------------------------------------
  
  // Concatenate all article text to identify common topics
  const allText = relevantArticles
    .map(article => {
      const title = article.title || '';
      const content = article.contentSnippet || article.content || '';
      return `${title} ${content}`;
    })
    .join(' ')
    .toLowerCase();
  
  // STEP 2: Extract and segment article sentences
  // -------------------------------------------
  
  // Extract individual sentences from all articles
  const sentences: string[] = [];
  relevantArticles.forEach(article => {
    const title = article.title || '';
    const content = article.contentSnippet || article.content || '';
    
    // Split content into individual sentences using punctuation as delimiters
    const articleSentences = (title + '. ' + content)
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")  // Mark sentence boundaries
      .split("|")                              // Split into individual sentences
      .map(s => s.trim())                      // Clean up whitespace
      .filter(s => s.length > 15 && s.length < 200); // Filter out very short or long sentences
    
    // Add sentences to our collection
    sentences.push(...articleSentences);
  });
  
  // STEP 3: Score sentences for relevance to query
  // --------------------------------------------
  
  // Extract meaningful words from the query (filtering out short words)
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  // Score each sentence based on relevance to the query
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Score based on query word matches
    queryWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 1;
    });
    
    // Give bonus points to sentences containing phrases that indicate claims
    const claimPhrases = ['according to', 'claimed that', 'states that', 'reported', 'shows that'];
    claimPhrases.forEach(phrase => {
      if (lowerSentence.includes(phrase)) score += 0.5;
    });
    
    return { sentence, score };
  });
  
  // STEP 4: Select top sentences and create summary
  // ---------------------------------------------
  
  // Sort sentences by score (highest first)
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Take the top 3 highest-scoring sentences
  const topSentences = scoredSentences.slice(0, 3).map(item => item.sentence);
  
  // Combine the top sentences into a coherent summary
  let summary = topSentences.join(' ');
  
  // Truncate if the summary is too long
  if (summary.length > 300) {
    summary = summary.substring(0, 297) + '...';  // Add ellipsis if truncated
  }
  
  // Return the summary or a fallback message if no sentences matched
  return summary || `Information related to: "${query}"`;
}

/**
 * Example usage pattern (commented out to prevent automatic execution when importing)
 * This shows how the various functions can be chained together to perform a complete fact-check
 */
/*
(async () => {
  // Step 1: Fetch all articles from configured RSS feeds
  const allArticles = await fetchAllRSSFeeds();
  console.log('All Articles:', allArticles.length);

  // Step 2: Filter articles to find those relevant to the query
  const query = 'Trump Iran policy';
  const relevantArticles = filterRelevantArticles(allArticles, query);
  console.log('Relevant Articles:', relevantArticles.length);

  // Step 3: Analyze the articles and make a fact-check decision
  const factCheckDecision = makeFactCheckDecision(relevantArticles);
  console.log('Fact Check Decision:', factCheckDecision);
})();
*/
