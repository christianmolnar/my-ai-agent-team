/**
 * Time Estimation Engine - Phase 2 Implementation
 * 
 * Intelligent time prediction system based on validated 160:1 efficiency ratio
 * with learning capabilities and real-time adjustment
 */

import { Agent, AgentTask, AgentTaskResult } from '../../agents/agent';

export interface TaskComplexity {
  dataRequirements: 'simple' | 'moderate' | 'complex';
  agentCoordination: 'single' | 'parallel' | 'sequential' | 'mixed';
  qualityRequirements: 'basic' | 'professional' | 'enterprise';
  novelty: 'routine' | 'adaptation' | 'innovation';
}

export interface TimeEstimate {
  estimatedDuration: number; // milliseconds
  confidenceInterval: { min: number; max: number };
  efficiencyRatio: number;
  qualityPrediction: number; // 0-100%
  riskFactors: RiskAssessment[];
  basedOn: EstimationSource[];
  created: Date;
}

export interface RiskAssessment {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  probability: number; // 0-100%
  mitigation: string;
}

export interface EstimationSource {
  type: 'historical' | 'baseline' | 'similar_project' | 'agent_analysis';
  data: any;
  confidence: number; // 0-100%
}

export interface ProjectHistory {
  projectId: string;
  taskType: string;
  complexity: TaskComplexity;
  estimatedTime: number;
  actualTime: number;
  qualityScore: number;
  agentsUsed: string[];
  coordinationEvents: number;
  completedDate: Date;
}

export class TimeEstimationEngine {
  private historicalData: ProjectHistory[] = [];
  private baselineEfficiency = 160; // Validated 160:1 ratio
  private learningModel: any = null;

  constructor() {
    // Initialize with baseline data from Phase 1 validation
    this.initializeBaseline();
  }

  /**
   * Main estimation function - predicts time for agent tasks
   */
  async estimateTaskTime(
    task: AgentTask, 
    complexity: TaskComplexity, 
    agentIds: string[] = []
  ): Promise<TimeEstimate> {
    
    console.log(`⏱️  Estimating time for task: ${task.type}`);
    
    // Step 1: Calculate base time using traditional estimates
    const traditionalTime = this.calculateTraditionalTime(task, complexity);
    
    // Step 2: Apply efficiency ratio with complexity adjustments
    const efficiencyRatio = this.calculateEfficiencyRatio(complexity, agentIds.length);
    
    // Step 3: Factor in coordination overhead
    const coordinationOverhead = this.estimateCoordinationOverhead(agentIds, complexity);
    
    // Step 4: Apply learning model adjustments if available
    const learningAdjustment = this.applyLearningModel(task, complexity);
    
    // Step 5: Calculate final estimate
    const baseEstimate = traditionalTime / efficiencyRatio;
    const adjustedEstimate = (baseEstimate + coordinationOverhead) * learningAdjustment;
    
    // Step 6: Calculate confidence intervals
    const confidence = this.calculateConfidence(task, complexity, agentIds);
    const variance = adjustedEstimate * (1 - confidence / 100) * 0.5;
    
    const estimate: TimeEstimate = {
      estimatedDuration: Math.round(adjustedEstimate),
      confidenceInterval: {
        min: Math.round(adjustedEstimate - variance),
        max: Math.round(adjustedEstimate + variance)
      },
      efficiencyRatio: efficiencyRatio,
      qualityPrediction: this.predictQuality(complexity, efficiencyRatio),
      riskFactors: this.assessRisks(task, complexity, agentIds),
      basedOn: this.getEstimationSources(task, complexity),
      created: new Date()
    };

    console.log(`✅ Estimated duration: ${Math.round(adjustedEstimate/1000)}s (${efficiencyRatio}:1 efficiency)`);
    
    return estimate;
  }

