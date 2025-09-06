import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { CapabilityAwareAgent, CapabilityUtils } from './AgentCapabilityAware';
import { 
  CollaborationRequest, 
  CapabilityEnhancement,
  CapabilityAssessment 
} from './GlobalAgentInspector';

/**
 * Example: Communications Agent Enhanced with Global Capability Awareness
 * 
 * This demonstrates how any agent can leverage the global capability system
 * to inspect other agents, request collaborations, and suggest improvements.
 */
export class EnhancedCommunicationsAgent extends CapabilityAwareAgent {
  id = 'enhanced-communications';
  name = 'Enhanced Communications Agent';
  description = 'Communications agent with global team capability awareness';
  abilities = [
    'Draft Email',
    'Summarize Email/Chat', 
    'Schedule Meeting',
    'Prepare Meeting Agenda',
    'Take Meeting Notes',
    'Send Reminders/Follow-ups',
    'Draft Business Proposals',
    'Write/Format Business Documents',
    'Edit/Polish Research Papers',
    'Write Resume Cover Letters',
    'Team Capability Assessment',
    'Inter-agent Collaboration',
    'Capability Enhancement Suggestions'
  ];
  
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'draft-comprehensive-report':
          return await this.handleComprehensiveReport(task.payload);
          
        case 'assess-team-capabilities':
          return await this.handleTeamCapabilityAssessment(task.payload);
          
        case 'suggest-collaboration':
          return await this.handleCollaborationSuggestion(task.payload);
          
        case 'enhance-agent-capability':
          return await this.handleCapabilityEnhancement(task.payload);
          
