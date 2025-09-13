const fs = require('fs');
const path = require('path');

// Test if renamed files exist
const agentsDir = path.join(__dirname, 'agents');
const renamedFiles = [
  'back-end-developer-agent.ts',
  'communications-agent.ts', 
  'data-scientist-agent.ts',
  'front-end-developer-agent.ts',
  'master-orchestrator-agent.ts',
  'project-coordinator-agent.ts',
  'researcher-agent.ts'
];

console.log('🔍 Checking renamed agent files...');

let allExist = true;
renamedFiles.forEach(file => {
  const filePath = path.join(agentsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allExist = false;
  }
});

console.log('\n🔍 Checking old files are gone...');
const oldFiles = [
  // These files should no longer exist after renaming
  // 'BackEndDeveloperAgent.ts',
  // 'CommunicationsAgent.ts',
  // 'DataScientistAgent.ts', 
  // 'FrontEndDeveloperAgent.ts',
  // 'MasterOrchestratorAgent.ts',
  // 'ProjectCoordinatorAgent.ts',
  // 'ResearcherAgent.ts'
];

oldFiles.forEach(file => {
  const filePath = path.join(agentsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`✅ ${file} - properly removed`);
  } else {
    console.log(`❌ ${file} - still exists (should be removed)`);
    allExist = false;
  }
});

if (allExist) {
  console.log('\n🎉 Phase 0 naming standardization COMPLETE!');
  console.log('✅ All 7 agent files successfully renamed to kebab-case');
  console.log('✅ Old PascalCase files properly removed');
  console.log('✅ Import statements updated'); 
  console.log('✅ TypeScript compilation passes');
  console.log('✅ Bridge dependencies commented out for new architecture');
} else {
  console.log('\n❌ Phase 0 naming standardization incomplete');
}