  /**
   * Calculate traditional time (human baseline)
   */
  private calculateTraditionalTime(task: AgentTask, complexity: TaskComplexity): number {
    let baseTime = 0; // milliseconds
    
    // Base time by task type
    switch (task.type) {
      case 'research':
        baseTime = 2 * 60 * 60 * 1000; // 2 hours
        break;
      case 'analysis':
        baseTime = 4 * 60 * 60 * 1000; // 4 hours
        break;
      case 'communication':
        baseTime = 1 * 60 * 60 * 1000; // 1 hour
        break;
      case 'development':
        baseTime = 8 * 60 * 60 * 1000; // 8 hours
        break;
      case 'orchestrate':
      case 'orchestrate-with-review':
        baseTime = 8 * 60 * 60 * 1000; // 8 hours for complex coordination
        break;
      default:
        baseTime = 2 * 60 * 60 * 1000; // 2 hours default
    }
    
    // Complexity multipliers
    const complexityMultiplier = {
      simple: 0.5,
      moderate: 1.0,
      complex: 2.0
    };
    
    const qualityMultiplier = {
      basic: 0.7,
      professional: 1.0,
      enterprise: 1.5
    };
    
    const noveltyMultiplier = {
      routine: 0.8,
      adaptation: 1.0,
      innovation: 1.8
    };
    
    return baseTime * 
           complexityMultiplier[complexity.dataRequirements] *
           qualityMultiplier[complexity.qualityRequirements] *
           noveltyMultiplier[complexity.novelty];
  }

  /**
   * Calculate efficiency ratio based on complexity and agent count
   */
  private calculateEfficiencyRatio(complexity: TaskComplexity, agentCount: number): number {
    let baseRatio = this.baselineEfficiency; // 160:1 baseline
    
    // Agent coordination efficiency
    const coordinationEfficiency = {
      'single': 0.8,    // Single agent is less efficient than coordinated
      'parallel': 1.2,  // Parallel coordination adds efficiency
      'sequential': 1.0, // Sequential is baseline
      'mixed': 1.4      // Mixed coordination is most efficient
    };
    
    // Agent count scaling (more agents = higher efficiency up to a point)
    const agentScaling = Math.min(1.0 + (agentCount - 1) * 0.1, 1.5);
    
    // Quality requirements scaling
    const qualityScaling = {
      'basic': 1.1,        // Less validation = faster
      'professional': 1.0,  // Baseline
      'enterprise': 0.9     // More validation = slightly slower
    };
    
    return baseRatio * 
           coordinationEfficiency[complexity.agentCoordination] *
           agentScaling *
           qualityScaling[complexity.qualityRequirements];
  }

  /**
   * Estimate coordination overhead between agents
   */
  private estimateCoordinationOverhead(agentIds: string[], complexity: TaskComplexity): number {
    if (agentIds.length <= 1) return 0;
    
    // Base overhead per agent coordination (in milliseconds)
    const baseOverheadPerAgent = 5000; // 5 seconds per agent
    
    // Coordination complexity multiplier
    const complexityOverhead = {
      'single': 0,
      'parallel': 0.5,   // Parallel has less overhead
      'sequential': 1.0, // Sequential is baseline
      'mixed': 1.2       // Mixed coordination has more overhead
    };
    
    const agentCount = agentIds.length;
    const coordinationEvents = agentCount * (agentCount - 1) / 2; // n*(n-1)/2 potential interactions
    
    return baseOverheadPerAgent * 
           coordinationEvents * 
           complexityOverhead[complexity.agentCoordination];
  }

  /**
   * Apply machine learning model adjustments
   */
  private applyLearningModel(task: AgentTask, complexity: TaskComplexity): number {
    // For Phase 2 implementation, start with rule-based adjustments
    // This will be replaced with actual ML model as we gather data
    
    if (this.historicalData.length === 0) {
      return 1.0; // No adjustment if no learning data
    }
    
    // Find similar historical projects
    const similarProjects = this.historicalData.filter(project =>
      project.taskType === task.type &&
      project.complexity.qualityRequirements === complexity.qualityRequirements
    );
    
    if (similarProjects.length === 0) {
      return 1.0; // No adjustment if no similar projects
    }
    
    // Calculate average accuracy of past estimates
    const accuracyRatios = similarProjects.map(project =>
      project.actualTime / project.estimatedTime
    );
    
    const averageAccuracy = accuracyRatios.reduce((sum, ratio) => sum + ratio, 0) / accuracyRatios.length;
    
    // Adjust future estimates based on past accuracy
    return averageAccuracy;
  }

