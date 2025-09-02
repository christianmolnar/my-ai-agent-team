import { Agent, AgentTask, AgentTaskResult } from './Agent';

export class VinylResearcherAgent implements Agent {
  id = 'vinyl-researcher';
  name = 'Vinyl Researcher';
  description = 'Lookup vinyl record info, prices, and metadata.';
  abilities = [
    'Search for vinyl records by artist, album, or catalog number',
    'Retrieve detailed record information from Discogs database',
    'Get current market prices and value estimates',
    'Find release dates, pressing details, and track listings',
    'Identify rare and collectible pressings',
    'Compare different pressings and editions',
    'Provide condition grading information',
    'Research vinyl record history and discography'
  ];

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      console.log(`[VinylResearcherAgent] Executing task: ${task.type}`);
      
      // For now, return instructions to use the web interface
      // The vinyl research functionality is implemented in the /vinyl-info-page component
      // which uses the /api/vinyl endpoint to query the Discogs API
      
      const result = {
        success: true,
        result: `Vinyl research task received. Please use the web interface at /vinyl-info-page to lookup vinyl record information.

Available capabilities:
- Search by artist, album, or catalog number
- Get detailed record information from Discogs
- View current market prices and values
- See pressing details and track listings
- Identify collectible and rare editions

The research uses the Discogs API to provide accurate and up-to-date vinyl record data including pricing, condition guides, and market trends.`,
        metadata: {
          agent: this.name,
          capabilities: this.abilities,
          webInterface: '/vinyl-info-page',
          apiEndpoint: '/api/vinyl',
          dataSource: 'Discogs API'
        }
      };

      console.log(`[VinylResearcherAgent] Task completed successfully`);
      return result;
    } catch (error) {
      console.error(`[VinylResearcherAgent] Error executing task:`, error);
      return {
        success: false,
        result: null,
        error: `Failed to process vinyl research task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
