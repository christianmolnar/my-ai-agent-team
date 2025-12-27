/**
 * Personal Assistant Bridge Test
 * 
 * Tests basic functionality of the Personal Assistant Bridge Agent
 * including private repository access, data retrieval, and security controls.
 */

import { PersonalAssistantBridge } from '../../agents/personal-assistant-bridge';
import { AgentTask } from '../../agents/agent';

async function testPersonalAssistantBridge() {
  console.log('🧪 Testing Personal Assistant Bridge...');
  
  const bridge = new PersonalAssistantBridge();
  
  // Test 1: Verify Access
  console.log('\n1️⃣ Testing access verification...');
  const accessTest: AgentTask = {
    type: 'verify-access',
    payload: {
      requestingAgent: 'communications-agent',
      dataType: 'identity-basic'
    }
  };
  
  const accessResult = await bridge.handleTask(accessTest);
  console.log('Access verification result:', accessResult);
  
  // Test 2: Get Identity Data
  console.log('\n2️⃣ Testing identity data retrieval...');
  const identityTest: AgentTask = {
    type: 'get-identity-data',
    payload: {
      requestingAgent: 'communications-agent',
      dataType: 'identity-basic'
    }
  };
  
  const identityResult = await bridge.handleTask(identityTest);
  console.log('Identity data result:', identityResult);
  
  // Test 3: Get Communications Style
  console.log('\n3️⃣ Testing communications style retrieval...');
  const styleTest: AgentTask = {
    type: 'get-communications-style',
    payload: {
      requestingAgent: 'communications-agent',
      dataType: 'identity-communications'
    }
  };
  
  const styleResult = await bridge.handleTask(styleTest);
  console.log('Communications style result:', styleResult);
  
  // Test 4: Get Project Context
  console.log('\n4️⃣ Testing project context retrieval...');
  const contextTest: AgentTask = {
    type: 'get-project-context',
    payload: {
      requestingAgent: 'master-orchestrator',
      dataType: 'project-context'
    }
  };
  
  const contextResult = await bridge.handleTask(contextTest);
  console.log('Project context result:', contextResult);
  
  // Test 5: Test Access Denial
  console.log('\n5️⃣ Testing access denial for unauthorized request...');
  const denialTest: AgentTask = {
    type: 'get-identity-data',
    payload: {
      requestingAgent: 'unknown-agent',
      dataType: 'identity-basic'
    }
  };
  
  const denialResult = await bridge.handleTask(denialTest);
  console.log('Access denial result:', denialResult);
  
  // Test 6: Get Audit Log
  console.log('\n6️⃣ Testing audit log retrieval...');
  const auditTest: AgentTask = {
    type: 'get-audit-log',
    payload: {}
  };
  
  const auditResult = await bridge.handleTask(auditTest);
  console.log('Audit log result:', auditResult);
  
  console.log('\n✅ Personal Assistant Bridge tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPersonalAssistantBridge().catch(console.error);
}

export { testPersonalAssistantBridge };