  /**
   * Calculate confidence level for estimate
   */
  private calculateConfidence(task: AgentTask, complexity: TaskComplexity, agentIds: string[]): number {
    let confidence = 85; // Base confidence (85%)
    
    // Reduce confidence for high complexity
    if (complexity.novelty === 'innovation') confidence -= 15;
    if (complexity.dataRequirements === 'complex') confidence -= 10;
    
    // Increase confidence for more agents (better coordination)
    if (agentIds.length >= 3) confidence += 5;
    
    // Increase confidence based on historical data
    const historicalSimilar = this.historicalData.filter(p => p.taskType === task.type);
    if (historicalSimilar.length >= 5) confidence += 10;
    
    return Math.min(Math.max(confidence, 50), 95); // Clamp between 50-95%
  }

  /**
   * Predict quality score based on complexity and efficiency
   */
  private predictQuality(complexity: TaskComplexity, efficiencyRatio: number): number {
    let baseQuality = 90; // High base quality from agent coordination
    
    // Quality requirements adjustment
    if (complexity.qualityRequirements === 'enterprise') baseQuality += 5;
    if (complexity.qualityRequirements === 'basic') baseQuality -= 5;
    
    // Efficiency vs quality tradeoff (minimal impact due to automation)
    if (efficiencyRatio > 200) baseQuality -= 2; // Extremely high efficiency might reduce quality slightly
    
    return Math.min(Math.max(baseQuality, 70), 100);
  }

  /**
   * Assess risk factors for the project
   */
  private assessRisks(task: AgentTask, complexity: TaskComplexity, agentIds: string[]): RiskAssessment[] {
    const risks: RiskAssessment[] = [];
    
    // Coordination risk for multiple agents
    if (agentIds.length >= 4) {
      risks.push({
        factor: 'Multi-agent coordination complexity',
        impact: 'medium',
        probability: 25,
        mitigation: 'Use proven coordination protocols from Phase 1'
      });
    }
    
    // Novelty risk
    if (complexity.novelty === 'innovation') {
      risks.push({
        factor: 'Innovative task uncertainty',
        impact: 'high',
        probability: 40,
        mitigation: 'Build in extra validation steps and iterative refinement'
      });
    }
    
    // Data complexity risk
    if (complexity.dataRequirements === 'complex') {
      risks.push({
        factor: 'Complex data processing requirements',
        impact: 'medium',
        probability: 30,
        mitigation: 'Ensure data validation agents are included'
      });
    }
    
    return risks;
  }

  /**
   * Track estimation sources for transparency
   */
  private getEstimationSources(task: AgentTask, complexity: TaskComplexity): EstimationSource[] {
    const sources: EstimationSource[] = [
      {
        type: 'baseline',
        data: { efficiencyRatio: this.baselineEfficiency, source: 'Phase 1 validation' },
        confidence: 95
      }
    ];
    
    // Add historical data source if available
    const similarCount = this.historicalData.filter(p => p.taskType === task.type).length;
    if (similarCount > 0) {
      sources.push({
        type: 'historical',
        data: { similarProjects: similarCount },
        confidence: Math.min(60 + similarCount * 5, 90)
      });
    }
    
    return sources;
  }

