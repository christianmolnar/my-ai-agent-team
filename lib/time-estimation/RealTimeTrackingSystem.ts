/**
 * Real-Time Project Tracking System - Phase 2 Implementation
 * 
 * Comprehensive monitoring system for multi-agent coordination with 
 * millisecond precision timing and quality validation tracking
 */

import { TimeEstimate, ProjectHistory } from './TimeEstimationEngine';
import { Agent, AgentTask, AgentTaskResult } from '../../agents/agent';

export interface AgentState {
  agentId: string;
  status: 'idle' | 'working' | 'waiting' | 'completed' | 'failed';
  currentTask?: string;
  progress: number; // 0-100%
  startTime?: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  lastActivity: Date;
}

export interface QualityGateStatus {
  gateId: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  startTime?: Date;
  completionTime?: Date;
  duration?: number; // milliseconds
  details?: any;
}

export interface CoordinationEvent {
  eventId: string;
  timestamp: Date;
  type: 'handoff' | 'request' | 'response' | 'validation' | 'error';
  fromAgent: string;
  toAgent: string;
  payload?: any;
  duration?: number; // milliseconds for response events
}

export interface EfficiencyData {
  currentRatio: number;
  targetRatio: number;
  timeElapsed: number; // milliseconds
  timeRemaining: number; // milliseconds
  progressPercent: number;
  qualityScore: number;
  bottlenecks: string[];
}

export interface ProjectMetrics {
  projectId: string;
  efficiency: EfficiencyData;
  agentUtilization: Map<string, number>; // agent -> utilization %
  coordinationHealth: number; // 0-100%
  qualityTrend: number[]; // quality scores over time
  predictedCompletion: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Alert {
  alertId: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  suggestedAction?: string;
}

export interface ProjectTracker {
  projectId: string;
  startTime: Date;
  estimatedCompletion: Date;
  actualProgress: number; // 0-100%
  agentStates: Map<string, AgentState>;
  qualityGates: QualityGateStatus[];
  coordinationEvents: CoordinationEvent[];
  efficiencyMetrics: EfficiencyData;
  alerts: Alert[];
  isActive: boolean;
}

export class RealTimeTrackingSystem {
  private activeProjects: Map<string, ProjectTracker> = new Map();
  private eventHistory: CoordinationEvent[] = [];
  private alertThresholds = {
    efficiencyDeviation: 20, // %
    coordinationDelay: 10000, // milliseconds
    qualityThreshold: 85 // minimum quality score
  };

  constructor() {
    console.log('📊 Real-Time Tracking System initialized');
  }

  /**
   * Start tracking a new project
   */
  startProject(
    projectId: string, 
    estimatedTime: TimeEstimate,
    agentIds: string[]
  ): ProjectTracker {
    
    console.log(`🚀 Starting project tracking: ${projectId}`);
    
    const startTime = new Date();
    const estimatedCompletion = new Date(startTime.getTime() + estimatedTime.estimatedDuration);
    
    // Initialize agent states
    const agentStates = new Map<string, AgentState>();
    agentIds.forEach(agentId => {
      agentStates.set(agentId, {
        agentId,
        status: 'idle',
        progress: 0,
        lastActivity: startTime
      });
    });
    
    // Initialize quality gates based on estimate
    const qualityGates: QualityGateStatus[] = [
      { gateId: 'data-validation', description: 'Data accuracy and completeness', status: 'pending' },
      { gateId: 'analysis-quality', description: 'Analysis depth and accuracy', status: 'pending' },
      { gateId: 'deliverable-format', description: 'Output format and presentation', status: 'pending' },
      { gateId: 'client-requirements', description: 'Client requirement fulfillment', status: 'pending' }
    ];
    
    const tracker: ProjectTracker = {
      projectId,
      startTime,
      estimatedCompletion,
      actualProgress: 0,
      agentStates,
      qualityGates,
      coordinationEvents: [],
      efficiencyMetrics: {
        currentRatio: estimatedTime.efficiencyRatio,
        targetRatio: estimatedTime.efficiencyRatio,
        timeElapsed: 0,
        timeRemaining: estimatedTime.estimatedDuration,
        progressPercent: 0,
        qualityScore: estimatedTime.qualityPrediction,
        bottlenecks: []
      },
      alerts: [],
      isActive: true
    };
    
    this.activeProjects.set(projectId, tracker);
    
    console.log(`✅ Project tracking started for ${projectId} with ${agentIds.length} agents`);
    return tracker;
  }

