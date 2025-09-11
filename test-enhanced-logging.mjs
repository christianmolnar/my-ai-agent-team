// Test script to create sample interactions for the enhanced logging system
import { logger, logAgentTask, logTaskCompletion, logTaskFailure, logAgentCollaboration, logLearningEvent } from '../lib/enhanced-agent-logger.js';

async function createSampleInteractions() {
    console.log('Creating sample interactions for enhanced logging system...');
    
    // Simulate various agent interactions
    logAgentTask('Personal Assistant', 'Handle User Request', 'Processing user request for project assistance');
    
    setTimeout(() => {
        logAgentCollaboration('Personal Assistant', 'Project Coordinator', 'Delegating task coordination to specialist agent');
    }, 100);
    
    setTimeout(() => {
        logAgentTask('Project Coordinator', 'Analyze Project Scope', 'Breaking down project requirements into manageable tasks');
    }, 200);
    
    setTimeout(() => {
        logTaskCompletion('Project Coordinator', 'Analyze Project Scope', 'Successfully identified 5 key project phases', 1250);
    }, 300);
    
    setTimeout(() => {
        logAgentTask('Communications Agent', 'Draft Project Plan', 'Creating structured project documentation');
    }, 400);
    
    setTimeout(() => {
        logTaskFailure('Communications Agent', 'Draft Project Plan', 'Failed to access required template', 'Template file not found: /templates/project-plan.md');
    }, 500);
    
    setTimeout(() => {
        logAgentTask('Communications Agent', 'Draft Project Plan - Retry', 'Creating project documentation with fallback template');
    }, 600);
    
    setTimeout(() => {
        logTaskCompletion('Communications Agent', 'Draft Project Plan - Retry', 'Successfully created project plan document', 2340);
    }, 700);
    
    setTimeout(() => {
        logLearningEvent('Personal Assistant', 'User prefers detailed project breakdowns with timeline estimates');
    }, 800);
    
    setTimeout(() => {
        logAgentTask('Data Scientist', 'Analyze Historical Data', 'Reviewing past project completion metrics');
    }, 900);
    
    setTimeout(() => {
        logTaskCompletion('Data Scientist', 'Analyze Historical Data', 'Generated insights on project success factors', 3450);
    }, 1000);
    
    setTimeout(() => {
        console.log('\nSample interactions created!');
        console.log('Current session logs:', logger.getSessionLogs().length);
        console.log('Total logs:', logger.getAllRecentLogs().length);
        console.log('Stats:', logger.getInteractionStats());
    }, 1100);
}

createSampleInteractions();
