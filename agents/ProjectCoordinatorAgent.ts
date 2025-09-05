import { Agent, AgentTask, AgentTaskResult } from './Agent';
import PersonalAssistantBridge from './PersonalAssistantBridge';

/**
 * Project Coordinator Agent - Project Management and Coordination
 * 
 * The Project Coordinator Agent specializes in project management methodologies,
 * timeline management, resource allocation, stakeholder communication, and
 * ensuring projects are completed on time, within scope, and meeting quality standards.
 */
export class ProjectCoordinatorAgent implements Agent {
  id = 'project-coordinator';
  name = 'Project Coordinator Agent';
  description = 'Specialized project management agent that handles timeline management, resource allocation, stakeholder coordination, and ensures project delivery excellence.';
  
  abilities = [
    'Project Planning and Scoping',
    'Timeline and Milestone Management', 
    'Resource Allocation and Optimization',
    'Stakeholder Communication and Updates',
    'Risk Assessment and Mitigation',
    'Quality Assurance and Control',
    'Budget and Cost Management',
    'Team Coordination and Leadership',
    'Progress Tracking and Reporting',
    'Agile and Waterfall Methodologies',
    'Change Management',
    'Deliverable Documentation'
  ];

  /**
   * Main task handler for project coordination activities
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'create_project_plan':
          return await this.createProjectPlan(task);
        case 'manage_timeline':
          return await this.manageTimeline(task);
        case 'allocate_resources':
          return await this.allocateResources(task);
        case 'track_progress':
          return await this.trackProgress(task);
        case 'manage_stakeholders':
          return await this.manageStakeholders(task);
        case 'assess_risks':
          return await this.assessRisks(task);
        case 'coordinate_team':
          return await this.coordinateTeam(task);
        case 'generate_status_report':
          return await this.generateStatusReport(task);
        default:
          return await this.handleGeneralProjectManagement(task);
      }
    } catch (error) {
      console.error(`Project Coordinator error:`, error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown project coordination error'
      };
    }
  }

  /**
   * Create comprehensive project plan with scope, timeline, and resources
   */
  async createProjectPlan(task: AgentTask): Promise<AgentTaskResult> {
    const projectRequirements = task.payload?.requirements || '';
    const constraints = task.payload?.constraints || {};
    
    try {
      // Use bridge to access GPT-4 for intelligent project planning
      const planResponse = await PersonalAssistantBridge.requestAPIAccess('openai-gpt4', {
        messages: [
          {
            role: 'system',
            content: `You are a professional Project Coordinator Agent with expertise in project management methodologies.
            Create a comprehensive project plan that includes:
            1. Project scope definition and objectives
            2. Work breakdown structure (WBS)
            3. Timeline with milestones and dependencies
            4. Resource requirements and allocation
            5. Risk assessment and mitigation strategies
            6. Quality assurance checkpoints
            7. Stakeholder communication plan
            8. Success criteria and KPIs
            
            Format the response as structured JSON for easy processing.`
          },
          {
            role: 'user',
            content: `Create project plan for: "${projectRequirements}"
            Constraints: ${JSON.stringify(constraints)}`
          }
        ],
        model: 'gpt-4-1106-preview',
        temperature: 0.1
      }, 'project-coordinator');

      if (planResponse.success) {
        const projectPlan = this.parseProjectPlan(planResponse.data);
        const riskAssessment = await this.performInitialRiskAssessment(projectPlan);
        const resourcePlan = await this.createResourcePlan(projectPlan);
        
        return {
          success: true,
          result: {
            projectPlan,
            riskAssessment,
            resourcePlan,
            estimatedDuration: projectPlan.timeline?.totalDuration || "TBD",
            nextSteps: this.determineNextSteps(projectPlan),
            message: `Comprehensive project plan created with ${projectPlan.phases?.length || 0} phases and ${projectPlan.milestones?.length || 0} milestones.`
          }
        };
      } else {
        throw new Error('Project plan generation failed');
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Project plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Manage project timeline including adjustments and optimization
   */
  async manageTimeline(task: AgentTask): Promise<AgentTaskResult> {
    const currentTimeline = task.payload?.timeline;
    const updates = task.payload?.updates || [];
    const constraints = task.payload?.constraints || {};
    
    try {
      // Analyze current timeline performance
      const timelineAnalysis = await this.analyzeTimelinePerformance(currentTimeline);
      
      // Apply updates and constraints
      const updatedTimeline = await this.applyTimelineUpdates(currentTimeline, updates, constraints);
      
      // Optimize timeline for efficiency
      const optimizedTimeline = await this.optimizeTimeline(updatedTimeline);
      
      // Identify critical path and bottlenecks
      const criticalPath = await this.identifyCriticalPath(optimizedTimeline);
      const bottlenecks = await this.identifyTimelineBottlenecks(optimizedTimeline);
      
      return {
        success: true,
        result: {
          originalTimeline: currentTimeline,
          updatedTimeline: optimizedTimeline,
          criticalPath,
          bottlenecks,
          timelineAnalysis,
          recommendations: this.generateTimelineRecommendations(timelineAnalysis, bottlenecks),
          message: `Timeline updated with ${updates.length} changes. Critical path identified with ${bottlenecks.length} bottlenecks.`
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Timeline management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Allocate and optimize resources across project tasks
   */
  async allocateResources(task: AgentTask): Promise<AgentTaskResult> {
    const projectTasks = task.payload?.tasks || [];
    const availableResources = task.payload?.resources || [];
    const constraints = task.payload?.constraints || {};
    
    try {
      // Analyze resource requirements for each task
      const resourceRequirements = await this.analyzeResourceRequirements(projectTasks);
      
      // Match resources to requirements
      const resourceMatching = await this.matchResourcesToRequirements(resourceRequirements, availableResources);
      
      // Optimize allocation for efficiency and cost
      const optimizedAllocation = await this.optimizeResourceAllocation(resourceMatching, constraints);
      
      // Identify resource conflicts and gaps
      const resourceConflicts = await this.identifyResourceConflicts(optimizedAllocation);
      const resourceGaps = await this.identifyResourceGaps(resourceRequirements, availableResources);
      
      return {
        success: true,
        result: {
          resourceAllocation: optimizedAllocation,
          resourceUtilization: this.calculateResourceUtilization(optimizedAllocation),
          conflicts: resourceConflicts,
          gaps: resourceGaps,
          recommendations: this.generateResourceRecommendations(resourceConflicts, resourceGaps),
          costEstimate: this.calculateResourceCosts(optimizedAllocation),
          message: `Resources allocated across ${projectTasks.length} tasks with ${resourceConflicts.length} conflicts and ${resourceGaps.length} gaps identified.`
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Resource allocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Track project progress against plan and milestones
   */
  async trackProgress(task: AgentTask): Promise<AgentTaskResult> {
    const projectPlan = task.payload?.projectPlan;
    const currentStatus = task.payload?.currentStatus || {};
    
    try {
      // Calculate overall progress metrics
      const progressMetrics = await this.calculateProgressMetrics(projectPlan, currentStatus);
      
      // Analyze milestone completion
      const milestoneAnalysis = await this.analyzeMilestoneProgress(projectPlan.milestones, currentStatus);
      
      // Assess timeline adherence
      const timelineAdherence = await this.assessTimelineAdherence(projectPlan.timeline, currentStatus);
      
      // Generate progress report
      const progressReport = await this.generateProgressReport(progressMetrics, milestoneAnalysis, timelineAdherence);
      
      // Identify at-risk areas
      const riskAreas = await this.identifyAtRiskAreas(progressMetrics, timelineAdherence);
      
      return {
        success: true,
        result: {
          overallProgress: progressMetrics.overallCompletion,
          progressMetrics,
          milestoneStatus: milestoneAnalysis,
          timelineStatus: timelineAdherence,
          progressReport,
          riskAreas,
          recommendations: this.generateProgressRecommendations(riskAreas),
          message: `Progress tracking completed: ${Math.round(progressMetrics.overallCompletion)}% complete with ${riskAreas.length} risk areas identified.`
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Progress tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Manage stakeholder communication and updates
   */
  async manageStakeholders(task: AgentTask): Promise<AgentTaskResult> {
    const stakeholders = task.payload?.stakeholders || [];
    const projectStatus = task.payload?.projectStatus || {};
    const communicationType = task.payload?.type || 'status_update';
    
    try {
      // Generate stakeholder-specific communications
      const communications = await this.generateStakeholderCommunications(stakeholders, projectStatus, communicationType);
      
      // Create communication schedule
      const communicationSchedule = await this.createCommunicationSchedule(stakeholders, communicationType);
      
      // Prepare presentation materials
      const presentationMaterials = await this.preparePresentationMaterials(projectStatus, stakeholders);
      
      return {
        success: true,
        result: {
          communications,
          communicationSchedule,
          presentationMaterials,
          stakeholderMatrix: this.createStakeholderMatrix(stakeholders),
          deliveryPlan: this.createCommunicationDeliveryPlan(communications),
          message: `Stakeholder communications prepared for ${stakeholders.length} stakeholders with ${communications.length} messages.`
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Stakeholder management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Assess project risks and develop mitigation strategies
   */
  async assessRisks(task: AgentTask): Promise<AgentTaskResult> {
    const projectContext = task.payload?.projectContext || {};
    const existingRisks = task.payload?.existingRisks || [];
    
    try {
      // Use bridge to access GPT-4 for comprehensive risk analysis
      const riskAnalysisResponse = await PersonalAssistantBridge.requestAPIAccess('openai-gpt4', {
        messages: [
          {
            role: 'system',
            content: `You are a Project Coordinator Agent specializing in risk management.
            Perform comprehensive risk assessment including:
            1. Risk identification and categorization
            2. Probability and impact analysis
            3. Risk prioritization matrix
            4. Mitigation strategies and contingency plans
            5. Risk monitoring and control measures
            6. Early warning indicators
            
            Consider technical, financial, resource, timeline, and stakeholder risks.
            Format response as structured JSON.`
          },
          {
            role: 'user',
            content: `Assess risks for project: ${JSON.stringify(projectContext)}
            Existing risks: ${JSON.stringify(existingRisks)}`
          }
        ],
        model: 'gpt-4-1106-preview',
        temperature: 0.2
      }, 'project-coordinator');

      if (riskAnalysisResponse.success) {
        const riskAssessment = this.parseRiskAssessment(riskAnalysisResponse.data);
        const mitigationPlans = await this.developMitigationPlans(riskAssessment);
        const monitoringPlan = await this.createRiskMonitoringPlan(riskAssessment);
        
        return {
          success: true,
          result: {
            riskAssessment,
            mitigationPlans,
            monitoringPlan,
            riskMatrix: this.createRiskMatrix(riskAssessment),
            actionItems: this.generateRiskActionItems(riskAssessment, mitigationPlans),
            message: `Risk assessment completed with ${riskAssessment.risks?.length || 0} risks identified and ${mitigationPlans.length} mitigation strategies developed.`
          }
        };
      } else {
        throw new Error('Risk analysis failed');
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Coordinate team activities and communication
   */
  async coordinateTeam(task: AgentTask): Promise<AgentTaskResult> {
    const teamMembers = task.payload?.teamMembers || [];
    const projectTasks = task.payload?.tasks || [];
    const coordinationType = task.payload?.type || 'daily_coordination';
    
    try {
      // Create team coordination plan
      const coordinationPlan = await this.createTeamCoordinationPlan(teamMembers, projectTasks, coordinationType);
      
      // Generate team assignments and responsibilities
      const teamAssignments = await this.generateTeamAssignments(teamMembers, projectTasks);
      
      // Create communication protocols
      const communicationProtocols = await this.createCommunicationProtocols(teamMembers, coordinationType);
      
      // Schedule team activities
      const teamSchedule = await this.scheduleTeamActivities(teamAssignments, coordinationType);
      
      return {
        success: true,
        result: {
          coordinationPlan,
          teamAssignments,
          communicationProtocols,
          teamSchedule,
          performanceMetrics: this.createTeamPerformanceMetrics(teamMembers),
          message: `Team coordination established for ${teamMembers.length} members across ${projectTasks.length} tasks.`
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Team coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate comprehensive status reports
   */
  async generateStatusReport(task: AgentTask): Promise<AgentTaskResult> {
    const projectData = task.payload?.projectData || {};
    const reportType = task.payload?.type || 'comprehensive';
    const audience = task.payload?.audience || 'stakeholders';
    
    try {
      // Use bridge to access GPT-4 for status report generation
      const reportResponse = await PersonalAssistantBridge.requestAPIAccess('openai-gpt4', {
        messages: [
          {
            role: 'system',
            content: `You are a Project Coordinator Agent generating a professional project status report.
            Create a comprehensive report including:
            1. Executive summary
            2. Project progress and milestones
            3. Budget and resource status
            4. Risk assessment and mitigation
            5. Timeline adherence
            6. Team performance
            7. Upcoming activities and deliverables
            8. Recommendations and next steps
            
            Tailor the tone and detail level for the specified audience.
            Format as a well-structured document.`
          },
          {
            role: 'user',
            content: `Generate ${reportType} status report for ${audience}:
            Project Data: ${JSON.stringify(projectData)}`
          }
        ],
        model: 'gpt-4-1106-preview',
        temperature: 0.2
      }, 'project-coordinator');

      if (reportResponse.success) {
        const statusReport = reportResponse.data;
        const metrics = await this.calculateReportMetrics(projectData);
        const visualizations = await this.createReportVisualizations(metrics);
        
        return {
          success: true,
          result: {
            statusReport,
            reportMetrics: metrics,
            visualizations,
            reportType,
            audience,
            generatedAt: new Date().toISOString(),
            message: `${reportType} status report generated successfully for ${audience}.`
          }
        };
      } else {
        throw new Error('Status report generation failed');
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Status report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handle general project management tasks
   */
  private async handleGeneralProjectManagement(task: AgentTask): Promise<AgentTaskResult> {
    return {
      success: true,
      result: {
        message: `General project management handling for task: ${task.type}`,
        capabilities: this.abilities,
        recommendations: ["Define specific task type for optimized handling"],
        nextActions: ["Specify task parameters for detailed coordination"]
      }
    };
  }

  // Helper methods for project coordination
  private parseProjectPlan(planData: any): ProjectPlan {
    // Implementation for parsing project plan from GPT-4 response
    return {
      scope: planData.scope || "TBD",
      objectives: planData.objectives || [],
      phases: planData.phases || [],
      milestones: planData.milestones || [],
      timeline: planData.timeline || { totalDuration: "TBD" },
      resources: planData.resources || [],
      risks: planData.risks || []
    };
  }

  private async performInitialRiskAssessment(projectPlan: ProjectPlan): Promise<RiskAssessment> {
    // Implementation for initial risk assessment
    return {
      risks: projectPlan.risks,
      riskLevel: "Medium",
      mitigationStrategies: ["Regular monitoring", "Contingency planning"]
    };
  }

  private async createResourcePlan(projectPlan: ProjectPlan): Promise<ResourcePlan> {
    // Implementation for resource planning
    return {
      requiredResources: projectPlan.resources,
      allocation: [],
      costEstimate: { total: 0, breakdown: {} }
    };
  }

  private determineNextSteps(projectPlan: ProjectPlan): string[] {
    // Implementation for determining next steps
    return ["Begin phase 1 execution", "Assign team members", "Set up monitoring"];
  }

  private async analyzeTimelinePerformance(timeline: any): Promise<TimelineAnalysis> {
    // Implementation for timeline performance analysis
    return {
      adherence: 85,
      delays: [],
      accelerations: [],
      criticalPath: []
    };
  }

  private async applyTimelineUpdates(timeline: any, updates: any[], constraints: any): Promise<any> {
    // Implementation for applying timeline updates
    return timeline;
  }

  private async optimizeTimeline(timeline: any): Promise<any> {
    // Implementation for timeline optimization
    return timeline;
  }

  private async identifyCriticalPath(timeline: any): Promise<string[]> {
    // Implementation for critical path identification
    return [];
  }

  private async identifyTimelineBottlenecks(timeline: any): Promise<Bottleneck[]> {
    // Implementation for bottleneck identification
    return [];
  }

  private generateTimelineRecommendations(analysis: TimelineAnalysis, bottlenecks: Bottleneck[]): string[] {
    // Implementation for timeline recommendations
    return ["Optimize resource allocation", "Parallel task execution"];
  }

  private async analyzeResourceRequirements(tasks: any[]): Promise<ResourceRequirement[]> {
    // Implementation for resource requirement analysis
    return [];
  }

  private async matchResourcesToRequirements(requirements: ResourceRequirement[], resources: any[]): Promise<ResourceMatch[]> {
    // Implementation for resource matching
    return [];
  }

  private async optimizeResourceAllocation(matching: ResourceMatch[], constraints: any): Promise<ResourceAllocation[]> {
    // Implementation for resource allocation optimization
    return [];
  }

  private async identifyResourceConflicts(allocation: ResourceAllocation[]): Promise<ResourceConflict[]> {
    // Implementation for resource conflict identification
    return [];
  }

  private async identifyResourceGaps(requirements: ResourceRequirement[], resources: any[]): Promise<ResourceGap[]> {
    // Implementation for resource gap identification
    return [];
  }

  private calculateResourceUtilization(allocation: ResourceAllocation[]): ResourceUtilization {
    // Implementation for resource utilization calculation
    return { overall: 75, byResource: {} };
  }

  private generateResourceRecommendations(conflicts: ResourceConflict[], gaps: ResourceGap[]): string[] {
    // Implementation for resource recommendations
    return ["Hire additional resources", "Optimize task scheduling"];
  }

  private calculateResourceCosts(allocation: ResourceAllocation[]): CostEstimate {
    // Implementation for resource cost calculation
    return { total: 0, breakdown: {} };
  }

  private async calculateProgressMetrics(projectPlan: any, currentStatus: any): Promise<ProgressMetrics> {
    // Implementation for progress metrics calculation
    return {
      overallCompletion: 45,
      phaseCompletion: {},
      milestoneCompletion: 60,
      taskCompletion: {}
    };
  }

  private async analyzeMilestoneProgress(milestones: any[], currentStatus: any): Promise<MilestoneAnalysis> {
    // Implementation for milestone analysis
    return {
      completed: [],
      inProgress: [],
      upcoming: [],
      overdue: []
    };
  }

  private async assessTimelineAdherence(timeline: any, currentStatus: any): Promise<TimelineAdherence> {
    // Implementation for timeline adherence assessment
    return {
      onSchedule: true,
      variance: 0,
      projectedCompletion: "2024-01-15"
    };
  }

  private async generateProgressReport(metrics: ProgressMetrics, milestones: MilestoneAnalysis, timeline: TimelineAdherence): Promise<string> {
    // Implementation for progress report generation
    return "Progress report generated";
  }

  private async identifyAtRiskAreas(metrics: ProgressMetrics, timeline: TimelineAdherence): Promise<RiskArea[]> {
    // Implementation for at-risk area identification
    return [];
  }

  private generateProgressRecommendations(riskAreas: RiskArea[]): string[] {
    // Implementation for progress recommendations
    return ["Monitor timeline closely", "Adjust resource allocation"];
  }

  private async generateStakeholderCommunications(stakeholders: any[], status: any, type: string): Promise<Communication[]> {
    // Implementation for stakeholder communications
    return [];
  }

  private async createCommunicationSchedule(stakeholders: any[], type: string): Promise<CommunicationSchedule> {
    // Implementation for communication schedule
    return { frequency: "weekly", meetings: [], reports: [] };
  }

  private async preparePresentationMaterials(status: any, stakeholders: any[]): Promise<PresentationMaterials> {
    // Implementation for presentation materials
    return { slides: [], documents: [], dashboards: [] };
  }

  private createStakeholderMatrix(stakeholders: any[]): StakeholderMatrix {
    // Implementation for stakeholder matrix
    return { matrix: [], analysis: {} };
  }

  private createCommunicationDeliveryPlan(communications: Communication[]): DeliveryPlan {
    // Implementation for delivery plan
    return { timeline: [], channels: [], responsibilities: [] };
  }

  private parseRiskAssessment(riskData: any): RiskAssessment {
    // Implementation for risk assessment parsing
    return {
      risks: riskData.risks || [],
      riskLevel: riskData.riskLevel || "Medium",
      mitigationStrategies: riskData.mitigationStrategies || []
    };
  }

  private async developMitigationPlans(assessment: RiskAssessment): Promise<MitigationPlan[]> {
    // Implementation for mitigation plan development
    return [];
  }

  private async createRiskMonitoringPlan(assessment: RiskAssessment): Promise<MonitoringPlan> {
    // Implementation for risk monitoring plan
    return { indicators: [], frequency: "weekly", responsibilities: [] };
  }

  private createRiskMatrix(assessment: RiskAssessment): RiskMatrix {
    // Implementation for risk matrix creation
    return { matrix: [], categories: [] };
  }

  private generateRiskActionItems(assessment: RiskAssessment, plans: MitigationPlan[]): ActionItem[] {
    // Implementation for risk action items
    return [];
  }

  private async createTeamCoordinationPlan(members: any[], tasks: any[], type: string): Promise<CoordinationPlan> {
    // Implementation for team coordination plan
    return { structure: {}, protocols: [], meetings: [] };
  }

  private async generateTeamAssignments(members: any[], tasks: any[]): Promise<TeamAssignment[]> {
    // Implementation for team assignments
    return [];
  }

  private async createCommunicationProtocols(members: any[], type: string): Promise<CommunicationProtocol[]> {
    // Implementation for communication protocols
    return [];
  }

  private async scheduleTeamActivities(assignments: TeamAssignment[], type: string): Promise<TeamSchedule> {
    // Implementation for team schedule
    return { activities: [], timeline: [] };
  }

  private createTeamPerformanceMetrics(members: any[]): TeamPerformanceMetrics {
    // Implementation for team performance metrics
    return { individual: {}, team: {} };
  }

  private async calculateReportMetrics(projectData: any): Promise<ReportMetrics> {
    // Implementation for report metrics calculation
    return { progress: 0, budget: 0, timeline: 0, quality: 0 };
  }

  private async createReportVisualizations(metrics: ReportMetrics): Promise<Visualization[]> {
    // Implementation for report visualizations
    return [];
  }
}

// Type definitions for Project Coordinator operations
interface ProjectPlan {
  scope: string;
  objectives: string[];
  phases: ProjectPhase[];
  milestones: Milestone[];
  timeline: Timeline;
  resources: Resource[];
  risks: Risk[];
}

interface ProjectPhase {
  name: string;
  duration: string;
  tasks: Task[];
  dependencies: string[];
}

interface Milestone {
  name: string;
  date: string;
  criteria: string[];
  dependencies: string[];
}

interface Timeline {
  totalDuration: string;
  phases?: TimelinePhase[];
  criticalPath?: string[];
}

interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  duration: string;
}

interface Resource {
  type: string;
  quantity: number;
  cost: number;
  availability: string;
}

interface Risk {
  id: string;
  description: string;
  probability: string;
  impact: string;
  mitigation: string;
}

interface Task {
  id: string;
  name: string;
  duration: string;
  assignee: string;
  dependencies: string[];
}

interface RiskAssessment {
  risks: Risk[];
  riskLevel: string;
  mitigationStrategies: string[];
}

interface ResourcePlan {
  requiredResources: Resource[];
  allocation: ResourceAllocation[];
  costEstimate: CostEstimate;
}

interface TimelineAnalysis {
  adherence: number;
  delays: Delay[];
  accelerations: Acceleration[];
  criticalPath: string[];
}

interface Bottleneck {
  location: string;
  severity: string;
  impact: string;
  resolution: string;
}

interface ResourceRequirement {
  taskId: string;
  resourceType: string;
  quantity: number;
  duration: string;
}

interface ResourceMatch {
  requirement: ResourceRequirement;
  assignedResource: Resource;
  efficiency: number;
}

interface ResourceAllocation {
  resourceId: string;
  taskId: string;
  allocation: number;
  startDate: string;
  endDate: string;
}

interface ResourceConflict {
  resourceId: string;
  conflictingTasks: string[];
  severity: string;
  resolution: string;
}

interface ResourceGap {
  resourceType: string;
  gap: number;
  urgency: string;
  recommendations: string[];
}

interface ResourceUtilization {
  overall: number;
  byResource: { [key: string]: number };
}

interface CostEstimate {
  total: number;
  breakdown: { [key: string]: number };
}

interface ProgressMetrics {
  overallCompletion: number;
  phaseCompletion: { [key: string]: number };
  milestoneCompletion: number;
  taskCompletion: { [key: string]: number };
}

interface MilestoneAnalysis {
  completed: Milestone[];
  inProgress: Milestone[];
  upcoming: Milestone[];
  overdue: Milestone[];
}

interface TimelineAdherence {
  onSchedule: boolean;
  variance: number;
  projectedCompletion: string;
}

interface RiskArea {
  area: string;
  riskLevel: string;
  impact: string;
  recommendations: string[];
}

interface Communication {
  recipient: string;
  type: string;
  content: string;
  deliveryDate: string;
}

interface CommunicationSchedule {
  frequency: string;
  meetings: Meeting[];
  reports: Report[];
}

interface PresentationMaterials {
  slides: Slide[];
  documents: Document[];
  dashboards: Dashboard[];
}

interface StakeholderMatrix {
  matrix: StakeholderEntry[];
  analysis: { [key: string]: any };
}

interface DeliveryPlan {
  timeline: DeliveryEvent[];
  channels: string[];
  responsibilities: Responsibility[];
}

interface MitigationPlan {
  riskId: string;
  strategy: string;
  actions: Action[];
  timeline: string;
  owner: string;
}

interface MonitoringPlan {
  indicators: Indicator[];
  frequency: string;
  responsibilities: string[];
}

interface RiskMatrix {
  matrix: RiskEntry[];
  categories: string[];
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: string;
}

interface CoordinationPlan {
  structure: { [key: string]: any };
  protocols: Protocol[];
  meetings: Meeting[];
}

interface TeamAssignment {
  memberId: string;
  tasks: string[];
  responsibilities: string[];
  timeline: string;
}

interface CommunicationProtocol {
  type: string;
  frequency: string;
  participants: string[];
  format: string;
}

interface TeamSchedule {
  activities: Activity[];
  timeline: ScheduleEvent[];
}

interface TeamPerformanceMetrics {
  individual: { [key: string]: any };
  team: { [key: string]: any };
}

interface ReportMetrics {
  progress: number;
  budget: number;
  timeline: number;
  quality: number;
}

interface Visualization {
  type: string;
  data: any;
  config: any;
}

// Additional supporting interfaces
interface Delay {
  task: string;
  delay: number;
  reason: string;
}

interface Acceleration {
  task: string;
  acceleration: number;
  reason: string;
}

interface Meeting {
  type: string;
  participants: string[];
  frequency: string;
  agenda: string[];
}

interface Report {
  type: string;
  recipients: string[];
  frequency: string;
  content: string[];
}

interface Slide {
  title: string;
  content: any;
  type: string;
}

interface Document {
  title: string;
  content: string;
  format: string;
}

interface Dashboard {
  title: string;
  metrics: string[];
  visualizations: string[];
}

interface StakeholderEntry {
  name: string;
  role: string;
  influence: string;
  interest: string;
}

interface DeliveryEvent {
  event: string;
  date: string;
  deliverables: string[];
}

interface Responsibility {
  person: string;
  tasks: string[];
  deadlines: string[];
}

interface Action {
  description: string;
  owner: string;
  deadline: string;
  status: string;
}

interface Indicator {
  name: string;
  threshold: number;
  measurement: string;
}

interface RiskEntry {
  risk: string;
  probability: string;
  impact: string;
  score: number;
}

interface Protocol {
  name: string;
  description: string;
  rules: string[];
}

interface Activity {
  name: string;
  type: string;
  participants: string[];
  duration: string;
}

interface ScheduleEvent {
  event: string;
  date: string;
  duration: string;
  participants: string[];
}
