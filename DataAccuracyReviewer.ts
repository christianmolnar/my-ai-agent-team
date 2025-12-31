// Data Accuracy Reviewer - Real Estate Analysis Quality Control
// Project: Quality Assurance System Implementation
// Date: December 28, 2025

export interface ReviewError {
  errorType: 'CALCULATION' | 'DATA' | 'LOGIC' | 'INCONSISTENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  description: string;
  suggestedFix: string;
  confidence: number;
}

export interface DataAccuracyResult {
  reviewId: string;
  timestamp: Date;
  overallScore: number; // 0-100
  errors: ReviewError[];
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  correctionSuggestions: string[];
}

export class DataAccuracyReviewer {
  private reviewId: string;
  
  constructor() {
    this.reviewId = `data-accuracy-${Date.now()}`;
  }

  /**
   * Review real estate investment analysis for data accuracy
   */
  async reviewRealEstateAnalysis(content: string): Promise<DataAccuracyResult> {
    const errors: ReviewError[] = [];
    
    // Extract financial data from content
    const financialData = this.extractFinancialData(content);
    
    // Check calculations
    const calculationErrors = await this.validateCalculations(financialData);
    errors.push(...calculationErrors);
    
    // Check data consistency
    const consistencyErrors = await this.validateConsistency(financialData);
    errors.push(...consistencyErrors);
    
    // Check logical soundness
    const logicErrors = await this.validateLogic(financialData);
    errors.push(...logicErrors);
    
    // Calculate overall score
    const overallScore = this.calculateScore(errors);
    
    // Generate recommendation
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

  private extractFinancialData(content: string) {
    // Extract key financial metrics from markdown content
    const data: any = {};
    
    // Purchase price
    const priceMatch = content.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) data.purchasePrice = parseInt(priceMatch[1].replace(/,/g, ''));
    
    // Monthly rent
    const rentMatch = content.match(/\$(\d{1,3}(?:,\d{3})*)\/month.*rent/i);
    if (rentMatch) data.monthlyRent = parseInt(rentMatch[1].replace(/,/g, ''));
    
    // Monthly costs
    const costMatch = content.match(/TOTAL MONTHLY COSTS.*\$(\d{1,3}(?:,\d{3})*)\/month/);
    if (costMatch) data.totalMonthlyCosts = parseInt(costMatch[1].replace(/,/g, ''));
    
    // Cash flow
    const cashFlowMatch = content.match(/NET MONTHLY CASH FLOW.*[-$]*(\d{1,3}(?:,\d{3})*)\/month/);
    if (cashFlowMatch) {
      const isNegative = content.includes('-$') || content.includes('❌');
      data.netCashFlow = parseInt(cashFlowMatch[1].replace(/,/g, '')) * (isNegative ? -1 : 1);
    }
    
    return data;
  }

  private async validateCalculations(data: any): Promise<ReviewError[]> {
    const errors: ReviewError[] = [];
    
    // Validate cash flow calculation
    if (data.monthlyRent && data.totalMonthlyCosts) {
      const expectedCashFlow = data.monthlyRent - data.totalMonthlyCosts;
      
      if (data.netCashFlow && Math.abs(data.netCashFlow - expectedCashFlow) > 10) {
        errors.push({
          errorType: 'CALCULATION',
          severity: 'HIGH',
          location: 'Cash Flow Calculation',
          description: `Cash flow calculation appears incorrect. Expected ${expectedCashFlow}, found ${data.netCashFlow}`,
          suggestedFix: `Verify: Monthly Rent (${data.monthlyRent}) - Monthly Costs (${data.totalMonthlyCosts}) = ${expectedCashFlow}`,
          confidence: 0.9
        });
      }
    }
    
    return errors;
  }

  private async validateConsistency(data: any): Promise<ReviewError[]> {
    const errors: ReviewError[] = [];
    
    // Check for internal consistency
    if (data.netCashFlow < 0 && !data.content?.includes('NEGATIVE')) {
      errors.push({
        errorType: 'INCONSISTENCY',
        severity: 'MEDIUM',
        location: 'Investment Verdict',
        description: 'Negative cash flow not clearly indicated in summary',
        suggestedFix: 'Ensure negative cash flow is clearly marked in verdict and summary',
        confidence: 0.8
      });
    }
    
    return errors;
  }

  private async validateLogic(data: any): Promise<ReviewError[]> {
    const errors: ReviewError[] = [];
    
    // Check logical investment conclusions
    if (data.netCashFlow < -200 && !data.content?.includes('AVOID')) {
      errors.push({
        errorType: 'LOGIC',
        severity: 'HIGH',
        location: 'Investment Recommendation',
        description: 'Significantly negative cash flow should result in AVOID recommendation',
        suggestedFix: 'Update recommendation to clearly state AVOID for properties with cash flow below -$200/month',
        confidence: 0.95
      });
    }
    
    return errors;
  }

  private calculateScore(errors: ReviewError[]): number {
    let score = 100;
    
    errors.forEach(error => {
      switch (error.severity) {
        case 'CRITICAL': score -= 25; break;
        case 'HIGH': score -= 15; break;
        case 'MEDIUM': score -= 8; break;
        case 'LOW': score -= 3; break;
      }
    });
    
    return Math.max(0, score);
  }

  private generateRecommendation(score: number, errors: ReviewError[]): 'APPROVE' | 'REVISE' | 'REJECT' {
    const criticalErrors = errors.filter(e => e.severity === 'CRITICAL').length;
    const highErrors = errors.filter(e => e.severity === 'HIGH').length;
    
    if (criticalErrors > 0 || score < 50) return 'REJECT';
    if (highErrors > 0 || score < 80) return 'REVISE';
    return 'APPROVE';
  }

  private generateCorrectionSuggestions(errors: ReviewError[]): string[] {
    return errors.map(error => `${error.location}: ${error.suggestedFix}`);
  }
}
