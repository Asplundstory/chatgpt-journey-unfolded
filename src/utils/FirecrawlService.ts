import FirecrawlApp from '@mendable/firecrawl-js';

export class FirecrawlService {
  private static firecrawlApp: FirecrawlApp | null = null;

  static initialize(apiKey: string): void {
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static async scrapeSystembolagetLaunches(): Promise<{ success: boolean; error?: string; data?: any[] }> {
    if (!this.firecrawlApp) {
      return { success: false, error: 'Firecrawl not initialized' };
    }

    try {
      console.log('Scraping Systembolaget launch page');
      
      // Scrape the main launch page
      const launchPageResponse = await this.firecrawlApp.scrape('https://www.systembolaget.se/sortiment/lanseringskalender/');

      return { 
        success: true,
        data: [launchPageResponse] 
      };
    } catch (error) {
      console.error('Error during Firecrawl scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape Systembolaget' 
      };
    }
  }

  static async downloadAndParseExcel(excelUrl: string): Promise<{ success: boolean; error?: string; data?: any }> {
    if (!this.firecrawlApp) {
      return { success: false, error: 'Firecrawl not initialized' };
    }

    try {
      console.log('Downloading and parsing Excel:', excelUrl);
      
      // Use Firecrawl to extract data from Excel files
      const response = await this.firecrawlApp.scrape(excelUrl);

      return { 
        success: true,
        data: response 
      };
    } catch (error) {
      console.error('Error parsing Excel:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse Excel file' 
      };
    }
  }
}