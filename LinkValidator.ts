// Link & Reference Validator - Quality Control System
// Project: Quality Assurance System Implementation
// Date: December 28, 2025

export interface LinkError {
  errorType: 'BROKEN_URL' | 'INCOMPLETE_URL' | 'INVALID_FORMAT' | 'MISSING_REFERENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  description: string;
  suggestedFix: string;
  confidence: number;
}

export interface LinkValidationResult {
  reviewId: string;
  timestamp: Date;
  overallScore: number;
  errors: LinkError[];
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  correctionSuggestions: string[];
}

export class LinkValidator {
  private reviewId: string;
  
  constructor() {
    this.reviewId = `link-validator-${Date.now()}`;
  }

  /**
   * Validate all links and references in content
   */
  async validateContent(content: string): Promise<LinkValidationResult> {
    const errors: LinkError[] = [];
    
    // Extract all URLs from content
    const urls = this.extractUrls(content);
    
    // Validate each URL
    for (const urlData of urls) {
      const urlErrors = await this.validateUrl(urlData);
      errors.push(...urlErrors);
    }
    
    // Check for missing critical references
    const missingRefErrors = await this.checkMissingReferences(content);
    errors.push(...missingRefErrors);
    
    const overallScore = this.calculateScore(errors);
    const recommendation = this.generateRecommendation(overallScore, errors);
    
    return {
      reviewId: this.reviewId,
      timestamp: new Date(),
      overallScore,
      errors,
      recommendation,
      correctionSuggestions: this.generateCorrectionSuggestions(errors)
    };
  }

  private extractUrls(content: string): Array<{text: string; url: string; location: string; type: string}> {
    const urls: Array<{text: string; url: string; location: string; type: string}> = [];
    
    // Extract markdown links [text](url)
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (markdownLinks) {
      markdownLinks.forEach(link => {
        const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          urls.push({
            text: match[1],
            url: match[2],
            location: `Markdown link: "${match[1]}"`,
            type: 'markdown'
          });
        }
      });
    }
    
    // Extract direct URLs
    const directUrls = content.match(/https?:\/\/[^\s\)]+/g);
    if (directUrls) {
      directUrls.forEach(url => {
        urls.push({
          text: url,
          url: url,
          location: `Direct URL: ${url}`,
          type: 'direct'
        });
      });
    }
    
    return urls;
  }

  private async validateUrl(urlData: any): Promise<LinkError[]> {
    const errors: LinkError[] = [];
    const url = urlData.url;
    
    // Check for incomplete URLs
    if (url.includes('homedetails/') && !url.includes('/zpid/')) {
      errors.push({
        errorType: 'INCOMPLETE_URL',
        severity: 'HIGH',
        location: urlData.location,
        description: 'Zillow URL appears incomplete - missing property ID',
        suggestedFix: 'Complete the Zillow URL with specific property ID (e.g., /homedetails/123-main-st/12345_zpid/)',
        confidence: 0.9
      });
    }
    
    // Check for placeholder URLs
    if (url.endsWith('homedetails/') || url === 'https://www.zillow.com/homedetails/') {
      errors.push({
        errorType: 'INCOMPLETE_URL',
        severity: 'CRITICAL',
        location: urlData.location,
        description: 'URL is a placeholder and does not link to specific property',
        suggestedFix: 'Replace with actual property URL from Zillow or remove the link',
        confidence: 1.0
      });
    }
    
    // Check Google Maps URLs
    if (url.includes('google.com/maps') && !url.includes('query=')) {
      errors.push({
        errorType: 'INCOMPLETE_URL',
        severity: 'MEDIUM',
        location: urlData.location,
        description: 'Google Maps URL missing search query parameter',
        suggestedFix: 'Add proper address query parameter to Google Maps URL',
        confidence: 0.85
      });
    }
    
    return errors;
  }

  private async checkMissingReferences(content: string): Promise<LinkError[]> {
    const errors: LinkError[] = [];
    
    // Check for property address without proper links
    const hasAddress = /\d{4,5}[^,]*(?:Ave|St|Dr|Ln|Ct|Blvd|Way|Pl)[^,]*,\s*[A-Z]{2}/.test(content);
    const hasZillowLink = content.includes('zillow.com');
    const hasMapLink = content.includes('google.com/maps');
    
    if (hasAddress && !hasZillowLink) {
      errors.push({
        errorType: 'MISSING_REFERENCE',
        severity: 'HIGH',
        location: 'Property links section',
        description: 'Property analysis missing Zillow listing link',
        suggestedFix: 'Add functional Zillow listing URL for property verification',
        confidence: 0.9
      });
    }
    
    if (hasAddress && !hasMapLink) {
      errors.push({
        errorType: 'MISSING_REFERENCE',
        severity: 'MEDIUM',
        location: 'Property links section',
        description: 'Property analysis missing Google Maps link',
        suggestedFix: 'Add Google Maps link with property address for location reference',
        confidence: 0.8
      });
    }
    
    return errors;
  }

  private calculateScore(errors: LinkError[]): number {
    let score = 100;
    
    errors.forEach(error => {
      switch (error.severity) {
        case 'CRITICAL': score -= 30; break;
        case 'HIGH': score -= 20; break;
        case 'MEDIUM': score -= 10; break;
        case 'LOW': score -= 5; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generateRecommendation(score: number, errors: LinkError[]): 'APPROVE' | 'REVISE' | 'REJECT' {
    const criticalErrors = errors.filter(e => e.severity === 'CRITICAL').length;
    const highErrors = errors.filter(e => e.severity === 'HIGH').length;
    
    if (criticalErrors > 0 || score < 40) return 'REJECT';
    if (highErrors > 1 || score < 70) return 'REVISE';
    return 'APPROVE';
  }

  private generateCorrectionSuggestions(errors: LinkError[]): string[] {
    return errors.map(error => `${error.location}: ${error.suggestedFix}`);
  }
}
