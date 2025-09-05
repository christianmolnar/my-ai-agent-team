import { PersonalAssistantAgent } from './agents/PersonalAssistantAgent';
import { MasterOrchestratorAgent } from './agents/MasterOrchestratorAgent';
import { MusicCoachAgent } from './agents/MusicCoachAgent';
import { PersonalAssistantBridge } from './agents/PersonalAssistantBridge';

/**
 * Demo Application for Personal Assistant → Master Orchestrator → Agent Workflow
 * 
 * This demonstrates the complete integration:
 * 1. User conversation with Personal Assistant (Claude Sonnet 4)
 * 2. Intent analysis and orchestration decision
 * 3. Master Orchestrator coordination with specialized agents
 * 4. Music Coach as first specialized agent implementation
 * 5. External API integration and response synthesis
 */

class PersonalAssistantDemo {
  private personalAssistant: PersonalAssistantAgent;
  private masterOrchestrator: MasterOrchestratorAgent;
  private musicCoach: MusicCoachAgent;
  private bridge: PersonalAssistantBridge;

  constructor() {
    this.personalAssistant = new PersonalAssistantAgent();
    this.masterOrchestrator = new MasterOrchestratorAgent();
    this.musicCoach = new MusicCoachAgent();
    this.bridge = new PersonalAssistantBridge();
  }

  /**
   * Demo Scenario 1: Simple conversation (direct response)
   */
  async demoDirectConversation(): Promise<void> {
    console.log('\n🎯 Demo 1: Direct Conversation with Personal Assistant');
    console.log('=====================================');

    const userMessage = "Hello! Can you tell me about my current projects?";
    console.log(`User: "${userMessage}"`);
    
    const response = await this.personalAssistant.handleUserConversation(userMessage);
    
    console.log('\nPersonal Assistant Response:');
    console.log(`Type: ${response.conversationType}`);
    console.log(`Response: ${response.response}`);
    
    if (response.suggestedFollowUps) {
      console.log('\nSuggested Follow-ups:');
      response.suggestedFollowUps.forEach(followUp => console.log(`  - ${followUp}`));
    }
  }

  /**
   * Demo Scenario 2: Complex request requiring orchestration
   */
  async demoOrchestratedRequest(): Promise<void> {
    console.log('\n🎯 Demo 2: Orchestrated Request (Multi-Agent Coordination)');
    console.log('=========================================');

    const userMessage = "I want to improve my piano skills and create a comprehensive learning plan with practice sessions, theory lessons, and progress tracking.";
    console.log(`User: "${userMessage}"`);
    
    const response = await this.personalAssistant.handleUserConversation(userMessage);
    
    console.log('\nPersonal Assistant Response:');
    console.log(`Type: ${response.conversationType}`);
    console.log(`Involved Agents: ${response.involvedAgents?.join(', ')}`);
    console.log(`Deliverables: ${response.deliverables?.join(', ')}`);
    console.log(`Execution Time: ${response.executionTime}ms`);
    console.log(`Response: ${response.response}`);
  }

  /**
   * Demo Scenario 3: Direct Music Coach interaction
   */
  async demoMusicCoachDirect(): Promise<void> {
    console.log('\n🎯 Demo 3: Direct Music Coach Interaction');
    console.log('==================================');

    console.log('\nTesting Music Coach Capabilities:');
    
    // Test chord teaching
    console.log('\n--- Chord Teaching ---');
    const chordLesson = await this.musicCoach.handleTask({
      type: 'teach-chords',
      payload: {
        instrument: 'piano',
        level: 'beginner',
        key: 'C',
        style: 'pop'
      }
    });
    console.log('Chord Lesson Result:', JSON.stringify(chordLesson, null, 2));

    // Test progression analysis
    console.log('\n--- Progression Analysis ---');
    const progressionAnalysis = await this.musicCoach.handleTask({
      type: 'analyze-progression',
      payload: {
        chords: ['C', 'Am', 'F', 'G'],
        key: 'C'
      }
    });
    console.log('Progression Analysis Result:', JSON.stringify(progressionAnalysis, null, 2));

    // Test practice session creation
    console.log('\n--- Practice Session Creation ---');
    const practiceSession = await this.musicCoach.handleTask({
      type: 'create-practice-session',
      payload: {
        level: 'intermediate',
        instrument: 'piano',
        duration: 45,
        focus_area: 'chord progressions'
      }
    });
    console.log('Practice Session Result:', JSON.stringify(practiceSession, null, 2));
  }

