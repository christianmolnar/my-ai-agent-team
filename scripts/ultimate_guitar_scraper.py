#!/usr/bin/env python3
"""
Real Ultimate Guitar scraper for guitar tabs
Based on Ultimate Guitar's public search functionality
"""

import requests
import json
import sys
import re
from bs4 import BeautifulSoup
from urllib.parse import quote, urljoin
import time

class UltimateGuitarScraper:
    def __init__(self):
        self.base_url = "https://www.ultimate-guitar.com"
        self.search_url = "https://www.ultimate-guitar.com/search.php"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def search_tabs(self, query, tab_type="tab", limit=10):
        """Search for guitar tabs on Ultimate Guitar"""
        try:
            # Try the new API-style search first
            api_url = f"https://www.ultimate-guitar.com/search.php?search_type=title&value={quote(query)}"
            
            print(f"Searching for: {query}", file=sys.stderr)
            
            response = self.session.get(api_url, timeout=15)
            response.raise_for_status()
            
            print(f"Response status: {response.status_code}", file=sys.stderr)
            
            # Parse the search results page
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for the data-content attribute in the js-store div
            store_div = soup.find('div', class_='js-store')
            if not store_div:
                print("No js-store div found", file=sys.stderr)
                return []
            
            data_content = store_div.get('data-content')
            if not data_content:
                print("No data-content attribute found", file=sys.stderr)
                return []
            
            # The data is HTML-encoded JSON, so we need to decode it
            import html
            decoded_data = html.unescape(data_content)
            
            try:
                page_data = json.loads(decoded_data)
                print("Successfully parsed JSON data", file=sys.stderr)
                
                # Navigate to the search results
                if 'store' in page_data and 'page' in page_data['store']:
                    page_info = page_data['store']['page']
                    if 'data' in page_info and 'results' in page_info['data']:
                        results = page_info['data']['results']
                        print(f"Found {len(results)} search results", file=sys.stderr)
                        
                        tabs = []
                        for result in results[:limit]:
                            # Extract tab info from result
                            tab_info = {
                                'title': result.get('song_name', ''),
                                'artist': result.get('artist_name', ''),
                                'type': result.get('type', 'tab'),
                                'rating': result.get('rating', 0),
                                'votes': result.get('votes', 0),
                                'url': result.get('tab_url', ''),
                                'difficulty': result.get('difficulty', ''),
                                'id': str(result.get('id', result.get('tab_id', '')))
                            }
                            
                            # Only add if we have essential info
                            if tab_info['title'] and tab_info['artist']:
                                tabs.append(tab_info)
                        
                        return tabs
                        
                else:
                    print("Could not find search results in page data structure", file=sys.stderr)
            
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {e}", file=sys.stderr)
                
            return []
            
        except Exception as e:
            print(f"Error searching tabs: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            return []

    def _extract_tabs_from_json(self, results_data, limit):
        """Extract tab info from JSON results"""
        tabs = []
        
        if not isinstance(results_data, list):
            return tabs
            
        for result in results_data[:limit]:
            if not isinstance(result, dict):
                continue
                
            tab_info = {
                'title': result.get('title', result.get('song_name', '')),
                'artist': result.get('artist_name', result.get('artist', '')),
                'type': result.get('type', 'tab'),
                'rating': result.get('rating', result.get('votes', 0)),
                'votes': result.get('votes', 0),
                'url': result.get('tab_url', result.get('url', '')),
                'difficulty': result.get('part', result.get('difficulty', '')),
                'id': result.get('id', str(result.get('tab_id', '')))
            }
            
            # Ensure we have at least title and artist
            if tab_info['title'] and tab_info['artist']:
                tabs.append(tab_info)
        
        return tabs

    def _parse_html_results(self, soup, limit):
        """Fallback HTML parsing if JSON extraction fails"""
        tabs = []
        
        print("Parsing HTML for results...", file=sys.stderr)
        
        # Look for various possible result containers
        selectors_to_try = [
            'tr[data-id]',  # Table rows with data-id
            '.search-result',  # Result divs
            '.js-result',  # JS result elements
            'tr[class*="search"]',  # Any tr with search in class
            'div[class*="search"]',  # Any div with search in class
            'a[href*="/tab/"]',  # Direct links to tabs
        ]
        
        for selector in selectors_to_try:
            elements = soup.select(selector)
            print(f"Found {len(elements)} elements with selector '{selector}'", file=sys.stderr)
            
            if elements:
                for element in elements[:limit*2]:  # Get extra in case some fail
                    try:
                        tab_info = self._extract_tab_from_element(element)
                        if tab_info and tab_info.get('title') and tab_info.get('artist'):
                            tabs.append(tab_info)
                            if len(tabs) >= limit:
                                break
                    except Exception as e:
                        print(f"Error extracting from element: {e}", file=sys.stderr)
                        continue
                
                if tabs:
                    break
        
        print(f"Extracted {len(tabs)} tabs from HTML", file=sys.stderr)
        return tabs

    def _extract_tab_from_element(self, element):
        """Extract tab info from a single HTML element"""
        tab_info = {}
        
        # Find title/song link
        title_link = element.find('a', href=re.compile(r'/tab/'))
        if not title_link:
            # Maybe the element itself is the link
            if element.name == 'a' and '/tab/' in element.get('href', ''):
                title_link = element
        
        if title_link:
            tab_info['title'] = title_link.get_text().strip()
            tab_info['url'] = urljoin(self.base_url, title_link.get('href'))
            tab_info['id'] = tab_info['url'].split('/')[-1] if tab_info['url'] else ''
        
        # Try to find artist - could be in various places
        artist_candidates = [
            element.find(attrs={'class': re.compile(r'artist', re.I)}),
            element.find('td', {'class': lambda x: x and 'artist' in x.lower()}),
            element.find('div', {'class': lambda x: x and 'artist' in x.lower()}),
            element.find('span', {'class': lambda x: x and 'artist' in x.lower()}),
        ]
        
        artist = "Unknown"
        for candidate in artist_candidates:
            if candidate and candidate.get_text().strip():
                artist = candidate.get_text().strip()
                break
        
        # If no specific artist element, try to extract from title or nearby text
        if artist == "Unknown" and tab_info.get('title'):
            # Sometimes format is "Artist - Song"
            title_parts = tab_info['title'].split(' - ')
            if len(title_parts) >= 2:
                artist = title_parts[0]
                tab_info['title'] = ' - '.join(title_parts[1:])
        
        tab_info['artist'] = artist
        tab_info['type'] = 'tab'
        tab_info['rating'] = 0
        tab_info['votes'] = 0
        tab_info['difficulty'] = ''
        
        return tab_info

    def get_tab_content(self, tab_url):
        """Get the actual tab content from a tab URL"""
        try:
            response = self.session.get(tab_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for tab content in various possible containers
            tab_content = None
            
            # Try to find pre-formatted tab content
            pre_elements = soup.find_all('pre')
            for pre in pre_elements:
                content = pre.get_text()
                if self._looks_like_tab_content(content):
                    tab_content = content
                    break
            
            if not tab_content:
                # Look for JavaScript data containing tab content
                scripts = soup.find_all('script')
                for script in scripts:
                    if script.string and 'tab_view' in script.string:
                        # Try to extract tab content from JS
                        match = re.search(r'"content":"([^"]*)"', script.string)
                        if match:
                            # Decode the content (it might be escaped)
                            content = match.group(1).encode().decode('unicode_escape')
                            if self._looks_like_tab_content(content):
                                tab_content = content
                                break
            
            return {
                'success': True,
                'content': tab_content,
                'url': tab_url,
                'title': soup.find('title').get_text() if soup.find('title') else 'Unknown'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'url': tab_url
            }

    def _looks_like_tab_content(self, content):
        """Check if content looks like guitar tablature"""
        if not content or len(content.strip()) < 20:
            return False
            
        # Look for common tab patterns
        tab_indicators = [
            'e|---', 'B|---', 'G|---', 'D|---', 'A|---', 'E|---',  # Standard tuning
            '|---', '|--', '|-',  # General tab lines
            '[Verse]', '[Chorus]', '[Bridge]',  # Song sections
            'Capo', 'Tuning:', 'BPM'  # Tab metadata
        ]
        
        content_lower = content.lower()
        for indicator in tab_indicators:
            if indicator.lower() in content_lower:
                return True
                
        return False

    def search_and_get_tabs(self, query, limit=5, include_content=False):
        """Complete workflow: search and optionally get tab content"""
        search_results = self.search_tabs(query, limit=limit)
        
        if include_content:
            for tab in search_results:
                if tab.get('url'):
                    content_result = self.get_tab_content(tab['url'])
                    tab['tab_content'] = content_result
                    time.sleep(1)  # Be respectful to the server
        
        return search_results

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ultimate_guitar_scraper.py <search_query> [limit] [include_content]")
        sys.exit(1)
    
    query = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    include_content = len(sys.argv) > 3 and sys.argv[3].lower() in ['true', '1', 'yes']
    
    scraper = UltimateGuitarScraper()
    results = scraper.search_and_get_tabs(query, limit=limit, include_content=include_content)
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
