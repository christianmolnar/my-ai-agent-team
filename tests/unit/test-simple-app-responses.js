#!/usr/bin/env node

/**
 * Test script to verify that agents now provide concise responses for simple applications
 * instead of verbose methodological planning
 */

import { FullStackDeveloperAgent } from './agents/full-stack-developer.js';
import { ExperienceDesignerAgent } from './agents/experience-designer.js';
import { TestExpertAgent } from './agents/test-expert.js';
import { ProjectCoordinatorAgent } from './agents/project-coordinator.js';
import { CommunicationsAgent } from './agents/communications.js';
import { DataScientistAgent } from './agents/data-scientist.js';
import { DevDesignDocCreatorAgent } from './agents/dev-design-doc-creator.js';
import { BackEndDeveloperAgent } from './agents/back-end-developer.js';

async function testSimpleApplicationResponses() {
  console.log('🧪 Testing Simple Application Response Improvements\n');
  
  const testRequest = "Create a checkers game";
  const agents = [
    { name: 'FullStackDeveloper', agent: new FullStackDeveloperAgent() },
    { name: 'ExperienceDesigner', agent: new ExperienceDesignerAgent() },
    { name: 'TestExpert', agent: new TestExpertAgent() },
    { name: 'ProjectCoordinator', agent: new ProjectCoordinatorAgent() },
    { name: 'Communications', agent: new CommunicationsAgent() },
    { name: 'DataScientist', agent: new DataScientistAgent() },
    { name: 'DevDesignDocCreator', agent: new DevDesignDocCreatorAgent() },
    { name: 'BackEndDeveloper', agent: new BackEndDeveloperAgent() }
  ];

  for (const { name, agent } of agents) {
    console.log(`\n📋 Testing ${name} Agent:`);
    console.log('─'.repeat(50));
    
    try {
      const task = {
        type: 'execute-task',
        payload: { userRequest: testRequest }
      };
      
      const result = await agent.handleTask(task);
      
      if (result.success) {
        const response = result.result;
        const responseLength = response.length;
        const hasMethodology = response.toLowerCase().includes('methodology');
        const hasFramework = response.toLowerCase().includes('framework');
        const isVerbose = responseLength > 1000;
        
        console.log(`✅ Response Length: ${responseLength} characters`);
        console.log(`${hasMethodology ? '⚠️' : '✅'} Contains "methodology": ${hasMethodology}`);
        console.log(`${hasFramework ? '⚠️' : '✅'} Contains "framework": ${hasFramework}`);
        console.log(`${isVerbose ? '⚠️' : '✅'} Verbose (>1000 chars): ${isVerbose}`);
        
        // Show first 200 characters of response
        console.log(`\nResponse Preview:`);
        console.log(response.substring(0, 200) + (response.length > 200 ? '...' : ''));
        
        if (isVerbose || hasMethodology) {
          console.log(`⚠️ ${name} may still be providing verbose methodology`);
        } else {
          console.log(`✅ ${name} provides concise, actionable response`);
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Failed to test ${name}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('─'.repeat(50));
  console.log('The goal is to have agents provide concise, actionable responses');
  console.log('for simple applications instead of verbose methodological planning.');
  console.log('Agents should detect "checkers game" as a simple app and respond accordingly.');
}

// Run the test
testSimpleApplicationResponses().catch(console.error);