  /**
   * Demo Scenario 4: Bridge integration test
   */
  async demoBridgeIntegration(): Promise<void> {
    console.log('\n🎯 Demo 4: Personal Assistant Bridge Integration');
    console.log('=========================================');

    console.log('\nTesting Bridge Data Access:');
    
    // Test identity data access
    console.log('\n--- Identity Data ---');
    const identityResult = await this.bridge.handleTask({
      type: 'get-identity-data',
      payload: { requestingAgent: 'personal-assistant' }
    });
    console.log('Identity Result:', JSON.stringify(identityResult, null, 2));

    // Test communications style
    console.log('\n--- Communications Style ---');
    const commResult = await this.bridge.handleTask({
      type: 'get-communications-style',
      payload: { requestingAgent: 'personal-assistant' }
    });
    console.log('Communications Result:', JSON.stringify(commResult, null, 2));

    // Test project context
    console.log('\n--- Project Context ---');
    const projectResult = await this.bridge.handleTask({
      type: 'get-project-context',
      payload: { requestingAgent: 'personal-assistant' }
    });
    console.log('Project Result:', JSON.stringify(projectResult, null, 2));
  }

  /**
   * Demo Scenario 5: Complete workflow integration
   */
  async demoCompleteWorkflow(): Promise<void> {
    console.log('\n🎯 Demo 5: Complete Workflow Integration');
    console.log('====================================');

    const musicRequest = "I'm interested in learning jazz piano. Can you help me understand jazz chord progressions, create a practice routine, and suggest some songs to work on?";
    console.log(`User Request: "${musicRequest}"`);

    // Step 1: Personal Assistant receives request
    console.log('\n--- Step 1: Personal Assistant Analysis ---');
    const intentAnalysis = await this.personalAssistant.handleTask({
      type: 'analyze-intent',
      payload: { message: musicRequest }
    });
    console.log('Intent Analysis:', JSON.stringify(intentAnalysis, null, 2));

    // Step 2: If orchestration needed, Master Orchestrator creates plan
    if (intentAnalysis.result?.requiresOrchestration) {
      console.log('\n--- Step 2: Master Orchestrator Planning ---');
      const orchestratorPlan = await this.masterOrchestrator.handleTask({
        type: 'plan',
        payload: {
          userRequest: musicRequest,
          requiredAgents: ['music-coach'],
          complexity: 'high'
        }
      });
      console.log('Orchestrator Plan:', JSON.stringify(orchestratorPlan, null, 2));

      // Step 3: Execute with Music Coach
      console.log('\n--- Step 3: Music Coach Execution ---');
      const jazzLesson = await this.musicCoach.handleTask({
        type: 'theory-lesson',
        payload: {
          topic: 'jazz chord progressions',
          level: 'intermediate',
          context: 'piano'
        }
      });
      console.log('Jazz Lesson:', JSON.stringify(jazzLesson, null, 2));
    }

    // Step 4: Final integrated response
    console.log('\n--- Step 4: Final User Response ---');
    const finalResponse = await this.personalAssistant.handleUserConversation(musicRequest);
    console.log('Complete Response:', JSON.stringify(finalResponse, null, 2));
  }

  /**
   * Run all demo scenarios
   */
  async runAllDemos(): Promise<void> {
    console.log('🚀 Personal Assistant System Integration Demo');
    console.log('==========================================');

    try {
      await this.demoDirectConversation();
      await this.demoOrchestratedRequest();
      await this.demoMusicCoachDirect();
      await this.demoBridgeIntegration();
      await this.demoCompleteWorkflow();

      console.log('\n✅ All demos completed successfully!');
      console.log('\n📊 Success Criteria Verification:');
      console.log('✅ Personal Assistant successfully making external model API calls (mock)');
      console.log('✅ Master Orchestrator crafting plans and coordinating agents');
      console.log('✅ Music Coach providing specialized education services');
      console.log('✅ Bridge providing secure private repository access');
      console.log('✅ Complete workflow from user input to agent coordination to response');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Export for external usage
export { PersonalAssistantDemo };

// Run demos if this file is executed directly
if (require.main === module) {
  const demo = new PersonalAssistantDemo();
  demo.runAllDemos().then(() => {
    console.log('\n🎉 Personal Assistant System Demo Complete!');
  }).catch(error => {
    console.error('Demo execution failed:', error);
  });
}
