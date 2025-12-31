/**
 * Quality Metrics Collection Service (Phase 1)
 * File-based storage for rapid deployment
 */

import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/quality-metrics');

export interface ErrorRecord {
  errorId: string;
  agentId: string;
  taskId: string;
  taskType: string;
  errorCategory: 'DATA_ACCURACY' | 'LINK_VALIDATION' | 'METHODOLOGY' | 'HALLUCINATION' | 'CALCULATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  originalContent: string;
  expectedContent?: string;
  detectedBy: string;
  confidence: number;
  userImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  status: 'DETECTED' | 'IN_CORRECTION' | 'CORRECTED' | 'VERIFIED' | 'CLOSED';
}

export interface QualityMetricsRecord {
  metricId: string;
  agentId: string;
  taskId: string;
  taskType: string;
  overallScore: number;
  accuracyScore: number;
  completenessScore: number;
  relevanceScore: number;
  methodologyScore: number;
  totalErrors: number;
  criticalErrors: number;
  highErrors: number;
  mediumErrors: number;
  lowErrors: number;
  reviewDuration: number;
  correctionCycles: number;
  reviewerConfidence: number;
  timestamp: Date;
}

export interface EfficiencyRecord {
  trackingId: string;
  agentId: string;
  taskId: string;
  taskType: string;
  controlDuration: number;
  treatmentDuration: number;
  generationTime: number;
  reviewTime: number;
  correctionTime: number;
  verificationTime: number;
  timeIncrease: number;
  timeIncreasePercentage: number;
  newEfficiencyRatio: number;
  efficiencyLoss: number;
  qualityImprovement: number;
  propertyComplexity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
}

export class QualityMetricsService {
  private errorsFile: string;
  private metricsFile: string;
  private efficiencyFile: string;
  
