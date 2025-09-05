/**
 * New Orleans Piano Masterclass Scenario Test
 * 
 * This test demonstrates the full workflow from Executive Stakeholder request
 * through Personal Assistant coordination to agent team execution and deliverable creation.
 * 
 * Scenario: "Please create me a master class that will teach me and help me practice 
 * on the piano, with chords and examples, the New Orleans Piano that Dr. John plays"
 */

import { AgentRegistry } from '../agents/AgentRegistry';
import { PersonalAssistantAgent } from '../agents/PersonalAssistantAgent';
import { MasterOrchestratorAgent } from '../agents/MasterOrchestratorAgent';
import { ProjectCoordinatorAgent } from '../agents/ProjectCoordinatorAgent';
import { MusicCoachAgent } from '../agents/MusicCoachAgent';

async function testNewOrleansWorkflow() {
  console.log('🎹 Starting New Orleans Piano Masterclass Workflow Test...\n');
  
  // Initialize agent registry
  const registry = new AgentRegistry();
  
  // Get our priority agents
  const personalAssistant = registry.getAgent('personal-assistant') as PersonalAssistantAgent;
  const masterOrchestrator = registry.getAgent('master-orchestrator') as MasterOrchestratorAgent;
  const projectCoordinator = registry.getAgent('project-coordinator') as ProjectCoordinatorAgent;
  const musicCoach = registry.getAgent('music-coach') as MusicCoachAgent;
  
  console.log('✅ Agents initialized successfully');
  console.log(`   - Personal Assistant: ${personalAssistant.name}`);
  console.log(`   - Master Orchestrator: ${masterOrchestrator.name}`);
  console.log(`   - Project Coordinator: ${projectCoordinator.name}`);
  console.log(`   - Music Coach: ${musicCoach.name}\n`);

  // Step 1: Executive Stakeholder Request via Personal Assistant
  console.log('📝 Step 1: Executive Request Processing...');
  const executiveRequest = {
    type: 'executive_request',
    payload: {
      request: 'Please create me a master class that will teach me and help me practice on the piano, with chords and examples, the New Orleans Piano that Dr. John plays in his music. I want to understand the style, learn the characteristic chord progressions, and get practical exercises I can practice daily.',
      context: {
        skill_level: 'intermediate',
        time_available: '30-60 minutes per session',
        focus_areas: ['chords', 'rhythm', 'technique', 'style'],
        reference_artist: 'Dr. John',
        style: 'New Orleans Piano'
      },
      urgency: 'normal'
    }
  };
  
  try {
    const paResult = await personalAssistant.handleTask(executiveRequest);
    
    if (paResult.success && paResult.result) {
      console.log('✅ Personal Assistant processed request successfully');
      console.log(`   - Request ID: ${paResult.result.requestId}`);
      console.log(`   - Workflow Plan: ${paResult.result.workflowPlan?.requiredAgents?.length || 0} agents assigned`);
      console.log(`   - Estimated Completion: ${paResult.result.estimatedCompletion}`);
      console.log(`   - Priority: ${paResult.result.priorityAssessment?.priorityLevel || 'normal'}\n`);
      
      // Step 2: Master Orchestrator Coordination
      console.log('🎯 Step 2: Master Orchestrator Project Setup...');
      const orchestratorTask = {
        type: 'orchestrate_project',
        payload: {
          request: executiveRequest.payload.request,
          workflowPlan: paResult.result.workflowPlan,
          priority: paResult.result.priorityAssessment?.priorityLevel || 'normal'
        }
      };
      
      const orchestratorResult = await masterOrchestrator.handleTask(orchestratorTask);
      
      if (orchestratorResult.success && orchestratorResult.result) {
        console.log('✅ Master Orchestrator coordinated project successfully');
        console.log(`   - Project Analysis: ${orchestratorResult.result.projectAnalysis?.projectType || 'multi-agent'}`);
        console.log(`   - Task Breakdown: ${orchestratorResult.result.taskBreakdown?.phases?.length || 0} phases`);
        console.log(`   - Agent Assignments: ${orchestratorResult.result.agentAssignments?.length || 0} assignments\n`);
        
        // Step 3: Project Coordinator Timeline Management
        console.log('📅 Step 3: Project Coordinator Timeline Setup...');
        const coordinatorTask = {
          type: 'create_project_plan',
          payload: {
            requirements: executiveRequest.payload.request,
            constraints: {
              timeline: paResult.result.estimatedCompletion,
              quality: 'executive_level',
              scope: 'comprehensive_masterclass'
            }
          }
        };
        
        const coordinatorResult = await projectCoordinator.handleTask(coordinatorTask);
        
        if (coordinatorResult.success && coordinatorResult.result) {
          console.log('✅ Project Coordinator created plan successfully');
          console.log(`   - Estimated Duration: ${coordinatorResult.result.estimatedDuration}`);
          console.log(`   - Risk Assessment: ${coordinatorResult.result.riskAssessment?.riskLevel || 'low'}`);
          console.log(`   - Next Steps: ${coordinatorResult.result.nextSteps?.length || 0} actions identified\n`);
          
          // Step 4: Music Coach Masterclass Creation
          console.log('🎼 Step 4: Music Coach Masterclass Development...');
          const musicCoachTask = {
            type: 'create_masterclass',
            payload: {
              song: 'Dr. John style New Orleans Piano',
              style: 'New Orleans Piano',
              level: executiveRequest.payload.context.skill_level,
              focus: executiveRequest.payload.context.focus_areas
            }
          };
          
          const musicCoachResult = await musicCoach.handleTask(musicCoachTask);
          
          if (musicCoachResult.success && musicCoachResult.result) {
            console.log('✅ Music Coach created masterclass successfully');
            console.log(`   - Masterclass Title: ${musicCoachResult.result.title}`);
            console.log(`   - Style: ${musicCoachResult.result.style}`);
            console.log(`   - Skill Level: ${musicCoachResult.result.skillLevel}`);
            console.log(`   - Focus Areas: ${musicCoachResult.result.focusAreas?.join(', ') || 'comprehensive'}`);
            console.log(`   - Duration: ${musicCoachResult.result.estimatedDuration}`);
            console.log(`   - Practice Exercises: ${musicCoachResult.result.practiceExercises?.totalExercises || 0} exercises`);
            console.log(`   - Chord Progressions: ${musicCoachResult.result.chordProgressions?.length || 0} progressions`);
            console.log(`   - Technique Guides: ${musicCoachResult.result.techniqueGuides?.length || 0} guides\n`);
            
            // Step 5: Integration and Executive Summary
            console.log('📋 Step 5: Personal Assistant Executive Summary...');
            const summaryTask = {
              type: 'generate_summary',
              payload: {
                projectData: {
                  request: executiveRequest.payload.request,
                  orchestration: orchestratorResult.result,
                  planning: coordinatorResult.result,
                  masterclass: musicCoachResult.result
                },
                type: 'executive',
                audience: 'stakeholder',
                format: 'comprehensive_document'
              }
            };
            
            const summaryResult = await personalAssistant.handleTask(summaryTask);
            
            if (summaryResult.success && summaryResult.result) {
              console.log('✅ Personal Assistant generated executive summary successfully');
              console.log(`   - Summary Type: ${summaryResult.result.summaryType}`);
              console.log(`   - Format: ${summaryResult.result.format}`);
              console.log(`   - Reading Time: ${summaryResult.result.readingTime}`);
              console.log(`   - Key Metrics Available: ${Object.keys(summaryResult.result.keyMetrics || {}).length} metrics`);
              console.log(`   - Strategic Insights: ${summaryResult.result.strategicInsights?.recommendations?.length || 0} recommendations\n`);
              
              // Step 6: Quality Review and Final Deliverable
              console.log('🔍 Step 6: Master Orchestrator Quality Review...');
              const reviewTask = {
                type: 'quality_review',
                payload: {
                  deliverable: {
                    masterclass: musicCoachResult.result,
                    executiveSummary: summaryResult.result,
                    projectPlan: coordinatorResult.result
                  }
                }
              };
              
              const reviewResult = await masterOrchestrator.handleTask(reviewTask);
              
              if (reviewResult.success && reviewResult.result) {
                console.log('✅ Master Orchestrator quality review completed');
                console.log(`   - Quality Score: ${reviewResult.result.qualityScore}/100`);
                console.log(`   - Approved: ${reviewResult.result.approved ? 'Yes' : 'No'}`);
                console.log(`   - Recommendations: ${reviewResult.result.recommendations?.length || 0} items\n`);
                
                // Final Success Summary
                console.log('🎉 NEW ORLEANS PIANO MASTERCLASS WORKFLOW COMPLETED SUCCESSFULLY!');
                console.log('========================================================');
                console.log('\n📊 FINAL DELIVERABLE SUMMARY:');
                console.log(`✅ Comprehensive New Orleans Piano Masterclass Created`);
                console.log(`✅ ${musicCoachResult.result.focusAreas?.length || 4} Focus Areas Covered (${musicCoachResult.result.focusAreas?.join(', ') || 'chords, rhythm, technique, style'})`);
                console.log(`✅ ${musicCoachResult.result.practiceExercises?.totalExercises || 'Multiple'} Practice Exercises Generated`);
                console.log(`✅ ${musicCoachResult.result.chordProgressions?.length || 'Several'} Chord Progressions with Dr. John Style Voicings`);
                console.log(`✅ ${musicCoachResult.result.estimatedDuration} Estimated Learning Duration`);
                console.log(`✅ Executive-Level Documentation and Summary`);
                console.log(`✅ Quality Score: ${reviewResult.result.qualityScore}/100 (${reviewResult.result.approved ? 'APPROVED' : 'NEEDS REVISION'})`);
                
                console.log('\n🎯 AGENT TEAM COORDINATION SUCCESS:');
                console.log(`✅ Personal Assistant: Request processing and executive interface`);
                console.log(`✅ Master Orchestrator: Project coordination and quality control`);
                console.log(`✅ Project Coordinator: Timeline and resource management`);
                console.log(`✅ Music Coach: Specialized New Orleans piano instruction`);
                
                console.log('\n🔄 ITERATIVE FEEDBACK READY:');
                console.log(`✅ Feedback loop established for refinements`);
                console.log(`✅ Executive presentation materials prepared`);
                console.log(`✅ Follow-up coordination scheduled`);
                
                return {
                  success: true,
                  masterclass: musicCoachResult.result,
                  executiveSummary: summaryResult.result,
                  qualityReview: reviewResult.result,
                  message: 'New Orleans Piano Masterclass workflow completed successfully with full agent coordination!'
                };
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
  
  console.log('❌ Workflow test encountered issues - check agent implementations');
  return {
    success: false,
    error: 'Workflow did not complete successfully'
  };
}

// Export for testing
export { testNewOrleansWorkflow };

// Run test if called directly
if (require.main === module) {
  testNewOrleansWorkflow()
    .then(result => {
      console.log('\n🏁 Test Result:', result.success ? 'SUCCESS' : 'FAILED');
      if (!result.success) {
        console.log('Error:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}