  /**
   * Update agent progress
   */
  trackAgentProgress(
    projectId: string, 
    agentId: string, 
    progress: number,
    status?: AgentState['status']
  ): void {
    
    const project = this.activeProjects.get(projectId);
    if (!project) {
      console.warn(`⚠️ Project ${projectId} not found for agent progress update`);
      return;
    }
    
    const agentState = project.agentStates.get(agentId);
    if (!agentState) {
      console.warn(`⚠️ Agent ${agentId} not found in project ${projectId}`);
      return;
    }
    
    // Update agent state
    agentState.progress = Math.min(Math.max(progress, 0), 100);
    if (status) agentState.status = status;
    agentState.lastActivity = new Date();
    
    // Update overall project progress
    this.updateProjectProgress(projectId);
    
    // Check for alerts
    this.checkProgressAlerts(projectId, agentId, agentState);
    
    console.log(`📈 Agent ${agentId} progress: ${progress}% (${status || agentState.status})`);
  }

  /**
   * Record coordination event between agents
   */
  recordCoordinationEvent(
    projectId: string,
    fromAgent: string, 
    toAgent: string, 
    type: CoordinationEvent['type'],
    payload?: any
  ): void {
    
    const project = this.activeProjects.get(projectId);
    if (!project) {
      console.warn(`⚠️ Project ${projectId} not found for coordination event`);
      return;
    }
    
    const event: CoordinationEvent = {
      eventId: `${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      fromAgent,
      toAgent,
      payload
    };
    
    project.coordinationEvents.push(event);
    this.eventHistory.push(event);
    
    // Keep event history manageable
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-500);
    }
    
    // Update coordination health metrics
    this.updateCoordinationHealth(projectId);
    
    console.log(`🔄 Coordination: ${fromAgent} -> ${toAgent} (${type})`);
  }

  /**
   * Track quality gate completion
   */
  trackQualityGate(
    projectId: string, 
    gateId: string, 
    passed: boolean, 
    details?: any
  ): void {
    
    const project = this.activeProjects.get(projectId);
    if (!project) {
      console.warn(`⚠️ Project ${projectId} not found for quality gate update`);
      return;
    }
    
    const gate = project.qualityGates.find(g => g.gateId === gateId);
    if (!gate) {
      console.warn(`⚠️ Quality gate ${gateId} not found in project ${projectId}`);
      return;
    }
    
    const now = new Date();
    gate.status = passed ? 'passed' : 'failed';
    gate.completionTime = now;
    gate.details = details;
    
    if (gate.startTime) {
      gate.duration = now.getTime() - gate.startTime.getTime();
    }
    
    // Update quality metrics
    this.updateQualityMetrics(projectId);
    
    // Generate alerts for failed quality gates
    if (!passed) {
      this.addAlert(projectId, 'warning', `Quality gate failed: ${gate.description}`, 'quality-system');
    }
    
    console.log(`🛡️ Quality gate ${gateId}: ${passed ? 'PASSED' : 'FAILED'}`);
  }

  /**
   * Generate real-time project metrics
   */
  generateRealTimeMetrics(projectId: string): ProjectMetrics | null {
    const project = this.activeProjects.get(projectId);
    if (!project) return null;
    
    const now = new Date();
    const timeElapsed = now.getTime() - project.startTime.getTime();
    const originalEstimate = project.estimatedCompletion.getTime() - project.startTime.getTime();
    
    // Calculate agent utilization
    const agentUtilization = new Map<string, number>();
    project.agentStates.forEach((state, agentId) => {
      // Simple utilization: working or completed = high utilization
      const utilization = state.status === 'working' ? 90 : 
                         state.status === 'completed' ? 100 : 
                         state.status === 'waiting' ? 50 : 10;
      agentUtilization.set(agentId, utilization);
    });
    
    // Calculate coordination health
    const recentEvents = project.coordinationEvents.filter(e => 
      now.getTime() - e.timestamp.getTime() < 60000 // last minute
    );
    const coordinationHealth = Math.min(100, recentEvents.length * 20); // More events = better coordination
    
    // Update efficiency metrics
    project.efficiencyMetrics.timeElapsed = timeElapsed;
    project.efficiencyMetrics.timeRemaining = Math.max(0, originalEstimate - timeElapsed);
    project.efficiencyMetrics.progressPercent = project.actualProgress;
    
    // Calculate current efficiency ratio
    if (project.actualProgress > 0) {
      const expectedTimeForProgress = originalEstimate * (project.actualProgress / 100);
      const actualEfficiencyRatio = expectedTimeForProgress / timeElapsed;
      project.efficiencyMetrics.currentRatio = actualEfficiencyRatio;
    }
    
    // Predict completion time
    const progressRate = project.actualProgress / timeElapsed; // progress per millisecond
    const remainingProgress = 100 - project.actualProgress;
    const predictedRemainingTime = remainingProgress / progressRate;
    const predictedCompletion = new Date(now.getTime() + predictedRemainingTime);
    
    return {
      projectId,
      efficiency: project.efficiencyMetrics,
      agentUtilization,
      coordinationHealth,
      qualityTrend: this.calculateQualityTrend(project),
      predictedCompletion,
      riskLevel: this.assessRiskLevel(project)
    };
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): ProjectTracker | null {
    return this.activeProjects.get(projectId) || null;
  }

  /**
   * Complete project tracking
   */
  completeProject(projectId: string, finalQuality: number = 100): ProjectHistory | null {
    const project = this.activeProjects.get(projectId);
    if (!project) return null;
    
    const completionTime = new Date();
    const actualDuration = completionTime.getTime() - project.startTime.getTime();
    const originalEstimate = project.estimatedCompletion.getTime() - project.startTime.getTime();
    
    project.isActive = false;
    
    const history: ProjectHistory = {
      projectId,
      taskType: 'multi-agent-coordination',
      complexity: {
        dataRequirements: 'moderate', // This would be passed from original task
        agentCoordination: 'mixed',
        qualityRequirements: 'professional',
        novelty: 'adaptation'
      },
      estimatedTime: originalEstimate,
      actualTime: actualDuration,
      qualityScore: finalQuality,
      agentsUsed: Array.from(project.agentStates.keys()),
      coordinationEvents: project.coordinationEvents.length,
      completedDate: completionTime
    };
    
    console.log(`🏁 Project ${projectId} completed in ${Math.round(actualDuration/1000)}s`);
    console.log(`📊 Efficiency: ${Math.round((originalEstimate/actualDuration)*10)/10}:1 ratio`);
    
    this.activeProjects.delete(projectId);
    
    return history;
  }

  /**
   * Update overall project progress based on agent states
   */
  private updateProjectProgress(projectId: string): void {
    const project = this.activeProjects.get(projectId);
    if (!project) return;
    
    // Calculate weighted average of agent progress
    const agentProgresses = Array.from(project.agentStates.values()).map(state => state.progress);
    const averageProgress = agentProgresses.reduce((sum, progress) => sum + progress, 0) / agentProgresses.length;
    
    project.actualProgress = Math.round(averageProgress);
    
    // Update efficiency metrics
    const now = new Date();
    const timeElapsed = now.getTime() - project.startTime.getTime();
    project.efficiencyMetrics.timeElapsed = timeElapsed;
    project.efficiencyMetrics.progressPercent = project.actualProgress;
  }

  /**
   * Update coordination health based on recent events
   */
  private updateCoordinationHealth(projectId: string): void {
    const project = this.activeProjects.get(projectId);
    if (!project) return;
    
    const now = new Date();
    const recentEvents = project.coordinationEvents.filter(e => 
      now.getTime() - e.timestamp.getTime() < 30000 // last 30 seconds
    );
    
    // Good coordination = regular events, low error rate
    const errorEvents = recentEvents.filter(e => e.type === 'error').length;
    const totalEvents = recentEvents.length;
    const errorRate = totalEvents > 0 ? errorEvents / totalEvents : 0;
    
    const coordinationHealth = Math.round(100 * (1 - errorRate) * Math.min(1, totalEvents / 5));
    project.efficiencyMetrics.qualityScore = coordinationHealth;
  }

  /**
   * Update quality metrics based on quality gates
   */
  private updateQualityMetrics(projectId: string): void {
    const project = this.activeProjects.get(projectId);
    if (!project) return;
    
    const passedGates = project.qualityGates.filter(g => g.status === 'passed').length;
    const totalGates = project.qualityGates.length;
    const qualityScore = Math.round((passedGates / totalGates) * 100);
    
    project.efficiencyMetrics.qualityScore = qualityScore;
  }

  /**
   * Check for progress-related alerts
   */
  private checkProgressAlerts(projectId: string, agentId: string, agentState: AgentState): void {
    // Check for stuck agents
    const now = new Date();
    const timeSinceActivity = now.getTime() - agentState.lastActivity.getTime();
    
    if (timeSinceActivity > this.alertThresholds.coordinationDelay && agentState.status === 'working') {
      this.addAlert(
        projectId, 
        'warning', 
        `Agent ${agentId} has been inactive for ${Math.round(timeSinceActivity/1000)}s`,
        'progress-monitor'
      );
    }
  }

  /**
   * Add alert to project
   */
  private addAlert(
    projectId: string, 
    severity: Alert['severity'], 
    message: string, 
    source: string,
    suggestedAction?: string
  ): void {
    const project = this.activeProjects.get(projectId);
    if (!project) return;
    
    const alert: Alert = {
      alertId: `${projectId}-${Date.now()}`,
      timestamp: new Date(),
      severity,
      message,
      source,
      suggestedAction
    };
    
    project.alerts.push(alert);
    
    // Keep alerts manageable
    if (project.alerts.length > 50) {
      project.alerts = project.alerts.slice(-25);
    }
    
    console.log(`🚨 ${severity.toUpperCase()}: ${message}`);
  }

  /**
   * Calculate quality trend over time
   */
  private calculateQualityTrend(project: ProjectTracker): number[] {
    // For Phase 2, return simple trend based on current quality
    const currentQuality = project.efficiencyMetrics.qualityScore;
    return [currentQuality - 5, currentQuality - 2, currentQuality];
  }

  /**
   * Assess current risk level
   */
  private assessRiskLevel(project: ProjectTracker): 'low' | 'medium' | 'high' {
    const efficiency = project.efficiencyMetrics;
    const recentAlerts = project.alerts.filter(a => 
      Date.now() - a.timestamp.getTime() < 300000 // last 5 minutes
    );
    
    // High risk: efficiency issues, quality problems, or many alerts
    if (efficiency.currentRatio < efficiency.targetRatio * 0.7 || 
        efficiency.qualityScore < this.alertThresholds.qualityThreshold ||
        recentAlerts.length > 3) {
      return 'high';
    }
    
    // Medium risk: minor efficiency or quality deviations
    if (efficiency.currentRatio < efficiency.targetRatio * 0.85 || 
        efficiency.qualityScore < 95 ||
        recentAlerts.length > 1) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get system statistics
   */
  getStats(): any {
    return {
      activeProjects: this.activeProjects.size,
      totalEvents: this.eventHistory.length,
      averageProjectDuration: this.calculateAverageProjectDuration(),
      systemHealth: this.calculateSystemHealth()
    };
  }

  private calculateAverageProjectDuration(): number {
    const projects = Array.from(this.activeProjects.values());
    if (projects.length === 0) return 0;
    
    const durations = projects.map(p => 
      Date.now() - p.startTime.getTime()
    );
    
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  private calculateSystemHealth(): number {
    const projects = Array.from(this.activeProjects.values());
    if (projects.length === 0) return 100;
    
    const healthScores = projects.map(p => p.efficiencyMetrics.qualityScore);
    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  }
}

// Export singleton instance
export const trackingSystem = new RealTimeTrackingSystem();