  constructor() {
    this.errorsFile = path.join(DATA_DIR, 'errors.json');
    this.metricsFile = path.join(DATA_DIR, 'metrics.json');
    this.efficiencyFile = path.join(DATA_DIR, 'efficiency.json');
  }
  
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await this.initializeFile(this.errorsFile, []);
      await this.initializeFile(this.metricsFile, []);
      await this.initializeFile(this.efficiencyFile, []);
      console.log('Quality metrics storage initialized');
    } catch (error) {
      console.error('Error initializing quality metrics storage:', error);
      throw error;
    }
  }
  
  private async initializeFile(filePath: string, defaultData: any): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }
  
  async recordError(error: Omit<ErrorRecord, 'errorId' | 'timestamp' | 'status'>): Promise<string> {
    try {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const errorRecord: ErrorRecord = {
        ...error,
        errorId,
        timestamp: new Date(),
        status: 'DETECTED'
      };
      
      const errors = await this.loadData<ErrorRecord>(this.errorsFile);
      errors.push(errorRecord);
      await this.saveData(this.errorsFile, errors);
      
      console.log(`Error recorded: ${errorId} - ${error.errorCategory} - ${error.severity}`);
      return errorId;
    } catch (error) {
      console.error('Error recording error:', error);
      throw new Error(`Failed to record error: ${error}`);
    }
  }
  
  async recordQualityMetrics(metrics: Omit<QualityMetricsRecord, 'metricId' | 'timestamp'>): Promise<void> {
    try {
      const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const metricsRecord: QualityMetricsRecord = {
        ...metrics,
        metricId,
        timestamp: new Date()
      };
      
      const allMetrics = await this.loadData<QualityMetricsRecord>(this.metricsFile);
      allMetrics.push(metricsRecord);
      await this.saveData(this.metricsFile, allMetrics);
      
      console.log(`Quality metrics recorded for task: ${metrics.taskId}`);
    } catch (error) {
      console.error('Error recording quality metrics:', error);
      throw new Error(`Failed to record quality metrics: ${error}`);
    }
  }
  
  async recordEfficiencyImpact(efficiency: Omit<EfficiencyRecord, 'trackingId' | 'timeIncrease' | 'timeIncreasePercentage' | 'newEfficiencyRatio' | 'efficiencyLoss' | 'timestamp'>): Promise<void> {
    try {
      const trackingId = `eff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const timeIncrease = efficiency.treatmentDuration - efficiency.controlDuration;
      const timeIncreasePercentage = (timeIncrease / efficiency.controlDuration) * 100;
      const newEfficiencyRatio = (960 * 60) / efficiency.treatmentDuration;
      const efficiencyLoss = ((160 - newEfficiencyRatio) / 160) * 100;
      
      const efficiencyRecord: EfficiencyRecord = {
        ...efficiency,
        trackingId,
        timeIncrease,
        timeIncreasePercentage,
        newEfficiencyRatio,
        efficiencyLoss,
        timestamp: new Date()
      };
      
      const allEfficiency = await this.loadData<EfficiencyRecord>(this.efficiencyFile);
      allEfficiency.push(efficiencyRecord);
      await this.saveData(this.efficiencyFile, allEfficiency);
      
      console.log(`Efficiency impact recorded: ${newEfficiencyRatio.toFixed(1)}:1 ratio (${efficiencyLoss.toFixed(1)}% loss)`);
    } catch (error) {
      console.error('Error recording efficiency impact:', error);
      throw new Error(`Failed to record efficiency impact: ${error}`);
    }
  }

  async getDashboardMetrics(): Promise<{
    totalTasks: number;
    totalErrors: number;
    errorRate: number;
    avgQualityScore: number;
    avgEfficiencyRatio: number;
    avgResolutionTime: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    agentPerformance: any[];
    efficiencyTrend: any[];
    lastUpdated: Date;
  }> {
    try {
      const errors = await this.loadData<ErrorRecord>(this.errorsFile);
      const metrics = await this.loadData<QualityMetricsRecord>(this.metricsFile);
      const efficiency = await this.loadData<EfficiencyRecord>(this.efficiencyFile);
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentErrors = errors.filter(e => new Date(e.timestamp) > sevenDaysAgo);
      const recentMetrics = metrics.filter(m => new Date(m.timestamp) > sevenDaysAgo);
      const recentEfficiency = efficiency.filter(e => new Date(e.timestamp) > sevenDaysAgo);
      
      const totalTasks = new Set(recentMetrics.map(m => m.taskId)).size;
      const totalErrors = recentErrors.length;
      const errorRate = totalTasks > 0 ? (totalErrors / totalTasks) * 100 : 0;
      const avgQualityScore = recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.overallScore, 0) / recentMetrics.length 
        : 85;
      const avgEfficiencyRatio = recentEfficiency.length > 0
        ? recentEfficiency.reduce((sum, e) => sum + e.newEfficiencyRatio, 0) / recentEfficiency.length
        : 160;
      
      const errorsByCategory: Record<string, number> = {};
      recentErrors.forEach(e => {
        errorsByCategory[e.errorCategory] = (errorsByCategory[e.errorCategory] || 0) + 1;
      });
      
      const errorsBySeverity: Record<string, number> = {};
      recentErrors.forEach(e => {
        errorsBySeverity[e.severity] = (errorsBySeverity[e.severity] || 0) + 1;
      });
      
      return {
        totalTasks,
        totalErrors,
        errorRate,
        avgQualityScore,
        avgEfficiencyRatio,
        avgResolutionTime: 0,
        errorsByCategory,
        errorsBySeverity,
        agentPerformance: [],
        efficiencyTrend: [],
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw new Error(`Failed to get dashboard metrics: ${error}`);
    }
  }
  
  private async loadData<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }
  
  private async saveData(filePath: string, data: any[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving data to ${filePath}:`, error);
      throw error;
    }
  }
}

export const qualityMetricsService = new QualityMetricsService();