        default:
          // Handle standard communications tasks
          return await this.handleStandardTask(task);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Enhanced Communications Agent error: ${error.message}`
      };
    }
  }
  
  /**
   * Example: Planning a comprehensive report with team collaboration
   */
  private async handleComprehensiveReport(payload: any): Promise<AgentTaskResult> {
    const { topic, requiresResearch, requiresVisuals } = payload;
    
    console.log(`📋 Planning comprehensive report on: ${topic}`);
    
    // Check if Researcher Agent can handle the research component
    let researchPlan: any = null;
    if (requiresResearch) {
      const researchCapability = await this.queryAgentCapability('researcher', 
        `Can you research ${topic} and provide comprehensive market analysis with current data?`);
      
      console.log(`🔍 Research capability assessment:`, {
        canPerform: researchCapability.canPerform,
        confidence: `${(researchCapability.confidenceLevel * 100).toFixed(1)}%`
      });
      
      if (researchCapability.canPerform && researchCapability.confidenceLevel > 0.8) {
        // Plan report with researcher collaboration
        const collaborationRequest: CollaborationRequest = {
          taskDescription: `Research ${topic} for comprehensive market analysis`,
          expectedDeliverables: ['market-data', 'trend-analysis', 'competitive-landscape'],
          timeline: '2 days',
          minimumConfidence: 0.8
        };
        
        const collaborationResponse = await this.requestAgentCollaboration('researcher', collaborationRequest);
        researchPlan = { 
          collaborating: collaborationResponse.accepted,
          reason: collaborationResponse.reason,
          timeline: collaborationResponse.estimatedCompletion
        };
        
        console.log(`🤝 Research collaboration:`, researchPlan);
      } else {
        // Suggest capability enhancement
        const enhancement: CapabilityEnhancement = {
          capability: 'market-analysis',
          justification: `Need comprehensive ${topic} analysis capability for better collaborative reports`,
          urgency: 'medium',
          benefits: ['Better collaborative reports', 'Enhanced team efficiency', 'More comprehensive insights']
        };
        
        const enhancementResponse = await this.proposeCapabilityEnhancement('researcher', enhancement);
        
        console.log(`💡 Proposed research enhancement:`, {
          feasible: enhancementResponse.feasible,
          reasoning: enhancementResponse.reasoning
        });
        
        researchPlan = { 
          collaborating: false,
          alternativeApproach: 'Basic research with external sources',
          enhancementProposed: true
        };
      }
    }
    
    // Check for visualization capabilities if required
    let visualPlan: any = null;
    if (requiresVisuals) {
      const visualCapableAgents = await this.findCapableAgents('Create professional infographics and data visualizations');
      
      console.log(`🎨 Visual-capable agents found:`, visualCapableAgents);
      
      if (visualCapableAgents.length > 0) {
        const bestVisualAgent = visualCapableAgents[0];
        visualPlan = {
          collaboratingWith: bestVisualAgent,
          capabilityConfirmed: true
        };
      } else {
        // Suggest adding visualization capability
        await this.proposeCapabilityEnhancement('image-generator', {
          capability: 'data-visualization',
          justification: 'Enhanced data analysis presentation capabilities',
          urgency: 'high',
          benefits: ['Better stakeholder communication', 'Improved analysis comprehension', 'Professional report presentation']
        });
        
        visualPlan = {
          collaboratingWith: null,
          enhancementProposed: true
        };
      }
    }
    
    // Generate comprehensive plan
    const reportPlan = {
      topic,
      sections: [
        'Executive Summary',
        requiresResearch && researchPlan?.collaborating ? 'Research-Based Market Analysis' : 'Overview',
        'Key Findings',
        'Recommendations',
        requiresVisuals ? 'Visual Data Presentation' : 'Supporting Data'
      ].filter(Boolean),
      collaborations: {
        research: researchPlan,
        visuals: visualPlan
      },
      estimatedCompletion: this.calculateReportTimeline(researchPlan, visualPlan),
      qualityExpectation: this.assessReportQuality(researchPlan, visualPlan)
    };
    
    return {
      success: true,
      result: {
        reportPlan,
        teamCollaborationSummary: {
          totalCollaborations: [researchPlan?.collaborating, visualPlan?.collaboratingWith].filter(Boolean).length,
          enhancementsProposed: [researchPlan?.enhancementProposed, visualPlan?.enhancementProposed].filter(Boolean).length,
          expectedQuality: reportPlan.qualityExpectation
        }
      }
    };
  }
  
  /**
   * Example: Team capability assessment for stakeholder reporting
   */
  private async handleTeamCapabilityAssessment(payload: any): Promise<AgentTaskResult> {
    console.log(`🔍 Assessing team capabilities for: ${payload.purpose}`);
    
    const availableAgents = await this.getAvailableAgents();
    const teamMatrix = await this.agentInspector.getTeamCapabilityMatrix();
    
    // Assess capabilities across different domains
    const domainAssessments = await Promise.all([
      this.assessDomainCapability('research-and-analysis', [
        'Can you conduct market research with current data?',
        'Can you analyze complex datasets and identify trends?',
        'Can you fact-check information and verify sources?'
      ]),
      this.assessDomainCapability('content-creation', [
        'Can you create professional business documents?',
        'Can you generate visual content and infographics?',
        'Can you write compelling marketing copy?'
      ]),
      this.assessDomainCapability('technical-skills', [
        'Can you develop web applications?',
        'Can you process and analyze audio files?',
        'Can you integrate with external APIs?'
      ])
    ]);
    
    const capabilityReport = {
      teamSize: availableAgents.length,
      domainAssessments,
      overallStrengths: this.identifyTeamStrengths(domainAssessments),
      capabilityGaps: this.identifyTeamGaps(domainAssessments),
      recommendedEnhancements: this.suggestTeamEnhancements(domainAssessments),
      collaborationPotential: teamMatrix.optimalCollaborationPaths.length,
      readinessScore: this.calculateTeamReadiness(domainAssessments)
    };
    
    return {
      success: true,
      result: capabilityReport
    };
  }
  
  /**
   * Example: Suggesting optimal collaborations for complex tasks
   */
  private async handleCollaborationSuggestion(payload: any): Promise<AgentTaskResult> {
    const { taskDescription, priority, deadline } = payload;
    
    console.log(`🤝 Suggesting collaborations for: ${taskDescription}`);
    
    const collaborationSuggestion = await this.suggestTeamCollaboration(taskDescription);
    
    if (collaborationSuggestion) {
      // Assess the suggested collaboration
      const primaryAssessment = await this.queryAgentCapability(
        collaborationSuggestion.primaryAgent, 
        taskDescription
      );
      
      const supportingAssessments = await Promise.all(
        collaborationSuggestion.supportingAgents.map(async agentId => ({
          agentId,
          assessment: await this.queryAgentCapability(agentId, taskDescription)
        }))
      );
      
      return {
        success: true,
        result: {
          recommendation: collaborationSuggestion,
          assessments: {
            primary: {
              agent: collaborationSuggestion.primaryAgent,
              confidence: primaryAssessment.confidenceLevel,
              approach: primaryAssessment.recommendedApproach
            },
            supporting: supportingAssessments.map(sa => ({
              agent: sa.agentId,
              confidence: sa.assessment.confidenceLevel,
              role: this.suggestSupportingRole(sa.assessment)
            }))
          },
          estimatedSuccess: this.calculateCollaborationSuccess(primaryAssessment, supportingAssessments.map(sa => sa.assessment)),
          risks: this.identifyCollaborationRisks(primaryAssessment, supportingAssessments.map(sa => sa.assessment))
        }
      };
    } else {
      return {
        success: true,
        result: {
          recommendation: null,
          reason: 'No agents found with sufficient capability for this task',
          suggestions: [
            'Break task into smaller components',
            'Consider capability enhancement',
            'Seek external resources'
          ]
        }
      };
    }
  }
  
  /**
   * Example: Proposing capability enhancements based on team needs analysis
   */
  private async handleCapabilityEnhancement(payload: any): Promise<AgentTaskResult> {
    const { targetAgent, analysisResults } = payload;
    
    console.log(`💡 Analyzing enhancement opportunities for: ${targetAgent}`);
    
    const currentCapabilities = await this.queryAgentCapability(targetAgent, 
      'What are your current core competencies and recent learning areas?');
    
    const teamMatrix = await this.agentInspector.getTeamCapabilityMatrix();
    const teamGaps = teamMatrix.gaps;
    
    // Identify enhancement opportunities based on team gaps
    const enhancementOpportunities = teamGaps
      .filter(gap => gap.severity === 'high' || gap.severity === 'medium')
      .map(gap => ({
        capability: gap.area,
        justification: `Address team capability gap: ${gap.recommendedSolution}`,
        urgency: gap.severity === 'high' ? 'high' as const : 'medium' as const,
        benefits: [
          'Fills critical team capability gap',
          'Improves overall team performance',
          'Reduces dependency on external resources'
        ]
      }));
    
    // Propose the most relevant enhancements
    const proposalResults = await Promise.all(
      enhancementOpportunities.slice(0, 3).map(async opportunity => {
        const response = await this.proposeCapabilityEnhancement(targetAgent, opportunity);
        return {
          opportunity,
          response
        };
      })
    );
    
    return {
      success: true,
      result: {
        targetAgent,
        currentCapabilityLevel: currentCapabilities.confidenceLevel,
        opportunitiesAnalyzed: enhancementOpportunities.length,
        proposalResults,
        summary: {
          feasibleEnhancements: proposalResults.filter(pr => pr.response.feasible).length,
          highImpactEnhancements: proposalResults.filter(pr => 
            pr.response.impactOnTeam.overallImpact === 'positive').length,
          approvalRequired: proposalResults.filter(pr => pr.response.approvalRequired).length
        }
      }
    };
  }
  
  // Helper methods for capability assessment
  private async assessDomainCapability(domain: string, testQueries: string[]): Promise<any> {
    const availableAgents = await this.getAvailableAgents();
    
    const domainResults = await Promise.all(
      availableAgents.map(async agent => {
        const queryResults = await Promise.all(
          testQueries.map(async query => {
            const assessment = await this.queryAgentCapability(agent.agentId, query);
            return {
              query,
              canPerform: assessment.canPerform,
              confidence: assessment.confidenceLevel
            };
          })
        );
        
        const avgConfidence = queryResults.reduce((sum, r) => sum + r.confidence, 0) / queryResults.length;
        const capableQueries = queryResults.filter(r => r.canPerform).length;
        
        return {
          agentId: agent.agentId,
          agentName: agent.agentName,
          domainScore: avgConfidence,
          capabilityBreadth: capableQueries / testQueries.length,
          specificCapabilities: queryResults.filter(r => r.canPerform).map(r => r.query)
        };
      })
    );
    
    return {
      domain,
      averageScore: domainResults.reduce((sum, r) => sum + r.domainScore, 0) / domainResults.length,
      topPerformers: domainResults.sort((a, b) => b.domainScore - a.domainScore).slice(0, 3),
      capabilityGaps: testQueries.filter(query => 
        !domainResults.some(result => 
          result.specificCapabilities.includes(query)
        )
      )
    };
  }
  
  private identifyTeamStrengths(assessments: any[]): string[] {
    return assessments
      .filter(assessment => assessment.averageScore > 0.7)
      .map(assessment => assessment.domain);
  }
  
  private identifyTeamGaps(assessments: any[]): string[] {
    return assessments
      .filter(assessment => assessment.averageScore < 0.5)
      .map(assessment => assessment.domain);
  }
  
  private suggestTeamEnhancements(assessments: any[]): any[] {
    return assessments
      .filter(assessment => assessment.capabilityGaps.length > 0)
      .map(assessment => ({
        domain: assessment.domain,
        missingCapabilities: assessment.capabilityGaps,
        suggestedActions: assessment.capabilityGaps.map((gap: string) => 
          `Enhance team capability in: ${gap}`)
      }));
  }
  
  private calculateTeamReadiness(assessments: any[]): number {
    const avgScore = assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length;
    return Math.round(avgScore * 100) / 100;
  }
  
  private calculateReportTimeline(researchPlan: any, visualPlan: any): string {
    let days = 1; // Base timeline
    if (researchPlan?.collaborating) days += 2;
    if (visualPlan?.collaboratingWith) days += 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  private assessReportQuality(researchPlan: any, visualPlan: any): string {
    let qualityScore = 7; // Base quality
    if (researchPlan?.collaborating) qualityScore += 2;
    if (visualPlan?.collaboratingWith) qualityScore += 1;
    
    if (qualityScore >= 9) return 'Excellent';
    if (qualityScore >= 7) return 'Good';
    return 'Standard';
  }
  
  private suggestSupportingRole(assessment: CapabilityAssessment): string {
    if (assessment.confidenceLevel > 0.8) return 'Primary Support';
    if (assessment.confidenceLevel > 0.6) return 'Secondary Support';
    return 'Consulting Role';
  }
  
  private calculateCollaborationSuccess(primary: CapabilityAssessment, supporting: CapabilityAssessment[]): number {
    const primaryWeight = 0.6;
    const supportingWeight = 0.4;
    
    const supportingAvg = supporting.length > 0 
      ? supporting.reduce((sum, s) => sum + s.confidenceLevel, 0) / supporting.length
      : 0.5;
    
    return primary.confidenceLevel * primaryWeight + supportingAvg * supportingWeight;
  }
  
  private identifyCollaborationRisks(primary: CapabilityAssessment, supporting: CapabilityAssessment[]): string[] {
    const risks: string[] = [];
    
    if (primary.confidenceLevel < 0.7) {
      risks.push('Primary agent has moderate confidence - may require additional support');
    }
    
    if (supporting.some(s => s.confidenceLevel < 0.6)) {
      risks.push('Some supporting agents have low confidence in the task');
    }
    
    if (primary.requiredPreparation.length > 2) {
      risks.push('Significant preparation required before starting');
    }
    
    return risks;
  }
  
  private async handleStandardTask(task: AgentTask): Promise<AgentTaskResult> {
    // Fallback to standard communications agent functionality
    return {
      success: true,
      result: `Standard communications task handled: ${task.type}`
    };
  }
}

export default EnhancedCommunicationsAgent;