  /**
   * Learn from completed project results
   */
  async updateEstimatesFromActual(
    original: TimeEstimate,
    actualResult: {
      actualDuration: number;
      qualityScore: number;
      agentsUsed: string[];
      coordinationEvents: number;
    }
  ): Promise<void> {
    
    console.log(`📚 Learning from project: predicted ${original.estimatedDuration}ms, actual ${actualResult.actualDuration}ms`);
    
    // Add to historical data
    const projectHistory: ProjectHistory = {
      projectId: `project-${Date.now()}`,
      taskType: 'estimated-task', // This would come from the original task
      complexity: {
        dataRequirements: 'moderate', // This would be stored with the original estimate
        agentCoordination: 'mixed',
        qualityRequirements: 'professional',
        novelty: 'adaptation'
      },
      estimatedTime: original.estimatedDuration,
      actualTime: actualResult.actualDuration,
      qualityScore: actualResult.qualityScore,
      agentsUsed: actualResult.agentsUsed,
      coordinationEvents: actualResult.coordinationEvents,
      completedDate: new Date()
    };
    
    this.historicalData.push(projectHistory);
    
    // Keep only last 100 projects to prevent memory bloat
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }
    
    // Calculate prediction accuracy
    const accuracy = 1 - Math.abs(actualResult.actualDuration - original.estimatedDuration) / original.estimatedDuration;
    
    console.log(`📈 Prediction accuracy: ${Math.round(accuracy * 100)}%`);
    
    // Update learning model (simple version for Phase 2)
    this.updateLearningModel(projectHistory);
  }

  /**
   * Update internal learning model
   */
  private updateLearningModel(project: ProjectHistory): void {
    // Phase 2: Simple learning based on accuracy trends
    // Phase 3+: Will implement actual ML models (neural networks, etc.)
    
    const accuracyRatio = project.actualTime / project.estimatedTime;
    
    // Adjust baseline efficiency if we're consistently over/under estimating
    const recentProjects = this.historicalData.slice(-10);
    if (recentProjects.length >= 10) {
      const avgAccuracy = recentProjects.reduce((sum, p) => 
        sum + (p.actualTime / p.estimatedTime), 0) / recentProjects.length;
      
      // Adjust baseline slightly based on systematic errors
      if (avgAccuracy > 1.2) {
        // We're consistently underestimating - reduce efficiency ratio
        this.baselineEfficiency *= 0.95;
        console.log(`🔧 Adjusting baseline efficiency ratio to ${this.baselineEfficiency}:1`);
      } else if (avgAccuracy < 0.8) {
        // We're consistently overestimating - increase efficiency ratio
        this.baselineEfficiency *= 1.05;
        console.log(`🔧 Adjusting baseline efficiency ratio to ${this.baselineEfficiency}:1`);
      }
    }
  }

  /**
   * Initialize with baseline data from Phase 1 validation
   */
  private initializeBaseline(): void {
    console.log('🚀 Initializing Time Estimation Engine with 160:1 efficiency baseline');
    
    // Add the Phase 1 validation as baseline historical data
    const phase1Validation: ProjectHistory = {
      projectId: 'phase-1-validation',
      taskType: 'orchestrate-with-review',
      complexity: {
        dataRequirements: 'complex',
        agentCoordination: 'mixed',
        qualityRequirements: 'professional',
        novelty: 'adaptation'
      },
      estimatedTime: 60 * 60 * 1000, // 1 hour estimate
      actualTime: 6 * 60 * 1000,     // 6 minute actual
      qualityScore: 100,
      agentsUsed: ['researcher', 'data-scientist', 'communications', 'full-stack-developer'],
      coordinationEvents: 24,
      completedDate: new Date('2025-12-27T10:53:00')
    };
    
    this.historicalData.push(phase1Validation);
    
    console.log('✅ Time Estimation Engine initialized with validated 160:1 baseline');
  }

  /**
   * Get current learning statistics
   */
  getStats(): any {
    return {
      baselineEfficiency: this.baselineEfficiency,
      historicalProjects: this.historicalData.length,
      averageAccuracy: this.calculateAverageAccuracy(),
      lastUpdate: this.historicalData[this.historicalData.length - 1]?.completedDate
    };
  }

  private calculateAverageAccuracy(): number {
    if (this.historicalData.length === 0) return 0;
    
    const accuracies = this.historicalData.map(p => 
      1 - Math.abs(p.actualTime - p.estimatedTime) / p.estimatedTime
    );
    
    return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
  }
}

// Export singleton instance
export const timeEstimationEngine = new TimeEstimationEngine();
