import { globalAgentRegistry } from './GlobalAgentRegistry';
import { EnhancedCommunicationsAgent } from './EnhancedCommunicationsAgent';
import { CapabilityUtils } from './AgentCapabilityAware';

/**
 * Global Agent Capability System Demo
 * 
 * This demo shows how the global capability awareness system enables
 * all agents to inspect each other's capabilities, request collaborations,
 * and propose enhancements for optimal team coordination.
 */

async function runGlobalCapabilityDemo() {
  console.log('\n🚀 Global Agent Capability System Demo');
  console.log('=====================================\n');
  
  // Register an enhanced communications agent
  const enhancedComm = new EnhancedCommunicationsAgent();
  globalAgentRegistry.register(enhancedComm);
  
  console.log('✅ Registered Enhanced Communications Agent with global capability awareness\n');
  
  // Demo 1: Agent inspecting team capabilities
  console.log('📊 Demo 1: Team Capability Assessment');
  console.log('------------------------------------');
  
  const teamAssessment = await enhancedComm.handleTask({
    type: 'assess-team-capabilities',
    payload: { purpose: 'Executive stakeholder report' }
  });
  
  if (teamAssessment.success) {
    console.log('Team Assessment Results:');
    console.log(`- Team Size: ${teamAssessment.result.teamSize} agents`);
    console.log(`- Overall Readiness Score: ${teamAssessment.result.readinessScore}/1.0`);
    console.log(`- Domain Strengths: ${teamAssessment.result.overallStrengths.join(', ')}`);
    console.log(`- Capability Gaps: ${teamAssessment.result.capabilityGaps.join(', ')}`);
    console.log(`- Collaboration Potential: ${teamAssessment.result.collaborationPotential} optimal paths`);
  }
  
  console.log('\n');
  
  // Demo 2: Cross-agent capability queries
  console.log('🔍 Demo 2: Cross-Agent Capability Queries');
  console.log('-----------------------------------------');
  
  // Any agent can now query other agents' capabilities
  console.log('Enhanced Communications Agent checking if Researcher can handle crypto analysis...\n');
  
  const cryptoCapability = await enhancedComm.queryAgentCapability('researcher', 
    'Can you analyze cryptocurrency market trends and provide predictive insights with confidence?'
  );
  
  console.log('Crypto Analysis Capability Assessment:');
  console.log(`- Can Perform: ${cryptoCapability.canPerform}`);
  console.log(`- Confidence Level: ${(cryptoCapability.confidenceLevel * 100).toFixed(1)}%`);
  console.log(`- Recommended Approach: ${cryptoCapability.recommendedApproach}`);
  console.log(`- Required Preparation: ${cryptoCapability.requiredPreparation.map(p => p.step).join(', ')}`);
  
  if (cryptoCapability.collaborationSuggestions.length > 0) {
    console.log(`- Collaboration Suggestions: ${cryptoCapability.collaborationSuggestions.map(cs => 
      `Work with ${cs.withAgent} for ${cs.approach}`).join('; ')}`);
  }
  
  console.log('\n');
  
  // Demo 3: Agent-to-agent collaboration requests
  console.log('🤝 Demo 3: Agent-to-Agent Collaboration');
  console.log('--------------------------------------');
  
  const collaborationSuggestion = await enhancedComm.handleTask({
    type: 'suggest-collaboration',
    payload: {
      taskDescription: 'Create comprehensive AI market analysis report with visualizations',
      priority: 'high',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    }
  });
  
  if (collaborationSuggestion.success && collaborationSuggestion.result.recommendation) {
    console.log('Optimal Collaboration Suggested:');
    console.log(`- Primary Agent: ${collaborationSuggestion.result.recommendation.primaryAgent}`);
    console.log(`- Supporting Agents: ${collaborationSuggestion.result.recommendation.supportingAgents.join(', ')}`);
    console.log(`- Estimated Success Rate: ${(collaborationSuggestion.result.estimatedSuccess * 100).toFixed(1)}%`);
    
    if (collaborationSuggestion.result.risks.length > 0) {
      console.log(`- Risk Factors: ${collaborationSuggestion.result.risks.join('; ')}`);
    }
  } else {
    console.log('No optimal collaboration found');
    if (collaborationSuggestion.success && collaborationSuggestion.result.suggestions) {
      console.log(`Suggestions: ${collaborationSuggestion.result.suggestions.join('; ')}`);
    }
  }
  
  console.log('\n');
  
  // Demo 4: Capability enhancement proposals
  console.log('💡 Demo 4: Capability Enhancement Proposals');
  console.log('-------------------------------------------');
  
  const enhancementAnalysis = await enhancedComm.handleTask({
    type: 'enhance-agent-capability',
    payload: {
      targetAgent: 'researcher',
      analysisResults: 'Team needs better financial data analysis capabilities'
    }
  });
  
  if (enhancementAnalysis.success) {
    console.log('Enhancement Analysis Results:');
    console.log(`- Target Agent: ${enhancementAnalysis.result.targetAgent}`);
    console.log(`- Current Capability Level: ${(enhancementAnalysis.result.currentCapabilityLevel * 100).toFixed(1)}%`);
    console.log(`- Opportunities Analyzed: ${enhancementAnalysis.result.opportunitiesAnalyzed}`);
    console.log(`- Feasible Enhancements: ${enhancementAnalysis.result.summary.feasibleEnhancements}`);
    console.log(`- High Impact Enhancements: ${enhancementAnalysis.result.summary.highImpactEnhancements}`);
    
    enhancementAnalysis.result.proposalResults.forEach((proposal: any, index: number) => {
      console.log(`\nProposal ${index + 1}: ${proposal.opportunity.capability}`);
      console.log(`  - Feasible: ${proposal.response.feasible}`);
      console.log(`  - Reasoning: ${proposal.response.reasoning}`);
      if (proposal.response.feasible && proposal.response.benefits) {
        console.log(`  - Expected Benefits: ${proposal.response.impactOnTeam.overallImpact}`);
      }
    });
  }
  
  console.log('\n');
  
  // Demo 5: Comprehensive report planning with team collaboration
  console.log('📋 Demo 5: Comprehensive Report Planning');
  console.log('----------------------------------------');
  
  const reportPlan = await enhancedComm.handleTask({
    type: 'draft-comprehensive-report',
    payload: {
      topic: 'AI Tools for Small Business Market Analysis',
      requiresResearch: true,
      requiresVisuals: true
    }
  });
  
  if (reportPlan.success) {
    console.log('Comprehensive Report Plan:');
    console.log(`- Topic: ${reportPlan.result.reportPlan.topic}`);
    console.log(`- Estimated Completion: ${reportPlan.result.reportPlan.estimatedCompletion}`);
    console.log(`- Expected Quality: ${reportPlan.result.reportPlan.qualityExpectation}`);
    console.log(`- Report Sections: ${reportPlan.result.reportPlan.sections.join(', ')}`);
    
    console.log('\nCollaboration Summary:');
    console.log(`- Total Collaborations: ${reportPlan.result.teamCollaborationSummary.totalCollaborations}`);
    console.log(`- Enhancements Proposed: ${reportPlan.result.teamCollaborationSummary.enhancementsProposed}`);
    
    if (reportPlan.result.reportPlan.collaborations.research) {
      console.log(`- Research Collaboration: ${reportPlan.result.reportPlan.collaborations.research.collaborating ? 'Active' : 'Alternative approach'}`);
    }
    
    if (reportPlan.result.reportPlan.collaborations.visuals) {
      console.log(`- Visual Collaboration: ${reportPlan.result.reportPlan.collaborations.visuals.collaboratingWith || 'Enhancement proposed'}`);
    }
  }
  
  console.log('\n');
  
  // Demo 6: Global team capability matrix
  console.log('🌐 Demo 6: Global Team Capability Matrix');
  console.log('----------------------------------------');
  
  const teamMatrix = await globalAgentRegistry.getTeamCapabilityMatrix();
  
  console.log('Team Capability Matrix:');
  console.log(`- Total Agents: ${teamMatrix.agents.length}`);
  console.log(`- Team Synergies Identified: ${teamMatrix.synergies.length}`);
  console.log(`- Capability Gaps: ${teamMatrix.gaps.length}`);
  console.log(`- Recommended Enhancements: ${teamMatrix.recommendedEnhancements.length}`);
  console.log(`- Optimal Collaboration Paths: ${teamMatrix.optimalCollaborationPaths.length}`);
  
  if (teamMatrix.synergies.length > 0) {
    console.log('\nTop Team Synergies:');
    teamMatrix.synergies.slice(0, 3).forEach((synergy, index) => {
      console.log(`  ${index + 1}. ${synergy.agents.join(' + ')} → ${synergy.synergyType} (${(synergy.potential * 100).toFixed(0)}% potential)`);
    });
  }
  
  if (teamMatrix.gaps.length > 0) {
    console.log('\nKey Capability Gaps:');
    teamMatrix.gaps.slice(0, 3).forEach((gap, index) => {
      console.log(`  ${index + 1}. ${gap.area} (${gap.severity}) → ${gap.recommendedSolution}`);
    });
  }
  
  console.log('\n');
  
  // Demo 7: Multi-agent task allocation
  console.log('🎯 Demo 7: Optimal Task Allocation');
  console.log('---------------------------------');
  
  const complexTask = {
    description: 'Develop comprehensive cryptocurrency investment guide with market analysis, risk assessment, and interactive tools',
    requirements: ['Market research', 'Financial analysis', 'Content creation', 'Visual design', 'Risk modeling'],
    priority: 'high' as const,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
  };
  
  const taskAllocation = await globalAgentRegistry.suggestOptimalTaskAllocation(complexTask);
  
  console.log('Optimal Task Allocation:');
  console.log(`- Primary Agent: ${taskAllocation.primaryAgent}`);
  console.log(`- Supporting Agents: ${taskAllocation.supportingAgents.join(', ')}`);
  console.log(`- Estimated Effort: ${taskAllocation.estimatedEffort}`);
  
  console.log('\nCollaboration Plan:');
  taskAllocation.collaborationPlan.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step.step} (${step.responsible}) - ${step.estimatedTime}`);
  });
  
  if (taskAllocation.riskFactors.length > 0) {
    console.log(`\nRisk Factors: ${taskAllocation.riskFactors.join('; ')}`);
  }
  
  if (taskAllocation.fallbackOptions.length > 0) {
    console.log(`\nFallback Options: ${taskAllocation.fallbackOptions.join('; ')}`);
  }
  
  console.log('\n🎉 Demo Complete! Global capability awareness is now active across all agents.\n');
  
  // Final summary
  console.log('🔮 System Impact Summary:');
  console.log('=========================');
  console.log('✅ Every agent can now query other agents\' capabilities');
  console.log('✅ Agents can request collaborations directly');
  console.log('✅ Agents can propose capability enhancements');
  console.log('✅ Team synergies are automatically identified');
  console.log('✅ Optimal task allocation is intelligently suggested');
  console.log('✅ Real-time capability assessment for accurate responses');
  console.log('✅ No more mock responses - everything based on actual agent state');
}

// Utility function for testing specific agent capabilities
async function testSpecificCapability(agentId: string, capability: string) {
  console.log(`\n🧪 Testing ${agentId} capability: "${capability}"`);
  
  try {
    const agents = globalAgentRegistry.getAllAgents();
    const testAgent = agents.find(a => a.id === 'enhanced-communications');
    
    if (testAgent && 'queryAgentCapability' in testAgent) {
      const assessment = await (testAgent as any).queryAgentCapability(agentId, capability);
      
      console.log('Assessment Result:');
      console.log(`- Can Perform: ${assessment.canPerform}`);
      console.log(`- Confidence: ${(assessment.confidenceLevel * 100).toFixed(1)}%`);
      console.log(`- Approach: ${assessment.recommendedApproach}`);
      
      return assessment;
    }
  } catch (error) {
    console.error(`Error testing capability: ${error.message}`);
  }
  
  return null;
}

// Export for use in other modules
export { runGlobalCapabilityDemo, testSpecificCapability };

// Run demo if this file is executed directly
if (require.main === module) {
  runGlobalCapabilityDemo().catch(console.error);
}
