/**
 * Debug the agent extraction regex
 */

// Sample Claude response that we're getting
const sampleResponse = `# Comprehensive Blues Research & Analysis Execution Plan

## Executive Summary
This multi-phase project will deliver a comprehensive blues education and analysis package covering historical development, financial market impact, and political influences. The plan coordinates 4 specialized agents over 6 weeks to produce actionable insights and learning materials.

## Task Decomposition & Agent Assignment

### Phase 1: Foundation Research (Week 1-2)
**Lead Agent: Researcher**
**Supporting Agents: Data Scientist, Project Coordinator**
`;

// Current regex pattern
function extractAgentsFromResponse(response) {
  console.log('🔍 Testing current regex pattern...');
  const agentMatch = response.match(/(?:agents?|assigned to):?\s*([^\n]+)/i);
  console.log('Agent match:', agentMatch);
  
  if (agentMatch) {
    console.log('Raw matched text:', JSON.stringify(agentMatch[1]));
    return agentMatch[1]
      .split(',')
      .map(a => a.trim()
        .replace(/^\*\*:?/, '') // Remove markdown bold formatting at start
        .replace(/\*\*$/, '')   // Remove markdown bold formatting at end
        .replace(/^[\*\-\s]+/, '') // Remove bullets and leading formatting
        .replace(/[\*\-\s]+$/, '') // Remove trailing formatting
        .toLowerCase()
        .replace(/\s+/g, '-')
      )
      .filter(a => a.length > 0); // Remove empty strings
  }
  return [];
}

// Alternative patterns to try
function tryAlternativePatterns(response) {
  console.log('\n🧪 Trying alternative extraction patterns...');
  
  // Pattern 1: Look for "Lead Agent:" and "Supporting Agents:"
  const leadAgentMatches = response.match(/Lead Agent:\s*([^\n\*]+)/gi);
  const supportingAgentMatches = response.match(/Supporting Agents?:\s*([^\n\*]+)/gi);
  
  console.log('Lead Agent matches:', leadAgentMatches);
  console.log('Supporting Agent matches:', supportingAgentMatches);
  
  // Pattern 2: Look for specialized agent names
  const knownAgents = ['researcher', 'data-scientist', 'communications', 'project-coordinator'];
  const foundAgents = knownAgents.filter(agent => 
    response.toLowerCase().includes(agent) || 
    response.toLowerCase().includes(agent.replace('-', ' '))
  );
  
  console.log('Found known agents in text:', foundAgents);
  
  return foundAgents;
}

// Test with sample
console.log('Testing agent extraction with sample response...\n');
const currentResult = extractAgentsFromResponse(sampleResponse);
console.log('Current method result:', currentResult);

const alternativeResult = tryAlternativePatterns(sampleResponse);
console.log('Alternative method result:', alternativeResult);

// Proposed improved extraction
function improvedExtractAgents(response, fallbackAgents = []) {
  console.log('\n🔧 Testing improved extraction method...');
  
  // Try multiple patterns
  const patterns = [
    /Lead Agent:\s*([^\n\*]+)/gi,
    /Supporting Agents?:\s*([^\n\*]+)/gi,
    /Agent:\s*([^\n\*]+)/gi,
    /agents?:?\s*([^\n]+)/i
  ];
  
  let foundAgents = [];
  
  for (const pattern of patterns) {
    const matches = response.match(pattern);
    if (matches) {
      console.log(`Pattern "${pattern.source}" found:`, matches);
      matches.forEach(match => {
        const agentText = match.replace(pattern, '$1').trim();
        const agents = agentText.split(',').map(a => a.trim().toLowerCase().replace(/\s+/g, '-'));
        foundAgents.push(...agents);
      });
    }
  }
  
  // Remove duplicates and filter known agents
  const knownAgents = ['researcher', 'data-scientist', 'communications', 'project-coordinator'];
  foundAgents = [...new Set(foundAgents)].filter(agent => 
    knownAgents.some(known => agent.includes(known) || known.includes(agent))
  );
  
  // Fallback to provided agents if extraction fails
  if (foundAgents.length === 0) {
    console.log('No agents extracted, using fallback:', fallbackAgents);
    foundAgents = fallbackAgents;
  }
  
  console.log('Final improved result:', foundAgents);
  return foundAgents;
}

// Test improved method
const improvedResult = improvedExtractAgents(sampleResponse, ['researcher-agent', 'data-scientist', 'communications-agent', 'project-coordinator']);
console.log('\n📊 Comparison:');
console.log('Current method:', currentResult);
console.log('Improved method:', improvedResult);
